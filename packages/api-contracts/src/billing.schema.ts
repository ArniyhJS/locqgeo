import { z } from "zod";

export const TopUpWalletSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID format"),
  amountNgn: z.number().min(1000, "Minimum top-up amount is NGN 1,000"),
  gateway: z.enum(["PAYSTACK", "FLUTTERWAVE", "STRIPE"]),
  reference: z.string().min(3, "Reference is required"),
});

export type TopUpWalletInput = z.infer<typeof TopUpWalletSchema>;

export const CreateInvoiceRequestSchema = z.object({
  tenantId: z.string().uuid("Invalid tenant ID format"),
  poNumber: z.string().max(100, "PO number exceeds 100 characters").optional(),
  amountNgn: z.number().min(50000, "Minimum invoice request is NGN 50,000"),
  dueDate: z.string().datetime("Invalid ISO datetime string"),
});

export type CreateInvoiceRequestInput = z.infer<typeof CreateInvoiceRequestSchema>;

export const UpdateCampaignBudgetSchema = z.object({
  campaignId: z.string().uuid("Invalid campaign ID format"),
  totalBudgetCapNgn: z.number().min(1000, "Minimum total budget cap is NGN 1,000"),
  dailyBudgetCapNgn: z.number().min(500, "Minimum daily budget cap is NGN 500"),
});

export type UpdateCampaignBudgetInput = z.infer<typeof UpdateCampaignBudgetSchema>;

export const UpdateUserRoleSchema = z.object({
  targetUserId: z.string().uuid("Invalid user ID format"),
  newRole: z.enum(["OWNER", "ADMIN", "CAMPAIGN_MANAGER", "FINANCIAL_AUDITOR", "VIEWER"]),
});

export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
