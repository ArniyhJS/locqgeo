# Database ERD Schema

This diagram reflects the Drizzle ORM schema defined in `packages/database/src/schema.ts`.

```mermaid
erDiagram
    users ||--o{ user_devices : "owns"
    users ||--o| user_wallets : "has"
    users ||--o{ user_otp_codes : "receives"
    tenants ||--o{ tenant_users : "employs"
    tenants ||--o{ api_keys : "issues"
    tenants ||--o{ geofences : "owns"
    tenants ||--o{ campaigns : "runs"
    tenants ||--o{ budget_resets_log : "audits"
    geofences ||--o{ checkin_pings : "receives"
    geofences ||--o{ verifications : "produces"
    geofences ||--o{ campaign_geofences : "joined by"
    campaigns ||--o{ campaign_geofences : "links"
    campaigns ||--o{ campaign_progress : "tracks"
    campaigns ||--o{ leaderboards : "scores"
    checkin_pings ||--|| verifications : "proves"
    users ||--o{ verifications : "makes"
    users ||--o{ campaign_progress : "earns"
    users ||--o{ leaderboards : "ranks"
    verifications ||--o| campaign_progress : "backfills"
    geofences ||--o{ verification_attempts : "targeted by"
    tenants ||--o{ verification_attempts : "receives"
    users ||--o{ verification_attempts : "attempts"
    device_reputation ||--|| users : "trust per device"

    users {
        uuid id PK
        varchar phone_number UK
        varchar email UK
        varchar full_name
        date date_of_birth
        boolean is_verified
        timestamptz created_at
        timestamptz updated_at
    }

    user_devices {
        uuid user_id FK
        varchar device_id PK
        timestamptz linked_at
    }

    user_wallets {
        uuid id PK
        uuid user_id FK UK
        numeric balance
        varchar currency
        timestamptz updated_at
    }

    user_otp_codes {
        uuid id PK
        uuid user_id FK
        varchar code
        varchar purpose
        timestamptz expires_at
        timestamptz used_at
        timestamptz created_at
    }

    tenants {
        uuid id PK
        varchar company_name
        varchar api_key_hash UK
        numeric reward_float_balance
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    tenant_users {
        uuid id PK
        uuid tenant_id FK
        varchar email UK
        varchar password_hash
        varchar full_name
        varchar role
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    api_keys {
        uuid id PK
        uuid tenant_id FK
        varchar key_label
        varchar key_prefix
        varchar api_key_hash UK
        boolean is_revoked
        timestamptz last_used_at
        timestamptz created_at
    }

    geofences {
        uuid id PK
        uuid tenant_id FK
        varchar title
        varchar creative_code UK
        double latitude
        double longitude
        double radius_meters
        varchar action_type
        varchar reward_type
        numeric reward_amount
        varchar reward_currency
        numeric daily_budget_limit
        numeric daily_budget_spent
        boolean is_active
        timestamptz created_at
        geography location
    }

    checkin_pings {
        uuid id PK
        varchar device_id
        double latitude
        double longitude
        double accuracy_meters
        varchar ip_address
        text user_agent
        timestamptz created_at
    }

    verifications {
        uuid id PK
        uuid geofence_id FK
        varchar device_id
        uuid ping_id FK
        uuid user_id FK
        varchar status
        varchar payout_reference
        varchar payout_status
        varchar reward_type
        numeric reward_amount
        varchar reward_currency
        timestamptz created_at
    }

    campaigns {
        uuid id PK
        uuid tenant_id FK
        varchar title
        text description
        varchar action_type
        timestamptz starts_at
        timestamptz ends_at
        numeric daily_budget_limit
        numeric total_budget_limit
        numeric total_budget_spent
        varchar reward_type
        numeric reward_amount
        varchar reward_currency
        boolean is_active
        timestamptz created_at
    }

    campaign_geofences {
        uuid campaign_id FK PK
        uuid geofence_id FK PK
        int visit_weight
        int required_visit_order
    }

    campaign_progress {
        uuid id PK
        uuid campaign_id FK
        varchar device_id
        uuid user_id FK
        uuid geofence_id FK
        uuid verification_id FK
        int earned_points
        timestamptz created_at
    }

    leaderboards {
        uuid id PK
        uuid campaign_id FK
        varchar device_id
        uuid user_id FK
        int total_points
        int total_visits
        int streak_count
        timestamptz last_visit_at
        timestamptz updated_at
    }

    budget_resets_log {
        uuid id PK
        uuid geofence_id FK
        uuid tenant_id FK
        date reset_date
        numeric previous_spent
        timestamptz created_at
    }

    verification_attempts {
        uuid id PK
        varchar device_id
        uuid geofence_id FK
        uuid tenant_id FK
        uuid user_id FK
        varchar status
        double latitude
        double longitude
        double accuracy_meters
        numeric fraud_score
        jsonb fraud_signals
        varchar ip_address
        text user_agent
        timestamptz created_at
    }

    device_reputation {
        varchar device_id PK
        numeric trust_score
        int total_attempts
        int rejected_attempts
        timestamptz last_seen_at
        timestamptz updated_at
    }
```

## Notes

- `geofences.location` is stored as a PostGIS `GEOGRAPHY` point for radius queries using `ST_DWithin`.
- `verification_attempts` is an append-only audit log of every accepted and rejected presence claim.
- `verifications.payout_status` drives the asynchronous table-as-queue worker pattern used by `services/payout-worker`.
- `campaign_geofences` supports visit weights and ordered checkpoint sequences for gamified campaigns.
