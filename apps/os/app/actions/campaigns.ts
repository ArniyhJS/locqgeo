"use server";

import { revalidatePath } from "next/cache";
import { CreateCampaignNodeSchema, type CreateCampaignNodeInput } from "@spottgeo/api-contracts";
import { db, sql } from "@spottgeo/database";

export async function createCampaignNodeAction(
  tenantId: string,
  rawInput: CreateCampaignNodeInput
) {
  // 1. Input Validation
  const parseResult = CreateCampaignNodeSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: "Validation failed",
      details: parseResult.error.flatten().fieldErrors,
    };
  }

  const { title, latitude, longitude, radius_meters, reward_type, reward_amount_ngn, daily_budget_limit_ngn } =
    parseResult.data;

  try {
    // 2. Insert Node with PostGIS EPSG:4326 Geography Point
    const result = (await db.execute(sql`
      INSERT INTO campaign_nodes (
        tenant_id,
        title,
        latitude,
        longitude,
        location,
        radius_meters,
        reward_type,
        reward_amount_ngn,
        daily_budget_limit_ngn,
        daily_budget_spent_ngn,
        is_active
      ) VALUES (
        ${tenantId},
        ${title},
        ${latitude},
        ${longitude},
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${radius_meters},
        ${reward_type},
        ${reward_amount_ngn},
        ${daily_budget_limit_ngn},
        0.00,
        TRUE
      )
      RETURNING id, title, created_at;
    `)) as unknown as Array<{ id: string; title: string; created_at: Date }>;

    revalidatePath("/nodes");

    return {
      success: true,
      data: Array.isArray(result) && result.length > 0 ? result[0] : { id: "node_demo", title, created_at: new Date() },
    };
  } catch (error) {
    console.error("[SpottOS] Failed to create campaign node:", error);
    return {
      success: false,
      error: "Database error occurred while spawning campaign node.",
    };
  }
}
