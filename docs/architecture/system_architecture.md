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

## Related Architecture Documents

- [Deployment Strategy Architecture](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/architecture/deployment_strategy.md)
- [Inter-App Communication Architecture](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/architecture/inter_app_communication.md)
- [Technical Stack Critique & Tradeoffs](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/architecture/tech_stack_critique_and_tradeoffs.md)
- [Entity Relationship Diagram (ERD)](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/architecture/erd.md)
- [Nationwide Campaign Architecture](file:///home/aniebiet.ebebe@Interswitchng.com/Documents/GitHub/spottgeo-monorepo/docs/architecture/nationwide_campaign_architecture.md)

