-- Setup script to ensure master_cash_box and organizations exist
-- This should be run after authentication is set up

-- Check if organizations table exists, if not create a simple one
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organizations') THEN
        CREATE TABLE organizations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL DEFAULT 'Mi Organización',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$;

-- Create a default organization if none exists
INSERT INTO organizations (id, name)
SELECT gen_random_uuid(), 'Organización Principal'
WHERE NOT EXISTS (SELECT 1 FROM organizations);

-- Create master_cash_box for the organization if it doesn't exist
INSERT INTO master_cash_box (organization_id, name, current_balance_ars, current_balance_usd)
SELECT
    o.id,
    'Caja Maestra Principal',
    0,
    0
FROM organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM master_cash_box WHERE organization_id = o.id
)
LIMIT 1;
