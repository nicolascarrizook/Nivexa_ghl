-- =====================================================
-- LIMPIEZA TOTAL DE BASE DE DATOS CON PERMISOS ADMIN
-- =====================================================
-- Ejecutar en Supabase SQL Editor con permisos admin
-- =====================================================

-- Desactivar RLS temporalmente para limpieza
ALTER TABLE cash_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_cash_box DISABLE ROW LEVEL SECURITY;
ALTER TABLE installments DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_contractors DISABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE administrator_fees DISABLE ROW LEVEL SECURITY;

-- Eliminar todos los registros en orden correcto
DELETE FROM contractor_payments;
DELETE FROM contractor_budgets;
DELETE FROM project_contractors;
DELETE FROM administrator_fees;  -- Debe eliminarse antes de installments
DELETE FROM cash_movements;
DELETE FROM payments;
DELETE FROM installments;
DELETE FROM project_cash_box;
DELETE FROM projects;
DELETE FROM providers;
DELETE FROM clients;

-- Reiniciar cajas especiales
UPDATE master_cash
SET
  balance = 0,
  balance_ars = 0,
  balance_usd = 0,
  last_movement_at = NOW();

UPDATE admin_cash
SET
  balance = 0,
  balance_ars = 0,
  balance_usd = 0,
  total_collected = 0,
  last_movement_at = NULL;

-- Reactivar RLS
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_cash_box ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrator_fees ENABLE ROW LEVEL SECURITY;

-- Verificar estado final
SELECT 'contractor_payments' as tabla, COUNT(*)::text as registros FROM contractor_payments
UNION ALL
SELECT 'contractor_budgets', COUNT(*)::text FROM contractor_budgets
UNION ALL
SELECT 'project_contractors', COUNT(*)::text FROM project_contractors
UNION ALL
SELECT 'administrator_fees', COUNT(*)::text FROM administrator_fees
UNION ALL
SELECT 'cash_movements', COUNT(*)::text FROM cash_movements
UNION ALL
SELECT 'installments', COUNT(*)::text FROM installments
UNION ALL
SELECT 'payments', COUNT(*)::text FROM payments
UNION ALL
SELECT 'project_cash_box', COUNT(*)::text FROM project_cash_box
UNION ALL
SELECT 'projects', COUNT(*)::text FROM projects
UNION ALL
SELECT 'providers', COUNT(*)::text FROM providers
UNION ALL
SELECT 'clients', COUNT(*)::text FROM clients
UNION ALL
SELECT 'master_cash (balance_ars)', balance_ars::text FROM master_cash
UNION ALL
SELECT 'master_cash (balance_usd)', balance_usd::text FROM master_cash
UNION ALL
SELECT 'admin_cash (balance_ars)', balance_ars::text FROM admin_cash
UNION ALL
SELECT 'admin_cash (balance_usd)', balance_usd::text FROM admin_cash;
