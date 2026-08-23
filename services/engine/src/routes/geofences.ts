import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db, sql } from "@locqgeo/database";
import {
  CreateGeofenceSchema,
  BulkGeofenceCsvRowSchema,
  type CreateGeofenceInput,
  z,
} from "@locqgeo/api-contracts";

const BulkImportRequestSchema = z.object({
  tenant_id: z.string().uuid("tenant_id must be a valid UUID v4"),
  geofences: z.array(BulkGeofenceCsvRowSchema).min(1, "At least 1 geofence row is required"),
});

export async function geofenceRoutes(fastify: FastifyInstance) {
  // POST /api/v1/engine/geofences (Single Geofence Creation)
  fastify.post(
    "/api/v1/engine/geofences",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const bodyWithTenant = request.body as CreateGeofenceInput & { tenant_id?: string };
        const parseResult = CreateGeofenceSchema.safeParse(bodyWithTenant);

        if (!parseResult.success) {
          return reply.status(400).send({
            success: false,
            error_code: "INVALID_PAYLOAD",
            message: "Request body failed validation",
            details: parseResult.error.flatten().fieldErrors,
          });
        }

        const data = parseResult.data;
        const tenantId = bodyWithTenant.tenant_id;

        if (!tenantId) {
          return reply.status(400).send({
            success: false,
            error_code: "MISSING_TENANT_ID",
            message: "tenant_id is required to create a geofence",
          });
        }

        const result = (await db.execute(sql`
          INSERT INTO geofences (
            tenant_id, title, latitude, longitude, radius_meters,
            action_type, reward_type, reward_amount, reward_currency, daily_budget_limit, location
          ) VALUES (
            ${tenantId},
            ${data.title},
            ${data.latitude},
            ${data.longitude},
            ${data.radius_meters},
            ${data.action_type},
            ${data.reward_type ?? null},
            ${data.reward_amount ?? null},
            ${data.reward_currency},
            ${data.daily_budget_limit},
            ST_SetSRID(ST_MakePoint(${data.longitude}, ${data.latitude}), 4326)::geography
          )
          RETURNING id;
        `)) as unknown as Array<{ id: string }>;

        return reply.status(201).send({
          success: true,
          data: { id: result[0].id, title: data.title },
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({
          success: false,
          error_code: "ERR_INTERNAL",
          message: "Failed to create geofence",
        });
      }
    },
  );

  // POST /api/v1/engine/geofences/bulk (Batch Import CSV / Array of Geofences)
  fastify.post(
    "/api/v1/engine/geofences/bulk",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const parseResult = BulkImportRequestSchema.safeParse(request.body);
        if (!parseResult.success) {
          return reply.status(400).send({
            success: false,
            error_code: "INVALID_PAYLOAD",
            message: "Bulk request failed validation",
            details: parseResult.error.flatten().fieldErrors,
          });
        }

        const { tenant_id, geofences } = parseResult.data;
        let insertedCount = 0;

        for (const g of geofences) {
          await db.execute(sql`
            INSERT INTO geofences (
              tenant_id, title, latitude, longitude, radius_meters,
              action_type, reward_type, reward_amount, reward_currency, daily_budget_limit, location
            ) VALUES (
              ${tenant_id},
              ${g.title},
              ${g.latitude},
              ${g.longitude},
              ${g.radius_meters},
              ${g.action_type},
              ${g.reward_type ?? null},
              ${g.reward_amount ?? null},
              ${g.reward_currency},
              ${g.daily_budget_limit},
              ST_SetSRID(ST_MakePoint(${g.longitude}, ${g.latitude}), 4326)::geography
            );
          `);
          insertedCount++;
        }

        return reply.status(201).send({
          success: true,
          data: {
            tenant_id,
            imported_count: insertedCount,
            message: `Successfully imported ${insertedCount} geofences into PostGIS spatial index`,
          },
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({
          success: false,
          error_code: "ERR_INTERNAL",
          message: "Failed to execute bulk geofence import",
        });
      }
    },
  );
}
