"use server";

import { db, sql } from "@spottgeo/database";

export async function getUsersAction() {
  try {
    const rows = (await db.execute(sql`
      SELECT
        u.id,
        u.phone_number,
        u.email,
        u.full_name,
        u.is_verified,
        u.created_at,
        COALESCE(w.balance, 0) AS balance,
        COALESCE(w.currency, 'NGN') AS currency,
        COALESCE(device_counts.device_count, 0) AS device_count
      FROM users u
      LEFT JOIN user_wallets w ON w.user_id = u.id
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS device_count
        FROM user_devices
        GROUP BY user_id
      ) device_counts ON device_counts.user_id = u.id
      ORDER BY u.created_at DESC;
    `)) as unknown as Array<{
      id: string;
      phone_number: string | null;
      email: string | null;
      full_name: string | null;
      is_verified: boolean;
      created_at: Date;
      balance: string;
      currency: string;
      device_count: number;
    }>;

    return {
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        phone_number: r.phone_number ?? undefined,
        email: r.email ?? undefined,
        full_name: r.full_name ?? undefined,
        is_verified: r.is_verified,
        created_at: r.created_at.toISOString(),
        balance: Number(r.balance),
        currency: r.currency,
        device_count: r.device_count,
      })),
    };
  } catch (error) {
    console.error("[SpottConsole] Failed to fetch users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}
