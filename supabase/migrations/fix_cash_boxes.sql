-- Fix: Ensure master_cash and admin_cash records exist
-- Run this in Supabase SQL Editor if you get PGRST116 errors

-- Check and create master_cash if it doesn't exist
INSERT INTO master_cash (
    id,
    balance,
    balance_ars,
    balance_usd,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    0,
    0,
    0,
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM master_cash LIMIT 1);

-- Check and create admin_cash if it doesn't exist
INSERT INTO admin_cash (
    id,
    balance,
    balance_ars,
    balance_usd,
    total_collected,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid(),
    0,
    0,
    0,
    0,
    now(),
    now()
WHERE NOT EXISTS (SELECT 1 FROM admin_cash LIMIT 1);

-- Verify the records were created
SELECT 'master_cash' as table_name, count(*) as record_count FROM master_cash
UNION ALL
SELECT 'admin_cash' as table_name, count(*) as record_count FROM admin_cash;
