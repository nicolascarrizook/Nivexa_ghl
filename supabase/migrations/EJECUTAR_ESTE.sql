-- =====================================================
-- SCRIPT MAESTRO DE MIGRACIONES
-- Ejecuta SOLO este archivo en Supabase SQL Editor
-- =====================================================
-- Este script ejecuta todas las migraciones necesarias
-- en el orden correcto para que el sistema funcione
-- =====================================================


-- =====================================================
-- 1. Fix Missing Columns
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

-- =====================================================
-- 2. Master Loans System
-- =====================================================
\echo '📝 Paso 2: Creando sistema de préstamos Master...'

-- Create master_loans table
CREATE TABLE IF NOT EXISTS master_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_code TEXT NOT NULL UNIQUE,

  -- Borrower (only one side - Master is always the lender)
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,

  -- Loan details
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL CHECK (currency IN ('ARS', 'USD')),
  interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (interest_rate >= 0),

  -- Dates
  loan_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date DATE NOT NULL,

  -- Status tracking
  loan_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (loan_status IN ('draft', 'pending', 'active', 'paid', 'overdue', 'cancelled')),

  -- Financial tracking
  outstanding_balance DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (outstanding_balance >= 0),
  total_paid DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (total_paid >= 0),

  -- Additional info
  description TEXT,
  notes TEXT,
  payment_terms TEXT,
  installments_count INTEGER NOT NULL DEFAULT 1 CHECK (installments_count > 0 AND installments_count <= 60),

  -- Risk assessment
  viability_score INTEGER CHECK (viability_score >= 0 AND viability_score <= 100),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),

  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create loan installments table for payment schedule
CREATE TABLE IF NOT EXISTS master_loan_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES master_loans(id) ON DELETE CASCADE,

  installment_number INTEGER NOT NULL CHECK (installment_number > 0),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),

  paid_amount DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  paid_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(loan_id, installment_number)
);

-- Create loan payments table
CREATE TABLE IF NOT EXISTS master_loan_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES master_loans(id) ON DELETE RESTRICT,
  installment_id UUID REFERENCES master_loan_installments(id) ON DELETE SET NULL,

  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL CHECK (currency IN ('ARS', 'USD')),
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Link to cash movement
  movement_id UUID REFERENCES cash_movements(id) ON DELETE SET NULL,

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_master_loans_project ON master_loans(project_id);
CREATE INDEX IF NOT EXISTS idx_master_loans_status ON master_loans(loan_status);
CREATE INDEX IF NOT EXISTS idx_master_loans_due_date ON master_loans(due_date);
CREATE INDEX IF NOT EXISTS idx_master_loans_created_at ON master_loans(created_at);

CREATE INDEX IF NOT EXISTS idx_master_loan_installments_loan ON master_loan_installments(loan_id);
CREATE INDEX IF NOT EXISTS idx_master_loan_installments_status ON master_loan_installments(status);
CREATE INDEX IF NOT EXISTS idx_master_loan_installments_due_date ON master_loan_installments(due_date);

CREATE INDEX IF NOT EXISTS idx_master_loan_payments_loan ON master_loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_master_loan_payments_installment ON master_loan_payments(installment_id);
CREATE INDEX IF NOT EXISTS idx_master_loan_payments_date ON master_loan_payments(payment_date);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_master_loans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_master_loans_updated_at ON master_loans;
CREATE TRIGGER trigger_update_master_loans_updated_at
  BEFORE UPDATE ON master_loans
  FOR EACH ROW
  EXECUTE FUNCTION update_master_loans_updated_at();

DROP TRIGGER IF EXISTS trigger_update_master_loan_installments_updated_at ON master_loan_installments;
CREATE TRIGGER trigger_update_master_loan_installments_updated_at
  BEFORE UPDATE ON master_loan_installments
  FOR EACH ROW
  EXECUTE FUNCTION update_master_loans_updated_at();

-- Function to generate loan code
CREATE OR REPLACE FUNCTION generate_master_loan_code()
RETURNS TEXT AS $$
DECLARE
  year_str TEXT;
  next_num INTEGER;
  new_code TEXT;
BEGIN
  year_str := TO_CHAR(CURRENT_DATE, 'YYYY');

  SELECT COALESCE(MAX(CAST(SUBSTRING(loan_code FROM 'MLN-' || year_str || '-(\d+)') AS INTEGER)), 0) + 1
  INTO next_num
  FROM master_loans
  WHERE loan_code LIKE 'MLN-' || year_str || '-%';

  new_code := 'MLN-' || year_str || '-' || LPAD(next_num::TEXT, 3, '0');

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE master_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_loan_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_loan_payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all master loans" ON master_loans;
DROP POLICY IF EXISTS "Users can insert master loans" ON master_loans;
DROP POLICY IF EXISTS "Users can update master loans" ON master_loans;
DROP POLICY IF EXISTS "Users can view all loan installments" ON master_loan_installments;
DROP POLICY IF EXISTS "Users can insert loan installments" ON master_loan_installments;
DROP POLICY IF EXISTS "Users can update loan installments" ON master_loan_installments;
DROP POLICY IF EXISTS "Users can view all loan payments" ON master_loan_payments;
DROP POLICY IF EXISTS "Users can insert loan payments" ON master_loan_payments;
DROP POLICY IF EXISTS "Users can update loan payments" ON master_loan_payments;

-- Master loans policies
CREATE POLICY "Users can view all master loans"
  ON master_loans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert master loans"
  ON master_loans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update master loans"
  ON master_loans FOR UPDATE
  TO authenticated
  USING (true);

-- Master loan installments policies
CREATE POLICY "Users can view all loan installments"
  ON master_loan_installments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert loan installments"
  ON master_loan_installments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update loan installments"
  ON master_loan_installments FOR UPDATE
  TO authenticated
  USING (true);

-- Master loan payments policies
CREATE POLICY "Users can view all loan payments"
  ON master_loan_payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert loan payments"
  ON master_loan_payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update loan payments"
  ON master_loan_payments FOR UPDATE
  TO authenticated
  USING (true);

-- Add comments
COMMENT ON TABLE master_loans IS 'Préstamos desde Caja Master (Nivexa) hacia proyectos';
COMMENT ON TABLE master_loan_installments IS 'Cuotas de préstamos Master';
COMMENT ON TABLE master_loan_payments IS 'Pagos realizados a préstamos Master';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check master_loans table
SELECT
  CASE
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'master_loans')
    THEN '✅ master_loans table exists'
    ELSE '❌ master_loans table missing'
  END as check_result;

-- Check columns
SELECT
  '✅ Column exists: ' || table_name || '.' || column_name as check_result
FROM information_schema.columns
WHERE table_name IN ('installments', 'payments', 'projects', 'master_loans')
  AND column_name IN ('currency', 'payment_frequency', 'payment_interval_days', 'viability_score', 'risk_level')
ORDER BY table_name, column_name;

