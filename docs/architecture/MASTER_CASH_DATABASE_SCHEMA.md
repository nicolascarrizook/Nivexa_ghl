# Esquema de Base de Datos - Caja Maestra

**Versión:** 2.0
**Fecha:** 30 de Enero de 2025

---

## Diagrama Entidad-Relación

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MASTER_CASH_BOX                                 │
│─────────────────────────────────────────────────────────────────────────│
│ PK │ id: UUID                                                           │
│    │ balance_ars: DECIMAL(15,2)                                         │
│    │ balance_usd: DECIMAL(15,2)                                         │
│    │ current_balance_ars: DECIMAL(15,2)                                 │
│    │ total_income_ars: DECIMAL(15,2)                                    │
│    │ total_income_usd: DECIMAL(15,2)                                    │
│    │ total_expenses_ars: DECIMAL(15,2)                                  │
│    │ total_expenses_usd: DECIMAL(15,2)                                  │
│    │ total_loans_given_ars: DECIMAL(15,2)        ← NUEVO                │
│    │ total_loans_given_usd: DECIMAL(15,2)        ← NUEVO                │
│    │ outstanding_receivables_ars: DECIMAL(15,2)  ← NUEVO                │
│    │ outstanding_receivables_usd: DECIMAL(15,2)  ← NUEVO                │
│    │ outstanding_payables_ars: DECIMAL(15,2)     ← NUEVO                │
│    │ outstanding_payables_usd: DECIMAL(15,2)     ← NUEVO                │
│    │ last_movement_at: TIMESTAMP                                        │
│    │ created_at: TIMESTAMP                                              │
│    │ updated_at: TIMESTAMP                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1:N
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         CASH_MOVEMENTS                                  │
│─────────────────────────────────────────────────────────────────────────│
│ PK │ id: UUID                                                           │
│    │ movement_type: ENUM                                                │
│    │   - 'inter_project_loan'        ← NUEVO                            │
│    │   - 'loan_repayment'            ← NUEVO                            │
│    │   - 'advance_to_project'        ← NUEVO                            │
│    │   - 'bank_account_transfer'     ← NUEVO                            │
│    │   - 'currency_exchange'         ← NUEVO                            │
│    │   - ... (tipos existentes)                                         │
│    │ source_type: ENUM (master, project, external)                      │
│ FK │ source_id: UUID                                                    │
│    │ destination_type: ENUM (master, project, external)                 │
│ FK │ destination_id: UUID                                               │
│    │ amount: DECIMAL(15,2)                                              │
│    │ currency: VARCHAR(3)            ← NUEVO                            │
│    │ exchange_rate: DECIMAL(10,4)    ← NUEVO                            │
│    │ description: TEXT                                                  │
│ FK │ project_id: UUID                                                   │
│ FK │ loan_id: UUID                   ← NUEVO                            │
│    │ installment_number: INTEGER     ← NUEVO                            │
│ FK │ created_by: UUID                                                   │
│    │ created_at: TIMESTAMP                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↑
                                    │ N:1
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                    INTER_PROJECT_LOANS (NUEVA TABLA)                    │
│─────────────────────────────────────────────────────────────────────────│
│ PK │ id: UUID                                                           │
│    │ loan_number: VARCHAR(50) UNIQUE                                    │
│ FK │ lender_project_id: UUID         → PROJECTS                         │
│    │ lender_project_name: VARCHAR(255) (desnormalizado)                 │
│ FK │ borrower_project_id: UUID       → PROJECTS                         │
│    │ borrower_project_name: VARCHAR(255) (desnormalizado)               │
│    │ loan_amount: DECIMAL(15,2)                                         │
│    │ currency: VARCHAR(3)                                               │
│    │ interest_rate: DECIMAL(5,2)                                        │
│    │ installments_count: INTEGER                                        │
│    │ installment_amount: DECIMAL(15,2)                                  │
│    │ payment_frequency: VARCHAR(20)                                     │
│    │ loan_date: TIMESTAMP                                               │
│    │ first_payment_date: DATE                                           │
│    │ expected_completion_date: DATE                                     │
│    │ actual_completion_date: DATE                                       │
│    │ status: VARCHAR(20)                                                │
│    │   - 'pending', 'active', 'partially_paid', 'paid', 'defaulted'    │
│    │ total_paid: DECIMAL(15,2)                                          │
│    │ total_interest_paid: DECIMAL(15,2)                                 │
│    │ outstanding_balance: DECIMAL(15,2)                                 │
│ FK │ disbursement_movement_id: UUID  → CASH_MOVEMENTS                   │
│    │ notes: TEXT                                                        │
│    │ approval_reason: TEXT                                              │
│ FK │ approved_by: UUID               → AUTH.USERS                       │
│ FK │ created_by: UUID                → AUTH.USERS                       │
│    │ created_at: TIMESTAMP                                              │
│    │ updated_at: TIMESTAMP                                              │
└─────────────────────────────────────────────────────────────────────────┘
          │                                                    │
          │ 1:N                                                │ N:1
          ↓                                                    ↓
┌───────────────────────────────┐              ┌──────────────────────────┐
│    LOAN_INSTALLMENTS          │              │       PROJECTS           │
│   (NUEVA TABLA)               │              │   (TABLA EXISTENTE)      │
│───────────────────────────────│              │──────────────────────────│
│ PK │ id: UUID                 │              │ PK │ id: UUID           │
│ FK │ loan_id: UUID            │              │    │ code: VARCHAR      │
│    │ installment_number: INT  │              │    │ name: VARCHAR      │
│    │ principal_amount: DEC    │              │    │ client_id: UUID    │
│    │ interest_amount: DEC     │              │    │ status: VARCHAR    │
│    │ total_amount: DEC        │              │    │ total_amount: DEC  │
│    │ paid_amount: DEC         │              │    │ ... (más campos)   │
│    │ due_date: DATE           │              └──────────────────────────┘
│    │ paid_date: DATE          │                          ↑
│    │ status: VARCHAR(20)      │                          │
│    │   'pending', 'partial'   │                          │ N:1
│    │   'paid', 'overdue'      │                          │
│ FK │ payment_movement_id: UUID│              ┌──────────────────────────┐
│    │ late_fee_amount: DEC     │              │    PROJECT_CASH          │
│    │ days_overdue: INTEGER    │              │  (TABLA EXISTENTE)       │
│    │ notes: TEXT              │              │──────────────────────────│
│    │ created_at: TIMESTAMP    │              │ PK │ id: UUID           │
│    │ updated_at: TIMESTAMP    │              │ FK │ project_id: UUID   │
└───────────────────────────────┘              │    │ balance: DECIMAL   │
                                                │    │ total_received: DEC│
                                                │    │ last_movement_at   │
                                                └──────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    BANK_ACCOUNTS (NUEVA TABLA)                          │
│─────────────────────────────────────────────────────────────────────────│
│ PK │ id: UUID                                                           │
│    │ bank_name: VARCHAR(100)                                            │
│    │ account_type: VARCHAR(20) ('checking', 'savings', 'investment')    │
│    │ account_number: VARCHAR(100)                                       │
│    │ account_alias: VARCHAR(100)                                        │
│    │ currency: VARCHAR(3)                                               │
│    │ current_balance: DECIMAL(15,2)                                     │
│    │ cbu_cvu: VARCHAR(22)                                               │
│    │ status: VARCHAR(20) ('active', 'inactive', 'closed')               │
│    │ notes: TEXT                                                        │
│    │ created_at: TIMESTAMP                                              │
│    │ updated_at: TIMESTAMP                                              │
│    │ UNIQUE (bank_name, account_number)                                 │
└─────────────────────────────────────────────────────────────────────────┘
          │                                    │
          │ 1:N (from)                         │ 1:N (to)
          ↓                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│              BANK_ACCOUNT_TRANSFERS (NUEVA TABLA)                       │
│─────────────────────────────────────────────────────────────────────────│
│ PK │ id: UUID                                                           │
│ FK │ from_account_id: UUID       → BANK_ACCOUNTS                        │
│ FK │ to_account_id: UUID         → BANK_ACCOUNTS                        │
│    │ amount: DECIMAL(15,2)                                              │
│    │ currency: VARCHAR(3)                                               │
│    │ exchange_rate: DECIMAL(10,4) (default: 1)                          │
│    │ converted_amount: DECIMAL(15,2)                                    │
│ FK │ outbound_movement_id: UUID  → CASH_MOVEMENTS                       │
│ FK │ inbound_movement_id: UUID   → CASH_MOVEMENTS                       │
│    │ status: VARCHAR(20)                                                │
│    │   'pending', 'processing', 'completed', 'failed', 'cancelled'     │
│    │ reference_number: VARCHAR(100)                                     │
│    │ notes: TEXT                                                        │
│    │ transfer_date: TIMESTAMP                                           │
│    │ completed_at: TIMESTAMP                                            │
│ FK │ created_by: UUID            → AUTH.USERS                           │
│    │ created_at: TIMESTAMP                                              │
│    │ updated_at: TIMESTAMP                                              │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│         LOAN_BALANCE_LEDGER (VISTA MATERIALIZADA - NUEVA)               │
│─────────────────────────────────────────────────────────────────────────│
│ PK │ project_id: UUID                                                   │
│    │ project_name: VARCHAR                                              │
│    │ receivables_ars: DECIMAL   (Lo que le deben al proyecto)          │
│    │ receivables_usd: DECIMAL                                           │
│    │ payables_ars: DECIMAL      (Lo que el proyecto debe)              │
│    │ payables_usd: DECIMAL                                              │
│    │ net_balance_ars: DECIMAL   (Balance neto)                          │
│    │ net_balance_usd: DECIMAL                                           │
│    │ loans_given_count: INTEGER                                         │
│    │ loans_received_count: INTEGER                                      │
│    │ last_updated: TIMESTAMP                                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│              CURRENCY_CONVERSIONS (TABLA EXISTENTE)                     │
│─────────────────────────────────────────────────────────────────────────│
│ PK │ id: UUID                                                           │
│    │ from_currency: VARCHAR(3)                                          │
│    │ from_amount: DECIMAL(15,2)                                         │
│    │ to_currency: VARCHAR(3)                                            │
│    │ to_amount: DECIMAL(15,2)                                           │
│    │ exchange_rate: DECIMAL(10,4)                                       │
│    │ exchange_rate_source: VARCHAR(50) ('blue', 'oficial', 'mep')      │
│ FK │ outbound_movement_id: UUID  → CASH_MOVEMENTS                       │
│ FK │ inbound_movement_id: UUID   → CASH_MOVEMENTS                       │
│    │ notes: TEXT                                                        │
│    │ created_at: TIMESTAMP                                              │
│ FK │ created_by: UUID            → AUTH.USERS                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Índices Críticos

### Performance Indexes

```sql
-- INTER_PROJECT_LOANS
CREATE INDEX idx_inter_project_loans_lender ON inter_project_loans(lender_project_id);
CREATE INDEX idx_inter_project_loans_borrower ON inter_project_loans(borrower_project_id);
CREATE INDEX idx_inter_project_loans_status ON inter_project_loans(status);
CREATE INDEX idx_inter_project_loans_loan_date ON inter_project_loans(loan_date DESC);
CREATE INDEX idx_inter_project_loans_currency ON inter_project_loans(currency);
CREATE INDEX idx_inter_project_loans_outstanding ON inter_project_loans(outstanding_balance DESC) WHERE status IN ('active', 'partially_paid');

-- LOAN_INSTALLMENTS
CREATE INDEX idx_loan_installments_loan_id ON loan_installments(loan_id);
CREATE INDEX idx_loan_installments_status ON loan_installments(status);
CREATE INDEX idx_loan_installments_due_date ON loan_installments(due_date);
CREATE INDEX idx_loan_installments_overdue ON loan_installments(due_date, status) WHERE status IN ('pending', 'partial');

-- CASH_MOVEMENTS
CREATE INDEX idx_cash_movements_loan_id ON cash_movements(loan_id) WHERE loan_id IS NOT NULL;
CREATE INDEX idx_cash_movements_currency ON cash_movements(currency);
CREATE INDEX idx_cash_movements_created_at ON cash_movements(created_at DESC);
CREATE INDEX idx_cash_movements_source ON cash_movements(source_type, source_id);
CREATE INDEX idx_cash_movements_destination ON cash_movements(destination_type, destination_id);
CREATE INDEX idx_cash_movements_type_date ON cash_movements(movement_type, created_at DESC);

-- BANK_ACCOUNTS
CREATE INDEX idx_bank_accounts_currency ON bank_accounts(currency);
CREATE INDEX idx_bank_accounts_status ON bank_accounts(status);

-- BANK_ACCOUNT_TRANSFERS
CREATE INDEX idx_bank_transfers_from_account ON bank_account_transfers(from_account_id);
CREATE INDEX idx_bank_transfers_to_account ON bank_account_transfers(to_account_id);
CREATE INDEX idx_bank_transfers_status ON bank_account_transfers(status);
CREATE INDEX idx_bank_transfers_date ON bank_account_transfers(transfer_date DESC);

-- LOAN_BALANCE_LEDGER (Materialized View)
CREATE UNIQUE INDEX idx_loan_balance_ledger_project_id ON loan_balance_ledger(project_id);
CREATE INDEX idx_loan_balance_ledger_receivables ON loan_balance_ledger(receivables_ars DESC, receivables_usd DESC);
CREATE INDEX idx_loan_balance_ledger_payables ON loan_balance_ledger(payables_ars DESC, payables_usd DESC);
```

---

## Constraints y Validaciones

### Check Constraints

```sql
-- MASTER_CASH_BOX
ALTER TABLE master_cash_box
  ADD CONSTRAINT check_balance_ars_positive CHECK (balance_ars >= 0),
  ADD CONSTRAINT check_balance_usd_positive CHECK (balance_usd >= 0),
  ADD CONSTRAINT check_outstanding_receivables_valid CHECK (
    outstanding_receivables_ars >= 0 AND outstanding_receivables_usd >= 0
  ),
  ADD CONSTRAINT check_outstanding_payables_valid CHECK (
    outstanding_payables_ars >= 0 AND outstanding_payables_usd >= 0
  );

-- INTER_PROJECT_LOANS
ALTER TABLE inter_project_loans
  ADD CONSTRAINT check_loan_amount_positive CHECK (loan_amount > 0),
  ADD CONSTRAINT check_interest_rate_valid CHECK (interest_rate >= 0 AND interest_rate <= 100),
  ADD CONSTRAINT check_installments_positive CHECK (installments_count > 0),
  ADD CONSTRAINT check_outstanding_balance_valid CHECK (outstanding_balance >= 0),
  ADD CONSTRAINT check_total_paid_valid CHECK (total_paid >= 0),
  ADD CONSTRAINT check_different_projects CHECK (lender_project_id != borrower_project_id),
  ADD CONSTRAINT check_currency_valid CHECK (currency IN ('ARS', 'USD'));

-- LOAN_INSTALLMENTS
ALTER TABLE loan_installments
  ADD CONSTRAINT check_amounts_positive CHECK (
    principal_amount >= 0 AND
    interest_amount >= 0 AND
    total_amount >= 0 AND
    paid_amount >= 0
  ),
  ADD CONSTRAINT check_paid_not_exceeds_total CHECK (paid_amount <= total_amount),
  ADD CONSTRAINT check_total_amount_correct CHECK (total_amount = principal_amount + interest_amount);

-- BANK_ACCOUNTS
ALTER TABLE bank_accounts
  ADD CONSTRAINT check_currency_valid CHECK (currency IN ('ARS', 'USD'));

-- BANK_ACCOUNT_TRANSFERS
ALTER TABLE bank_account_transfers
  ADD CONSTRAINT check_amount_positive CHECK (amount > 0),
  ADD CONSTRAINT check_different_accounts CHECK (from_account_id != to_account_id),
  ADD CONSTRAINT check_currency_valid CHECK (currency IN ('ARS', 'USD'));

-- CASH_MOVEMENTS
ALTER TABLE cash_movements
  ADD CONSTRAINT check_currency_valid CHECK (currency IN ('ARS', 'USD')),
  ADD CONSTRAINT check_exchange_rate_positive CHECK (exchange_rate > 0);
```

### Foreign Key Constraints

```sql
-- INTER_PROJECT_LOANS
ALTER TABLE inter_project_loans
  ADD CONSTRAINT fk_lender_project FOREIGN KEY (lender_project_id)
    REFERENCES projects(id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_borrower_project FOREIGN KEY (borrower_project_id)
    REFERENCES projects(id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_disbursement_movement FOREIGN KEY (disbursement_movement_id)
    REFERENCES cash_movements(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_approved_by FOREIGN KEY (approved_by)
    REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_created_by FOREIGN KEY (created_by)
    REFERENCES auth.users(id) ON DELETE SET NULL;

-- LOAN_INSTALLMENTS
ALTER TABLE loan_installments
  ADD CONSTRAINT fk_loan FOREIGN KEY (loan_id)
    REFERENCES inter_project_loans(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_payment_movement FOREIGN KEY (payment_movement_id)
    REFERENCES cash_movements(id) ON DELETE SET NULL;

-- BANK_ACCOUNT_TRANSFERS
ALTER TABLE bank_account_transfers
  ADD CONSTRAINT fk_from_account FOREIGN KEY (from_account_id)
    REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_to_account FOREIGN KEY (to_account_id)
    REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_outbound_movement FOREIGN KEY (outbound_movement_id)
    REFERENCES cash_movements(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_inbound_movement FOREIGN KEY (inbound_movement_id)
    REFERENCES cash_movements(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_created_by FOREIGN KEY (created_by)
    REFERENCES auth.users(id) ON DELETE SET NULL;

-- CASH_MOVEMENTS (nuevas referencias)
ALTER TABLE cash_movements
  ADD CONSTRAINT fk_loan FOREIGN KEY (loan_id)
    REFERENCES inter_project_loans(id) ON DELETE SET NULL;
```

---

## Triggers Automáticos

### 1. Auto-actualización de Outstanding Balance

```sql
CREATE TRIGGER trigger_update_loan_balance
  AFTER INSERT OR UPDATE ON loan_installments
  FOR EACH ROW
  EXECUTE FUNCTION update_loan_outstanding_balance();
```

### 2. Auto-actualización de Caja Maestra

```sql
CREATE TRIGGER trigger_update_master_cash_balance
  AFTER INSERT ON cash_movements
  FOR EACH ROW
  WHEN (NEW.movement_type IN ('inter_project_loan', 'loan_repayment'))
  EXECUTE FUNCTION update_master_cash_balance();
```

### 3. Validación de Préstamos

```sql
CREATE TRIGGER trigger_validate_inter_project_loan
  BEFORE INSERT OR UPDATE ON inter_project_loans
  FOR EACH ROW
  EXECUTE FUNCTION validate_inter_project_loan();
```

### 4. Actualización de Timestamps

```sql
CREATE TRIGGER trigger_update_loan_timestamp
  BEFORE UPDATE ON inter_project_loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_installment_timestamp
  BEFORE UPDATE ON loan_installments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Secuencias

```sql
-- Secuencia para números de préstamo
CREATE SEQUENCE IF NOT EXISTS loan_number_seq START 1;

-- Ejemplo de uso:
-- LOAN-2025-0001
-- LOAN-2025-0002
-- ...
```

---

## Políticas RLS (Row Level Security)

```sql
-- INTER_PROJECT_LOANS
ALTER TABLE inter_project_loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view loans for their organization"
  ON inter_project_loans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE (p.id = lender_project_id OR p.id = borrower_project_id)
      AND p.architect_id = auth.uid()
    )
  );

CREATE POLICY "Users can create loans for their organization"
  ON inter_project_loans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE (p.id = lender_project_id OR p.id = borrower_project_id)
      AND p.architect_id = auth.uid()
    )
  );

-- LOAN_INSTALLMENTS
ALTER TABLE loan_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view installments for their loans"
  ON loan_installments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inter_project_loans l
      JOIN projects p ON (p.id = l.lender_project_id OR p.id = l.borrower_project_id)
      WHERE l.id = loan_id
      AND p.architect_id = auth.uid()
    )
  );

-- BANK_ACCOUNTS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's bank accounts"
  ON bank_accounts FOR SELECT
  USING (
    -- Implementar lógica de organización
    true
  );

-- Similar para otras tablas...
```

---

## Comentarios de Documentación

```sql
-- MASTER_CASH_BOX
COMMENT ON TABLE master_cash_box IS 'Caja maestra centralizada con balances en ARS y USD';
COMMENT ON COLUMN master_cash_box.balance_ars IS 'Balance disponible en Pesos Argentinos';
COMMENT ON COLUMN master_cash_box.balance_usd IS 'Balance disponible en Dólares Estadounidenses';
COMMENT ON COLUMN master_cash_box.outstanding_receivables_ars IS 'Total a cobrar de préstamos otorgados en ARS';
COMMENT ON COLUMN master_cash_box.outstanding_payables_ars IS 'Total a pagar por préstamos recibidos en ARS';

-- INTER_PROJECT_LOANS
COMMENT ON TABLE inter_project_loans IS 'Préstamos entre proyectos intermediados por la caja maestra con trazabilidad completa';
COMMENT ON COLUMN inter_project_loans.lender_project_id IS 'Proyecto que presta el dinero (aportante a caja maestra)';
COMMENT ON COLUMN inter_project_loans.borrower_project_id IS 'Proyecto que recibe el préstamo desde caja maestra';
COMMENT ON COLUMN inter_project_loans.outstanding_balance IS 'Saldo pendiente de pago incluyendo capital e intereses';
COMMENT ON COLUMN inter_project_loans.disbursement_movement_id IS 'Movimiento de cash que registró el desembolso del préstamo';

-- LOAN_INSTALLMENTS
COMMENT ON TABLE loan_installments IS 'Cuotas individuales de préstamos inter-proyectos con tracking de pagos';
COMMENT ON COLUMN loan_installments.principal_amount IS 'Monto de capital en esta cuota';
COMMENT ON COLUMN loan_installments.interest_amount IS 'Monto de interés en esta cuota';
COMMENT ON COLUMN loan_installments.late_fee_amount IS 'Penalidad por mora aplicada a esta cuota';

-- BANK_ACCOUNTS
COMMENT ON TABLE bank_accounts IS 'Cuentas bancarias del estudio para gestión de liquidez';

-- BANK_ACCOUNT_TRANSFERS
COMMENT ON TABLE bank_account_transfers IS 'Transferencias entre cuentas bancarias del estudio con tracking de conversión';

-- LOAN_BALANCE_LEDGER
COMMENT ON MATERIALIZED VIEW loan_balance_ledger IS 'Balance consolidado de deudas inter-proyectos por proyecto (vista materializada para performance)';
```

---

## Versionado de Schema

```sql
-- Tabla de migraciones (si no existe)
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(50) PRIMARY KEY,
  description TEXT,
  executed_at TIMESTAMP DEFAULT NOW()
);

-- Registrar esta migración
INSERT INTO schema_migrations (version, description)
VALUES
  ('2025-01-30-master-cash-v2', 'Implementación completa de sistema de préstamos inter-proyectos con trazabilidad total');
```

---

**Documento generado por:** Sistema Arquitecto - Nivexa CRM
**Fecha:** 30 de Enero de 2025
**Versión:** 2.0 - Esquema de Base de Datos Completo