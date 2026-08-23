import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/locqgeo";

// Configure parameterized query client
export const queryClient = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(queryClient, { schema });

// Helper function for PostGIS ST_DWithin spatial distance query constructor
export function buildSpatialDistanceQuery(
  lat: number,
  lng: number,
  targetLat: number,
  targetLng: number,
): number {
  // Haversine formula distance helper (in meters)
  const R = 6371000; // Earth radius in meters
  const dLat = ((targetLat - lat) * Math.PI) / 180;
  const dLng = ((targetLng - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((targetLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
