import type { FastifyInstance } from "fastify";
import { PingRequestSchema, type PingResponse } from "@spottgeo/api-contracts";
import { AntiCheatFilter } from "../plugins/anticheat.js";
import { buildSpatialDistanceQuery } from "@spottgeo/database";

export async function pingRoutes(fastify: FastifyInstance) {
  fastify.post("/api/v1/grid/ping", async (request, reply) => {
    // 1. Validate payload with Zod contract
    const parseResult = PingRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        status: "REJECTED_ANTICHEAT",
        claim_eligible: false,
        reason: "Invalid request contract schema",
        errors: parseResult.error.errors,
      });
    }

    const ping = parseResult.data;

    // 2. Run 4-Step Anti-Cheat Filter
    const anticheatEval = AntiCheatFilter.evaluatePing(
      ping.latitude,
      ping.longitude,
      ping.accuracy_meters,
      ping.velocity_mps || 0
    );

    if (!anticheatEval.passed) {
      const response: PingResponse = {
        status: "REJECTED_ANTICHEAT",
        claim_eligible: false,
        reason: anticheatEval.reason || "Failed anti-cheat verification",
        anticheat: {
          velocity_valid: anticheatEval.velocityValid,
          accuracy_valid: anticheatEval.accuracyValid,
          spoof_score: anticheatEval.spoofScore,
        },
      };
      return reply.status(422).send(response);
    }

    // 3. Compute distance (simulated target node coordinates for node_id)
    // Target node coordinates demo (e.g. Lagos City Center: 6.5244, 3.3792)
    const nodeTargetLat = 6.5244;
    const nodeTargetLng = 3.3792;
    const geofenceRadiusMeters = 500;

    const distanceMeters = buildSpatialDistanceQuery(
      ping.latitude,
      ping.longitude,
      nodeTargetLat,
      nodeTargetLng
    );

    const isWithinGeofence = distanceMeters <= geofenceRadiusMeters;

    const response: PingResponse = {
      status: isWithinGeofence ? "ACCEPTED" : "OUT_OF_BOUNDS",
      distance_meters: Math.round(distanceMeters),
      claim_eligible: isWithinGeofence,
      reason: isWithinGeofence ? "Device within target geofence" : "Device outside target geofence",
      anticheat: {
        velocity_valid: true,
        accuracy_valid: true,
        spoof_score: anticheatEval.spoofScore,
      },
    };

    return reply.status(200).send(response);
  });
}
