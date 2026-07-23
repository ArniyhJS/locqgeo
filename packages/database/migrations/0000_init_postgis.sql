-- Enable PostGIS spatial extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'consumer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description VARCHAR(1000),
  total_budget NUMERIC(12, 2) NOT NULL,
  spent_budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create Geofences Table with PostGIS Geography Point
CREATE TABLE IF NOT EXISTS geofences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  radius_meters INT NOT NULL DEFAULT 100,
  reward_amount NUMERIC(10, 2) NOT NULL,
  payout_type VARCHAR(50) NOT NULL DEFAULT 'AIRTIME',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create GiST Spatial Index on Geofences
CREATE INDEX IF NOT EXISTS idx_geofences_location ON geofences USING GIST(location);

-- Create Claims Table
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geofence_id UUID NOT NULL REFERENCES geofences(id),
  user_id UUID REFERENCES users(id),
  device_id VARCHAR(128) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  payout_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_claims_device ON claims(device_id);
CREATE INDEX IF NOT EXISTS idx_claims_geofence ON claims(geofence_id);

-- Create Payouts Table
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(id),
  provider VARCHAR(50) NOT NULL,
  reference VARCHAR(128) NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL,
  recipient VARCHAR(128) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  response_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create Telemetry Logs Table
CREATE TABLE IF NOT EXISTS telemetry_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(128) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy_meters DOUBLE PRECISION NOT NULL,
  velocity_mps DOUBLE PRECISION DEFAULT 0,
  is_suspicious BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_telemetry_device ON telemetry_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_created ON telemetry_logs(created_at);
