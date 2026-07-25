-- Campaigns / billboard gamification schema

ALTER TABLE geofences
  ADD COLUMN IF NOT EXISTS creative_code VARCHAR(100);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  action_type VARCHAR(50) NOT NULL DEFAULT 'CHECKIN',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  daily_budget_limit NUMERIC(14, 2),
  total_budget_limit NUMERIC(14, 2),
  total_budget_spent NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  reward_type VARCHAR(50),
  reward_amount NUMERIC(10, 2),
  reward_currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_tenant ON campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_active_dates ON campaigns(is_active, starts_at, ends_at);

CREATE TABLE IF NOT EXISTS campaign_geofences (
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  geofence_id UUID NOT NULL REFERENCES geofences(id) ON DELETE CASCADE,
  visit_weight INT NOT NULL DEFAULT 1,
  required_visit_order INT,
  PRIMARY KEY (campaign_id, geofence_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_geofences_geofence ON campaign_geofences(geofence_id);

CREATE TABLE IF NOT EXISTS campaign_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  device_id VARCHAR(128) NOT NULL,
  geofence_id UUID NOT NULL REFERENCES geofences(id) ON DELETE CASCADE,
  verification_id UUID NOT NULL REFERENCES verifications(id) ON DELETE CASCADE,
  earned_points INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (campaign_id, device_id, geofence_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_progress_campaign_device ON campaign_progress(campaign_id, device_id);
CREATE INDEX IF NOT EXISTS idx_campaign_progress_created ON campaign_progress(created_at);

CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  device_id VARCHAR(128) NOT NULL,
  total_points INT NOT NULL DEFAULT 0,
  total_visits INT NOT NULL DEFAULT 0,
  streak_count INT NOT NULL DEFAULT 0,
  last_visit_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (campaign_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_campaign_score ON leaderboards(campaign_id, total_points DESC);
