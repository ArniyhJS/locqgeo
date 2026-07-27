# Inter-App Communication Architecture

This document details how applications, services, and packages within the **SpottGeo Monorepo** communicate with each other, exchange data, enforce type contracts, and process asynchronous events.

---

## 🏛️ System Topology

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|                                                                                   |
|   +-----------------------+   +-----------------------+   +-------------------+   |
|   |      SpottDrop        |   |      SpottVerify      |   |    SpottConsole   |   |
|   |  Consumer PWA (3001)  |   |  Consumer PWA (3002)  |   |  B2B Admin (3000) |   |
|   +-----------+-----------+   +-----------+-----------+   +---------+---------+   |
+---------------|---------------------------|-------------------------|-------------+
                |                           |                         |
                | HTTP POST                 | HTTP POST               | Direct DB &
                | /api/v1/engine/verify     | /api/v1/engine/verify   | Telemetry API
                v                           v                         v
+-----------------------------------------------------------------------------------+
|                                CORE API LAYER                                     |
|                                                                                   |
|                       +----------------------------------+                        |
|                       |           SpottEngine            |                        |
|                       |   Node.js + Fastify API (8080)   |                        |
|                       +-----------------+----------------+                        |
+-----------------------------------------|-----------------------------------------+
                                          |
                        Zod Schemas       | Drizzle ORM Queries
                  (@spottgeo/api-contracts) | (@spottgeo/database)
                                          v
+-----------------------------------------------------------------------------------+
|                                 DATA & WORKER LAYER                               |
|                                                                                   |
|                               +------------------+                                |
|                               | PostgreSQL DB    |                                |
|                               | (Table Queues)   |                                |
|                               +--------+---------+                                |
|                                        |                                          |
|            ┌───────────────────────────┼───────────────────────────┐              |
|            │ Polling Loop              │ Polling Loop              │ Aggregate    |
|            v (5s)                      v (10s)                     v (60s)        |
|  +-------------------+       +-------------------+       +-------------------+    |
|  |   Payout Worker   |       | Webhook Dispatcher|       | Analytics Worker  |    |
|  | (services/payout) |       | (services/webhook)|       | (services/analyt) |    |
|  +---------+---------+       +---------+---------+       +---------+---------+    |
+------------|---------------------------|---------------------------|--------------+
             |                           |                           |
             v                           v                           v
     External Gateways           Client Webhooks             Pre-Aggregated
   (Paystack/VTpass/FW)        (HMAC SHA-256 Signed)         Console Analytics
```

---

## 📡 Communication Mechanisms

Inter-app communication in SpottGeo uses four distinct patterns depending on latency and coupling requirements:

### 1. HTTP REST APIs (Synchronous Client-to-Engine)

- **Protocols**: HTTP/1.1 (JSON)
- **Primary Endpoint**: `POST /api/v1/engine/verify` hosted by `SpottEngine` on port 8080.
- **Participants**: `SpottDrop` (Consumer PWA) and `SpottVerify` (Attendance PWA) invoke `SpottEngine`.
- **Purpose**: Real-time verification of physical presence claims, anti-cheat evaluation, and instant decision feedback (sub-50ms latency).

### 2. Database Asynchronous Queues (Decoupled Worker Pattern)

- **Pattern**: Transactional Outbox / Table-as-Queue pattern over PostgreSQL.
- **Participants**: `SpottEngine` (Producer) $\rightarrow$ PostgreSQL $\rightarrow$ `PayoutWorker`, `WebhookDispatcher`, `AnalyticsWorker` (Consumers).
- **Purpose**:
  - `SpottEngine` writes verification records to the database with `payout_status = 'QUEUED'` during presence validation.
  - Background workers poll PostgreSQL at fixed intervals (`5000ms` for payouts, `10000ms` for webhooks, `60000ms` for telemetry pre-aggregation), eliminating HTTP coupling or main-thread blockages on user requests.

### 3. Shared TypeScript Data Layer (`@spottgeo/database`)

- **Library**: Drizzle ORM (`packages/database`).
- **Participants**: `SpottEngine`, `SpottConsole`, `PayoutWorker`, `WebhookDispatcher`, and `AnalyticsWorker`.
- **Purpose**:
  - Every server-side application imports a single, centralized database schema and parameterized SQL client from `@spottgeo/database`.
  - Ensures schema consistency across API routes, background workers, and admin actions.

### 4. Shared Contract Schemas (`@spottgeo/api-contracts`)

- **Library**: Zod (`packages/api-contracts`).
- **Participants**: All 10 packages in the monorepo.
- **Purpose**:
  - Request/Response payloads, query parameters, and domain interfaces are defined once in `@spottgeo/api-contracts`.
  - Prevents type drift between Next.js frontends (`SpottConsole`, `SpottDrop`, `SpottVerify`) and Fastify backends (`SpottEngine`).

---

## 🔄 End-to-End Execution Flows

### Flow 1: Presence Verification & Instant Reward Payout

```mermaid
sequenceDiagram
    autonumber
    participant Drop as SpottDrop PWA
    participant Engine as SpottEngine (8080)
    participant DB as PostgreSQL Database
    participant Worker as Payout Worker
    participant Gateway as Payment Gateway (Paystack/VTpass)

    Drop->>Engine: POST /api/v1/engine/verify (device_id, lat, lng, geofence_id or alias)
    Note over Engine: Run 4-Step Anti-Cheat Filter
    Engine->>DB: INSERT INTO checkin_pings & verifications (status='VERIFIED', payout_status='QUEUED')
    Engine-->>Drop: 200 OK { status: 'VERIFIED', payout_status: 'QUEUED' }

    loop Every 5 Seconds
        Worker->>DB: SELECT * FROM verifications WHERE payout_status = 'QUEUED' LIMIT 25
        DB-->>Worker: Pending Payout Jobs
        Worker->>Gateway: Execute Airtime / Data / Cash Transfer
        Gateway-->>Worker: Payout Success (Ref: PWRK_178507...)
        Worker->>DB: UPDATE verifications SET payout_status = 'COMPLETED'
    end
```

---

### Flow 2: Signed Webhook Event Dispatching

```mermaid
sequenceDiagram
    autonumber
    participant Engine as SpottEngine
    participant DB as PostgreSQL Database
    participant Dispatcher as Webhook Dispatcher
    participant Client as Client Webhook Endpoint

    Engine->>DB: Write Verification Attempt (VERIFIED or FRAUD_FLAGGED)

    loop Every 10 Seconds
        Dispatcher->>DB: SELECT recent verifications ORDER BY created_at DESC
        DB-->>Dispatcher: Verification Records
        Note over Dispatcher: Compute HMAC SHA-256 Signature (x-spottgeo-signature)
        Dispatcher->>Client: POST /webhooks (Payload + Signature Header)
        Client-->>Dispatcher: 200 OK
    end
```

---

### Flow 3: Analytics Pre-Aggregation & Executive Dashboard

```mermaid
sequenceDiagram
    autonumber
    participant Analytics as Analytics Worker
    participant DB as PostgreSQL Database
    participant Console as SpottConsole Dashboard (3000)

    loop Every 60 Seconds
        Analytics->>DB: SELECT COUNT(*) FROM verifications WHERE created_at >= CURRENT_DATE
        DB-->>Analytics: Aggregated Telemetry Totals
        Analytics->>DB: Update daily summary cache
    end

    Console->>DB: Query telemetry metrics & daily pre-aggregated summaries
    DB-->>Console: Pre-aggregated telemetry rows
    Console-->>Console: Render Recharts Velocity & Anti-Cheat Breakdown
```

---

## 🔌 Port & Protocol Matrix

| Service / App                      | Role                                  | Port            | Transport Protocol                       | Connected Services                                        |
| :--------------------------------- | :------------------------------------ | :-------------- | :--------------------------------------- | :-------------------------------------------------------- |
| **`@spottgeo/console`**            | Next.js Enterprise Admin Dashboard    | `3000`          | HTTP / Next.js Server Actions            | PostgreSQL Database, Browser Clients                      |
| **`@spottgeo/drop`**               | Next.js Consumer Gamification PWA     | `3001`          | HTTP (Fetch Client)                      | `SpottEngine` (`:8080/api/v1/engine/verify`)              |
| **`@spottgeo/verify`**             | Next.js Standalone Check-In PWA       | `3002`          | HTTP (Fetch Client)                      | `SpottEngine` (`:8080/api/v1/engine/verify`)              |
| **`@spottgeo/engine`**             | Node.js Fastify Core Verification API | `8080`          | REST API / PostgreSQL Client             | `SpottDrop`, `SpottVerify`, PostgreSQL Database           |
| **`@spottgeo/payout-worker`**      | Asynchronous Payout Processor         | Background Loop | PostgreSQL Polling / HTTPS External      | PostgreSQL Database, Paystack / VTpass / Flutterwave APIs |
| **`@spottgeo/webhook-dispatcher`** | HMAC Webhook Dispatcher               | Background Loop | PostgreSQL Polling / HTTP POST           | PostgreSQL Database, External Client Webhook Endpoints    |
| **`@spottgeo/analytics-worker`**   | Telemetry Aggregator                  | Background Loop | PostgreSQL Polling / SQL Pre-Aggregation | PostgreSQL Database                                       |

---

## 🔐 Security & Cryptographic Communication

1. **API Key Authentication**:
   - SpottConsole generates B2B SDK API keys using `spott_live_<32_random_bytes_hex>`.
   - Keys are stored in the `api_keys` PostgreSQL table strictly as **SHA-256 hashes** (`api_key_hash`).
   - Clients send `x-api-key: spott_live_...` in HTTP headers when calling `SpottEngine`.

2. **Webhook Cryptographic Signatures**:
   - Outbound webhooks sent by `WebhookDispatcher` include an `X-SpottGeo-Signature` HTTP header.
   - The signature is calculated using HMAC SHA-256 over the JSON body with the client's secret key:
     ```ts
     const signature = crypto.createHmac("sha256", secret).update(payloadString).digest("hex");
     ```

3. **Multi-Tenancy Isolation**:
   - All geofences, campaigns, API keys, and verification logs are partitioned by `tenant_id` (UUID) across database tables to guarantee enterprise data isolation.

---

## 🚀 Future Architectural Evolution Path

As verification volume scales from thousands to tens of millions of daily pings, the communication and data pipeline is designed to evolve incrementally without requiring structural application rewrites:

```
[ Phase 1: Current Monorepo ]       [ Phase 2: High-Velocity Scale ]       [ Phase 3: Nationwide Scale ]
  Fastify API + Postgres               Redis / BullMQ Queue Layer              PostgreSQL Read Replicas
  SQL Table-as-Queue Polling    ───►   In-Memory Geofence Caching     ───►   Kafka / NATS Telemetry Streams
  Shared Monorepo Contracts            Redis Sorted Set Leaderboards           Multi-Region Load Balancing
```

### Phase 1: Current Architecture (0 – 1,000,000 Daily Pings)

- **API Core**: Stateless `SpottEngine` Fastify API instances scaled horizontally behind a load balancer.
- **Worker Queuing**: PostgreSQL Transactional Outbox / Table-as-Queue polling loops (`payout_status = 'QUEUED'`).
- **Database**: Single primary PostgreSQL instance with PostGIS spatial indexing.
- **Contracts & Schema**: Monorepo shared Zod contracts (`@spottgeo/api-contracts`) and Drizzle ORM (`@spottgeo/database`).

### Phase 2: High-Velocity Scale (1M – 10M Daily Pings)

- **Redis + BullMQ Queuing**: Replace PostgreSQL table polling with Redis event streams / BullMQ queues (`payout-queue`, `webhook-queue`) for instant sub-millisecond job distribution to `PayoutWorker` and `WebhookDispatcher`.
- **In-Memory Geofence Caching**: Cache active geofence coordinate boundaries in Redis in-memory spatial data structures to eliminate SQL database reads on high-velocity check-in bursts.
- **Real-Time Leaderboard Caching**: Cache campaign leaderboard scores using Redis Sorted Sets (`ZADD`, `ZREVRANGE`) for instant leaderboard rendering.

### Phase 3: Nationwide Enterprise Scale (10M+ Daily Pings)

- **PostgreSQL Read Replicas**: Separate write-heavy presence verifications (Primary DB) from read-heavy `SpottConsole` telemetry and reporting queries (Read Replicas).
- **Distributed Event Streaming**: Route high-frequency raw `checkin_pings` to an event streaming platform (Apache Kafka / NATS) for real-time stream processing and anti-cheat ML model evaluation.
