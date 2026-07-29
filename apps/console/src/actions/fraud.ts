"use server";

import { UnblockDeviceSchema, type UnblockDeviceInput } from "@spottgeo/api-contracts";

export type UnblockDeviceActionResult =
  | { success: true; targetDeviceId: string }
  | { success: false; error: any };

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
