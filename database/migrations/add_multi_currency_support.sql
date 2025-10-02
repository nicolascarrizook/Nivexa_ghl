-- Migration: Add Multi-Currency Support to Master Cash
-- Description: Partitions master cash to support ARS and USD balances separately
-- Date: 2025-01-30

-- ============================================================================
-- STEP 1: Add currency columns to master_cash table
-- ============================================================================

-- Add separate balance columns for ARS and USD
ALTER TABLE master_cash
  ADD COLUMN IF NOT EXISTS balance_ars DECIMAL(15,2) DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS balance_usd DECIMAL(15,2) DEFAULT 0 NOT NULL;

-- Migrate existing balance to balance_ars (assuming current balance is in ARS)
UPDATE master_cash
SET balance_ars = balance,
    balance_usd = 0,
    updated_at = NOW()
WHERE balance_ars = 0 AND balance > 0;

-- Add check constraints to ensure non-negative balances
ALTER TABLE master_cash
  ADD CONSTRAINT check_balance_ars_positive CHECK (balance_ars >= 0),
  ADD CONSTRAINT check_balance_usd_positive CHECK (balance_usd >= 0);

-- ============================================================================
-- STEP 2: Add currency fields to cash_movements table
-- ============================================================================

-- Add currency field with default 'ARS' for existing records
ALTER TABLE cash_movements
  ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'ARS' NOT NULL,
  ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,4) DEFAULT 1 NOT NULL;

-- Add check constraint for valid currencies
ALTER TABLE cash_movements
  ADD CONSTRAINT check_currency_valid CHECK (currency IN ('ARS', 'USD'));

-- Add check constraint for positive exchange rate
ALTER TABLE cash_movements
  ADD CONSTRAINT check_exchange_rate_positive CHECK (exchange_rate > 0);

-- ============================================================================
-- STEP 3: Create currency_conversions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS currency_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source currency details
  from_currency VARCHAR(3) NOT NULL,
  from_amount DECIMAL(15,2) NOT NULL,

  -- Destination currency details
  to_currency VARCHAR(3) NOT NULL,
  to_amount DECIMAL(15,2) NOT NULL,

  -- Exchange rate information
  exchange_rate DECIMAL(10,4) NOT NULL,
  exchange_rate_source VARCHAR(50) NOT NULL, -- 'blue', 'oficial', 'mep', 'ccl'

  -- Related cash movements (outbound and inbound)
  outbound_movement_id UUID REFERENCES cash_movements(id) ON DELETE RESTRICT,
  inbound_movement_id UUID REFERENCES cash_movements(id) ON DELETE RESTRICT,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT check_different_currencies CHECK (from_currency != to_currency),
  CONSTRAINT check_from_currency_valid CHECK (from_currency IN ('ARS', 'USD')),
  CONSTRAINT check_to_currency_valid CHECK (to_currency IN ('ARS', 'USD')),
  CONSTRAINT check_from_amount_positive CHECK (from_amount > 0),
  CONSTRAINT check_to_amount_positive CHECK (to_amount > 0),
  CONSTRAINT check_exchange_rate_positive CHECK (exchange_rate > 0)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_currency_conversions_created_at
  ON currency_conversions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_currency_conversions_from_currency
  ON currency_conversions(from_currency);

CREATE INDEX IF NOT EXISTS idx_currency_conversions_to_currency
  ON currency_conversions(to_currency);

CREATE INDEX IF NOT EXISTS idx_currency_conversions_movements
  ON currency_conversions(outbound_movement_id, inbound_movement_id);

-- ============================================================================
-- STEP 4: Add currency_exchange movement type
-- ============================================================================

-- Note: If movement_type is an enum, you may need to recreate the type
-- For now, we'll document it for reference. The actual implementation
-- will be handled in the application layer with proper type validation.

-- Document the new movement type:
-- 'currency_exchange': Represents a currency conversion operation
--   - Creates TWO movements:
--     1. Outbound: Deducts amount in source currency (e.g., -320 USD)
--     2. Inbound: Adds amount in destination currency (e.g., +499,200 ARS)
--   - Both movements reference the same currency_conversions record

-- ============================================================================
-- STEP 5: Add comments for documentation
-- ============================================================================

COMMENT ON COLUMN master_cash.balance_ars IS 'Balance in Argentine Pesos (ARS)';
COMMENT ON COLUMN master_cash.balance_usd IS 'Balance in US Dollars (USD)';
COMMENT ON COLUMN cash_movements.currency IS 'Currency of the movement (ARS or USD)';
COMMENT ON COLUMN cash_movements.exchange_rate IS 'Exchange rate at time of movement (default 1 for non-conversion movements)';
COMMENT ON TABLE currency_conversions IS 'Tracks all currency conversion operations between ARS and USD';

-- ============================================================================
-- STEP 6: Create function to validate currency conversion movements
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_currency_conversion()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure currency_exchange movements have a valid currency_conversions record
  IF NEW.movement_type = 'currency_exchange' THEN
    IF NOT EXISTS (
      SELECT 1 FROM currency_conversions
      WHERE outbound_movement_id = NEW.id OR inbound_movement_id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Currency exchange movements must be linked to a currency_conversions record';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (will be applied after movement_type is updated to include 'currency_exchange')
-- CREATE TRIGGER trigger_validate_currency_conversion
--   AFTER INSERT OR UPDATE ON cash_movements
--   FOR EACH ROW
--   WHEN (NEW.movement_type = 'currency_exchange')
--   EXECUTE FUNCTION validate_currency_conversion();

-- ============================================================================
-- ROLLBACK SCRIPT (for reference, do not execute)
-- ============================================================================

/*
-- To rollback this migration:

-- Drop trigger and function
DROP TRIGGER IF EXISTS trigger_validate_currency_conversion ON cash_movements;
DROP FUNCTION IF EXISTS validate_currency_conversion();

-- Drop indexes
DROP INDEX IF EXISTS idx_currency_conversions_movements;
DROP INDEX IF EXISTS idx_currency_conversions_to_currency;
DROP INDEX IF EXISTS idx_currency_conversions_from_currency;
DROP INDEX IF EXISTS idx_currency_conversions_created_at;

-- Drop currency_conversions table
DROP TABLE IF EXISTS currency_conversions;

-- Remove columns from cash_movements
ALTER TABLE cash_movements
  DROP CONSTRAINT IF EXISTS check_exchange_rate_positive,
  DROP CONSTRAINT IF EXISTS check_currency_valid,
  DROP COLUMN IF EXISTS exchange_rate,
  DROP COLUMN IF EXISTS currency;

-- Remove columns from master_cash
ALTER TABLE master_cash
  DROP CONSTRAINT IF EXISTS check_balance_usd_positive,
  DROP CONSTRAINT IF EXISTS check_balance_ars_positive,
  DROP COLUMN IF EXISTS balance_usd,
  DROP COLUMN IF EXISTS balance_ars;
*/