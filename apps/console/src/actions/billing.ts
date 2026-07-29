"use server";

import { TopUpWalletSchema, type TopUpWalletInput } from "@spottgeo/api-contracts";

export type TopUpWalletActionResult =
  | { success: true; transactionId: string }
  | { success: false; error: any };

export async function topUpWalletAction(input: TopUpWalletInput): Promise<TopUpWalletActionResult> {
  const parsed = TopUpWalletSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten(),
    };
  }

  // Generate transaction ID reference
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return {
    success: true,
    transactionId,
  };
}
