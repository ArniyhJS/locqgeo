# Advanced Anti-Cheat AI & Fraud Detection Engine — Design Specification

**Document Version**: 1.0.0  
**Date**: 2026-07-29  
**Status**: APPROVED  
**Target Workspace**: `services/engine`, `packages/database`, `packages/api-contracts`, `apps/console`  

---

## 1. Overview & Business Intent

This specification details the **Advanced Anti-Cheat AI & Fraud Detection Engine** for SpottEngine and SpottConsole. The system upgrades SpottEngine's presence verification pipeline into a 6-step scoring engine that computes a composite **`spoof_score` (0–100)** combining **GPS Accuracy Risk**, **Spatial Velocity Risk**, **Network/VPN Risk**, and **Hardware Device Reputation**.

---

## 2. System Architecture & Flow

```text
               ┌─────────────────────────────────────────────────────────┐
               │    POST /api/v1/engine/verify (Fastify 5 Pipeline)      │
               └────────────────────────────┬────────────────────────────┘
                                            │
                                            ▼
               ┌─────────────────────────────────────────────────────────┐
               │ 1. Accuracy Filter (Reject if accuracy > 50.0m)         │
               │ 2. 24h Deduplication Check                              │
               │ 3. Velocity Teleportation Risk (v = delta_d / delta_t)  │
               │ 4. Network Risk (VPN / Datacenter IP lookup)             │
               │ 5. Device Reputation (Trust Score 0-100 lookup)          │
               └────────────────────────────┬────────────────────────────┘
                                            │
                                            ▼
               ┌─────────────────────────────────────────────────────────┐
               │ Step 6: Composite Spoof Score Calculation               │
               │ spoof_score = (0.35 * accuracy_risk)                    │
               │             + (0.30 * velocity_risk)                    │
               │             + (0.20 * network_risk)                     │
               │             + (0.15 * device_risk)                      │
               └────────────────────────────┬────────────────────────────┘
                                            │
           ┌────────────────────────────────┼────────────────────────────────┐
           │                                │                                │
  spoof_score < 30                30 <= spoof_score < 60           spoof_score >= 60
   (Low Risk)                       (Medium Risk)                    (High Risk)
           │                                │                                │
           ▼                                ▼                                ▼
┌─────────────────────┐          ┌─────────────────────┐          ┌─────────────────────┐
│ Status: VERIFIED    │          │ Status:             │          │ Status:             │
│ - Instant Payout    │          │ VERIFIED_FLAGGED    │          │ REJECTED_SPOOF      │
│ - +5 Trust Recovery │          │ - Payout held 24h   │          │ - Hard Rejection    │
│                     │          │ - Log Fraud Alert   │          │ - -20 Trust Penalty │
└─────────────────────┘          └─────────────────────┘          └─────────────────────┘
```

---

## 3. Data Model & Schema Contracts

### 3.1 Drizzle ORM Database Tables (`packages/database`)

```typescript
// 1. Device Reputation Table
export const deviceReputation = pgTable("device_reputation", {
  id: uuid("id").primaryKey().defaultRandom(),
  deviceId: varchar("device_id", { length: 128 }).notNull().unique(),
  trustScore: integer("trust_score").notNull().default(100),
  totalPings: integer("total_pings").notNull().default(0),
  verifiedPings: integer("verified_pings").notNull().default(0),
  spoofsBlocked: integer("spoofs_blocked").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("HEALTHY"), // HEALTHY, SUSPICIOUS, BLOCKED
  lastSeenIp: varchar("last_seen_ip", { length: 45 }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// 2. IP Intelligence Cache Table
export const ipIntelligenceCache = pgTable("ip_intelligence_cache", {
  ipAddress: varchar("ip_address", { length: 45 }).primaryKey(),
  isVpn: boolean("is_vpn").notNull().default(false),
  isDatacenter: boolean("is_datacenter").notNull().default(false),
  isProxy: boolean("is_proxy").notNull().default(false),
  riskScore: integer("risk_score").notNull().default(0),
  cachedUntil: timestamp("cached_until", { withTimezone: true }).notNull(),
});

// 3. Fraud Alerts Audit Trail
export const fraudAlerts = pgTable("fraud_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  deviceId: varchar("device_id", { length: 128 }).notNull(),
  pingId: uuid("ping_id").notNull().references(() => checkinPings.id),
  spoofScore: integer("spoof_score").notNull(),
  breakdownJson: jsonb("breakdown_json").notNull(),
  actionTaken: varchar("action_taken", { length: 30 }).notNull(), // VERIFIED, VERIFIED_FLAGGED, REJECTED_SPOOF
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

### 3.2 Zod API Contracts (`packages/api-contracts`)

```typescript
export const SpoofScoreBreakdownSchema = z.object({
  accuracyRisk: z.number().min(0).max(100),
  velocityRisk: z.number().min(0).max(100),
  networkRisk: z.number().min(0).max(100),
  deviceRisk: z.number().min(0).max(100),
  compositeSpoofScore: z.number().min(0).max(100),
});

export const UnblockDeviceSchema = z.object({
  targetDeviceId: z.string().min(16).max(128),
  reason: z.string().min(3),
});
```

---

## 4. Composite Spoof Score Calculation Engine (`services/engine`)

```typescript
export interface SpoofScoreResult {
  spoofScore: number;
  action: "VERIFIED" | "VERIFIED_FLAGGED" | "REJECTED_SPOOF";
  breakdown: {
    accuracyRisk: number;
    velocityRisk: number;
    networkRisk: number;
    deviceRisk: number;
  };
}

export function calculateSpoofScore(params: {
  accuracyMeters: number;
  velocityMps: number;
  isVpnOrProxy: boolean;
  deviceTrustScore: number;
}): SpoofScoreResult {
  // 1. Accuracy Risk (0 to 100)
  const accuracyRisk = Math.min(100, Math.max(0, (params.accuracyMeters - 10) * 2.5));

  // 2. Velocity Risk (0 to 100)
  const velocityRisk = Math.min(100, Math.max(0, (params.velocityMps - 10) * 2.2));

  // 3. Network Risk (0 or 100)
  const networkRisk = params.isVpnOrProxy ? 100 : 0;

  // 4. Device Risk (100 - trustScore)
  const deviceRisk = Math.max(0, 100 - params.deviceTrustScore);

  // Composite Weighted Score
  const spoofScore = Math.round(
    0.35 * accuracyRisk + 0.3 * velocityRisk + 0.2 * networkRisk + 0.15 * deviceRisk
  );

  let action: "VERIFIED" | "VERIFIED_FLAGGED" | "REJECTED_SPOOF" = "VERIFIED";
  if (spoofScore >= 60) {
    action = "REJECTED_SPOOF";
  } else if (spoofScore >= 30) {
    action = "VERIFIED_FLAGGED";
  }

  return {
    spoofScore,
    action,
    breakdown: {
      accuracyRisk: Math.round(accuracyRisk),
      velocityRisk: Math.round(velocityRisk),
      networkRisk: Math.round(networkRisk),
      deviceRisk: Math.round(deviceRisk),
    },
  };
}
```

---

## 5. SpottConsole Fraud Portal Layout (`apps/console`)

- `/dashboard/fraud`: High-level fraud metrics, Risk Score distribution bar chart.
- `/dashboard/fraud/logs`: Telemetry audit log inspector with 4-factor risk breakdown drawer.
- `/dashboard/fraud/devices`: Device reputation directory with trust score bars.
- `/dashboard/fraud/devices/[id]`: 1-Click "Unblock & Whitelist Device" action.
