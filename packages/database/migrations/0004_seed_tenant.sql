-- Seed a demo tenant for the LocqConsole operator dashboard
INSERT INTO tenants (id, company_name, api_key_hash)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Acme Corp B2B',
  'demo_api_key_hash_not_for_production'
)
ON CONFLICT (id) DO NOTHING;
