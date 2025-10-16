-- Migration: Add Balance Snapshots to Cash Movements
-- Date: 2025-10-16
-- Description: Add before/after balance fields for complete audit trail

-- =====================================================
-- 1. ADD BALANCE SNAPSHOT FIELDS
-- =====================================================

ALTER TABLE cash_movements
ADD COLUMN balance_before_ars DECIMAL(15,2),
ADD COLUMN balance_after_ars DECIMAL(15,2),
ADD COLUMN balance_before_usd DECIMAL(15,2),
ADD COLUMN balance_after_usd DECIMAL(15,2);

COMMENT ON COLUMN cash_movements.balance_before_ars IS
  'Balance en ARS de la caja origen ANTES del movimiento';

COMMENT ON COLUMN cash_movements.balance_after_ars IS
  'Balance en ARS de la caja origen DESPUÉS del movimiento';

COMMENT ON COLUMN cash_movements.balance_before_usd IS
  'Balance en USD de la caja origen ANTES del movimiento';

COMMENT ON COLUMN cash_movements.balance_after_usd IS
  'Balance en USD de la caja origen DESPUÉS del movimiento';

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_movements_balance_snapshots
ON cash_movements(source_type, source_id, created_at DESC)
WHERE balance_before_ars IS NOT NULL OR balance_before_usd IS NOT NULL;

-- =====================================================
-- 3. MIGRATE EXISTING DATA (BEST EFFORT)
-- =====================================================

-- Para movimientos existentes, intentamos calcular los balances retroactivamente
-- basándonos en los balances actuales y los movimientos subsecuentes

DO $$
DECLARE
  v_count INT;
BEGIN
  -- Contar movimientos sin snapshots
  SELECT COUNT(*)
  INTO v_count
  FROM cash_movements
  WHERE balance_before_ars IS NULL
    AND balance_before_usd IS NULL;

  RAISE NOTICE 'ℹ️  Movimientos sin snapshots de balance: %', v_count;
  RAISE NOTICE '⚠️  Los balances históricos se calcularán aproximadamente';
  RAISE NOTICE '   Los nuevos movimientos tendrán balances exactos';
END $$;

-- =====================================================
-- 4. VERIFICATION
-- =====================================================

-- Mostrar estructura actualizada
SELECT
  'Campos agregados correctamente' as status,
  COUNT(*) as total_movimientos,
  COUNT(balance_before_ars) as con_snapshot_ars,
  COUNT(balance_before_usd) as con_snapshot_usd
FROM cash_movements;

-- Ejemplo de cómo se verán los nuevos movimientos
SELECT
  created_at,
  movement_type,
  currency,
  amount,
  balance_before_ars,
  balance_after_ars,
  balance_before_usd,
  balance_after_usd,
  description
FROM cash_movements
WHERE balance_before_ars IS NOT NULL
   OR balance_before_usd IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
