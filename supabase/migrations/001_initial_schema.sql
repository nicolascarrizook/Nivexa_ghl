-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Architect Profile (Single User for now)
CREATE TABLE architects (
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

-- Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- e.g., "PRY-2024-001"
    name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    client_tax_id TEXT,
    project_type TEXT CHECK (project_type IN ('construction', 'renovation', 'design', 'other')),
    status TEXT CHECK (status IN ('draft', 'active', 'on_hold', 'completed', 'cancelled')) DEFAULT 'draft',
    
    -- Financial Configuration
    total_amount DECIMAL(15, 2) NOT NULL,
    down_payment_amount DECIMAL(15, 2) DEFAULT 0, -- Anticipo
    down_payment_percentage DECIMAL(5, 2), -- Alternative: percentage instead of fixed amount
    installments_count INTEGER DEFAULT 1,
    installment_amount DECIMAL(15, 2),
    late_fee_percentage DECIMAL(5, 2) DEFAULT 5.0,
    
    -- Dates
    start_date DATE,
    estimated_end_date DATE,
    actual_end_date DATE,
    
    -- Metadata
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRIPLE CASH BOX SYSTEM
-- =====================================================

-- Master Cash Box (Caja Maestra - Studio's main cash)
CREATE TABLE master_cash (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    balance DECIMAL(15, 2) DEFAULT 0,
    last_movement_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Cash Box (Caja Admin - Architect's personal cash for fees)
CREATE TABLE admin_cash (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    balance DECIMAL(15, 2) DEFAULT 0,
    total_collected DECIMAL(15, 2) DEFAULT 0, -- Total fees collected historically
    last_movement_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Cash Boxes (One per project)
CREATE TABLE project_cash (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    balance DECIMAL(15, 2) DEFAULT 0,
    total_received DECIMAL(15, 2) DEFAULT 0, -- Total money received for this project
    last_movement_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id)
);

-- =====================================================
-- FINANCIAL MOVEMENTS & TRANSACTIONS
-- =====================================================

-- Cash Movements (All money movements with traceability)
CREATE TABLE cash_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movement_type TEXT CHECK (movement_type IN (
        'project_income',      -- Money entering a project
        'master_duplication',  -- Automatic duplication to master cash
        'fee_collection',      -- Fee transfer from master to admin
        'expense',            -- Direct expense from any cash box
        'transfer',           -- Transfer between cash boxes
        'adjustment'          -- Manual adjustment
    )) NOT NULL,
    
    -- Source and Destination
    source_type TEXT CHECK (source_type IN ('master', 'admin', 'project', 'external')),
    source_id UUID, -- References the specific cash box or null for external
    destination_type TEXT CHECK (destination_type IN ('master', 'admin', 'project', 'external')),
    destination_id UUID, -- References the specific cash box or null for external
    
    -- Financial Details
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT NOT NULL,
    
    -- References
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    installment_id UUID, -- Will reference installments table
    fee_collection_id UUID, -- Will reference fee_collections table
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_by UUID, -- Will reference architect
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fee Collections (Detailed fee collection records)
CREATE TABLE fee_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Collection Details
    amount_collected DECIMAL(15, 2) NOT NULL,
    collection_reason TEXT, -- e.g., "Monthly fee", "Project completion bonus", etc.
    
    -- Calculation Base
    project_income_base DECIMAL(15, 2), -- Amount of project income this fee is based on
    percentage_applied DECIMAL(5, 2), -- If percentage-based
    
    -- Movement Reference
    movement_id UUID REFERENCES cash_movements(id),
    
    -- Metadata
    notes TEXT,
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INSTALLMENTS & PAYMENTS
-- =====================================================

-- Project Installments
CREATE TABLE installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    
    -- Financial Details
    amount DECIMAL(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')) DEFAULT 'pending',
    
    -- Payment Tracking
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    paid_date DATE,
    late_fee_applied DECIMAL(15, 2) DEFAULT 0,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(project_id, installment_number)
);

-- Payments (Track individual payments for installments)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    installment_id UUID NOT NULL REFERENCES installments(id) ON DELETE CASCADE,
    
    -- Payment Details
    amount DECIMAL(15, 2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'transfer', 'check', 'card', 'other')),
    payment_reference TEXT, -- Transaction ID, check number, etc.
    
    -- Movement Reference
    movement_id UUID REFERENCES cash_movements(id),
    
    -- Metadata
    notes TEXT,
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONTRACTS & DOCUMENTS
-- =====================================================

-- Digital Contracts
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Contract Details
    contract_type TEXT CHECK (contract_type IN ('service', 'financing', 'amendment')) DEFAULT 'service',
    status TEXT CHECK (status IN ('draft', 'sent', 'signed', 'cancelled')) DEFAULT 'draft',
    
    -- Content
    content TEXT, -- Contract text/HTML
    terms JSONB, -- Structured terms and conditions
    
    -- Signatures
    architect_signed_at TIMESTAMPTZ,
    client_signed_at TIMESTAMPTZ,
    client_signature_ip TEXT,
    
    -- Files
    pdf_url TEXT,
    
    -- Metadata
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_code ON projects(code);
CREATE INDEX idx_cash_movements_project ON cash_movements(project_id);
CREATE INDEX idx_cash_movements_created ON cash_movements(created_at DESC);
CREATE INDEX idx_cash_movements_type ON cash_movements(movement_type);
CREATE INDEX idx_installments_project ON installments(project_id);
CREATE INDEX idx_installments_status ON installments(status);
CREATE INDEX idx_installments_due_date ON installments(due_date);
CREATE INDEX idx_payments_installment ON payments(installment_id);
CREATE INDEX idx_fee_collections_project ON fee_collections(project_id);
CREATE INDEX idx_contracts_project ON contracts(project_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Create initial cash boxes
INSERT INTO master_cash (id, balance) VALUES (uuid_generate_v4(), 0);
INSERT INTO admin_cash (id, balance) VALUES (uuid_generate_v4(), 0);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Simplified for single user
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE architects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Simple policies for authenticated users (architect has full access)
CREATE POLICY "Architect has full access to architects" ON architects
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Architect has full access to projects" ON projects
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Architect has full access to master_cash" ON master_cash
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Architect has full access to admin_cash" ON admin_cash
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Architect has full access to project_cash" ON project_cash
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Architect has full access to cash_movements" ON cash_movements
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Architect has full access to fee_collections" ON fee_collections
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Architect has full access to installments" ON installments
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Architect has full access to payments" ON payments
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Architect has full access to contracts" ON contracts
    FOR ALL USING (auth.uid() IS NOT NULL);