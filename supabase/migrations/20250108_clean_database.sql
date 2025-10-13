-- =====================================================
-- SCRIPT DE LIMPIEZA DE BASE DE DATOS
-- =====================================================
-- Limpia toda la base de datos EXCEPTO:
-- - Usuarios (auth.users)
-- - Clientes (clients)
--
-- IMPORTANTE: Este script elimina TODOS los datos de proyectos,
-- cajas, movimientos, honorarios, cuotas, pagos, etc.
-- =====================================================

-- 1. Eliminar movimientos de caja (dependencias primero)
DELETE FROM cash_movements;

-- 2. Eliminar honorarios de administrador
DELETE FROM administrator_fees;

-- 3. Eliminar pagos
DELETE FROM payments;

-- 4. Eliminar cuotas
DELETE FROM installments;

-- 5. Eliminar cajas de proyectos
DELETE FROM project_cash;

-- 6. Eliminar préstamos inter-proyecto (si existen)
DELETE FROM inter_project_loans WHERE true;

-- 7. Eliminar transferencias bancarias (si existen)
DELETE FROM bank_transfers WHERE true;

-- 8. Eliminar cuentas bancarias (excepto master/admin si existen)
DELETE FROM bank_accounts
WHERE account_type NOT IN ('master', 'admin');

-- 9. Eliminar proyectos
DELETE FROM projects;

-- 10. Resetear cajas principales (master_cash y admin_cash)
-- Limpiar Master Cash
UPDATE master_cash
SET
  balance = 0,
  balance_ars = 0,
  balance_usd = 0,
  total_income = 0,
  total_fees_collected = 0,
  last_movement_at = NULL,
  updated_at = NOW();

-- Limpiar Admin Cash
UPDATE admin_cash
SET
  balance = 0,
  balance_ars = 0,
  balance_usd = 0,
  total_collected = 0,
  last_movement_at = NULL,
  updated_at = NOW();

-- 11. Verificar que solo queden usuarios y clientes
-- Esta consulta mostrará cuántos registros quedan en cada tabla

SELECT
  'clients' as tabla,
  COUNT(*) as registros
FROM clients

UNION ALL

SELECT
  'projects' as tabla,
  COUNT(*) as registros
FROM projects

UNION ALL

SELECT
  'installments' as tabla,
  COUNT(*) as registros
FROM installments

UNION ALL

SELECT
  'payments' as tabla,
  COUNT(*) as registros
FROM payments

UNION ALL

SELECT
  'project_cash' as tabla,
  COUNT(*) as registros
FROM project_cash

UNION ALL

SELECT
  'cash_movements' as tabla,
  COUNT(*) as registros
FROM cash_movements

UNION ALL

SELECT
  'administrator_fees' as tabla,
  COUNT(*) as registros
FROM administrator_fees

UNION ALL

SELECT
  'master_cash' as tabla,
  COUNT(*) as registros
FROM master_cash

UNION ALL

SELECT
  'admin_cash' as tabla,
  COUNT(*) as registros
FROM admin_cash

ORDER BY tabla;

-- =====================================================
-- RESULTADO ESPERADO:
-- - clients: 1 (el cliente que creaste)
-- - projects: 0
-- - installments: 0
-- - payments: 0
-- - project_cash: 0
-- - cash_movements: 0
-- - administrator_fees: 0
-- - master_cash: 1 (con balance en 0)
-- - admin_cash: 1 (con balance en 0)
-- =====================================================
