-- Enable PostGIS and UUID Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: tenants (Multi-Tenancy Isolation)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    api_key_hash VARCHAR(128) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: geofences (Generic Presence Targets)
CREATE TABLE IF NOT EXISTS geofences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    radius_meters FLOAT NOT NULL DEFAULT 50.0,
    action_type VARCHAR(50) NOT NULL DEFAULT 'REWARD' CHECK (action_type IN ('REWARD', 'CHECKIN', 'ATTENDANCE', 'AUDIT', 'ACCESS')),
    reward_type VARCHAR(50) CHECK (reward_type IN ('AIRTIME', 'DATA', 'CASH', 'VOUCHER')),
    reward_amount NUMERIC(10, 2),
    reward_currency VARCHAR(3) DEFAULT 'NGN',
    daily_budget_limit NUMERIC(10, 2) DEFAULT 50000.00,
    daily_budget_spent NUMERIC(10, 2) DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast Spatial and Relational Indexing
CREATE INDEX IF NOT EXISTS idx_geofences_location ON geofences USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_geofences_tenant ON geofences(tenant_id);

-- Table: checkin_pings (Telemetry History)
CREATE TABLE IF NOT EXISTS checkin_pings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(128) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    user_location GEOGRAPHY(Point, 4326) NOT NULL,
    accuracy_meters FLOAT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkin_pings_device_time ON checkin_pings(device_id, created_at DESC);

-- Table: verifications (Atomic Audit Log & Idempotency)
CREATE TABLE IF NOT EXISTS verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    geofence_id UUID NOT NULL REFERENCES geofences(id),
    device_id VARCHAR(128) NOT NULL,
    ping_id UUID NOT NULL REFERENCES checkin_pings(id),
    status VARCHAR(50) NOT NULL CHECK (
        status IN (
            'VERIFIED',
            'REJECTED_ACCURACY',
            'REJECTED_DUPLICATE',
            'REJECTED_VELOCITY',
            'REJECTED_OUT_OF_BOUNDS',
            'REJECTED_INACTIVE_GEOFENCE'
        )
    ),
    payout_reference VARCHAR(255),
    payout_status VARCHAR(50) DEFAULT 'NOT_APPLICABLE' CHECK (
        payout_status IN ('NOT_APPLICABLE', 'QUEUED', 'PROCESSING', 'SUCCESS', 'FAILED')
    ),
    reward_type VARCHAR(50),
    reward_amount NUMERIC(10, 2),
    reward_currency VARCHAR(3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deduplication Index: Prevents multiple verified events for the same device + geofence within 24 hours
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_daily_verification
ON verifications(device_id, geofence_id)
WHERE status = 'VERIFIED' AND created_at > NOW() - INTERVAL '24 hours';
