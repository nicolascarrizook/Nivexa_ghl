-- Migration: Full Clean Including Test Projects
-- Date: 2025-10-16
-- Description: Limpieza COMPLETA incluyendo proyectos de prueba
-- ⚠️  ADVERTENCIA: Esto eliminará TODO excepto clientes

-- =====================================================
-- ⚠️  EXTREMADAMENTE DESTRUCTIVO
-- =====================================================
-- Este script elimina:
-- - Todos los movimientos
-- - Todos los préstamos
-- - Todos los proyectos (soft delete)
-- - Todas las cuotas
-- - Todos los pagos
-- - Resetea todas las cajas a 0
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ELIMINAR DATOS FINANCIEROS
-- =====================================================

DELETE FROM cash_movements;
DELETE FROM loan_installments;
DELETE FROM master_loans;
DELETE FROM fee_collections;
DELETE FROM contractor_payments;
DELETE FROM payments;
DELETE FROM installments;

RAISE NOTICE '✅ Datos financieros eliminados';

-- =====================================================
-- 2. SOFT DELETE DE PROYECTOS
-- =====================================================

UPDATE projects
SET deleted_at = NOW(),
    updated_at = NOW()
WHERE deleted_at IS NULL;

RAISE NOTICE '✅ Proyectos marcados como eliminados (soft delete)';

-- =====================================================
-- 3. ELIMINAR CAJAS DE PROYECTOS
-- =====================================================

DELETE FROM project_cash_box;

RAISE NOTICE '✅ Cajas de proyectos eliminadas';

-- =====================================================
-- 4. RESETEAR MASTER Y ADMIN CASH
-- =====================================================

UPDATE master_cash
SET balance = 0,
    balance_ars = 0,
    balance_usd = 0,
    last_movement_at = NULL,
    updated_at = NOW();

UPDATE admin_cash
SET balance = 0,
    updated_at = NOW();

RAISE NOTICE '✅ Cajas reseteadas a 0';

-- =====================================================
-- 5. LIMPIAR INVERSORES (OPCIONAL)
-- =====================================================

-- Descomentar si también quieres eliminar inversores:
-- DELETE FROM project_investors;
-- DELETE FROM investor_access_tokens;
-- DELETE FROM investors;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Limpieza COMPLETA finalizada' as status;

-- Estado final del sistema
SELECT
  (SELECT COUNT(*) FROM cash_movements) as movimientos,
  (SELECT COUNT(*) FROM master_loans) as prestamos,
  (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL) as proyectos_activos,
  (SELECT COUNT(*) FROM projects WHERE deleted_at IS NOT NULL) as proyectos_eliminados,
  (SELECT COUNT(*) FROM clients) as clientes,
  (SELECT balance_ars FROM master_cash) as master_ars,
  (SELECT balance_usd FROM master_cash) as master_usd,
  (SELECT balance FROM admin_cash) as admin_balance;

COMMIT;

RAISE NOTICE '🎯 Sistema completamente limpio y listo para demo';
RAISE NOTICE '📊 Clientes preservados para crear nuevos proyectos';
