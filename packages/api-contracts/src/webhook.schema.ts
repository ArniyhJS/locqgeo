import { z } from "zod";

export const CreateWebhookSubscriptionSchema = z.object({
  targetUrl: z
    .string()
    .url("Must be a valid URL")
    .refine((url) => url.startsWith("https://"), "Webhooks must use HTTPS protocol"),
  subscribedEvents: z
    .array(z.enum(["verification.created", "reward.queued", "reward.completed", "reward.failed", "fraud.flagged"]))
    .min(1, "At least one event must be selected"),
  ipWhitelist: z.array(z.string()).optional(),
});

export type CreateWebhookSubscriptionInput = z.infer<typeof CreateWebhookSubscriptionSchema>;

export const GenerateApiKeySchema = z.object({
  keyLabel: z.string().min(2, "Key label must be at least 2 characters").max(100),
  environment: z.enum(["LIVE", "TEST"]).default("TEST"),
});

export type GenerateApiKeyInput = z.infer<typeof GenerateApiKeySchema>;

export const WebhookDeliveryQuerySchema = z.object({
  subscriptionId: z.string().uuid().optional(),
  status: z.enum(["SUCCESS", "PENDING", "FAILED"]).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type WebhookDeliveryQueryInput = z.infer<typeof WebhookDeliveryQuerySchema>;
