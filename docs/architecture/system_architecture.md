# System Architecture Diagram

```
                        +-----------------------------------+
                        |        Consumer Mobile Users      |
                        | (SpottDrop & SpottVerify PWAs)    |
                        +-----------------+-----------------+
                                          |
                                   HTTP POST /api/v1/engine/verify
                                          |
                                          v
                        +-----------------------------------+
                        |    SpottEngine Core API           |
                        |    (Fastify Service - Port 8080)  |
                        +-------+-------------------+-------+
                                |                   |
                Zod Contracts   |                   |  PostGIS Queries
             (packages/api-contracts)           (packages/database)
                                |                   |
                                v                   v
                        +---------------+   +---------------+
                        | Anti-Cheat    |   | PostgreSQL +  |
                        | 4-Step Filter |   | PostGIS GiST  |
                        +---------------+   +-------+-------+
                                                    ^
            ┌───────────────────────────────────────┼───────────────────────────────────────┐
            │                                       │                                       │
            v                                       v                                       v
+───────────────────────+               +───────────────────────+               +───────────────────────+
|  Payout Worker        |               | Webhook Dispatcher    |               | Analytics Worker      |
|  (services/payout)    |               | (services/webhook)    |               | (services/analytics)  |
+───────────────────────+               +───────────────────────+               +───────────────────────+
            │                                       │                                       │
            v                                       v                                       v
  Paystack/VTpass/Flutterwave                 Enterprise Webhooks                    SpottConsole Analytics
```

## Microservices Overview

- **`services/engine`**: Stateless Fastify API serving latency-critical location verification calls under 50ms.
- **`services/payout-worker`**: Dedicated background service for executing queued payouts and wallet fallback credits.
- **`services/webhook-dispatcher`**: Microservice for delivering signed outbound HMAC webhooks to enterprise tenants.
- **`services/analytics-worker`**: Pre-aggregates daily verification trends and leaderboard rankings.
