-- Ensure the alias column exists (safe to re-run) and enforce uniqueness when set.
ALTER TABLE geofences ADD COLUMN IF NOT EXISTS creative_code VARCHAR(100);

CREATE UNIQUE INDEX IF NOT EXISTS idx_geofences_creative_code
ON geofences(creative_code);
