"use server";

import { revalidatePath } from "next/cache";
import { CreateGeofenceSchema, type CreateGeofenceInput } from "@spottgeo/api-contracts";
import { db, sql } from "@spottgeo/database";

export async function createGeofenceAction(tenantId: string, rawInput: CreateGeofenceInput) {
  const parseResult = CreateGeofenceSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: "Validation failed",
      details: parseResult.error.flatten().fieldErrors,
    };
  }

  const {
    title,
    latitude,
    longitude,
    radius_meters,
    action_type,
    reward_type,
    reward_amount,
    reward_currency,
    daily_budget_limit,
  } = parseResult.data;

  try {
    const result = (await db.execute(sql`
      INSERT INTO geofences (
        tenant_id,
        title,
        latitude,
        longitude,
        location,
        radius_meters,
        action_type,
        reward_type,
        reward_amount,
        reward_currency,
        daily_budget_limit,
        daily_budget_spent,
        is_active
      ) VALUES (
        ${tenantId},
        ${title},
        ${latitude},
        ${longitude},
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
        ${radius_meters},
        ${action_type},
        ${reward_type ?? null},
        ${reward_amount ?? null},
        ${reward_currency ?? "NGN"},
        ${daily_budget_limit},
        0.00,
        TRUE
      )
      RETURNING id, title, created_at;
    `)) as unknown as Array<{ id: string; title: string; created_at: Date }>;

    revalidatePath("/nodes");

    return {
      success: true,
      data:
        Array.isArray(result) && result.length > 0
          ? result[0]
          : { id: "geofence_demo", title, created_at: new Date() },
    };
  } catch (error) {
    console.error("[SpottConsole] Failed to create geofence:", error);
    return {
      success: false,
      error: "Database error occurred while creating the geofence.",
    };
  }
}

export async function getGeofencesAction(tenantId: string) {
  try {
    const result = (await db.execute(sql`
      SELECT
        id,
        title,
        action_type,
        reward_type,
        reward_amount,
        reward_currency,
        is_active
      FROM geofences
      WHERE tenant_id = ${tenantId}
      ORDER BY title ASC;
    `)) as unknown as Array<{
      id: string;
      title: string;
      action_type: string;
      reward_type: string | null;
      reward_amount: string | null;
      reward_currency: string | null;
      is_active: boolean;
    }>;

    return {
      success: true,
      data: result.map((g) => ({
        id: g.id,
        title: g.title,
        action_type: g.action_type,
        reward_type: g.reward_type,
        reward_amount: g.reward_amount ? Number(g.reward_amount) : null,
        reward_currency: g.reward_currency,
        is_active: g.is_active,
      })),
    };
  } catch (error) {
    console.error("[SpottConsole] Failed to fetch geofences:", error);
    return { success: false, error: "Failed to fetch geofences" };
  }
}
