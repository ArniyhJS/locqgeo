"use server";

import { UnblockDeviceSchema, type UnblockDeviceInput } from "@locqgeo/api-contracts";

export type UnblockDeviceActionResult =
  | { success: true; targetDeviceId: string }
  | { success: false; error: unknown };

export async function unblockDeviceAction(
  input: UnblockDeviceInput
): Promise<UnblockDeviceActionResult> {
  const parsed = UnblockDeviceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten(),
    };
  }

  return {
    success: true,
    targetDeviceId: parsed.data.targetDeviceId,
  };
}
