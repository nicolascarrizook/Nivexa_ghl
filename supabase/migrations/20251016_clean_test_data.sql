-- Migration: Clean Test Data
-- Date: 2025-10-16
-- Description: Limpiar datos de prueba para empezar fresh antes de la demo
-- ⚠️  ADVERTENCIA: Esto eliminará TODOS los movimientos y préstamos

-- =====================================================
-- BACKUP RECOMMENDATION
-- =====================================================
-- Antes de ejecutar, haz backup:
-- 1. Exporta los proyectos importantes
-- 2. Guarda los códigos de préstamos si los necesitas
-- =====================================================

BEGIN;

-- =====================================================
-- 1. LIMPIAR MOVIMIENTOS DE CAJA
-- =====================================================

DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM cash_movements;
  RAISE NOTICE '🗑️  Eliminando % movimientos de caja...', v_count;
END $$;

DELETE FROM cash_movements;

-- =====================================================
-- 2. LIMPIAR PRÉSTAMOS Y CUOTAS
-- =====================================================

DO $$
DECLARE
  v_loans INT;
  v_installments INT;
BEGIN
  SELECT COUNT(*) INTO v_loans FROM master_loans;
  SELECT COUNT(*) INTO v_installments FROM loan_installments;

  RAISE NOTICE '🗑️  Eliminando % préstamos...', v_loans;
  RAISE NOTICE '🗑️  Eliminando % cuotas...', v_installments;
END $$;

DELETE FROM loan_installments;
DELETE FROM master_loans;

-- =====================================================
-- 3. RESETEAR BALANCES DE CAJAS
-- =====================================================

-- Resetear Master Cash
UPDATE master_cash
SET balance = 0,
    balance_ars = 0,
    balance_usd = 0,
    last_movement_at = NULL,
    updated_at = NOW();

RAISE NOTICE '✅ Master Cash reseteada a 0';

-- Resetear Admin Cash
UPDATE admin_cash
SET balance = 0,
    updated_at = NOW();

RAISE NOTICE '✅ Admin Cash reseteada a 0';

-- Resetear Project Cash Boxes
UPDATE project_cash_box
SET current_balance_ars = 0,
    current_balance_usd = 0,
    last_movement_at = NULL,
    updated_at = NOW();

RAISE NOTICE '✅ Cajas de proyectos reseteadas a 0';

-- =====================================================
-- 4. LIMPIAR OTROS DATOS RELACIONADOS (OPCIONAL)
-- =====================================================

-- Descomentar si quieres eliminar también:

-- Pagos de proyectos
-- DELETE FROM payments;

-- Cuotas de proyectos
-- DELETE FROM installments;

-- Fee collections
-- DELETE FROM fee_collections;

-- Contractor payments
-- DELETE FROM contractor_payments;

-- =====================================================
-- 5. ELIMINAR PROYECTOS DE PRUEBA (OPCIONAL)
-- =====================================================

-- ⚠️  CUIDADO: Esto eliminará TODOS los proyectos
-- Descomentar solo si estás seguro:

-- DELETE FROM project_cash_box;
-- DELETE FROM projects WHERE name LIKE '%test%' OR name LIKE '%prueba%';

-- =====================================================
-- 6. RESETEAR SECUENCIAS (OPCIONAL)
-- =====================================================

-- Resetear contador de préstamos para empezar desde 001
-- Descomentar si quieres códigos desde MLN-2025-001:

-- No hay secuencia SQL, el código se genera en el servicio
-- Los nuevos préstamos seguirán la numeración desde el último

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 'Limpieza completada' as status;

-- Verificar estado final
SELECT
  'master_cash' as caja,
  balance_ars,
  balance_usd,
  (SELECT COUNT(*) FROM cash_movements WHERE source_type = 'master' OR destination_type = 'master') as movimientos
FROM master_cash
UNION ALL
SELECT
  'admin_cash' as caja,
  balance as balance_ars,
  0 as balance_usd,
  (SELECT COUNT(*) FROM cash_movements WHERE source_type = 'admin' OR destination_type = 'admin') as movimientos
FROM admin_cash
UNION ALL
SELECT
  'project_cash_boxes' as caja,
  SUM(current_balance_ars) as balance_ars,
  SUM(current_balance_usd) as balance_usd,
  (SELECT COUNT(*) FROM cash_movements WHERE source_type = 'project' OR destination_type = 'project') as movimientos
FROM project_cash_box;

-- Mostrar totales
SELECT
  (SELECT COUNT(*) FROM cash_movements) as total_movimientos,
  (SELECT COUNT(*) FROM master_loans) as total_prestamos,
  (SELECT COUNT(*) FROM loan_installments) as total_cuotas,
  (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL) as total_proyectos_activos;

COMMIT;

RAISE NOTICE '✅ Base de datos limpiada exitosamente';
RAISE NOTICE '📊 Verifica los resultados arriba';
RAISE NOTICE '🎯 Sistema listo para pruebas de demo';
