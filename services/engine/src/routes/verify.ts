import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import crypto from "node:crypto";
import { PingRequestSchema, type VerificationStatus } from "@locqgeo/api-contracts";
import { PayoutOrchestrator } from "../services/payout.js";
import { db, sql } from "@locqgeo/database";
import { isCampaignEligible, recordCampaignVisit } from "./campaigns.js";
import { AntiCheatFilter } from "../plugins/anticheat.js";

interface ResolvedGeofence {
  id: string;
  tenant_id: string;
}

async function resolveGeofenceAlias(
  alias: string,
  tenantId?: string,
): Promise<ResolvedGeofence | null> {
  const normalized = alias.trim();
  if (!normalized) return null;

  const rows = (await db.execute(sql`
    SELECT id, tenant_id
    FROM geofences
    WHERE LOWER(creative_code) = LOWER(${normalized})
      AND is_active = TRUE
      ${tenantId ? sql`AND tenant_id = ${tenantId}` : sql``}
    LIMIT 1;
  `)) as unknown as Array<ResolvedGeofence>;

  return rows[0] ?? null;
}

function errorReply(
  status: VerificationStatus,
  code: string,
  message: string,
  details?: Record<string, unknown>,
) {
  return {
    success: false as const,
    status,
    error_code: code,
    message,
    details,
  };
}

async function logAttemptAndReputation(
  deviceId: string,
  geofenceId: string | null,
  tenantId: string | null,
  userId: string | null,
  status: string,
  latitude: number,
  longitude: number,
  accuracyMeters: number,
  fraudScore: number,
  fraudSignals: string[],
  ipAddress?: string,
  userAgent?: string,
) {
  try {
    await db.execute(sql`
      INSERT INTO verification_attempts (
        device_id, geofence_id, tenant_id, user_id, status,
        latitude, longitude, accuracy_meters, fraud_score, fraud_signals,
        ip_address, user_agent
      ) VALUES (
        ${deviceId}, ${geofenceId}, ${tenantId}, ${userId}, ${status},
        ${latitude}, ${longitude}, ${accuracyMeters}, ${fraudScore}, ${JSON.stringify(fraudSignals)}::jsonb,
        ${ipAddress ?? null}, ${userAgent ?? null}
      );
    `);

    const isRejected = status.startsWith("REJECTED_");
    await db.execute(sql`
      INSERT INTO device_reputation (
        device_id, trust_score, total_attempts, rejected_attempts, last_seen_at, updated_at
      ) VALUES (
        ${deviceId}, ${isRejected ? "0.800" : "1.000"}, 1, ${isRejected ? 1 : 0}, NOW(), NOW()
      )
      ON CONFLICT (device_id) DO UPDATE SET
        total_attempts = device_reputation.total_attempts + 1,
        rejected_attempts = device_reputation.rejected_attempts + ${isRejected ? 1 : 0},
        trust_score = GREATEST(0.000, LEAST(1.000, 1.0 - ((device_reputation.rejected_attempts + ${isRejected ? 1 : 0})::numeric / (device_reputation.total_attempts + 1)::numeric))),
        last_seen_at = NOW(),
        updated_at = NOW();
    `);
  } catch (err) {
    console.error("Failed to record verification attempt:", err);
  }
}

export async function verifyRoutes(fastify: FastifyInstance) {
  fastify.post("/api/v1/engine/verify", async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = PingRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply
        .status(400)
        .send(
          errorReply(
            "REJECTED_ACCURACY",
            "ERR_INVALID_PAYLOAD",
            "Payload failed schema validation",
            { errors: parseResult.error.flatten() },
          ),
        );
    }

    const ping = parseResult.data;
    const requestIp = ping.ip_address ?? request.ip;
    const requestUA = ping.user_agent ?? (request.headers["user-agent"] as string | undefined);

    // Resolve human-friendly alias to a concrete geofence UUID before processing.
    let geofenceId = ping.geofence_id ?? "";
    if (ping.alias && !geofenceId) {
      const resolved = await resolveGeofenceAlias(ping.alias, ping.tenant_id);
      if (!resolved) {
        await logAttemptAndReputation(
          ping.device_id,
          null,
          ping.tenant_id ?? null,
          ping.user_id ?? null,
          "REJECTED_INACTIVE_GEOFENCE",
          ping.latitude,
          ping.longitude,
          ping.accuracy_meters,
          0.5,
          ["ALIAS_NOT_FOUND"],
          requestIp,
          requestUA,
        );

        return reply.status(422).send(
          errorReply(
            "REJECTED_INACTIVE_GEOFENCE",
            "ERR_ALIAS_NOT_FOUND",
            `No active geofence found for alias "${ping.alias}"`,
          ),
        );
      }

      geofenceId = resolved.id;
      if (!ping.tenant_id) {
        ping.tenant_id = resolved.tenant_id;
      }
    }

    try {
      // Step 1: Query prior pings for rate limiting and velocity calculation
      const priorPingResult = (await db.execute(sql`
          SELECT
            latitude,
            longitude,
            created_at,
            ST_Distance(
              ST_SetSRID(ST_MakePoint(${ping.longitude}, ${ping.latitude}), 4326)::geography,
              ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
            ) AS distance_delta_meters,
            EXTRACT(EPOCH FROM (NOW() - created_at)) AS time_delta_seconds
          FROM checkin_pings
          WHERE device_id = ${ping.device_id}
          ORDER BY created_at DESC
          LIMIT 1;
        `)) as unknown as Array<{
        latitude: number;
        longitude: number;
        created_at: Date;
        distance_delta_meters: number;
        time_delta_seconds: number;
      }>;

      const prior = priorPingResult[0];

      const recentPingsResult = (await db.execute(sql`
          SELECT EXTRACT(EPOCH FROM created_at) * 1000 AS created_ms
          FROM checkin_pings
          WHERE device_id = ${ping.device_id}
            AND created_at >= NOW() - INTERVAL '60 seconds';
        `)) as unknown as Array<{ created_ms: number }>;

      const recentTimestamps = recentPingsResult.map((r) => Number(r.created_ms));

      // Evaluate 4-Step Anti-Cheat Filter
      const antiCheatResult = AntiCheatFilter.evaluatePing(
        ping.latitude,
        ping.longitude,
        ping.accuracy_meters,
        ping.velocity_mps ?? 0,
        prior
          ? {
              distanceDeltaMeters: Number(prior.distance_delta_meters),
              timeDeltaSeconds: Number(prior.time_delta_seconds),
            }
          : undefined,
        Date.now(),
        recentTimestamps,
      );

      if (!antiCheatResult.passed) {
        const errorCode =
          antiCheatResult.status === "REJECTED_ACCURACY"
            ? "ERR_LOW_GPS_ACCURACY"
            : antiCheatResult.status === "REJECTED_RATE_LIMIT"
              ? "ERR_RATE_LIMIT_EXCEEDED"
              : antiCheatResult.status === "REJECTED_VELOCITY"
                ? "ERR_IMPOSSIBLE_SPEED"
                : "ERR_SPOOF_SUSPECTED";

        await logAttemptAndReputation(
          ping.device_id,
          geofenceId,
          ping.tenant_id ?? null,
          ping.user_id ?? null,
          antiCheatResult.status,
          ping.latitude,
          ping.longitude,
          ping.accuracy_meters,
          antiCheatResult.fraudScore,
          antiCheatResult.fraudSignals,
          requestIp,
          requestUA,
        );

        return reply.status(422).send(
          errorReply(
            antiCheatResult.status,
            errorCode,
            antiCheatResult.reason || "Verification rejected by anti-cheat filter",
            {
              spoof_score: antiCheatResult.spoofScore,
              fraud_score: antiCheatResult.fraudScore,
              fraud_signals: antiCheatResult.fraudSignals,
            },
          ),
        );
      }

      // Look up the target geofence. Restrict by tenant when provided.
      const geofenceResult = (await db.execute(sql`
          SELECT
            id,
            tenant_id,
            title,
            radius_meters,
            action_type,
            reward_type,
            reward_amount,
            reward_currency,
            daily_budget_limit,
            daily_budget_spent,
            is_active,
            ST_Distance(
              location,
              ST_SetSRID(ST_MakePoint(${ping.longitude}, ${ping.latitude}), 4326)::geography
            ) AS distance_meters
          FROM geofences
          WHERE id = ${geofenceId}
            ${ping.tenant_id ? sql`AND tenant_id = ${ping.tenant_id}` : sql``}
          LIMIT 1;
        `)) as unknown as Array<{
        id: string;
        tenant_id: string;
        title: string;
        radius_meters: number;
        action_type: string;
        reward_type: string | null;
        reward_amount: string | null;
        reward_currency: string | null;
        daily_budget_limit: string | null;
        daily_budget_spent: string | null;
        is_active: boolean;
        distance_meters: number;
      }>;

      const geofence = geofenceResult[0];

      if (!geofence) {
        await logAttemptAndReputation(
          ping.device_id,
          geofenceId,
          ping.tenant_id ?? null,
          ping.user_id ?? null,
          "REJECTED_INACTIVE_GEOFENCE",
          ping.latitude,
          ping.longitude,
          ping.accuracy_meters,
          0.5,
          ["GEOFENCE_NOT_FOUND"],
          requestIp,
          requestUA,
        );

        return reply
          .status(422)
          .send(
            errorReply(
              "REJECTED_INACTIVE_GEOFENCE",
              "ERR_GEOFENCE_NOT_FOUND",
              "Target geofence was not found or tenant restriction mismatched",
            ),
          );
      }

      if (!geofence.is_active) {
        await logAttemptAndReputation(
          ping.device_id,
          geofenceId,
          geofence.tenant_id,
          ping.user_id ?? null,
          "REJECTED_INACTIVE_GEOFENCE",
          ping.latitude,
          ping.longitude,
          ping.accuracy_meters,
          0.5,
          ["GEOFENCE_INACTIVE"],
          requestIp,
          requestUA,
        );

        return reply
          .status(422)
          .send(
            errorReply(
              "REJECTED_INACTIVE_GEOFENCE",
              "ERR_GEOFENCE_INACTIVE",
              `Geofence "${geofence.title}" is inactive`,
            ),
          );
      }

      // Validate campaign eligibility when campaign_id is provided
      let campaignRewardOverride: { type: string; amount: number; currency: string } | null = null;
      if (ping.campaign_id) {
        const eligibility = await isCampaignEligible(ping.campaign_id);
        if (!eligibility.eligible) {
          await logAttemptAndReputation(
            ping.device_id,
            geofenceId,
            geofence.tenant_id,
            ping.user_id ?? null,
            "REJECTED_INACTIVE_GEOFENCE",
            ping.latitude,
            ping.longitude,
            ping.accuracy_meters,
            0.5,
            ["CAMPAIGN_INELIGIBLE"],
            requestIp,
            requestUA,
          );

          return reply
            .status(422)
            .send(
              errorReply(
                "REJECTED_INACTIVE_GEOFENCE",
                "ERR_CAMPAIGN_INELIGIBLE",
                eligibility.reason || "Campaign is inactive or ineligible for this geofence",
              ),
            );
        }

        if (eligibility.reward) {
          campaignRewardOverride = {
            type: eligibility.reward.type,
            amount: eligibility.reward.amount,
            currency: eligibility.reward.currency || "NGN",
          };
        }
      }

      // Rolling 24-hour duplicate check
      const dupResult = (await db.execute(sql`
          SELECT id FROM verifications
          WHERE device_id = ${ping.device_id}
            AND geofence_id = ${geofenceId}
            AND status = 'VERIFIED'
            AND created_at >= NOW() - INTERVAL '24 hours'
          LIMIT 1;
        `)) as unknown as Array<{ id: string }>;

      if (dupResult.length > 0) {
        await logAttemptAndReputation(
          ping.device_id,
          geofenceId,
          geofence.tenant_id,
          ping.user_id ?? null,
          "REJECTED_DUPLICATE",
          ping.latitude,
          ping.longitude,
          ping.accuracy_meters,
          0.6,
          ["DUPLICATE_CLAIM_24H"],
          requestIp,
          requestUA,
        );

        return reply
          .status(422)
          .send(
            errorReply(
              "REJECTED_DUPLICATE",
              "ERR_DUPLICATE_VERIFICATION",
              `Device "${ping.device_id}" has already verified at geofence "${geofence.title}" within the last 24 hours`,
            ),
          );
      }

      // Distance boundary validation against the geofence radius
      const distanceMeters = Number(geofence.distance_meters);
      const radiusMeters = Number(geofence.radius_meters);
      if (distanceMeters > radiusMeters) {
        await logAttemptAndReputation(
          ping.device_id,
          geofenceId,
          geofence.tenant_id,
          ping.user_id ?? null,
          "REJECTED_OUT_OF_BOUNDS",
          ping.latitude,
          ping.longitude,
          ping.accuracy_meters,
          0.4,
          ["OUT_OF_BOUNDS"],
          requestIp,
          requestUA,
        );

        return reply
          .status(422)
          .send(
            errorReply(
              "REJECTED_OUT_OF_BOUNDS",
              "ERR_OUT_OF_BOUNDS",
              `Distance ${distanceMeters.toFixed(1)}m exceeds geofence radius of ${radiusMeters.toFixed(1)}m`,
            ),
          );
      }

      // Insert raw checkin ping
      const pingId = crypto.randomUUID();
      await db.execute(sql`
          INSERT INTO checkin_pings (
            id, geofence_id, device_id, latitude, longitude, accuracy_meters, velocity_mps, location
          ) VALUES (
            ${pingId},
            ${geofenceId},
            ${ping.device_id},
            ${ping.latitude},
            ${ping.longitude},
            ${ping.accuracy_meters},
            ${ping.velocity_mps ?? 0},
            ST_SetSRID(ST_MakePoint(${ping.longitude}, ${ping.latitude}), 4326)::geography
          );
        `);

      // Record verification attempt success
      await logAttemptAndReputation(
        ping.device_id,
        geofenceId,
        geofence.tenant_id,
        ping.user_id ?? null,
        "VERIFIED",
        ping.latitude,
        ping.longitude,
        ping.accuracy_meters,
        antiCheatResult.fraudScore,
        [],
        requestIp,
        requestUA,
      );

      const verificationId = crypto.randomUUID();
      const effectiveRewardType = campaignRewardOverride?.type ?? geofence.reward_type;
      const effectiveRewardAmount =
        campaignRewardOverride?.amount ??
        (geofence.reward_amount ? Number(geofence.reward_amount) : null);
      const effectiveRewardCurrency =
        campaignRewardOverride?.currency ?? (geofence.reward_currency || "NGN");
      const campaignBudgetAmount = campaignRewardOverride?.amount ?? 0;

      let payoutResult: { reference?: string; status: string; provider?: string } = {
        status: "NOT_APPLICABLE",
      };

      if (geofence.action_type === "REWARD" || campaignRewardOverride) {
        if (effectiveRewardType && effectiveRewardAmount && effectiveRewardAmount > 0) {
          const provider =
            effectiveRewardType === "AIRTIME" || effectiveRewardType === "DATA"
              ? "VTPASS"
              : "PAYSTACK";
          const payoutType =
            effectiveRewardType === "AIRTIME" ||
            effectiveRewardType === "DATA" ||
            effectiveRewardType === "CASH"
              ? (effectiveRewardType as "AIRTIME" | "DATA" | "CASH")
              : "CASH";

          payoutResult = await PayoutOrchestrator.processPayout({
            claimId: verificationId,
            amount: effectiveRewardAmount,
            currency: effectiveRewardCurrency,
            recipient: ping.user_id ?? ping.device_id,
            provider,
            payoutType,
            tenantId: geofence.tenant_id,
            userId: ping.user_id,
          });
        }

        await db.execute(sql`
            INSERT INTO verifications (
              id,
              geofence_id,
              device_id,
              user_id,
              ping_id,
              status,
              payout_reference,
              payout_status,
              reward_type,
              reward_amount,
              reward_currency
            ) VALUES (
              ${verificationId},
              ${geofenceId},
              ${ping.device_id},
              ${ping.user_id ?? null},
              ${pingId},
              'VERIFIED',
              ${payoutResult.reference ?? null},
              ${payoutResult.status},
              ${effectiveRewardType},
              ${effectiveRewardAmount},
              ${effectiveRewardCurrency}
            );
          `);

        if (ping.campaign_id && campaignBudgetAmount > 0 && payoutResult.status !== "FAILED") {
          await db.execute(sql`
              UPDATE campaigns
              SET total_budget_spent = total_budget_spent + ${campaignBudgetAmount},
                  updated_at = NOW()
              WHERE id = ${ping.campaign_id};
            `);
        }
      } else {
        await db.execute(sql`
            INSERT INTO verifications (
              id,
              geofence_id,
              device_id,
              user_id,
              ping_id,
              status,
              payout_status
            ) VALUES (
              ${verificationId},
              ${geofenceId},
              ${ping.device_id},
              ${ping.user_id ?? null},
              ${pingId},
              'VERIFIED',
              'NOT_APPLICABLE'
            );
          `);
      }

      let campaignMeta:
        { campaign_id: string; points_earned: number; leaderboard_rank: number } | undefined;
      if (ping.campaign_id) {
        const campaignVisit = await recordCampaignVisit(
          ping.campaign_id,
          ping.device_id,
          geofenceId,
          verificationId,
          ping.user_id,
        );
        campaignMeta = {
          campaign_id: ping.campaign_id,
          points_earned: campaignVisit.pointsEarned,
          leaderboard_rank: campaignVisit.rank,
        };
      }

      const nowIso = new Date().toISOString();
      const successPayload = {
        success: true as const,
        status: "VERIFIED" as const,
        data: {
          verification_id: verificationId,
          geofence_id: geofence.id,
          geofence_title: geofence.title,
          distance_meters: Number(distanceMeters.toFixed(1)),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          action_type: geofence.action_type as any,
          verified_at: nowIso,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          payout_status: payoutResult.status as any,
          ...(ping.campaign_id && campaignMeta
            ? {
                campaign_id: ping.campaign_id,
                points_earned: campaignMeta.points_earned,
                leaderboard_rank: campaignMeta.leaderboard_rank,
              }
            : {}),
          ...(payoutResult.status !== "NOT_APPLICABLE" &&
          effectiveRewardType &&
          effectiveRewardAmount
            ? {
                reward: {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  type: effectiveRewardType as any,
                  amount: effectiveRewardAmount,
                  currency: effectiveRewardCurrency,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  payout_status: payoutResult.status as any,
                },
              }
            : {}),
        },
      };

      return reply.status(200).send(successPayload);
    } catch (err: unknown) {
      console.error("Unhandled error during verification processing:", err);
      return reply
        .status(500)
        .send(
          errorReply(
            "REJECTED_INACTIVE_GEOFENCE",
            "ERR_INTERNAL_SERVER_ERROR",
            "Internal server error while processing presence verification",
          ),
        );
    }
  });
}
