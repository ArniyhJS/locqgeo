# Nationwide Gamification Campaign Architecture

This document describes the scaled-up deployment architecture required for SpottGeo to host nationwide gamification events.

## Principles

- **Stateless engine instances** allow horizontal scaling behind a load balancer.
- **Decouple payouts** so reward disbursement never blocks the verification response.
- **Cache hot reads** (leaderboards, campaign metadata) to reduce database pressure.
- **Write once, read many** — verification writes hit the primary DB; analytics and leaderboards read from replicas.

## High-Level Architecture

```text
┌──────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐           │
│  │ SpottDrop  │  │ SpottVerify │  │  SpottConsole    │           │
│  │    PWA     │  │     PWA     │  │   Dashboard      │           │
│  └─────┬──────┘  └──────┬──────┘  └────────┬─────────┘           │
│        │                │                  │                     │
│        └────────────────┴──────────────────┘                     │
│                 Cloudflare / AWS CloudFront CDN                  │
└────────────────────────┬─────────────────────────────────────────┘
                         │
┌────────────────────────┼─────────────────────────────────────────┐
│                        ▼                                         │
│              Edge Load Balancer (Cloudflare / ALB)               │
└────────────────────────┬─────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ SpottEngine    │ │ SpottEngine    │ │ SpottEngine    │
│  Instance 1    │ │  Instance 2    │ │  Instance N    │
│   (Fastify)    │ │   (Fastify)    │ │   (Fastify)    │
└───────┬────────┘ └───────┬────────┘ └───────┬────────┘
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│     Redis      │ │     Redis      │ │     Redis      │
│  Rate Limiter  │ │    Sessions    │ │  Leaderboard   │
└────────────────┘ └────────────────┘ └────────────────┘
         │                  │                  │
         └──────────────────┴──────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│  PostgreSQL    │ │  PostgreSQL    │ │  BullMQ /      │
│    Primary     │──│  Read Replica  │ │  Redis Queue   │
│   (PostGIS)    │ │                │ │   (Payouts)    │
└────────────────┘ └────────────────┘ └────────────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │   Reward Providers    │
               │  VTpass, Paystack,    │
               │  Bank APIs, Telco     │
               └───────────────────────┘
```

## Component Responsibilities

### Client Layer

- **SpottDrop / SpottVerify**: Progressive web apps cached by the CDN.
- Capture QR scans, GPS coordinates, and device fingerprints.
- Queue verifications offline when connectivity is poor and sync later.

### CDN / Edge

- Serve static PWA assets globally with low latency.
- Provide DDoS protection, SSL termination, and edge caching for read-only campaign metadata.

### Load Balancer

- Distribute traffic across the nearest healthy SpottEngine instances.
- Apply WAF rules and enforce rate limits at the edge.

### SpottEngine Cluster

- Stateless Fastify containers that run the verification API.
- Scale horizontally based on CPU, memory, or request-queue depth.
- No local state; all persistence goes to PostgreSQL and Redis.

### Redis Layer

- **Rate limiting**: prevent abuse, e.g. max 5 verifications per device per minute.
- **Sessions / JWT cache**: optional authenticated-user sessions.
- **Leaderboard cache**: hold the top-N leaderboard and user rank; refresh asynchronously.
- **Payout queue**: buffer reward jobs during traffic spikes.

### PostgreSQL Layer

- **Primary**: handles writes (verifications, campaign progress, user links).
- **Read replicas**: serve leaderboard queries, analytics, and console reports.
- **PostGIS**: geospatial lookups for radius checks and distance calculations.

### Payout Workers

- Consume jobs from a BullMQ/Redis queue.
- Process reward disbursements through VTpass, Paystack, banks, or telco APIs.
- Retry failed payouts, respect provider rate limits, and update wallet balances.

### Monitoring

- **Prometheus + Grafana**: observe request rates, latency, DB connections, queue depth.
- **Sentry**: collect application errors.
- **PagerDuty / Opsgenie**: alert on payout failures, DB replication lag, or engine errors.

## Request Flow Example

1. A user scans a QR code at a billboard in Kano.
2. The PWA captures GPS + `device_id` (+ optional `user_id`).
3. The request hits the nearest CDN edge and is forwarded to the load balancer.
4. A SpottEngine instance validates the request:
   - Check the rate limit in Redis.
   - Look up the geofence (read replica).
   - Check campaign eligibility (cached + DB).
   - Run velocity and duplicate checks against the primary DB.
5. On success:
   - Write the verification to the PostgreSQL primary.
   - Update `campaign_progress` and `leaderboards`.
   - Queue a reward job in BullMQ if the campaign has a reward.
6. A payout worker completes the reward through the configured provider.
7. The leaderboard cache refreshes asynchronously.

## Scaling Tiers

| Daily Verifications | Recommended Setup                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------- |
| 10,000              | Single engine instance + primary DB                                                      |
| 100,000             | 3+ engine instances + 1 read replica + Redis                                             |
| 1,000,000+          | 10+ engine instances + multiple read replicas + Redis Cluster + dedicated payout workers |

## Deployment Recommendations

| Concern                 | Suggested Technology                                          |
| ----------------------- | ------------------------------------------------------------- |
| Container orchestration | Kubernetes (EKS/GKE) or AWS ECS Fargate                       |
| Database                | AWS RDS PostgreSQL Multi-AZ + read replicas, or Supabase/Neon |
| Cache / Queue           | AWS ElastiCache Redis or Upstash                              |
| Object storage          | AWS S3 or Cloudflare R2 for campaign assets and badge images  |
| CI/CD                   | GitHub Actions → Docker image → ECR/ACR → ECS/Kubernetes      |
| Edge / DNS              | Cloudflare or AWS Route 53 + CloudFront                       |

## Nationwide-Specific Considerations

- **Connectivity gaps**: rural areas may have intermittent network. The PWAs must support offline queuing and background sync.
- **GPS accuracy**: dense urban areas and indoor locations may need beacon or Wi-Fi augmentation.
- **Fraud at scale**: implement device reputation scoring, spoofing detection, velocity anomaly alerts, and caps per device/IP.
- **Reward liquidity**: prefund payout float or have invoicing agreements with providers to avoid service interruption.
- **Compliance**: honor data-residency, privacy-consent, and marketing-reward regulations in each operating region.

## Notes

- This is a target-state architecture. Start with city/regional pilots, prove unit economics, and add scale layers as traffic grows.
- The existing SpottEngine, SpottConsole, SpottDrop, and SpottVerify apps already align with this architecture because they are stateless and API-driven.
