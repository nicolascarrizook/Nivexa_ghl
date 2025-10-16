-- Migration: Add currency field to cash_movements
-- Date: 2025-10-16
-- Description: Add explicit currency field for better traceability

-- =====================================================
-- 1. ADD CURRENCY FIELD
-- =====================================================

DO $$
BEGIN
    -- Add currency field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'cash_movements' AND column_name = 'currency'
    ) THEN
        ALTER TABLE cash_movements
        ADD COLUMN currency VARCHAR(3) DEFAULT 'ARS'
        CHECK (currency IN ('ARS', 'USD'));

        RAISE NOTICE '✅ Campo currency agregado a cash_movements';
    END IF;
END $$;

-- =====================================================
-- 2. MIGRATE EXISTING DATA
-- =====================================================

-- Update existing records from metadata
UPDATE cash_movements
SET currency = COALESCE(metadata->>'currency', 'ARS')
WHERE currency IS NULL OR currency = 'ARS';

COMMENT ON COLUMN cash_movements.currency IS 'Currency of the movement: ARS (Argentine Peso) or USD (US Dollar)';

-- =====================================================
-- 3. CREATE INDEX FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cash_movements_currency
ON cash_movements(currency);

CREATE INDEX IF NOT EXISTS idx_cash_movements_type_currency
ON cash_movements(movement_type, currency);

-- =====================================================
-- 4. VERIFICATION
-- =====================================================

-- Show movements by currency
SELECT
  currency,
  COUNT(*) as total_movimientos,
  SUM(amount) as monto_total
FROM cash_movements
GROUP BY currency
ORDER BY currency;

-- Show recent loan movements
SELECT
  id,
  movement_type,
  currency,
  amount,
  description,
  metadata->>'loan_code' as codigo_prestamo,
  created_at
FROM cash_movements
WHERE metadata->>'movement_type' IN ('loan_disbursement', 'loan_repayment')
ORDER BY created_at DESC
LIMIT 10;
