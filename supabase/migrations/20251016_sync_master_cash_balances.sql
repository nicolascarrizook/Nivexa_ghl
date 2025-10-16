-- Migration: Sync Master Cash Balances with Projects
-- Date: 2025-10-16
-- Description: Recalculate and sync master_cash balances from project_cash_box

-- =====================================================
-- RECALCULAR Y SINCRONIZAR BALANCES
-- =====================================================

DO $$
DECLARE
  v_total_ars DECIMAL(15,2);
  v_total_usd DECIMAL(15,2);
BEGIN
  -- Calcular totales desde project_cash_box
  SELECT
    COALESCE(SUM(current_balance_ars), 0),
    COALESCE(SUM(current_balance_usd), 0)
  INTO v_total_ars, v_total_usd
  FROM project_cash_box;

  -- Actualizar master_cash
  UPDATE master_cash
  SET
    balance_ars = v_total_ars,
    balance_usd = v_total_usd,
    balance = v_total_ars, -- Legacy field (keep for compatibility)
    updated_at = NOW();

  RAISE NOTICE '✅ Sincronización completada:';
  RAISE NOTICE '   - ARS: %', v_total_ars;
  RAISE NOTICE '   - USD: %', v_total_usd;
END $$;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Mostrar comparación
SELECT
  'master_cash' as fuente,
  balance_ars,
  balance_usd
FROM master_cash

UNION ALL

SELECT
  'proyectos (calculado)' as fuente,
  SUM(current_balance_ars) as balance_ars,
  SUM(current_balance_usd) as balance_usd
FROM project_cash_box;

-- Verificar que coincidan
SELECT
  CASE
    WHEN mc.balance_usd = (SELECT SUM(current_balance_usd) FROM project_cash_box)
    THEN '✅ Balances USD sincronizados correctamente'
    ELSE '❌ ERROR: Balances USD NO coinciden'
  END as status_usd,
  CASE
    WHEN mc.balance_ars = (SELECT SUM(current_balance_ars) FROM project_cash_box)
    THEN '✅ Balances ARS sincronizados correctamente'
    ELSE '❌ ERROR: Balances ARS NO coinciden'
  END as status_ars
FROM master_cash mc;
