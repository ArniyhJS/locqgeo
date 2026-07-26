# SpottConsole Product Requirements Document (PRD)

## 1. Overview

**SpottConsole** is the enterprise control plane for the SpottGeo Verified Presence Platform. It allows business operators, campaign managers, finance teams, and developers to configure geofences, launch and monitor campaigns, manage users and rewards, and analyze verification events at scale.

SpottConsole sits between:

- **SpottEngine** — the API and verification engine.
- **SpottDrop / SpottVerify** — consumer-facing PWAs used by end users to scan QR codes and verify presence.

### 1.1 Product Vision

> Make physical-world presence measurable, rewardable, and trustworthy for any business that cares about real-world engagement.

### 1.2 Goals

1. Enable non-technical users to create and manage location-based campaigns in minutes.
2. Provide real-time visibility into verification events, fraud, and reward spend.
3. Support progressive user identity so consumers can stay anonymous until they choose to link an account.
4. Offer enterprise-grade controls: RBAC, audit logs, API keys, and multi-tenancy.
5. Serve as the primary SaaS monetization surface for SpottGeo.

---

## 2. User Personas

| Persona                           | Role                         | Primary Goals                                                                 |
| --------------------------------- | ---------------------------- | ----------------------------------------------------------------------------- |
| **Campaign Manager**              | Brand or agency marketer     | Build campaigns, set budgets, view engagement, export reports.                |
| **Operations Manager**            | Field ops or security lead   | Monitor live verifications, detect fraud, manage geofences and users.         |
| **Finance / Risk Manager**        | Finance, compliance, or risk | Track reward spend, reconcile payouts, approve reward floats, audit activity. |
| **Developer / Integrations Lead** | Engineering or product       | Generate API keys, configure webhooks, build custom flows.                    |
| **Tenant Admin**                  | Account owner or agency lead | Manage team access, roles, billing, white-label settings, sub-accounts.       |

---

## 3. Product Modules

### 3.1 Executive Overview Dashboard

**Purpose:** Give every user a quick snapshot of tenant health and campaign performance.

**User Stories:**

- As a Campaign Manager, I want to see total verified events, active campaigns, and total reward spend at a glance.
- As an Operations Manager, I want to see the latest fraud rejections so I can investigate quickly.
- As a Finance Manager, I want to see wallet balance and pending payouts.

**Key Metrics:**

- Total verifications today / this week / this month
- Active campaigns
- Verified vs rejected events
- Fraud breakdown by rejection reason
- Total reward spend and remaining budget
- Top performing geofences
- New linked users

**Acceptance Criteria:**

- Dashboard loads within 2 seconds.
- Metrics refresh automatically every 60 seconds.
- Each metric card links to a detailed report page.

---

### 3.2 Geofence / Campaign Node Studio

**Purpose:** Allow users to define physical locations where presences can be verified.

**User Stories:**

- As an Operations Manager, I want to create a geofence by clicking on a map.
- As a Campaign Manager, I want to import hundreds of billboards via CSV.
- As an Operations Manager, I want to activate or deactivate a location without deleting it.
- As a Campaign Manager, I want to tag locations by city or client.

**Features:**

- Interactive map using PostGIS + Leaflet/Mapbox
- Draw geofences with radius presets: 25m, 50m, 100m, 250m
- Manual coordinate entry with validation
- CSV/XLSX bulk import
- Creative codes, titles, descriptions
- Tags and filters
- Activation toggle
- Duplicate detection by coordinate proximity

**Acceptance Criteria:**

- User can create a geofence in under 60 seconds.
- CSV import validates required fields and reports errors.
- Map renders at least 500 geofences without significant lag.
- Inactive geofences cannot be verified against.

---

### 3.3 Campaign Builder

**Purpose:** Let business users design presence-based gamification, rewards, and attendance workflows.

**User Stories:**

- As a Campaign Manager, I want to choose a campaign template so I can launch faster.
- As a Campaign Manager, I want to link geofences and assign different point weights.
- As a Finance Manager, I want to set daily and total budget caps.
- As a Campaign Manager, I want to schedule campaign start and end dates.
- As a Campaign Manager, I want to configure rewards (airtime, data, cash, voucher).

**Campaign Templates:**

- **Treasure Hunt** — visit geofences in a specific order.
- **Loyalty Punch Card** — visit the same or different locations N times.
- **Flash Drop** — reward the first N verified visitors.
- **Attendance** — verify presence once per event or session.
- **Audit / Check-in** — simple verified presence without rewards.

**Features:**

- Campaign title, description, active period
- Action type: REWARD, CHECKIN, ATTENDANCE, AUDIT, ACCESS
- Linked geofences with visit weight and optional required order
- Budget controls: daily limit, total limit, per-user cap
- Reward configuration: type, amount, currency, provider
- Streak rules (consecutive-day bonuses)
- Audience rules: new users only, returning users, by region
- Draft / scheduled / running / paused / ended statuses

**Acceptance Criteria:**

- User can create a campaign from a template in under 3 minutes.
- Budget caps are enforced before any reward is queued.
- Campaign status changes take effect within 30 seconds.
- Linked geofences list shows on the campaign detail page.

---

### 3.4 Verification & Engagement Analytics

**Purpose:** Surface real-time and historical data about campaign performance and fraud.

**User Stories:**

- As a Campaign Manager, I want to see hourly trends of verifications.
- As an Operations Manager, I want to see fraud rejected events by reason.
- As a Campaign Manager, I want to see a leaderboard of top participants.
- As a Finance Manager, I want to export verification and payout reports.

**Features:**

- Live verification feed (latest 100 events)
- Fraud breakdown: rejected accuracy, velocity, duplicate, out-of-bounds, inactive geofence
- Hourly/daily trend charts
- Heatmap of verifications
- Leaderboard table with rank, points, visits, streak
- Conversion funnel: scans → verified → rewarded → repeat
- CSV/PDF export

**Acceptance Criteria:**

- Analytics pages load within 3 seconds for 30 days of data.
- Fraud breakdown updates within 60 seconds.
- Export produces a valid CSV with correct columns.

---

### 3.5 User & Identity Management

**Purpose:** Manage anonymous devices and progressively linked user identities.

**User Stories:**

- As an Operations Manager, I want to see all devices that have scanned.
- As a Support Agent, I want to look up a user by phone or email.
- As a Finance Manager, I want to see a user's reward history.
- As an Operations Manager, I want to flag suspicious devices.

**Features:**

- Device list with fingerprint, first/last scan, total verifications
- User profiles: phone, email, name, linked devices, wallet, verification history
- Search by device_id, phone, email, or geofence
- Trust score / fraud flags per device or user
- Manual user-device linking for support scenarios

**Acceptance Criteria:**

- Search returns results within 2 seconds.
- Linked users see all historical verifications associated with their devices.
- Fraud flags are visible on user and device detail pages.

---

### 3.6 Reward & Payout Operations

**Purpose:** Control how rewards are funded, queued, and disbursed.

**User Stories:**

- As a Finance Manager, I want to see total prefunded reward balance.
- As an Operations Manager, I want to retry a failed payout.
- As a Campaign Manager, I want to see how much of my campaign budget has been spent.
- As a Finance Manager, I want to reconcile payouts by provider.

**Features:**

- Reward float / wallet dashboard
- Payout queue status: pending, processing, completed, failed
- Provider configuration: VTpass, Paystack, bank transfer, voucher codes
- Retry failed payouts
- Payout logs with reference IDs, timestamps, failure reasons
- Budget burn chart per campaign

**Acceptance Criteria:**

- Payout status updates within 60 seconds of provider response.
- Failed payouts can be retried manually from the UI.
- Campaign budget caps are enforced before payouts are queued.

---

### 3.7 Team & Access Control

**Purpose:** Enable multi-user access with appropriate permissions.

**User Stories:**

- As a Tenant Admin, I want to invite team members.
- As a Tenant Admin, I want to assign roles.
- As a Finance Manager, I want to view payout data but not modify campaigns.

**Roles:**

- **Admin** — full access, billing, team management
- **Campaign Manager** — create/edit campaigns, view analytics
- **Operations Manager** — manage geofences, verify fraud flags, view live telemetry
- **Finance** — view payouts, wallets, budgets, export reports
- **Viewer** — read-only access
- **Developer** — manage API keys and webhooks

**Acceptance Criteria:**

- Role permissions are enforced on both UI routes and server actions.
- Invited users receive an email with a secure link.
- Role changes take effect immediately.

---

### 3.8 API Keys & Developer integrations

**Purpose:** Allow external developers and systems to integrate with SpottEngine securely.

**User Stories:**

- As a Developer, I want to generate API keys for staging and production.
- As a Developer, I want to rotate or revoke an API key.
- As a Developer, I want to configure webhooks for verification events.

**Features:**

- API key creation with label and environment
- Key prefix visibility, full key shown only once
- Revocation and rotation
- Webhook endpoint configuration
- Webhook event selection: verification.created, reward.queued, reward.completed, reward.failed, fraud.flagged
- Webhook retry and delivery logs

**Acceptance Criteria:**

- API keys are hashed before storage.
- Revoked keys are rejected immediately.
- Webhooks retry failed deliveries up to 5 times with exponential backoff.

---

### 3.9 Audit Logs

**Purpose:** Provide a tamper-resistant record of all administrative actions.

**User Stories:**

- As a Tenant Admin, I want to see who created or modified a campaign.
- As a Compliance Officer, I want to export audit logs.

**Logged Events:**

- User login / invite / role change
- Campaign create / update / delete / status change
- Geofence create / update / delete / activation change
- Reward payout retry / manual adjusent
- API key create / revoke
- Webhook create / update / delete

**Acceptance Criteria:**

- Logs are append-only from the application layer.
- Logs are searchable by user, action, and date range.
- Retention of at least 12 months.

---

## 4. Non-Functional Requirements

| Requirement              | Target                                                                     |
| ------------------------ | -------------------------------------------------------------------------- |
| **Performance**          | Dashboard loads in < 2s; analytics pages load in < 3s.                     |
| **Availability**         | 99.9% uptime for console; engine uptime negotiated separately.             |
| **Security**             | API keys hashed, RBAC enforced, HTTPS only, input validated via Zod.       |
| **Privacy**              | Consent-aware, location data minimized, user data exportable/deletable.    |
| **Scalability**          | Support tenants with thousands of geofences and millions of verifications. |
| **Mobile-first readers** | Console is desktop/tablet optimized; consumer apps are mobile-first.       |
| **Accessibility**        | WCAG 2.1 AA compliance where feasible.                                     |

---

## 5. Open Questions

1. Should campaigns support squads/teams, or only individual leaderboards?
2. Should payout float be managed at tenant level or campaign level?
3. Should the console white-label per client (for agencies) or only per tenant?
4. Which OAuth providers will be supported for tenant user login? (Email, Google, SSO?)
5. Should audit logs be stored in PostgreSQL or shipped to an immutable store?

---

## 6. Roadmap

### Phase 1 — Foundation (Current)

- Executive overview dashboard
- Campaign nodes (geofences) list and CSV import
- Campaign CRUD and detail/leaderboard
- Users list
- Live telemetry page
- API keys and team settings (UI only)

### Phase 2 — Campaign Power User

- Interactive map-based geofence studio
- Campaign templates (treasure hunt, loyalty, flash drop, attendance)
- Advanced analytics: heatmap, funnel, hourly trends
- CSV/PDF report export

### Phase 3 — Enterprise Controls

- Enforced RBAC on server actions
- Full audit log UI
- Payout operations dashboard
- Reward float management
- Webhook management

### Phase 4 — Scale & Ecosystem

- White-label and client sub-accounts
- Public API documentation
- Zapier / Make connector
- Billing and usage dashboard
- Mobile SDK snippets for developers

---

## 7. Success Metrics

| Metric                           | Target                                      |
| -------------------------------- | ------------------------------------------- |
| Time to create a campaign        | < 3 minutes from template                   |
| Time to create a geofence        | < 60 seconds                                |
| Dashboard load time              | < 2 seconds                                 |
| Campaign analytics query time    | < 3 seconds for 30 days                     |
| Monthly active campaign managers | Growth rate tracked per tenant              |
| Verification volume              | Primary growth metric tied to engine usage  |
| Fraud rejection rate             | < 10% of total attempts (healthy campaigns) |
| Net Revenue Retention (NRR)      | > 100% for enterprise tenants               |

---

## 8. Appendix: Terminology

| Term                     | Definition                                                                        |
| ------------------------ | --------------------------------------------------------------------------------- |
| **Geofence**             | A virtual boundary defined by latitude, longitude, and radius.                    |
| **Campaign Node**        | A business-friendly name for a geofence in the console.                           |
| **Campaign**             | A set of rules, geofences, budgets, and rewards for a presence-driven initiative. |
| **Verification**         | A successful or failed proof-of-presence event.                                   |
| **Progressive Identity** | Anonymous scanning by default, with optional phone/email linking later.           |
| **Reward Float**         | Pre-funded balance used to pay out consumer rewards.                              |

---

_This PRD should be reviewed quarterly and updated as SpottConsole moves through each roadmap phase._
