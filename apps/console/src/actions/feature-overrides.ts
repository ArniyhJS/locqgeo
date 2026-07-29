"use server";

import { CreateFeatureOverrideSchema, type CreateFeatureOverrideInput } from "@spottgeo/api-contracts";
import { randomUUID } from "crypto";

export async function createFeatureOverrideAction(input: CreateFeatureOverrideInput) {
  const parsed = CreateFeatureOverrideSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten() };
  }

  const overrideId = randomUUID();

  return { success: true as const, overrideId };
}
