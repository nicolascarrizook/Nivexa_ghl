-- Migration: Fix Trigger Interference with Loans
-- Date: 2025-10-16
-- Description: Disable auto-sync trigger as it interferes with loan transfers

-- =====================================================
-- PROBLEMA: El trigger recalcula master_cash después
-- de cada cambio en project_cash_box, lo que interfiere
-- con las transferencias de préstamos que actualizan
-- master_cash manualmente.
-- =====================================================

-- Deshabilitar el trigger de auto-sincronización
DROP TRIGGER IF EXISTS trigger_sync_master_cash ON project_cash_box;

-- Eliminar la función asociada
DROP FUNCTION IF EXISTS sync_master_cash_from_projects();

RAISE NOTICE '⚠️  Trigger auto-sync deshabilitado';
RAISE NOTICE '   Los balances de master_cash ahora se actualizan manualmente';
RAISE NOTICE '   mediante las transferencias de préstamos';

-- =====================================================
-- NOTA: El balance de master_cash ahora se mantiene
-- actualizado mediante:
-- 1. transferMasterToProject() - Descuenta al dar préstamo
-- 2. transferProjectToMaster() - Aumenta al pagar préstamo
-- 3. Otros métodos del NewCashBoxService
-- =====================================================

-- Verificar balances actuales
SELECT
  'master_cash' as caja,
  balance_ars,
  balance_usd,
  'Actualizado manualmente' as metodo
FROM master_cash;

-- Mostrar diferencia con suma de proyectos (para referencia)
SELECT
  'Suma de proyectos' as caja,
  SUM(current_balance_ars) as balance_ars,
  SUM(current_balance_usd) as balance_usd,
  'Solo referencia' as metodo
FROM project_cash_box;
