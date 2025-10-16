-- Migration: Auto-Sync Master Cash on Project Changes
-- Date: 2025-10-16
-- Description: Automatically update master_cash when project_cash_box changes

-- =====================================================
-- FUNCIÓN PARA SINCRONIZAR MASTER CASH
-- =====================================================

CREATE OR REPLACE FUNCTION sync_master_cash_from_projects()
RETURNS TRIGGER AS $$
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
    balance = v_total_ars, -- Legacy field
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION sync_master_cash_from_projects() IS
  'Automatically sync master_cash balances when project_cash_box changes';

-- =====================================================
-- TRIGGER PARA AUTO-SINCRONIZACIÓN
-- =====================================================

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_sync_master_cash ON project_cash_box;

-- Create trigger for INSERT, UPDATE, DELETE
CREATE TRIGGER trigger_sync_master_cash
AFTER INSERT OR UPDATE OR DELETE ON project_cash_box
FOR EACH ROW
EXECUTE FUNCTION sync_master_cash_from_projects();

COMMENT ON TRIGGER trigger_sync_master_cash ON project_cash_box IS
  'Keeps master_cash balances in sync with sum of all project_cash_box balances';

-- =====================================================
-- EJECUTAR SINCRONIZACIÓN INICIAL
-- =====================================================

DO $$
DECLARE
  v_total_ars DECIMAL(15,2);
  v_total_usd DECIMAL(15,2);
BEGIN
  -- Calcular totales
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
    balance = v_total_ars,
    updated_at = NOW();

  RAISE NOTICE '✅ Trigger creado y sincronización inicial completada';
  RAISE NOTICE '   - Total ARS: %', v_total_ars;
  RAISE NOTICE '   - Total USD: %', v_total_usd;
END $$;
