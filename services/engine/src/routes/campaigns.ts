import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db, sql } from "@locqgeo/database";
import {
  CampaignCreateRequestSchema,
  CampaignListResponseSchema,
  CampaignDetailResponseSchema,
  CampaignLeaderboardResponseSchema,
  CampaignMeResponseSchema,
} from "@locqgeo/api-contracts";

const DEFAULT_LEADERBOARD_LIMIT = 50;
const STREAK_WINDOW_HOURS = 48;

export async function campaignRoutes(fastify: FastifyInstance) {
  // GET /api/v1/campaigns
  fastify.get("/api/v1/campaigns", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const tenantId = (request.query as { tenant_id?: string }).tenant_id;

      const rows = (await db.execute(sql`
        SELECT
          id,
          tenant_id,
          title,
          description,
          action_type,
          starts_at,
          ends_at,
          daily_budget_limit,
          total_budget_limit,
          total_budget_spent,
          reward_type,
          reward_amount,
          reward_currency,
          is_active,
          created_at
        FROM campaigns
        WHERE is_active = true
          AND starts_at <= NOW()
          AND ends_at >= NOW()
          ${tenantId ? sql`AND tenant_id = ${tenantId}` : sql``}
        ORDER BY created_at DESC;
      `)) as unknown as Array<{
        id: string;
        tenant_id: string;
        title: string;
        description: string | null;
        action_type: string;
        starts_at: Date;
        ends_at: Date;
        daily_budget_limit: string | null;
        total_budget_limit: string | null;
        total_budget_spent: string;
        reward_type: string | null;
        reward_amount: string | null;
        reward_currency: string;
        is_active: boolean;
        created_at: Date;
      }>;

      const data = rows.map((r) => ({
        id: r.id,
        tenant_id: r.tenant_id,
        title: r.title,
        description: r.description ?? undefined,
        action_type: r.action_type,
        starts_at: r.starts_at.toISOString(),
        ends_at: r.ends_at.toISOString(),
        daily_budget_limit: r.daily_budget_limit ? Number(r.daily_budget_limit) : undefined,
        total_budget_limit: r.total_budget_limit ? Number(r.total_budget_limit) : undefined,
        total_budget_spent: Number(r.total_budget_spent),
        reward_type: r.reward_type ?? undefined,
        reward_amount: r.reward_amount ? Number(r.reward_amount) : undefined,
        reward_currency: r.reward_currency,
        is_active: r.is_active,
        created_at: r.created_at.toISOString(),
      }));

      const response = { success: true as const, data };
      return reply.status(200).send(CampaignListResponseSchema.parse(response));
    } catch (err) {
      fastify.log.error(err);
      return reply
        .status(500)
        .send({ success: false, error_code: "ERR_INTERNAL", message: "Failed to list campaigns" });
    }
  });

  // POST /api/v1/campaigns
  fastify.post("/api/v1/campaigns", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const parseResult = CampaignCreateRequestSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error_code: "INVALID_PAYLOAD",
          message: "Request body failed validation",
          details: parseResult.error.flatten().fieldErrors,
        });
      }

      const payload = parseResult.data;
      if (new Date(payload.starts_at) >= new Date(payload.ends_at)) {
        return reply.status(400).send({
          success: false,
          error_code: "INVALID_DATES",
          message: "starts_at must be before ends_at",
        });
      }

      const campaignResult = (await db.execute(sql`
        INSERT INTO campaigns (
          tenant_id, title, description, action_type, starts_at, ends_at,
          daily_budget_limit, total_budget_limit, reward_type, reward_amount, reward_currency, is_active
        ) VALUES (
          ${payload.tenant_id},
          ${payload.title},
          ${payload.description ?? null},
          ${payload.action_type},
          ${payload.starts_at},
          ${payload.ends_at},
          ${payload.daily_budget_limit ?? null},
          ${payload.total_budget_limit ?? null},
          ${payload.reward_type ?? null},
          ${payload.reward_amount ?? null},
          ${payload.reward_currency},
          ${payload.is_active}
        )
        RETURNING id;
      `)) as unknown as Array<{ id: string }>;

      const campaignId = campaignResult[0].id;

      for (const g of payload.geofences ?? []) {
        await db.execute(sql`
          INSERT INTO campaign_geofences (campaign_id, geofence_id, visit_weight, required_visit_order)
          VALUES (${campaignId}, ${g.geofence_id}, ${g.visit_weight}, ${g.required_visit_order ?? null})
          ON CONFLICT (campaign_id, geofence_id) DO UPDATE SET
            visit_weight = EXCLUDED.visit_weight,
            required_visit_order = EXCLUDED.required_visit_order;
        `);
      }

      return reply.status(201).send({ success: true, data: { id: campaignId } });
    } catch (err) {
      fastify.log.error(err);
      return reply
        .status(500)
        .send({ success: false, error_code: "ERR_INTERNAL", message: "Failed to create campaign" });
    }
  });

  // GET /api/v1/campaigns/:id
  fastify.get(
    "/api/v1/campaigns/:id",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;

        const campaignRows = (await db.execute(sql`
        SELECT
          id,
          tenant_id,
          title,
          description,
          action_type,
          starts_at,
          ends_at,
          daily_budget_limit,
          total_budget_limit,
          total_budget_spent,
          reward_type,
          reward_amount,
          reward_currency,
          is_active,
          created_at
        FROM campaigns
        WHERE id = ${id}
        LIMIT 1;
      `)) as unknown as Array<{
          id: string;
          tenant_id: string;
          title: string;
          description: string | null;
          action_type: string;
          starts_at: Date;
          ends_at: Date;
          daily_budget_limit: string | null;
          total_budget_limit: string | null;
          total_budget_spent: string;
          reward_type: string | null;
          reward_amount: string | null;
          reward_currency: string;
          is_active: boolean;
          created_at: Date;
        }>;

        if (campaignRows.length === 0) {
          return reply
            .status(404)
            .send({ success: false, error_code: "NOT_FOUND", message: "Campaign not found" });
        }

        const c = campaignRows[0];

        const geofenceRows = (await db.execute(sql`
        SELECT geofence_id, visit_weight, required_visit_order
        FROM campaign_geofences
        WHERE campaign_id = ${id};
      `)) as unknown as Array<{
          geofence_id: string;
          visit_weight: number;
          required_visit_order: number | null;
        }>;

        const data = {
          id: c.id,
          tenant_id: c.tenant_id,
          title: c.title,
          description: c.description ?? undefined,
          action_type: c.action_type,
          starts_at: c.starts_at.toISOString(),
          ends_at: c.ends_at.toISOString(),
          daily_budget_limit: c.daily_budget_limit ? Number(c.daily_budget_limit) : undefined,
          total_budget_limit: c.total_budget_limit ? Number(c.total_budget_limit) : undefined,
          total_budget_spent: Number(c.total_budget_spent),
          reward_type: c.reward_type ?? undefined,
          reward_amount: c.reward_amount ? Number(c.reward_amount) : undefined,
          reward_currency: c.reward_currency,
          is_active: c.is_active,
          geofences: geofenceRows.map((g) => ({
            geofence_id: g.geofence_id,
            visit_weight: g.visit_weight,
            required_visit_order: g.required_visit_order ?? undefined,
          })),
          created_at: c.created_at.toISOString(),
        };

        const response = { success: true as const, data };
        return reply.status(200).send(CampaignDetailResponseSchema.parse(response));
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({
          success: false,
          error_code: "ERR_INTERNAL",
          message: "Failed to fetch campaign",
        });
      }
    },
  );

  // GET /api/v1/campaigns/:id/leaderboard
  fastify.get(
    "/api/v1/campaigns/:id/leaderboard",
    async (
      request: FastifyRequest<{ Params: { id: string }; Querystring: { limit?: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = request.params;
        const limit = Math.min(Number(request.query.limit) || DEFAULT_LEADERBOARD_LIMIT, 100);

        const rows = (await db.execute(sql`
          SELECT
            device_id,
            total_points,
            total_visits,
            streak_count,
            last_visit_at,
            RANK() OVER (ORDER BY total_points DESC, updated_at ASC) AS rank
          FROM leaderboards
          WHERE campaign_id = ${id}
          ORDER BY total_points DESC, updated_at ASC
          LIMIT ${limit};
        `)) as unknown as Array<{
          device_id: string;
          total_points: number;
          total_visits: number;
          streak_count: number;
          last_visit_at: Date | null;
          rank: number;
        }>;

        const data = {
          campaign_id: id,
          entries: rows.map((r) => ({
            rank: Number(r.rank),
            device_id: r.device_id,
            total_points: r.total_points,
            total_visits: r.total_visits,
            streak_count: r.streak_count,
            last_visit_at: r.last_visit_at?.toISOString(),
          })),
        };

        const response = { success: true as const, data };
        return reply.status(200).send(CampaignLeaderboardResponseSchema.parse(response));
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({
          success: false,
          error_code: "ERR_INTERNAL",
          message: "Failed to fetch leaderboard",
        });
      }
    },
  );

  // GET /api/v1/campaigns/:id/me?device_id=...
  fastify.get(
    "/api/v1/campaigns/:id/me",
    async (
      request: FastifyRequest<{ Params: { id: string }; Querystring: { device_id?: string } }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = request.params;
        const deviceId = request.query.device_id;

        if (!deviceId) {
          return reply.status(400).send({
            success: false,
            error_code: "MISSING_DEVICE_ID",
            message: "device_id query parameter is required",
          });
        }

        const rowResult = (await db.execute(sql`
          SELECT
            device_id,
            total_points,
            total_visits,
            streak_count,
            last_visit_at
          FROM leaderboards
          WHERE campaign_id = ${id} AND device_id = ${deviceId}
          LIMIT 1;
        `)) as unknown as Array<{
          device_id: string;
          total_points: number;
          total_visits: number;
          streak_count: number;
          last_visit_at: Date | null;
        }>;

        const row = rowResult[0] ?? {
          device_id: deviceId,
          total_points: 0,
          total_visits: 0,
          streak_count: 0,
          last_visit_at: null,
        };

        const rankResult = (await db.execute(sql`
          SELECT COUNT(*) + 1 AS rank
          FROM leaderboards
          WHERE campaign_id = ${id} AND total_points > ${row.total_points};
        `)) as unknown as Array<{ rank: number }>;

        const visitedResult = (await db.execute(sql`
          SELECT geofence_id
          FROM campaign_progress
          WHERE campaign_id = ${id} AND device_id = ${deviceId};
        `)) as unknown as Array<{ geofence_id: string }>;

        const response = {
          success: true as const,
          data: {
            campaign_id: id,
            device_id: row.device_id,
            total_points: row.total_points,
            total_visits: row.total_visits,
            streak_count: row.streak_count,
            rank: Number(rankResult[0]?.rank ?? 1),
            visited_geofence_ids: visitedResult.map((v) => v.geofence_id),
          },
        };

        return reply.status(200).send(CampaignMeResponseSchema.parse(response));
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({
          success: false,
          error_code: "ERR_INTERNAL",
          message: "Failed to fetch campaign progress",
        });
      }
    },
  );
}

export async function recordCampaignVisit(
  campaignId: string,
  deviceId: string,
  geofenceId: string,
  verificationId: string,
  userId?: string,
): Promise<{ pointsEarned: number; rank: number }> {
  // Fetch campaign geofence metadata
  const mappingResult = (await db.execute(sql`
    SELECT visit_weight, required_visit_order
    FROM campaign_geofences
    WHERE campaign_id = ${campaignId} AND geofence_id = ${geofenceId}
    LIMIT 1;
  `)) as unknown as Array<{ visit_weight: number; required_visit_order: number | null }>;

  const mapping = mappingResult[0];
  const visitWeight = mapping?.visit_weight ?? 1;

  // Idempotent insert into campaign_progress
  await db.execute(sql`
    INSERT INTO campaign_progress (campaign_id, device_id, user_id, geofence_id, verification_id, earned_points)
    VALUES (${campaignId}, ${deviceId}, ${userId ?? null}, ${geofenceId}, ${verificationId}, ${visitWeight})
    ON CONFLICT (campaign_id, device_id, geofence_id) DO NOTHING;
  `);

  // Check whether progress was newly inserted; if not, no points should be awarded again.
  const progressResult = (await db.execute(sql`
    SELECT earned_points
    FROM campaign_progress
    WHERE campaign_id = ${campaignId} AND device_id = ${deviceId} AND geofence_id = ${geofenceId}
    LIMIT 1;
  `)) as unknown as Array<{ earned_points: number }>;

  const pointsEarned = progressResult[0]?.earned_points ?? 0;

  // Update leaderboard
  await db.execute(sql`
    INSERT INTO leaderboards (campaign_id, device_id, user_id, total_points, total_visits, streak_count, last_visit_at)
    VALUES (${campaignId}, ${deviceId}, ${userId ?? null}, ${pointsEarned}, 1, 1, NOW())
    ON CONFLICT (campaign_id, device_id) DO UPDATE SET
      total_points = leaderboards.total_points + EXCLUDED.total_points,
      total_visits = leaderboards.total_visits + 1,
      user_id = COALESCE(${userId ?? null}, leaderboards.user_id),
      streak_count = CASE
        WHEN leaderboards.last_visit_at IS NULL THEN 1
        WHEN leaderboards.last_visit_at > NOW() - INTERVAL '${STREAK_WINDOW_HOURS} hours' THEN leaderboards.streak_count + 1
        ELSE 1
      END,
      last_visit_at = NOW(),
      updated_at = NOW();
  `);

  // Compute rank
  const rankResult = (await db.execute(sql`
    SELECT COUNT(*) + 1 AS rank
    FROM leaderboards
    WHERE campaign_id = ${campaignId} AND total_points > (
      SELECT total_points FROM leaderboards WHERE campaign_id = ${campaignId} AND device_id = ${deviceId} LIMIT 1
    );
  `)) as unknown as Array<{ rank: number }>;

  return { pointsEarned, rank: Number(rankResult[0]?.rank ?? 1) };
}

export async function isCampaignEligible(campaignId: string): Promise<{
  eligible: boolean;
  reason?: string;
  reward?: { type: string; amount: number; currency: string } | null;
  actionType?: string;
}> {
  const rows = (await db.execute(sql`
    SELECT
      action_type,
      starts_at,
      ends_at,
      is_active,
      total_budget_limit,
      total_budget_spent,
      reward_type,
      reward_amount,
      reward_currency
    FROM campaigns
    WHERE id = ${campaignId}
    LIMIT 1;
  `)) as unknown as Array<{
    action_type: string;
    starts_at: Date;
    ends_at: Date;
    is_active: boolean;
    total_budget_limit: string | null;
    total_budget_spent: string;
    reward_type: string | null;
    reward_amount: string | null;
    reward_currency: string;
  }>;

  if (rows.length === 0) {
    return { eligible: false, reason: "Campaign not found" };
  }

  const c = rows[0];
  const now = new Date();

  if (!c.is_active) return { eligible: false, reason: "Campaign is inactive" };
  if (now < c.starts_at) return { eligible: false, reason: "Campaign has not started" };
  if (now > c.ends_at) return { eligible: false, reason: "Campaign has ended" };

  if (c.total_budget_limit) {
    const limit = Number(c.total_budget_limit);
    const spent = Number(c.total_budget_spent);
    if (spent >= limit) return { eligible: false, reason: "Campaign budget exhausted" };
  }

  const reward =
    c.reward_type && c.reward_amount
      ? { type: c.reward_type, amount: Number(c.reward_amount), currency: c.reward_currency }
      : null;

  return { eligible: true, reward, actionType: c.action_type };
}
