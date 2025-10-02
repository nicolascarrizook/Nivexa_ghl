-- Initial Schema Migration for Nivexa
-- Creates all necessary tables for project and payment management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Architects table (user profiles)
CREATE TABLE IF NOT EXISTS architects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  business_name TEXT,
  tax_id TEXT,
  phone TEXT,
  address JSONB,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_tax_id TEXT,
  project_type TEXT NOT NULL DEFAULT 'other' CHECK (project_type IN ('construction', 'renovation', 'design', 'other')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'on_hold', 'completed', 'cancelled')),
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  down_payment_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  down_payment_percentage NUMERIC(5,2),
  installments_count INTEGER NOT NULL DEFAULT 1,
  installment_amount NUMERIC(12,2),
  late_fee_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  start_date DATE,
  estimated_end_date DATE,
  actual_end_date DATE,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Master cash account
CREATE TABLE IF NOT EXISTS master_cash (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_movement_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin cash account
CREATE TABLE IF NOT EXISTS admin_cash (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_collected NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_movement_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project cash accounts
CREATE TABLE IF NOT EXISTS project_cash (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_received NUMERIC(12,2) NOT NULL DEFAULT 0,
  last_movement_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cash movements (transactions)
CREATE TABLE IF NOT EXISTS cash_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('project_income', 'master_duplication', 'fee_collection', 'expense', 'transfer', 'adjustment')),
  source_type TEXT CHECK (source_type IN ('master', 'admin', 'project', 'external')),
  source_id UUID,
  destination_type TEXT CHECK (destination_type IN ('master', 'admin', 'project', 'external')),
  destination_id UUID,
  amount NUMERIC(12,2) NOT NULL,
  description TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  installment_id UUID,
  fee_collection_id UUID,
  metadata JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fee collections
CREATE TABLE IF NOT EXISTS fee_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  amount_collected NUMERIC(12,2) NOT NULL,
  collection_reason TEXT,
  project_income_base NUMERIC(12,2),
  percentage_applied NUMERIC(5,2),
  movement_id UUID REFERENCES cash_movements(id),
  notes TEXT,
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Installments (payment schedule)
CREATE TABLE IF NOT EXISTS installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_date DATE,
  late_fee_applied NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments (actual payment records)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  installment_id UUID NOT NULL REFERENCES installments(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'transfer', 'check', 'card', 'other')),
  payment_reference TEXT,
  movement_id UUID REFERENCES cash_movements(id),
  notes TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL DEFAULT 'service' CHECK (contract_type IN ('service', 'financing', 'amendment')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'cancelled')),
  content TEXT,
  terms JSONB,
  architect_signed_at TIMESTAMPTZ,
  client_signed_at TIMESTAMPTZ,
  client_signature_ip TEXT,
  pdf_url TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_name ON projects(client_name);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_installments_project_id ON installments(project_id);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date);
CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status);
CREATE INDEX IF NOT EXISTS idx_payments_installment_id ON payments(installment_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_project_id ON cash_movements(project_id);
CREATE INDEX IF NOT EXISTS idx_project_cash_project_id ON project_cash(project_id);

-- Set up updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_architects_updated_at BEFORE UPDATE ON architects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_master_cash_updated_at BEFORE UPDATE ON master_cash 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_cash_updated_at BEFORE UPDATE ON admin_cash 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_cash_updated_at BEFORE UPDATE ON project_cash 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_installments_updated_at BEFORE UPDATE ON installments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();