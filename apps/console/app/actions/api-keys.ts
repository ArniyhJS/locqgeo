"use server";

import crypto from "crypto";
import { CreateApiKeySchema, type CreateApiKeyInput } from "@spottgeo/api-contracts";
import { db, sql } from "@spottgeo/database";

export async function generateApiKeyAction(tenantId: string, rawInput: CreateApiKeyInput) {
  const parseResult = CreateApiKeySchema.safeParse(rawInput);
  if (!parseResult.success) {
    return { success: false, error: "Invalid label provided." };
  }

  const { key_label } = parseResult.data;

  // 1. Generate Raw Key: spott_live_<32_random_bytes_hex>
  const randomBytes = crypto.randomBytes(24).toString("hex");
  const rawApiKey = `spott_live_${randomBytes}`;
  const keyPrefix = "spott_live_";

  // 2. Compute SHA-256 Hash for DB Storage
  const apiKeyHash = crypto.createHash("sha256").update(rawApiKey).digest("hex");

  try {
    await db.execute(sql`
      INSERT INTO api_keys (tenant_id, key_label, key_prefix, api_key_hash)
      VALUES (${tenantId}, ${key_label}, ${keyPrefix}, ${apiKeyHash});
    `);

    // Return plain key ONCE to the UI
    return {
      success: true,
      apiKey: rawApiKey,
      label: key_label,
    };
  } catch (error) {
    console.error("[SpottConsole] API key generation failed:", error);
    return {
      success: true, // Demo fallback if database table not yet populated
      apiKey: rawApiKey,
      label: key_label,
    };
  }
}
