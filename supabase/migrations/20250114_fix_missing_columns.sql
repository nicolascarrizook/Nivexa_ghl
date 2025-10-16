-- =====================================================
-- FIX MISSING COLUMNS
-- Agrega columnas faltantes para compatibilidad con el código
-- =====================================================

-- Add currency to installments if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'installments' AND column_name = 'currency'
  ) THEN
    ALTER TABLE installments ADD COLUMN currency TEXT NOT NULL DEFAULT 'ARS' CHECK (currency IN ('ARS', 'USD'));
    RAISE NOTICE '✅ Added currency column to installments';
  ELSE
    RAISE NOTICE '⏭️  currency column already exists in installments';
  END IF;
END $$;

-- Add payment_frequency to projects if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'payment_frequency'
  ) THEN
    ALTER TABLE projects ADD COLUMN payment_frequency TEXT DEFAULT 'monthly' CHECK (payment_frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'custom'));
    RAISE NOTICE '✅ Added payment_frequency column to projects';
  ELSE
    RAISE NOTICE '⏭️  payment_frequency column already exists in projects';
  END IF;
END $$;

-- Add payment_interval_days to projects if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'payment_interval_days'
  ) THEN
    ALTER TABLE projects ADD COLUMN payment_interval_days INTEGER DEFAULT 30;
    RAISE NOTICE '✅ Added payment_interval_days column to projects';
  ELSE
    RAISE NOTICE '⏭️  payment_interval_days column already exists in projects';
  END IF;
END $$;

-- Add currency to payments if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'currency'
  ) THEN
    ALTER TABLE payments ADD COLUMN currency TEXT NOT NULL DEFAULT 'ARS' CHECK (currency IN ('ARS', 'USD'));
    RAISE NOTICE '✅ Added currency column to payments';
  ELSE
    RAISE NOTICE '⏭️  currency column already exists in payments';
  END IF;
END $$;

-- Add payment_date to payments if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'payment_date'
  ) THEN
    ALTER TABLE payments ADD COLUMN payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW();
    RAISE NOTICE '✅ Added payment_date column to payments';
  ELSE
    RAISE NOTICE '⏭️  payment_date column already exists in payments';
  END IF;
END $$;

-- Verification
SELECT
  'installments' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'installments' AND column_name IN ('currency')
UNION ALL
SELECT
  'payments' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'payments' AND column_name IN ('currency', 'payment_date')
UNION ALL
SELECT
  'projects' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'projects' AND column_name IN ('payment_frequency', 'payment_interval_days')
ORDER BY table_name, column_name;

RAISE NOTICE '✅ Migration completed successfully';
