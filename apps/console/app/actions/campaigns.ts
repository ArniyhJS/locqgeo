"use server";

import { revalidatePath } from "next/cache";
import { CampaignCreateRequestSchema, type CampaignCreateRequest } from "@spottgeo/api-contracts";
import { db, sql } from "@spottgeo/database";

export async function getCampaignsAction(tenantId: string) {
  try {
    const rows = (await db.execute(sql`
      SELECT
        c.id,
        c.tenant_id,
        c.title,
        c.description,
        c.action_type,
        c.starts_at,
        c.ends_at,
        c.daily_budget_limit,
        c.total_budget_limit,
        c.total_budget_spent,
        c.reward_type,
        c.reward_amount,
        c.reward_currency,
        c.is_active,
        c.created_at,
        COALESCE(jsonb_agg(
          jsonb_build_object(
            'geofence_id', cg.geofence_id,
            'visit_weight', cg.visit_weight,
            'required_visit_order', cg.required_visit_order
          ) ORDER BY cg.required_visit_order NULLS LAST
        ) FILTER (WHERE cg.geofence_id IS NOT NULL), '[]'::jsonb) AS geofences
      FROM campaigns c
      LEFT JOIN campaign_geofences cg ON cg.campaign_id = c.id
      WHERE c.tenant_id = ${tenantId}
      GROUP BY c.id
      ORDER BY c.created_at DESC;
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
      geofences: Array<{
        geofence_id: string;
        visit_weight: number;
        required_visit_order: number | null;
      }>;
    }>;

    const data = rows.map((r) => ({
      id: r.id,
      tenant_id: r.tenant_id,
      title: r.title,
      description: r.description ?? undefined,
      action_type: r.action_type,
      starts_at: new Date(r.starts_at).toISOString(),
      ends_at: new Date(r.ends_at).toISOString(),
      daily_budget_limit: r.daily_budget_limit ? Number(r.daily_budget_limit) : undefined,
      total_budget_limit: r.total_budget_limit ? Number(r.total_budget_limit) : undefined,
      total_budget_spent: Number(r.total_budget_spent),
      reward_type: r.reward_type ?? undefined,
      reward_amount: r.reward_amount ? Number(r.reward_amount) : undefined,
      reward_currency: r.reward_currency,
      is_active: r.is_active,
      geofences: r.geofences.map((g) => ({
        geofence_id: g.geofence_id,
        visit_weight: g.visit_weight,
        required_visit_order: g.required_visit_order ?? undefined,
      })),
      created_at: new Date(r.created_at).toISOString(),
    }));

    return { success: true, data };
  } catch (error) {
    console.error("[SpottConsole] Failed to fetch campaigns:", error);
    return { success: false, error: "Failed to fetch campaigns" };
  }
}

export async function getCampaignByIdAction(campaignId: string) {
  try {
    const campaignRows = (await db.execute(sql`
      SELECT
        c.id,
        c.tenant_id,
        c.title,
        c.description,
        c.action_type,
        c.starts_at,
        c.ends_at,
        c.daily_budget_limit,
        c.total_budget_limit,
        c.total_budget_spent,
        c.reward_type,
        c.reward_amount,
        c.reward_currency,
        c.is_active,
        c.created_at
      FROM campaigns c
      WHERE c.id = ${campaignId}
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
      return { success: false, error: "Campaign not found" };
    }

    const c = campaignRows[0];

    const geofenceRows = (await db.execute(sql`
      SELECT geofence_id, visit_weight, required_visit_order
      FROM campaign_geofences
      WHERE campaign_id = ${campaignId};
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
      starts_at: new Date(c.starts_at).toISOString(),
      ends_at: new Date(c.ends_at).toISOString(),
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
      created_at: new Date(c.created_at).toISOString(),
    };

    return { success: true, data };
  } catch (error) {
    console.error("[SpottConsole] Failed to fetch campaign:", error);
    return { success: false, error: "Failed to fetch campaign" };
  }
}

export async function getCampaignLeaderboardAction(campaignId: string, limit = 20) {
  try {
    const rows = (await db.execute(sql`
      SELECT
        device_id,
        total_points,
        total_visits,
        streak_count,
        last_visit_at,
        RANK() OVER (ORDER BY total_points DESC, updated_at ASC) AS rank
      FROM leaderboards
      WHERE campaign_id = ${campaignId}
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

    return {
      success: true,
      data: rows.map((r) => ({
        rank: Number(r.rank),
        device_id: r.device_id,
        total_points: r.total_points,
        total_visits: r.total_visits,
        streak_count: r.streak_count,
        last_visit_at: r.last_visit_at ? new Date(r.last_visit_at).toISOString() : undefined,
      })),
    };
  } catch (error) {
    console.error("[SpottConsole] Failed to fetch leaderboard:", error);
    return { success: false, error: "Failed to fetch leaderboard" };
  }
}

export async function createCampaignAction(
  tenantId: string,
  rawInput: Omit<CampaignCreateRequest, "tenant_id">,
) {
  const payload = { ...rawInput, tenant_id: tenantId };
  const parseResult = CampaignCreateRequestSchema.safeParse(payload);
  if (!parseResult.success) {
    return {
      success: false,
      error: "Validation failed",
      details: parseResult.error.flatten().fieldErrors,
    };
  }

  const {
    title,
    description,
    action_type,
    starts_at,
    ends_at,
    daily_budget_limit,
    total_budget_limit,
    reward_type,
    reward_amount,
    reward_currency,
    is_active,
    geofences,
  } = parseResult.data;

  try {
    const campaignResult = (await db.execute(sql`
      INSERT INTO campaigns (
        tenant_id,
        title,
        description,
        action_type,
        starts_at,
        ends_at,
        daily_budget_limit,
        total_budget_limit,
        reward_type,
        reward_amount,
        reward_currency,
        is_active
      ) VALUES (
        ${tenantId},
        ${title},
        ${description ?? null},
        ${action_type},
        ${starts_at},
        ${ends_at},
        ${daily_budget_limit ?? null},
        ${total_budget_limit ?? null},
        ${reward_type ?? null},
        ${reward_amount ?? null},
        ${reward_currency},
        ${is_active}
      )
      RETURNING id;
    `)) as unknown as Array<{ id: string }>;

    const campaignId = campaignResult[0].id;

    for (const g of geofences ?? []) {
      await db.execute(sql`
        INSERT INTO campaign_geofences (campaign_id, geofence_id, visit_weight, required_visit_order)
        VALUES (
          ${campaignId},
          ${g.geofence_id},
          ${g.visit_weight},
          ${g.required_visit_order ?? null}
        )
        ON CONFLICT (campaign_id, geofence_id) DO UPDATE SET
          visit_weight = EXCLUDED.visit_weight,
          required_visit_order = EXCLUDED.required_visit_order;
      `);
    }

    revalidatePath("/campaigns");

    return { success: true, data: { id: campaignId, title } };
  } catch (error) {
    console.error("[SpottConsole] Failed to create campaign:", error);
    return { success: false, error: "Database error occurred while creating the campaign." };
  }
}
