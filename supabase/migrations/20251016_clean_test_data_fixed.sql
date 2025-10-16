-- Migration: Clean Test Data (Fixed)
-- Date: 2025-10-16
-- Description: Limpiar datos de prueba para empezar fresh antes de la demo

BEGIN;

-- =====================================================
-- 1. LIMPIAR DATOS DEPENDIENTES PRIMERO
-- =====================================================

DO $$
DECLARE
  v_count INT;
BEGIN
  -- Contractor payments (referencia a cash_movements)
  SELECT COUNT(*) INTO v_count FROM contractor_payments;
  RAISE NOTICE 'Eliminando % pagos de contratistas...', v_count;
  DELETE FROM contractor_payments;

  -- Fee collections (si existe)
  SELECT COUNT(*) INTO v_count FROM fee_collections;
  RAISE NOTICE 'Eliminando % cobros de honorarios...', v_count;
  DELETE FROM fee_collections;

  -- Payments de proyectos
  SELECT COUNT(*) INTO v_count FROM payments;
  RAISE NOTICE 'Eliminando % pagos de proyectos...', v_count;
  DELETE FROM payments;
END $$;

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

  RAISE NOTICE 'Eliminando % préstamos...', v_loans;
  RAISE NOTICE 'Eliminando % cuotas...', v_installments;

  DELETE FROM loan_installments;
  DELETE FROM master_loans;
END $$;

-- =====================================================
-- 3. LIMPIAR MOVIMIENTOS DE CAJA
-- =====================================================

DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM cash_movements;
  RAISE NOTICE 'Eliminando % movimientos de caja...', v_count;
  DELETE FROM cash_movements;
END $$;

-- =====================================================
-- 4. RESETEAR BALANCES DE CAJAS
-- =====================================================

DO $$
BEGIN
  -- Resetear Master Cash
  UPDATE master_cash
  SET balance = 0,
      balance_ars = 0,
      balance_usd = 0,
      last_movement_at = NULL,
      updated_at = NOW();

  RAISE NOTICE 'Master Cash reseteada a 0';

  -- Resetear Admin Cash
  UPDATE admin_cash
  SET balance = 0,
      updated_at = NOW();

  RAISE NOTICE 'Admin Cash reseteada a 0';

  -- Resetear Project Cash Boxes (sin last_movement_at que no existe)
  UPDATE project_cash_box
  SET current_balance_ars = 0,
      current_balance_usd = 0,
      updated_at = NOW();

  RAISE NOTICE 'Cajas de proyectos reseteadas a 0';
END $$;

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
  COALESCE(SUM(current_balance_ars), 0) as balance_ars,
  COALESCE(SUM(current_balance_usd), 0) as balance_usd,
  (SELECT COUNT(*) FROM cash_movements WHERE source_type = 'project' OR destination_type = 'project') as movimientos
FROM project_cash_box;

-- Mostrar totales
SELECT
  (SELECT COUNT(*) FROM cash_movements) as total_movimientos,
  (SELECT COUNT(*) FROM master_loans) as total_prestamos,
  (SELECT COUNT(*) FROM loan_installments) as total_cuotas,
  (SELECT COUNT(*) FROM contractor_payments) as total_pagos_contratistas,
  (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL) as total_proyectos_activos;

COMMIT;
