# System Architecture Diagram

```
                       +-----------------------------------+
                       |        Consumer Mobile User       |
                       |       (SpottDrop Next.js PWA)     |
                       +-----------------+-----------------+
                                         |
                                  HTTP POST /api/v1/engine/verify
                                         |
                                         v
                       +-----------------------------------+
                       |    SpottEngine Core Engine          |
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
                       +---------------+   +---------------+
                                                   ^
                                                   |
                       +---------------------------+-------+
                       |    SpottConsole B2B Dashboard          |
                       |    (Next.js App Router - Port 3000)|
                       +-----------------------------------+
```
