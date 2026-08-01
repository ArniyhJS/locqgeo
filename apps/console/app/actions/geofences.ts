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
        latitude,
        longitude,
        radius_meters,
        action_type,
        reward_type,
        reward_amount,
        reward_currency,
        daily_budget_limit,
        daily_budget_spent,
        is_active,
        created_at
      FROM geofences
      WHERE tenant_id = ${tenantId}
      ORDER BY created_at DESC;
    `)) as unknown as Array<{
      id: string;
      title: string;
      latitude: number;
      longitude: number;
      radius_meters: number;
      action_type: string;
      reward_type: string | null;
      reward_amount: string | null;
      reward_currency: string | null;
      daily_budget_limit: string | null;
      daily_budget_spent: string | null;
      is_active: boolean;
      created_at: string;
    }>;

    return {
      success: true,
      data: result.map((g) => ({
        id: g.id,
        title: g.title,
        latitude: g.latitude,
        longitude: g.longitude,
        radius_meters: g.radius_meters,
        action_type: g.action_type,
        reward_type: g.reward_type,
        reward_amount: g.reward_amount ? Number(g.reward_amount) : null,
        reward_currency: g.reward_currency,
        daily_budget_limit: g.daily_budget_limit ? Number(g.daily_budget_limit) : null,
        daily_budget_spent: g.daily_budget_spent ? Number(g.daily_budget_spent) : 0,
        is_active: g.is_active,
        created_at: new Date(g.created_at).toISOString(),
      })),
    };
  } catch (error) {
    console.error("[SpottConsole] Failed to fetch geofences:", error);
    return { success: false, error: "Failed to fetch geofences" };
  }
}
