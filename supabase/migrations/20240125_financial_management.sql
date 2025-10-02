-- ============================================
-- FINANCIAL MANAGEMENT SYSTEM MIGRATION
-- ============================================
-- Adds comprehensive financial management capabilities
-- to the admin cash system for complete business finance tracking
-- ============================================

-- 1. INCOME & EXPENSE CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS income_expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    parent_category_id UUID REFERENCES income_expense_categories(id),
    description TEXT,
    color VARCHAR(7), -- Hex color for UI
    icon VARCHAR(50), -- Icon name for UI
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false, -- System categories can't be deleted
    tax_deductible BOOLEAN DEFAULT false, -- For expense categories
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_income_expense_categories_type ON income_expense_categories(type);
CREATE INDEX idx_income_expense_categories_active ON income_expense_categories(is_active);

-- Insert default categories
INSERT INTO income_expense_categories (type, name, code, description, color, icon, is_system) VALUES
-- Income categories
('income', 'Honorarios Profesionales', 'INC-FEES', 'Honorarios por servicios de arquitectura', '#10b981', 'DollarSign', true),
('income', 'Consultoría', 'INC-CONSULT', 'Ingresos por consultoría', '#3b82f6', 'Briefcase', true),
('income', 'Diseño', 'INC-DESIGN', 'Servicios de diseño', '#8b5cf6', 'Palette', true),
('income', 'Gestión de Proyectos', 'INC-MGMT', 'Gestión y supervisión de proyectos', '#f59e0b', 'FolderOpen', true),
('income', 'Otros Ingresos', 'INC-OTHER', 'Otros ingresos no categorizados', '#6b7280', 'Plus', true),

-- Expense categories
('expense', 'Alquiler y Expensas', 'EXP-RENT', 'Alquiler de oficina y expensas', '#ef4444', 'Home', true),
('expense', 'Servicios', 'EXP-SERVICES', 'Luz, gas, agua, internet', '#f97316', 'Zap', true),
('expense', 'Software y Suscripciones', 'EXP-SOFTWARE', 'Licencias de software y suscripciones', '#a855f7', 'Monitor', true),
('expense', 'Materiales', 'EXP-MATERIALS', 'Materiales de oficina y proyecto', '#84cc16', 'Package', true),
('expense', 'Salarios', 'EXP-SALARIES', 'Sueldos y cargas sociales', '#06b6d4', 'Users', true),
('expense', 'Impuestos', 'EXP-TAXES', 'Impuestos y tasas', '#dc2626', 'FileText', true),
('expense', 'Marketing', 'EXP-MARKETING', 'Publicidad y marketing', '#ec4899', 'Megaphone', true),
('expense', 'Transporte', 'EXP-TRANSPORT', 'Gastos de transporte y combustible', '#14b8a6', 'Car', true),
('expense', 'Profesionales', 'EXP-PROF', 'Honorarios a otros profesionales', '#f59e0b', 'Briefcase', true),
('expense', 'Mantenimiento', 'EXP-MAINT', 'Mantenimiento y reparaciones', '#64748b', 'Tool', true),
('expense', 'Otros Gastos', 'EXP-OTHER', 'Otros gastos no categorizados', '#6b7280', 'MoreHorizontal', true);

-- 2. PROVIDERS/SUPPLIERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('supplier', 'service', 'professional', 'utility', 'government', 'other')),
    tax_id VARCHAR(50), -- CUIT/CUIL
    category_id UUID REFERENCES income_expense_categories(id),
    
    -- Contact information
    contact_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Argentina',
    
    -- Payment information
    payment_terms INTEGER DEFAULT 30, -- Days
    payment_method VARCHAR(50),
    bank_account VARCHAR(100),
    bank_name VARCHAR(100),
    
    -- Additional info
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Financial tracking
    total_paid DECIMAL(15,2) DEFAULT 0,
    last_payment_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_providers_type ON providers(type);
CREATE INDEX idx_providers_active ON providers(is_active);
CREATE INDEX idx_providers_category ON providers(category_id);

-- 3. ENHANCED FINANCIAL TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Transaction basics
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('income', 'expense', 'transfer')),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ARS',
    exchange_rate DECIMAL(10,4) DEFAULT 1.0,
    
    -- Categorization
    category_id UUID REFERENCES income_expense_categories(id),
    subcategory_id UUID REFERENCES income_expense_categories(id),
    
    -- Related entities
    provider_id UUID REFERENCES providers(id),
    project_id UUID REFERENCES projects(id),
    cash_type VARCHAR(20) NOT NULL CHECK (cash_type IN ('admin', 'master')),
    
    -- Transaction details
    description TEXT,
    reference_number VARCHAR(100),
    payment_method VARCHAR(50),
    
    -- Dates
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    paid_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled', 'scheduled')),
    
    -- Attachments
    receipt_url TEXT,
    invoice_number VARCHAR(100),
    
    -- Recurring transaction link
    recurring_transaction_id UUID,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX idx_financial_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_category ON financial_transactions(category_id);
CREATE INDEX idx_financial_transactions_provider ON financial_transactions(provider_id);
CREATE INDEX idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX idx_financial_transactions_project ON financial_transactions(project_id);

-- 4. RECURRING TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Transaction template
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('income', 'expense')),
    category_id UUID REFERENCES income_expense_categories(id),
    provider_id UUID REFERENCES providers(id),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ARS',
    description TEXT,
    payment_method VARCHAR(50),
    
    -- Recurrence pattern
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual')),
    interval_value INTEGER DEFAULT 1, -- Every N periods
    day_of_month INTEGER, -- For monthly: 1-31
    day_of_week INTEGER, -- For weekly: 0-6 (Sunday-Saturday)
    month_of_year INTEGER, -- For annual: 1-12
    
    -- Scheduling
    start_date DATE NOT NULL,
    end_date DATE,
    next_date DATE NOT NULL,
    last_processed_date DATE,
    
    -- Control
    is_active BOOLEAN DEFAULT true,
    auto_process BOOLEAN DEFAULT false,
    send_reminder BOOLEAN DEFAULT true,
    reminder_days_before INTEGER DEFAULT 3,
    
    -- Stats
    total_occurrences INTEGER DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_recurring_transactions_active ON recurring_transactions(is_active);
CREATE INDEX idx_recurring_transactions_next_date ON recurring_transactions(next_date);
CREATE INDEX idx_recurring_transactions_type ON recurring_transactions(transaction_type);

-- 5. BUDGETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Budget info
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('monthly', 'quarterly', 'annual', 'project')),
    category_id UUID REFERENCES income_expense_categories(id),
    project_id UUID REFERENCES projects(id),
    
    -- Amounts
    budgeted_amount DECIMAL(15,2) NOT NULL,
    actual_amount DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'ARS',
    
    -- Period
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Alerts
    alert_threshold DECIMAL(5,2) DEFAULT 80.00, -- Alert when X% spent
    alert_sent BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_budgets_type ON budgets(type);
CREATE INDEX idx_budgets_status ON budgets(status);
CREATE INDEX idx_budgets_dates ON budgets(start_date, end_date);
CREATE INDEX idx_budgets_category ON budgets(category_id);

-- 6. FINANCIAL REPORTS CACHE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS financial_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    report_type VARCHAR(50) NOT NULL,
    report_name VARCHAR(200),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Report data (JSON)
    report_data JSONB NOT NULL,
    
    -- Metadata
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_by UUID REFERENCES auth.users(id),
    
    -- Cache control
    expires_at TIMESTAMP WITH TIME ZONE,
    is_draft BOOLEAN DEFAULT false
);

-- Create indexes
CREATE INDEX idx_financial_reports_type ON financial_reports(report_type);
CREATE INDEX idx_financial_reports_period ON financial_reports(period_start, period_end);

-- 7. PAYMENT SCHEDULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    provider_id UUID REFERENCES providers(id),
    financial_transaction_id UUID REFERENCES financial_transactions(id),
    
    scheduled_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ARS',
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    
    reminder_sent BOOLEAN DEFAULT false,
    reminder_date DATE,
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_payment_schedules_date ON payment_schedules(scheduled_date);
CREATE INDEX idx_payment_schedules_status ON payment_schedules(status);
CREATE INDEX idx_payment_schedules_provider ON payment_schedules(provider_id);

-- 8. CREATE VIEWS FOR REPORTING
-- ============================================

-- Cash flow view
CREATE VIEW cash_flow_summary AS
SELECT 
    DATE_TRUNC('month', transaction_date) as month,
    transaction_type,
    SUM(CASE WHEN currency = 'ARS' THEN amount ELSE amount * exchange_rate END) as total_ars,
    SUM(CASE WHEN currency = 'USD' THEN amount ELSE 0 END) as total_usd,
    COUNT(*) as transaction_count
FROM financial_transactions
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', transaction_date), transaction_type
ORDER BY month DESC;

-- Category summary view
CREATE VIEW category_summary AS
SELECT 
    c.id,
    c.type,
    c.name,
    c.code,
    COUNT(ft.id) as transaction_count,
    SUM(CASE WHEN ft.currency = 'ARS' THEN ft.amount ELSE ft.amount * ft.exchange_rate END) as total_ars,
    MAX(ft.transaction_date) as last_transaction_date
FROM income_expense_categories c
LEFT JOIN financial_transactions ft ON ft.category_id = c.id AND ft.status = 'completed'
GROUP BY c.id, c.type, c.name, c.code;

-- Provider summary view
CREATE VIEW provider_summary AS
SELECT 
    p.id,
    p.name,
    p.type,
    COUNT(ft.id) as transaction_count,
    SUM(CASE WHEN ft.currency = 'ARS' THEN ft.amount ELSE ft.amount * ft.exchange_rate END) as total_spent,
    MAX(ft.transaction_date) as last_transaction_date,
    AVG(CASE 
        WHEN ft.due_date IS NOT NULL AND ft.paid_date IS NOT NULL 
        THEN ft.paid_date - ft.due_date 
        ELSE 0 
    END) as avg_payment_delay_days
FROM providers p
LEFT JOIN financial_transactions ft ON ft.provider_id = p.id AND ft.status = 'completed'
GROUP BY p.id, p.name, p.type;

-- 9. FUNCTIONS FOR FINANCIAL OPERATIONS
-- ============================================

-- Function to process recurring transactions
CREATE OR REPLACE FUNCTION process_recurring_transactions()
RETURNS void AS $$
DECLARE
    rec RECORD;
    new_transaction_id UUID;
BEGIN
    FOR rec IN 
        SELECT * FROM recurring_transactions 
        WHERE is_active = true 
        AND auto_process = true 
        AND next_date <= CURRENT_DATE
    LOOP
        -- Create the transaction
        INSERT INTO financial_transactions (
            transaction_type,
            amount,
            currency,
            category_id,
            provider_id,
            description,
            payment_method,
            transaction_date,
            status,
            recurring_transaction_id,
            cash_type
        ) VALUES (
            rec.transaction_type,
            rec.amount,
            rec.currency,
            rec.category_id,
            rec.provider_id,
            rec.description || ' (Recurrente)',
            rec.payment_method,
            rec.next_date,
            'completed',
            rec.id,
            'admin'
        ) RETURNING id INTO new_transaction_id;
        
        -- Update recurring transaction
        UPDATE recurring_transactions
        SET 
            last_processed_date = CURRENT_DATE,
            total_occurrences = total_occurrences + 1,
            total_amount = total_amount + rec.amount,
            next_date = CASE rec.frequency
                WHEN 'daily' THEN rec.next_date + INTERVAL '1 day' * rec.interval_value
                WHEN 'weekly' THEN rec.next_date + INTERVAL '1 week' * rec.interval_value
                WHEN 'monthly' THEN rec.next_date + INTERVAL '1 month' * rec.interval_value
                WHEN 'quarterly' THEN rec.next_date + INTERVAL '3 months' * rec.interval_value
                WHEN 'annual' THEN rec.next_date + INTERVAL '1 year' * rec.interval_value
            END
        WHERE id = rec.id;
        
        -- Check if end date reached
        UPDATE recurring_transactions
        SET is_active = false
        WHERE id = rec.id AND end_date IS NOT NULL AND next_date > end_date;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update budget actuals
CREATE OR REPLACE FUNCTION update_budget_actuals()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE budgets
        SET actual_amount = actual_amount + NEW.amount
        WHERE category_id = NEW.category_id
        AND NEW.transaction_date BETWEEN start_date AND end_date
        AND status = 'active';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for budget updates
CREATE TRIGGER update_budget_on_transaction
AFTER INSERT OR UPDATE ON financial_transactions
FOR EACH ROW
EXECUTE FUNCTION update_budget_actuals();

-- 10. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE income_expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies (all data visible to authenticated users for now)
CREATE POLICY "Enable all operations for authenticated users" ON income_expense_categories
    FOR ALL USING (auth.role() = 'authenticated');
    
CREATE POLICY "Enable all operations for authenticated users" ON providers
    FOR ALL USING (auth.role() = 'authenticated');
    
CREATE POLICY "Enable all operations for authenticated users" ON financial_transactions
    FOR ALL USING (auth.role() = 'authenticated');
    
CREATE POLICY "Enable all operations for authenticated users" ON recurring_transactions
    FOR ALL USING (auth.role() = 'authenticated');
    
CREATE POLICY "Enable all operations for authenticated users" ON budgets
    FOR ALL USING (auth.role() = 'authenticated');
    
CREATE POLICY "Enable all operations for authenticated users" ON financial_reports
    FOR ALL USING (auth.role() = 'authenticated');
    
CREATE POLICY "Enable all operations for authenticated users" ON payment_schedules
    FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_income_expense_categories_updated_at BEFORE UPDATE ON income_expense_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_payment_schedules_updated_at BEFORE UPDATE ON payment_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Financial Management System migration completed successfully!';
END $$;