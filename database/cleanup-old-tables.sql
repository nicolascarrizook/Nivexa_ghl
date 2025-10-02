-- ============================================
-- CLEANUP OLD CASH BOX SYSTEM TABLES
-- ============================================
-- This script removes the old/unused cash box tables
-- that are causing confusion with the new system
-- 
-- OLD SYSTEM (to be removed):
-- - master_cash_box
-- - project_cash_box  
-- - master_cash_transactions
-- - project_cash_transactions
-- - expense_categories
--
-- NEW SYSTEM (currently in use):
-- - master_cash
-- - project_cash
-- - admin_cash
-- - cash_movements
-- ============================================

-- Step 1: Drop old transaction tables first (they have foreign keys)
DROP TABLE IF EXISTS master_cash_transactions CASCADE;
DROP TABLE IF EXISTS project_cash_transactions CASCADE;

-- Step 2: Drop old cash box tables
DROP TABLE IF EXISTS master_cash_box CASCADE;
DROP TABLE IF EXISTS project_cash_box CASCADE;

-- Step 3: Drop expense categories if not used
DROP TABLE IF EXISTS expense_categories CASCADE;

-- Step 4: Clean test data from active tables (optional - uncomment if needed)
-- DELETE FROM installments;
-- DELETE FROM cash_movements;
-- DELETE FROM project_cash;
-- DELETE FROM projects;
-- DELETE FROM clients;

-- Step 5: Verify the cleanup
DO $$
BEGIN
    RAISE NOTICE 'Cleanup complete!';
    RAISE NOTICE 'Old cash box tables have been removed.';
    RAISE NOTICE 'The following tables are now active:';
    RAISE NOTICE '- master_cash (Caja Maestra/Financiera)';
    RAISE NOTICE '- project_cash (Caja de Proyecto)';
    RAISE NOTICE '- admin_cash (Caja Administrativa)';
    RAISE NOTICE '- cash_movements (Movimientos de caja)';
END $$;