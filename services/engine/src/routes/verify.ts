import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import crypto from "node:crypto";
import {
  PingRequestSchema,
  type PingRequest,
  VerificationStatusEnum,
  PingResponseSuccessSchema,
} from "@spottgeo/api-contracts";
import { PayoutOrchestrator } from "../services/payout.js";
import { db, sql } from "@spottgeo/database";
import { isCampaignEligible, recordCampaignVisit } from "./campaigns.js";

const MAX_ACCURACY_METERS = 50.0;
const MAX_VELOCITY_MPS = 55.56; // ~200 km/h

function errorReply(
  status: (typeof VerificationStatusEnum._type),
  code: string,
  message: string,
  details?: Record<string, unknown>
) {
  return {
    success: false as const,
    status,
    error_code: code,
    message,
    details,
  };
}

export async function verifyRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/api/v1/engine/verify",
    async (request: FastifyRequest<{ Body: PingRequest }>, reply: FastifyReply) => {
      const parseResult = PingRequestSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send(
          errorReply("REJECTED_ACCURACY", "INVALID_PAYLOAD", "Request body failed validation", parseResult.error.flatten().fieldErrors)
        );
      }

      const ping = parseResult.data;

      // Step 1: Accuracy filter
      if (ping.accuracy_meters > MAX_ACCURACY_METERS) {
        return reply.status(422).send(
          errorReply(
            "REJECTED_ACCURACY",
            "ERR_LOW_GPS_ACCURACY",
            `Accuracy ${ping.accuracy_meters.toFixed(1)}m exceeds threshold of ${MAX_ACCURACY_METERS}m`
          )
        );
      }

      try {
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
          WHERE id = ${ping.geofence_id}
            ${ping.tenant_id ? sql`AND tenant_id = ${ping.tenant_id}` : sql``}
          LIMIT 1;
        `)) as unknown as Array<{
          id: string;
          tenant_id: string;
          title: string;
          radius_meters: number;
          action_type: "REWARD" | "CHECKIN" | "ATTENDANCE" | "AUDIT" | "ACCESS";
          reward_type: "AIRTIME" | "DATA" | "CASH" | "VOUCHER" | null;
          reward_amount: string | null;
          reward_currency: string | null;
          daily_budget_limit: string | null;
          daily_budget_spent: string | null;
          is_active: boolean;
          distance_meters: number;
        }>;

        const geofence = geofenceResult[0];

        if (!geofence) {
          return reply.status(422).send(
            errorReply("REJECTED_INACTIVE_GEOFENCE", "ERR_GEOFENCE_NOT_FOUND", "The requested geofence does not exist or is not accessible")
          );
        }

        if (!geofence.is_active) {
          return reply.status(422).send(
            errorReply("REJECTED_INACTIVE_GEOFENCE", "ERR_INACTIVE_GEOFENCE", "This geofence is currently inactive")
          );
        }

        // Campaign eligibility check (only when a campaign is supplied)
        let campaignReward: { type: string; amount: number; currency: string } | null = null;
        let campaignActionType: string | undefined;
        let campaignBudgetAmount = 0;
        if (ping.campaign_id) {
          const eligibility = await isCampaignEligible(ping.campaign_id);
          if (!eligibility.eligible) {
            return reply.status(422).send(
              errorReply("REJECTED_INACTIVE_GEOFENCE", "ERR_CAMPAIGN_INELIGIBLE", eligibility.reason || "Campaign is not eligible")
            );
          }
          campaignReward = eligibility.reward ?? null;
          campaignActionType = eligibility.actionType;
          campaignBudgetAmount = campaignReward?.amount ?? 0;
        }

        // Step 2: Server-side velocity / teleportation check using the last ping
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
        let velocityMps = 0;
        if (prior && prior.time_delta_seconds > 0) {
          velocityMps = Number(prior.distance_delta_meters) / Number(prior.time_delta_seconds);
        }

        if (prior && Number(prior.time_delta_seconds) === 0 && Number(prior.distance_delta_meters) > 10) {
          return reply.status(422).send(
            errorReply("REJECTED_VELOCITY", "ERR_ZERO_TIME_SPOOF", "Impossible location jump with zero time delta")
          );
        }

        // Also reject if client-sent velocity hint or computed velocity exceeds threshold
        const clientVelocity = ping.velocity_mps ?? 0;
        if (clientVelocity > MAX_VELOCITY_MPS || velocityMps > MAX_VELOCITY_MPS) {
          return reply.status(422).send(
            errorReply(
              "REJECTED_VELOCITY",
              "ERR_IMPOSSIBLE_SPEED",
              `Telemetry velocity exceeds ${MAX_VELOCITY_MPS} m/s`
            )
          );
        }

        // Step 3: Duplicate verification filter (24h rolling window)
        const duplicateResult = (await db.execute(sql`
          SELECT id
          FROM verifications
          WHERE device_id = ${ping.device_id}
            AND geofence_id = ${ping.geofence_id}
            AND status = 'VERIFIED'
            AND created_at >= NOW() - INTERVAL '24 hours'
          LIMIT 1;
        `)) as unknown as Array<{ id: string }>;

        if (duplicateResult.length > 0) {
          return reply.status(422).send(
            errorReply("REJECTED_DUPLICATE", "ERR_DUPLICATE_VERIFICATION", "A verified presence event already exists for this device and geofence in the last 24 hours")
          );
        }

        // Step 4: Spatial distance filter against the geofence's own radius
        const radiusMeters = Number(geofence.radius_meters) || 50.0;
        const distanceMeters = Number(geofence.distance_meters);

        if (distanceMeters > radiusMeters) {
          return reply.status(422).send(
            errorReply(
              "REJECTED_OUT_OF_BOUNDS",
              "ERR_OUT_OF_BOUNDS",
              `Distance ${distanceMeters.toFixed(1)}m is outside the geofence radius of ${radiusMeters.toFixed(1)}m`
            )
          );
        }

        // All checks passed. Persist the ping and the verified event.
        const pingId = crypto.randomUUID();
        await db.execute(sql`
          INSERT INTO checkin_pings (id, device_id, latitude, longitude, user_location, accuracy_meters)
          VALUES (
            ${pingId},
            ${ping.device_id},
            ${ping.latitude},
            ${ping.longitude},
            ST_SetSRID(ST_MakePoint(${ping.longitude}, ${ping.latitude}), 4326)::geography,
            ${ping.accuracy_meters}
          );
        `);

        const verificationId = crypto.randomUUID();

        // Determine effective reward configuration (campaign wins over geofence)
        const effectiveRewardType = campaignReward?.type ?? geofence.reward_type;
        const effectiveRewardAmount = campaignReward?.amount ?? (geofence.reward_amount ? Number(geofence.reward_amount) : null);
        const effectiveRewardCurrency = campaignReward?.currency ?? geofence.reward_currency ?? "NGN";
        const effectiveActionType = campaignActionType ?? geofence.action_type;

        const hasReward =
          effectiveActionType === "REWARD" && effectiveRewardType && effectiveRewardAmount;

        let payoutResult: {
          reference?: string;
          status: "NOT_APPLICABLE" | "QUEUED" | "PROCESSING" | "SUCCESS" | "FAILED";
          amount?: number;
          currency?: string;
          provider?: string;
        } = { status: "NOT_APPLICABLE" };

        if (hasReward) {
          const provider = effectiveRewardType === "CASH" ? "PAYSTACK" : "VTPASS";
          const payoutType = effectiveRewardType === "CASH" ? "CASH" : (effectiveRewardType as "AIRTIME" | "DATA");

          payoutResult = await PayoutOrchestrator.processPayout({
            claimId: verificationId,
            amount: effectiveRewardAmount,
            currency: effectiveRewardCurrency,
            recipient: ping.device_id,
            provider,
            payoutType,
          });

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
              ${ping.geofence_id},
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

          // Track campaign spend when the campaign supplied the reward
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
              ${ping.geofence_id},
              ${ping.device_id},
              ${ping.user_id ?? null},
              ${pingId},
              'VERIFIED',
              'NOT_APPLICABLE'
            );
          `);
        }

        // Record gamification progress when campaign context is present
        let campaignMeta:
          | { campaign_id: string; points_earned: number; leaderboard_rank: number }
          | undefined;
        if (ping.campaign_id) {
          const { pointsEarned, rank } = await recordCampaignVisit(
            ping.campaign_id,
            ping.device_id,
            ping.geofence_id,
            verificationId,
            ping.user_id
          );
          campaignMeta = {
            campaign_id: ping.campaign_id,
            points_earned: pointsEarned,
            leaderboard_rank: rank,
          };
        }

        const normalizedPayoutStatus = payoutResult.status === "SUCCESS" ? "COMPLETED" : payoutResult.status;

        const response = {
          success: true as const,
          status: "VERIFIED" as const,
          data: {
            verification_id: verificationId,
            geofence_id: geofence.id,
            geofence_title: geofence.title,
            distance_meters: Math.round(distanceMeters * 10) / 10,
            action_type: effectiveActionType as typeof geofence.action_type,
            verified_at: new Date().toISOString(),
            payout_status:
              payoutResult.status !== "NOT_APPLICABLE" ? normalizedPayoutStatus : "NOT_APPLICABLE",
            ...(campaignMeta ?? {}),
            reward:
              payoutResult.status !== "NOT_APPLICABLE"
                ? {
                    type: effectiveRewardType!,
                    amount: effectiveRewardAmount!,
                    currency: effectiveRewardCurrency,
                    payout_status: normalizedPayoutStatus,
                  }
                : undefined,
          },
        };

        // Validate against contract for extra safety
        const validated = PingResponseSuccessSchema.safeParse(response);
        return reply.status(200).send(validated.success ? validated.data : response);
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send(
          errorReply("REJECTED_ACCURACY", "ERR_INTERNAL", "An internal error occurred while processing the verification")
        );
      }
    }
  );
}
