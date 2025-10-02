-- ===============================================
-- RESET FINANCIAL DATA
-- ===============================================
-- Este script limpia TODOS los datos financieros
-- ¡USAR SOLO EN DESARROLLO! ⚠️
-- ===============================================

-- 1. Limpiar movimientos de caja
TRUNCATE TABLE cash_movements CASCADE;

-- 2. Limpiar pagos e installments
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE installments CASCADE;

-- 3. Limpiar honorarios administrativos
TRUNCATE TABLE administrator_fees CASCADE;

-- 4. Limpiar préstamos inter-proyecto
TRUNCATE TABLE loan_installments CASCADE;
TRUNCATE TABLE inter_project_loans CASCADE;

-- 5. Resetear cajas de proyectos
UPDATE project_cash SET
  balance = 0,
  total_received = 0,
  last_movement_at = NULL;

-- 6. Resetear caja maestra (mantener registro pero en cero)
UPDATE master_cash SET
  balance = 0,
  balance_ars = 0,
  balance_usd = 0,
  last_movement_at = NULL;

-- 7. Resetear caja administrativa (mantener registro pero en cero)
UPDATE admin_cash SET
  balance = 0,
  balance_ars = 0,
  balance_usd = 0,
  total_collected = 0,
  total_collected_ars = 0,
  total_collected_usd = 0,
  last_movement_at = NULL;

-- 8. Resetear cuentas bancarias (opcional - si existen)
-- UPDATE bank_accounts SET
--   balance = 0,
--   available_balance = 0;

-- 9. Limpiar transferencias bancarias (opcional - si existen)
-- TRUNCATE TABLE bank_account_transfers CASCADE;

-- 10. Resetear proyectos a estado inicial (opcional)
-- UPDATE projects SET
--   status = 'planning',
--   paid_amount = 0,
--   remaining_amount = total_amount;

SELECT 'Base de datos financiera limpiada correctamente ✅' AS result;
