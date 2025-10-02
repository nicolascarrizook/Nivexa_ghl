-- =====================================================
-- MASTER CASH SYSTEM - PRÉSTAMOS INTER-PROYECTO
-- =====================================================
-- Este script crea las tablas necesarias para gestionar:
-- 1. Préstamos entre proyectos con trazabilidad completa
-- 2. Cuotas de préstamos con tracking de pagos
-- 3. Cuentas bancarias separadas (ARS/USD)
-- 4. Transferencias entre cuentas

-- =====================================================
-- 1. ENUM TYPES
-- =====================================================

-- Tipos de moneda
CREATE TYPE currency_type AS ENUM ('ARS', 'USD');

-- Estados de préstamo
CREATE TYPE loan_status_type AS ENUM ('draft', 'pending', 'active', 'paid', 'overdue', 'cancelled');

-- Estados de pago de cuota
CREATE TYPE installment_payment_status AS ENUM ('pending', 'partial', 'paid', 'overdue', 'cancelled');

-- Tipos de cuenta bancaria
CREATE TYPE bank_account_type AS ENUM ('master_ars', 'master_usd', 'project_ars', 'project_usd');

-- =====================================================
-- 2. PRÉSTAMOS INTER-PROYECTO
-- =====================================================

CREATE TABLE inter_project_loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Código único del préstamo
  loan_code VARCHAR(50) UNIQUE NOT NULL,

  -- Partes involucradas
  lender_project_id UUID REFERENCES projects(id) ON DELETE RESTRICT,
  borrower_project_id UUID REFERENCES projects(id) ON DELETE RESTRICT,

  -- Monto y moneda
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  currency currency_type NOT NULL DEFAULT 'ARS',

  -- Términos del préstamo
  interest_rate DECIMAL(5,2) DEFAULT 0 CHECK (interest_rate >= 0),
  loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,

  -- Estado y tracking
  loan_status loan_status_type NOT NULL DEFAULT 'draft',
  outstanding_balance DECIMAL(15,2) NOT NULL,
  total_paid DECIMAL(15,2) DEFAULT 0,

  -- Información adicional
  description TEXT,
  notes TEXT,
  payment_terms TEXT,

  -- Archivos y documentos
  contract_file_url TEXT,

  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT,

  -- Constraints
  CONSTRAINT different_projects CHECK (lender_project_id != borrower_project_id),
  CONSTRAINT valid_dates CHECK (due_date > loan_date)
);

-- Índices para performance
CREATE INDEX idx_inter_project_loans_lender ON inter_project_loans(lender_project_id);
CREATE INDEX idx_inter_project_loans_borrower ON inter_project_loans(borrower_project_id);
CREATE INDEX idx_inter_project_loans_status ON inter_project_loans(loan_status);
CREATE INDEX idx_inter_project_loans_due_date ON inter_project_loans(due_date);

-- Trigger para updated_at
CREATE TRIGGER update_inter_project_loans_updated_at
  BEFORE UPDATE ON inter_project_loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. CUOTAS DE PRÉSTAMOS
-- =====================================================

CREATE TABLE loan_installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Préstamo asociado
  loan_id UUID NOT NULL REFERENCES inter_project_loans(id) ON DELETE CASCADE,

  -- Información de la cuota
  installment_number INTEGER NOT NULL CHECK (installment_number > 0),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,

  -- Estado de pago
  payment_status installment_payment_status NOT NULL DEFAULT 'pending',
  paid_amount DECIMAL(15,2) DEFAULT 0 CHECK (paid_amount >= 0),
  paid_date DATE,

  -- Intereses y recargos
  interest_amount DECIMAL(15,2) DEFAULT 0,
  late_fee_amount DECIMAL(15,2) DEFAULT 0,

  -- Trazabilidad de pago
  payment_movement_id UUID REFERENCES cash_movements(id),

  -- Información adicional
  notes TEXT,

  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(loan_id, installment_number),
  CONSTRAINT valid_paid_amount CHECK (paid_amount <= amount + interest_amount + late_fee_amount)
);

-- Índices
CREATE INDEX idx_loan_installments_loan ON loan_installments(loan_id);
CREATE INDEX idx_loan_installments_status ON loan_installments(payment_status);
CREATE INDEX idx_loan_installments_due_date ON loan_installments(due_date);

-- Trigger para updated_at
CREATE TRIGGER update_loan_installments_updated_at
  BEFORE UPDATE ON loan_installments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. CUENTAS BANCARIAS
-- =====================================================

CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Tipo de cuenta
  account_type bank_account_type NOT NULL,
  account_name VARCHAR(255) NOT NULL,

  -- Vinculación (null para cuentas master)
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Balance
  currency currency_type NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0 NOT NULL,
  available_balance DECIMAL(15,2) DEFAULT 0 NOT NULL,

  -- Información bancaria
  bank_name VARCHAR(255),
  account_number VARCHAR(100),
  account_holder VARCHAR(255),

  -- Estado
  is_active BOOLEAN DEFAULT true,

  -- Auditoría
  last_movement_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT master_no_project CHECK (
    (account_type IN ('master_ars', 'master_usd') AND project_id IS NULL) OR
    (account_type IN ('project_ars', 'project_usd') AND project_id IS NOT NULL)
  ),
  CONSTRAINT currency_match CHECK (
    (account_type IN ('master_ars', 'project_ars') AND currency = 'ARS') OR
    (account_type IN ('master_usd', 'project_usd') AND currency = 'USD')
  )
);

-- Índices
CREATE INDEX idx_bank_accounts_project ON bank_accounts(project_id);
CREATE INDEX idx_bank_accounts_type ON bank_accounts(account_type);
CREATE INDEX idx_bank_accounts_currency ON bank_accounts(currency);
CREATE INDEX idx_bank_accounts_active ON bank_accounts(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. TRANSFERENCIAS ENTRE CUENTAS
-- =====================================================

CREATE TABLE bank_account_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Cuentas origen y destino
  from_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  to_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE RESTRICT,

  -- Monto
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),

  -- Conversión de moneda (si aplica)
  from_currency currency_type NOT NULL,
  to_currency currency_type NOT NULL,
  exchange_rate DECIMAL(10,4),
  converted_amount DECIMAL(15,2),

  -- Tipo de transferencia
  transfer_type VARCHAR(50) NOT NULL, -- 'fee_payment', 'loan_disbursement', 'loan_repayment', 'internal_transfer'

  -- Referencias
  related_loan_id UUID REFERENCES inter_project_loans(id),
  related_installment_id UUID REFERENCES loan_installments(id),
  related_movement_id UUID REFERENCES cash_movements(id),

  -- Información adicional
  description TEXT NOT NULL,
  notes TEXT,
  reference_number VARCHAR(100),

  -- Auditoría
  transfer_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT different_accounts CHECK (from_account_id != to_account_id),
  CONSTRAINT valid_conversion CHECK (
    (from_currency = to_currency AND exchange_rate IS NULL AND converted_amount IS NULL) OR
    (from_currency != to_currency AND exchange_rate IS NOT NULL AND converted_amount IS NOT NULL)
  )
);

-- Índices
CREATE INDEX idx_bank_account_transfers_from ON bank_account_transfers(from_account_id);
CREATE INDEX idx_bank_account_transfers_to ON bank_account_transfers(to_account_id);
CREATE INDEX idx_bank_account_transfers_date ON bank_account_transfers(transfer_date);
CREATE INDEX idx_bank_account_transfers_loan ON bank_account_transfers(related_loan_id);
CREATE INDEX idx_bank_account_transfers_type ON bank_account_transfers(transfer_type);

-- =====================================================
-- 6. EXTENDER cash_movements PARA PRÉSTAMOS
-- =====================================================

-- Agregar nuevos tipos de movimiento para préstamos
ALTER TYPE cash_movements_type ADD VALUE IF NOT EXISTS 'loan_disbursement';
ALTER TYPE cash_movements_type ADD VALUE IF NOT EXISTS 'loan_repayment';
ALTER TYPE cash_movements_type ADD VALUE IF NOT EXISTS 'loan_interest';
ALTER TYPE cash_movements_type ADD VALUE IF NOT EXISTS 'inter_account_transfer';

-- Agregar columnas para vincular préstamos en cash_movements
ALTER TABLE cash_movements ADD COLUMN IF NOT EXISTS related_loan_id UUID REFERENCES inter_project_loans(id);
ALTER TABLE cash_movements ADD COLUMN IF NOT EXISTS related_installment_id UUID REFERENCES loan_installments(id);

-- =====================================================
-- 7. FUNCIONES PARA ACTUALIZAR BALANCES
-- =====================================================

-- Función para actualizar balance de préstamo
CREATE OR REPLACE FUNCTION update_loan_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el balance pendiente del préstamo
  UPDATE inter_project_loans
  SET
    total_paid = (
      SELECT COALESCE(SUM(paid_amount), 0)
      FROM loan_installments
      WHERE loan_id = NEW.loan_id
    ),
    outstanding_balance = amount - (
      SELECT COALESCE(SUM(paid_amount), 0)
      FROM loan_installments
      WHERE loan_id = NEW.loan_id
    ),
    loan_status = CASE
      WHEN (SELECT COALESCE(SUM(paid_amount), 0) FROM loan_installments WHERE loan_id = NEW.loan_id) >= amount THEN 'paid'::loan_status_type
      WHEN NEW.payment_status = 'overdue' THEN 'overdue'::loan_status_type
      ELSE 'active'::loan_status_type
    END,
    updated_at = NOW()
  WHERE id = NEW.loan_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar balance cuando cambia una cuota
CREATE TRIGGER update_loan_balance_trigger
  AFTER INSERT OR UPDATE ON loan_installments
  FOR EACH ROW
  EXECUTE FUNCTION update_loan_balance();

-- Función para actualizar balance de cuenta bancaria
CREATE OR REPLACE FUNCTION update_bank_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar cuenta origen (decrementar)
  IF TG_OP = 'INSERT' THEN
    UPDATE bank_accounts
    SET
      balance = balance - NEW.amount,
      available_balance = available_balance - NEW.amount,
      last_movement_at = NOW(),
      updated_at = NOW()
    WHERE id = NEW.from_account_id;

    -- Actualizar cuenta destino (incrementar)
    UPDATE bank_accounts
    SET
      balance = balance + COALESCE(NEW.converted_amount, NEW.amount),
      available_balance = available_balance + COALESCE(NEW.converted_amount, NEW.amount),
      last_movement_at = NOW(),
      updated_at = NOW()
    WHERE id = NEW.to_account_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar balances en transferencias
CREATE TRIGGER update_bank_account_balance_trigger
  AFTER INSERT ON bank_account_transfers
  FOR EACH ROW
  EXECUTE FUNCTION update_bank_account_balance();

-- =====================================================
-- 8. VISTA: RESUMEN DE PRÉSTAMOS ACTIVOS
-- =====================================================

CREATE OR REPLACE VIEW active_loans_summary AS
SELECT
  l.id,
  l.loan_code,
  l.amount,
  l.currency,
  l.loan_status,
  l.outstanding_balance,
  l.total_paid,
  l.loan_date,
  l.due_date,
  lp.name as lender_project_name,
  bp.name as borrower_project_name,
  COUNT(li.id) as total_installments,
  COUNT(CASE WHEN li.payment_status = 'paid' THEN 1 END) as paid_installments,
  COUNT(CASE WHEN li.payment_status = 'pending' THEN 1 END) as pending_installments,
  COUNT(CASE WHEN li.payment_status = 'overdue' THEN 1 END) as overdue_installments,
  MIN(CASE WHEN li.payment_status IN ('pending', 'partial') THEN li.due_date END) as next_payment_due
FROM inter_project_loans l
LEFT JOIN projects lp ON l.lender_project_id = lp.id
LEFT JOIN projects bp ON l.borrower_project_id = bp.id
LEFT JOIN loan_installments li ON l.id = li.loan_id
WHERE l.loan_status IN ('active', 'overdue')
GROUP BY l.id, lp.name, bp.name;

-- =====================================================
-- 9. VISTA: BALANCE DE CUENTAS BANCARIAS
-- =====================================================

CREATE OR REPLACE VIEW bank_accounts_balance AS
SELECT
  ba.id,
  ba.account_name,
  ba.account_type,
  ba.currency,
  ba.balance,
  ba.available_balance,
  ba.is_active,
  p.name as project_name,
  COALESCE(
    (SELECT SUM(amount)
     FROM bank_account_transfers
     WHERE from_account_id = ba.id),
    0
  ) as total_outgoing,
  COALESCE(
    (SELECT SUM(COALESCE(converted_amount, amount))
     FROM bank_account_transfers
     WHERE to_account_id = ba.id),
    0
  ) as total_incoming
FROM bank_accounts ba
LEFT JOIN projects p ON ba.project_id = p.id
WHERE ba.is_active = true;

-- =====================================================
-- 10. DATOS INICIALES
-- =====================================================

-- Crear cuentas bancarias master (ARS y USD)
INSERT INTO bank_accounts (account_type, account_name, currency, balance, available_balance, account_holder)
VALUES
  ('master_ars', 'Caja Maestra - Pesos', 'ARS', 0, 0, 'Estudio de Arquitectura'),
  ('master_usd', 'Caja Maestra - Dólares', 'USD', 0, 0, 'Estudio de Arquitectura')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 11. PERMISOS Y POLÍTICAS RLS
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE inter_project_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_account_transfers ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según necesidades de autenticación)
CREATE POLICY "Enable read access for authenticated users" ON inter_project_loans
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON loan_installments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON bank_accounts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON bank_account_transfers
  FOR SELECT TO authenticated USING (true);

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================

COMMENT ON TABLE inter_project_loans IS 'Préstamos entre proyectos con trazabilidad completa';
COMMENT ON TABLE loan_installments IS 'Cuotas de préstamos con tracking de pagos';
COMMENT ON TABLE bank_accounts IS 'Cuentas bancarias separadas por moneda y proyecto';
COMMENT ON TABLE bank_account_transfers IS 'Transferencias entre cuentas bancarias con conversión';
