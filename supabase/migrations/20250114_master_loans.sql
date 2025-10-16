-- =====================================================
-- MASTER LOANS SYSTEM
-- Nivexa actúa como financiera prestando desde Caja Master
-- =====================================================

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
CREATE INDEX idx_master_loans_project ON master_loans(project_id);
CREATE INDEX idx_master_loans_status ON master_loans(loan_status);
CREATE INDEX idx_master_loans_due_date ON master_loans(due_date);
CREATE INDEX idx_master_loans_created_at ON master_loans(created_at);

CREATE INDEX idx_master_loan_installments_loan ON master_loan_installments(loan_id);
CREATE INDEX idx_master_loan_installments_status ON master_loan_installments(status);
CREATE INDEX idx_master_loan_installments_due_date ON master_loan_installments(due_date);

CREATE INDEX idx_master_loan_payments_loan ON master_loan_payments(loan_id);
CREATE INDEX idx_master_loan_payments_installment ON master_loan_payments(installment_id);
CREATE INDEX idx_master_loan_payments_date ON master_loan_payments(payment_date);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_master_loans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_master_loans_updated_at
  BEFORE UPDATE ON master_loans
  FOR EACH ROW
  EXECUTE FUNCTION update_master_loans_updated_at();

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

-- Add comment
COMMENT ON TABLE master_loans IS 'Préstamos desde Caja Master (Nivexa) hacia proyectos';
COMMENT ON TABLE master_loan_installments IS 'Cuotas de préstamos Master';
COMMENT ON TABLE master_loan_payments IS 'Pagos realizados a préstamos Master';
