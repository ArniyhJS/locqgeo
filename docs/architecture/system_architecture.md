# System Architecture Diagram

```
                       +-----------------------------------+
                       |        Consumer Mobile User       |
                       |       (SpottDrop Next.js PWA)     |
                       +-----------------+-----------------+
                                         |
                                  HTTP POST /api/v1/grid/ping
                                         |
                                         v
                       +-----------------------------------+
                       |    SpottGrid Core Engine          |
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
                       |    SpottOS B2B Dashboard          |
                       |    (Next.js App Router - Port 3000)|
                       +-----------------------------------+
```
