import { z } from "zod";

export const InitiateLinkSchema = z.object({
  device_id: z.string().min(16).max(128),
  phone_number: z.string().min(5).max(20).optional(),
  email: z.string().email().optional(),
  full_name: z.string().max(255).optional(),
}).refine((data) => data.phone_number || data.email, {
  message: "Either phone_number or email is required",
  path: ["phone_number"],
});

export const VerifyLinkSchema = z.object({
  device_id: z.string().min(16).max(128),
  code: z.string().length(6),
});

export const LookupUserSchema = z.object({
  device_id: z.string().min(16).max(128),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  phone_number: z.string().optional(),
  email: z.string().email().optional(),
  full_name: z.string().optional(),
  is_verified: z.boolean(),
  created_at: z.string().datetime(),
});

export const UserDeviceSchema = z.object({
  user_id: z.string().uuid(),
  device_id: z.string(),
  linked_at: z.string().datetime(),
});

export const UserWalletSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  balance: z.number(),
  currency: z.string(),
  updated_at: z.string().datetime(),
});

export const UserProfileResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: UserSchema,
    devices: z.array(UserDeviceSchema),
    wallet: UserWalletSchema,
  }),
});

export const UserLinkResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: UserSchema,
    otp_sent: z.boolean(),
  }),
});

export const UserVerifyResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: UserSchema,
    linked: z.boolean(),
  }),
});

export type InitiateLinkRequest = z.infer<typeof InitiateLinkSchema>;
export type VerifyLinkRequest = z.infer<typeof VerifyLinkSchema>;
export type LookupUserRequest = z.infer<typeof LookupUserSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;
export type UserLinkResponse = z.infer<typeof UserLinkResponseSchema>;
export type UserVerifyResponse = z.infer<typeof UserVerifyResponseSchema>;
