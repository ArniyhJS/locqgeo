import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db, sql } from "@spottgeo/database";
import {
  InitiateLinkSchema,
  UserLinkResponseSchema,
  UserProfileResponseSchema,
  LookupUserSchema,
} from "@spottgeo/api-contracts";

export async function userRoutes(fastify: FastifyInstance) {
  // POST /api/v1/users/link
  // Progressive identity: create/link a user to a device without breaking anonymous scans.
  fastify.post("/api/v1/users/link", async (request: FastifyRequest, reply: FastifyReply) => {
    const parseResult = InitiateLinkSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        success: false,
        error_code: "INVALID_PAYLOAD",
        message: "Request body failed validation",
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { device_id, phone_number, email, full_name } = parseResult.data;

    try {
      // Find existing user by phone or email
      let userRows: Array<{ id: string; phone_number: string | null; email: string | null; full_name: string | null; is_verified: boolean; created_at: Date }> = [];

      if (phone_number) {
        const byPhone = (await db.execute(sql`
          SELECT id, phone_number, email, full_name, is_verified, created_at
          FROM users
          WHERE phone_number = ${phone_number}
          LIMIT 1;
        `)) as unknown as typeof userRows;
        userRows = byPhone;
      }

      if (userRows.length === 0 && email) {
        const byEmail = (await db.execute(sql`
          SELECT id, phone_number, email, full_name, is_verified, created_at
          FROM users
          WHERE email = ${email}
          LIMIT 1;
        `)) as unknown as typeof userRows;
        userRows = byEmail;
      }

      let userId: string;
      let isNew = false;

      if (userRows.length > 0) {
        userId = userRows[0].id;
        await db.execute(sql`
          UPDATE users
          SET
            phone_number = COALESCE(${phone_number ?? null}, phone_number),
            email = COALESCE(${email ?? null}, email),
            full_name = COALESCE(${full_name ?? null}, full_name),
            is_verified = true,
            updated_at = NOW()
          WHERE id = ${userId};
        `);
      } else {
        isNew = true;
        const insertResult = (await db.execute(sql`
          INSERT INTO users (phone_number, email, full_name, is_verified)
          VALUES (${phone_number ?? null}, ${email ?? null}, ${full_name ?? null}, true)
          RETURNING id, phone_number, email, full_name, is_verified, created_at;
        `)) as unknown as typeof userRows;
        userId = insertResult[0].id;
      }

      // Link device to user (idempotent)
      await db.execute(sql`
        INSERT INTO user_devices (user_id, device_id)
        VALUES (${userId}, ${device_id})
        ON CONFLICT (user_id, device_id) DO NOTHING;
      `);

      // Ensure wallet exists
      await db.execute(sql`
        INSERT INTO user_wallets (user_id)
        VALUES (${userId})
        ON CONFLICT (user_id) DO NOTHING;
      `);

      // Backfill user_id onto recent anonymous records so history follows the user
      await db.execute(sql`
        UPDATE verifications
        SET user_id = ${userId}
        WHERE user_id IS NULL AND device_id = ${device_id};
      `);

      await db.execute(sql`
        UPDATE campaign_progress
        SET user_id = ${userId}
        WHERE user_id IS NULL AND device_id = ${device_id};
      `);

      await db.execute(sql`
        UPDATE leaderboards
        SET user_id = ${userId}
        WHERE user_id IS NULL AND device_id = ${device_id};
      `);

      // Recompute leaderboard points by user if needed (simple sum for now)
      await db.execute(sql`
        UPDATE leaderboards l
        SET total_points = sub.total,
            total_visits = sub.visits,
            user_id = ${userId}
        FROM (
          SELECT campaign_id, COALESCE(SUM(earned_points), 0) AS total, COUNT(*) AS visits
          FROM campaign_progress
          WHERE device_id = ${device_id} OR user_id = ${userId}
          GROUP BY campaign_id
        ) sub
        WHERE l.campaign_id = sub.campaign_id
          AND (l.device_id = ${device_id} OR l.user_id = ${userId});
      `);

      const response = {
        success: true as const,
        data: {
          user: {
            id: userId,
            phone_number: phone_number ?? userRows[0]?.phone_number ?? undefined,
            email: email ?? userRows[0]?.email ?? undefined,
            full_name: full_name ?? userRows[0]?.full_name ?? undefined,
            is_verified: true,
            created_at: isNew
              ? (userRows[0]?.created_at ?? new Date()).toISOString()
              : userRows[0].created_at.toISOString(),
          },
          otp_sent: false,
        },
      };

      return reply.status(200).send(UserLinkResponseSchema.parse(response));
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error_code: "ERR_INTERNAL", message: "Failed to link user" });
    }
  });

  // GET /api/v1/users/me?device_id=...
  fastify.get("/api/v1/users/me", async (request: FastifyRequest<{ Querystring: { device_id?: string } }>, reply: FastifyReply) => {
    try {
      const parseResult = LookupUserSchema.safeParse({ device_id: request.query.device_id ?? "" });
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error_code: "INVALID_DEVICE_ID",
          message: "device_id query parameter is required",
        });
      }

      const { device_id } = parseResult.data;

      const userResult = (await db.execute(sql`
        SELECT u.id, u.phone_number, u.email, u.full_name, u.is_verified, u.created_at
        FROM users u
        JOIN user_devices ud ON ud.user_id = u.id
        WHERE ud.device_id = ${device_id}
        LIMIT 1;
      `)) as unknown as Array<{
        id: string;
        phone_number: string | null;
        email: string | null;
        full_name: string | null;
        is_verified: boolean;
        created_at: Date;
      }>;

      if (userResult.length === 0) {
        return reply.status(404).send({ success: false, error_code: "USER_NOT_FOUND", message: "No user linked to this device" });
      }

      const user = userResult[0];

      const devicesResult = (await db.execute(sql`
        SELECT user_id, device_id, linked_at
        FROM user_devices
        WHERE user_id = ${user.id};
      `)) as unknown as Array<{ user_id: string; device_id: string; linked_at: Date }>;

      const walletResult = (await db.execute(sql`
        SELECT id, user_id, balance, currency, updated_at
        FROM user_wallets
        WHERE user_id = ${user.id}
        LIMIT 1;
      `)) as unknown as Array<{ id: string; user_id: string; balance: string; currency: string; updated_at: Date }>;

      const wallet = walletResult[0] ?? {
        id: "",
        user_id: user.id,
        balance: "0",
        currency: "NGN",
        updated_at: new Date(),
      };

      const response = {
        success: true as const,
        data: {
          user: {
            id: user.id,
            phone_number: user.phone_number ?? undefined,
            email: user.email ?? undefined,
            full_name: user.full_name ?? undefined,
            is_verified: user.is_verified,
            created_at: user.created_at.toISOString(),
          },
          devices: devicesResult.map((d) => ({
            user_id: d.user_id,
            device_id: d.device_id,
            linked_at: d.linked_at.toISOString(),
          })),
          wallet: {
            id: wallet.id,
            user_id: wallet.user_id,
            balance: Number(wallet.balance),
            currency: wallet.currency,
            updated_at: wallet.updated_at.toISOString(),
          },
        },
      };

      return reply.status(200).send(UserProfileResponseSchema.parse(response));
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error_code: "ERR_INTERNAL", message: "Failed to lookup user" });
    }
  });
}
