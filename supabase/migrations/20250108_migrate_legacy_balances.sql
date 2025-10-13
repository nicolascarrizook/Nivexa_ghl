-- ============================================
-- MIGRACIÓN: Mover balances legacy a campos multi-moneda
-- ============================================
-- Migra los balances del campo legacy 'balance' a 'balance_ars'
-- para proyectos que fueron creados antes de la implementación de multi-moneda

-- 1. Migrar master_cash
UPDATE master_cash
SET
  balance_ars = COALESCE(balance, 0),
  balance_usd = 0
WHERE balance_ars = 0 AND balance > 0;

-- 2. Migrar project_cash
UPDATE project_cash
SET
  balance_ars = COALESCE(balance, 0),
  balance_usd = 0
WHERE balance_ars = 0 AND balance > 0;

-- 3. Migrar admin_cash (si tiene balance)
UPDATE admin_cash
SET
  balance_ars = COALESCE(balance, 0),
  balance_usd = 0
WHERE balance > 0;

-- Verificar la migración
SELECT 'master_cash' as table_name, balance, balance_ars, balance_usd FROM master_cash
UNION ALL
SELECT 'admin_cash', balance, 0, 0 FROM admin_cash
UNION ALL
SELECT 'project_cash', balance, balance_ars, balance_usd FROM project_cash;
