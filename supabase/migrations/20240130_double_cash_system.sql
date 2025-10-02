-- Sistema de Doble Caja: Caja Maestra (Financiera) y Caja de Proyecto
-- La Caja Maestra es privada y maneja todos los movimientos financieros
-- La Caja del Proyecto es visible al cliente y solo muestra movimientos del proyecto

-- ============================================
-- CAJA MAESTRA (Master Cash Box / Financiera)
-- ============================================

-- Tabla principal de la caja maestra
CREATE TABLE master_cash_box (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) DEFAULT 'Caja Maestra Principal',
    description TEXT,
    current_balance_ars DECIMAL(15,2) DEFAULT 0,
    current_balance_usd DECIMAL(15,2) DEFAULT 0,
    total_income_ars DECIMAL(15,2) DEFAULT 0,
    total_income_usd DECIMAL(15,2) DEFAULT 0,
    total_expenses_ars DECIMAL(15,2) DEFAULT 0,
    total_expenses_usd DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    CONSTRAINT unique_master_cash_per_org UNIQUE (organization_id)
);

-- Tipos de movimientos para la caja maestra
CREATE TYPE master_transaction_type AS ENUM (
    'project_income',        -- Ingreso desde proyecto (anticipo, cuota)
    'honorarium_payment',    -- Pago de honorarios personales
    'operational_expense',   -- Gastos operativos
    'tax_payment',          -- Pago de impuestos
    'investment',           -- Inversiones
    'loan_given',           -- Préstamo otorgado
    'loan_received',        -- Préstamo recibido
    'loan_payment',         -- Pago de préstamo
    'transfer_out',         -- Transferencia saliente
    'transfer_in',          -- Transferencia entrante
    'bank_fee',             -- Comisiones bancarias
    'other_income',         -- Otros ingresos
    'other_expense'         -- Otros gastos
);

-- Categorías de gastos
CREATE TABLE expense_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transacciones de la caja maestra (PRIVADAS)
CREATE TABLE master_cash_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    master_cash_box_id UUID NOT NULL REFERENCES master_cash_box(id) ON DELETE CASCADE,
    transaction_type master_transaction_type NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL CHECK (currency IN ('ARS', 'USD')),
    exchange_rate DECIMAL(10,4) DEFAULT 1,
    
    -- Referencias opcionales según el tipo de transacción
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    project_payment_id UUID, -- Referencia al pago del proyecto
    expense_category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
    
    -- Detalles del movimiento
    description TEXT NOT NULL,
    reference_number VARCHAR(255),
    payment_method VARCHAR(50),
    bank_account VARCHAR(255),
    
    -- Destinatario/Origen
    recipient_name VARCHAR(255),
    recipient_account VARCHAR(255),
    source_name VARCHAR(255),
    source_description TEXT,
    
    -- Archivos adjuntos
    receipt_url TEXT,
    invoice_url TEXT,
    attachments JSONB DEFAULT '[]',
    
    -- Metadata
    notes TEXT,
    tags TEXT[],
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id),
    
    -- Balance después de la transacción
    balance_after_ars DECIMAL(15,2),
    balance_after_usd DECIMAL(15,2)
);

-- ============================================
-- CAJA DE PROYECTO (Project Cash Box)
-- ============================================

-- Caja individual por proyecto (visible al cliente)
CREATE TABLE project_cash_box (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    current_balance_ars DECIMAL(15,2) DEFAULT 0,
    current_balance_usd DECIMAL(15,2) DEFAULT 0,
    total_income_ars DECIMAL(15,2) DEFAULT 0,
    total_income_usd DECIMAL(15,2) DEFAULT 0,
    total_expenses_ars DECIMAL(15,2) DEFAULT 0,
    total_expenses_usd DECIMAL(15,2) DEFAULT 0,
    budget_allocated_ars DECIMAL(15,2) DEFAULT 0,
    budget_allocated_usd DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_cash_per_project UNIQUE (project_id)
);

-- Tipos de transacciones del proyecto (visibles al cliente)
CREATE TYPE project_transaction_type AS ENUM (
    'down_payment',         -- Anticipo inicial
    'installment_payment',  -- Pago de cuota
    'additional_payment',   -- Pago adicional
    'material_purchase',    -- Compra de materiales
    'labor_payment',        -- Pago de mano de obra
    'service_payment',      -- Pago de servicios
    'permit_fee',          -- Permisos y habilitaciones
    'refund',              -- Reembolso
    'adjustment',          -- Ajuste
    'other'                -- Otros
);

-- Transacciones de la caja del proyecto (VISIBLES AL CLIENTE)
CREATE TABLE project_cash_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_cash_box_id UUID NOT NULL REFERENCES project_cash_box(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    transaction_type project_transaction_type NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL CHECK (currency IN ('ARS', 'USD')),
    exchange_rate DECIMAL(10,4) DEFAULT 1,
    
    -- Detalles de la transacción
    description TEXT NOT NULL,
    reference_number VARCHAR(255),
    payment_method VARCHAR(50),
    
    -- Para pagos de clientes
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    installment_number INTEGER,
    
    -- Para gastos del proyecto
    vendor_name VARCHAR(255),
    invoice_number VARCHAR(255),
    
    -- Documentación
    receipt_url TEXT,
    attachments JSONB DEFAULT '[]',
    
    -- Estado y verificación
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    notes TEXT,
    tags TEXT[],
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES auth.users(id),
    
    -- Balance después de la transacción
    balance_after_ars DECIMAL(15,2),
    balance_after_usd DECIMAL(15,2)
);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para registrar transacción en ambas cajas cuando hay un pago
CREATE OR REPLACE FUNCTION process_payment_to_cash_boxes(
    p_organization_id UUID,
    p_project_id UUID,
    p_amount DECIMAL,
    p_currency VARCHAR(3),
    p_payment_type VARCHAR,
    p_description TEXT,
    p_reference_number VARCHAR DEFAULT NULL,
    p_payment_method VARCHAR DEFAULT NULL,
    p_client_id UUID DEFAULT NULL,
    p_installment_number INTEGER DEFAULT NULL,
    p_exchange_rate DECIMAL DEFAULT 1
) RETURNS JSON AS $$
DECLARE
    v_master_box_id UUID;
    v_project_box_id UUID;
    v_master_transaction_id UUID;
    v_project_transaction_id UUID;
    v_master_balance_ars DECIMAL;
    v_master_balance_usd DECIMAL;
    v_project_balance_ars DECIMAL;
    v_project_balance_usd DECIMAL;
BEGIN
    -- Obtener o crear caja maestra
    SELECT id, current_balance_ars, current_balance_usd 
    INTO v_master_box_id, v_master_balance_ars, v_master_balance_usd
    FROM master_cash_box 
    WHERE organization_id = p_organization_id;
    
    IF v_master_box_id IS NULL THEN
        INSERT INTO master_cash_box (organization_id)
        VALUES (p_organization_id)
        RETURNING id, current_balance_ars, current_balance_usd 
        INTO v_master_box_id, v_master_balance_ars, v_master_balance_usd;
    END IF;
    
    -- Obtener o crear caja del proyecto
    SELECT id, current_balance_ars, current_balance_usd 
    INTO v_project_box_id, v_project_balance_ars, v_project_balance_usd
    FROM project_cash_box 
    WHERE project_id = p_project_id;
    
    IF v_project_box_id IS NULL THEN
        INSERT INTO project_cash_box (project_id)
        VALUES (p_project_id)
        RETURNING id, current_balance_ars, current_balance_usd 
        INTO v_project_box_id, v_project_balance_ars, v_project_balance_usd;
    END IF;
    
    -- Actualizar balance de caja maestra
    IF p_currency = 'ARS' THEN
        v_master_balance_ars := v_master_balance_ars + p_amount;
        UPDATE master_cash_box 
        SET current_balance_ars = v_master_balance_ars,
            total_income_ars = total_income_ars + p_amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_master_box_id;
    ELSE
        v_master_balance_usd := v_master_balance_usd + p_amount;
        UPDATE master_cash_box 
        SET current_balance_usd = v_master_balance_usd,
            total_income_usd = total_income_usd + p_amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_master_box_id;
    END IF;
    
    -- Insertar transacción en caja maestra
    INSERT INTO master_cash_transactions (
        master_cash_box_id,
        transaction_type,
        amount,
        currency,
        exchange_rate,
        project_id,
        description,
        reference_number,
        payment_method,
        source_name,
        source_description,
        balance_after_ars,
        balance_after_usd,
        created_by
    ) VALUES (
        v_master_box_id,
        'project_income',
        p_amount,
        p_currency,
        p_exchange_rate,
        p_project_id,
        p_description,
        p_reference_number,
        p_payment_method,
        'Proyecto #' || p_project_id::text,
        p_description,
        v_master_balance_ars,
        v_master_balance_usd,
        auth.uid()
    ) RETURNING id INTO v_master_transaction_id;
    
    -- Actualizar balance de caja del proyecto
    IF p_currency = 'ARS' THEN
        v_project_balance_ars := v_project_balance_ars + p_amount;
        UPDATE project_cash_box 
        SET current_balance_ars = v_project_balance_ars,
            total_income_ars = total_income_ars + p_amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_project_box_id;
    ELSE
        v_project_balance_usd := v_project_balance_usd + p_amount;
        UPDATE project_cash_box 
        SET current_balance_usd = v_project_balance_usd,
            total_income_usd = total_income_usd + p_amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_project_box_id;
    END IF;
    
    -- Insertar transacción en caja del proyecto
    INSERT INTO project_cash_transactions (
        project_cash_box_id,
        project_id,
        transaction_type,
        amount,
        currency,
        exchange_rate,
        description,
        reference_number,
        payment_method,
        client_id,
        installment_number,
        balance_after_ars,
        balance_after_usd,
        is_verified,
        verified_at,
        verified_by,
        created_by
    ) VALUES (
        v_project_box_id,
        p_project_id,
        p_payment_type::project_transaction_type,
        p_amount,
        p_currency,
        p_exchange_rate,
        p_description,
        p_reference_number,
        p_payment_method,
        p_client_id,
        p_installment_number,
        v_project_balance_ars,
        v_project_balance_usd,
        true,
        CURRENT_TIMESTAMP,
        auth.uid(),
        auth.uid()
    ) RETURNING id INTO v_project_transaction_id;
    
    -- Retornar IDs de las transacciones creadas
    RETURN json_build_object(
        'success', true,
        'master_transaction_id', v_master_transaction_id,
        'project_transaction_id', v_project_transaction_id,
        'master_balance_ars', v_master_balance_ars,
        'master_balance_usd', v_master_balance_usd,
        'project_balance_ars', v_project_balance_ars,
        'project_balance_usd', v_project_balance_usd
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para extraer dinero de la caja maestra (movimientos privados)
CREATE OR REPLACE FUNCTION process_master_cash_withdrawal(
    p_organization_id UUID,
    p_amount DECIMAL,
    p_currency VARCHAR(3),
    p_transaction_type master_transaction_type,
    p_description TEXT,
    p_expense_category_id UUID DEFAULT NULL,
    p_recipient_name VARCHAR DEFAULT NULL,
    p_recipient_account VARCHAR DEFAULT NULL,
    p_reference_number VARCHAR DEFAULT NULL,
    p_payment_method VARCHAR DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_master_box_id UUID;
    v_transaction_id UUID;
    v_balance_ars DECIMAL;
    v_balance_usd DECIMAL;
BEGIN
    -- Obtener caja maestra
    SELECT id, current_balance_ars, current_balance_usd 
    INTO v_master_box_id, v_balance_ars, v_balance_usd
    FROM master_cash_box 
    WHERE organization_id = p_organization_id;
    
    IF v_master_box_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Caja maestra no encontrada'
        );
    END IF;
    
    -- Verificar fondos suficientes
    IF p_currency = 'ARS' AND v_balance_ars < p_amount THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Fondos insuficientes en ARS'
        );
    ELSIF p_currency = 'USD' AND v_balance_usd < p_amount THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Fondos insuficientes en USD'
        );
    END IF;
    
    -- Actualizar balance
    IF p_currency = 'ARS' THEN
        v_balance_ars := v_balance_ars - p_amount;
        UPDATE master_cash_box 
        SET current_balance_ars = v_balance_ars,
            total_expenses_ars = total_expenses_ars + p_amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_master_box_id;
    ELSE
        v_balance_usd := v_balance_usd - p_amount;
        UPDATE master_cash_box 
        SET current_balance_usd = v_balance_usd,
            total_expenses_usd = total_expenses_usd + p_amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_master_box_id;
    END IF;
    
    -- Insertar transacción
    INSERT INTO master_cash_transactions (
        master_cash_box_id,
        transaction_type,
        amount,
        currency,
        description,
        expense_category_id,
        recipient_name,
        recipient_account,
        reference_number,
        payment_method,
        balance_after_ars,
        balance_after_usd,
        created_by
    ) VALUES (
        v_master_box_id,
        p_transaction_type,
        -p_amount, -- Negativo porque es un egreso
        p_currency,
        p_description,
        p_expense_category_id,
        p_recipient_name,
        p_recipient_account,
        p_reference_number,
        p_payment_method,
        v_balance_ars,
        v_balance_usd,
        auth.uid()
    ) RETURNING id INTO v_transaction_id;
    
    RETURN json_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'balance_ars', v_balance_ars,
        'balance_usd', v_balance_usd
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_master_transactions_date ON master_cash_transactions(transaction_date DESC);
CREATE INDEX idx_master_transactions_type ON master_cash_transactions(transaction_type);
CREATE INDEX idx_master_transactions_project ON master_cash_transactions(project_id);
CREATE INDEX idx_project_transactions_date ON project_cash_transactions(transaction_date DESC);
CREATE INDEX idx_project_transactions_type ON project_cash_transactions(transaction_type);
CREATE INDEX idx_project_transactions_client ON project_cash_transactions(client_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Master Cash Box - Solo el owner de la organización puede ver
ALTER TABLE master_cash_box ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Master cash box owner access" ON master_cash_box
    FOR ALL USING (
        organization_id IN (
            SELECT id FROM organizations 
            WHERE created_by = auth.uid()
        )
    );

-- Master Cash Transactions - Solo el owner puede ver
ALTER TABLE master_cash_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Master transactions owner access" ON master_cash_transactions
    FOR ALL USING (
        master_cash_box_id IN (
            SELECT id FROM master_cash_box 
            WHERE organization_id IN (
                SELECT id FROM organizations 
                WHERE created_by = auth.uid()
            )
        )
    );

-- Project Cash Box - Visible para el owner y el cliente del proyecto
ALTER TABLE project_cash_box ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project cash box access" ON project_cash_box
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE organization_id IN (
                SELECT id FROM organizations 
                WHERE created_by = auth.uid()
            )
            OR client_id IN (
                SELECT id FROM clients 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Project cash box owner write" ON project_cash_box
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE organization_id IN (
                SELECT id FROM organizations 
                WHERE created_by = auth.uid()
            )
        )
    );

-- Project Cash Transactions - Visible para el owner y el cliente
ALTER TABLE project_cash_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project transactions read access" ON project_cash_transactions
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE organization_id IN (
                SELECT id FROM organizations 
                WHERE created_by = auth.uid()
            )
            OR client_id IN (
                SELECT id FROM clients 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Project transactions owner write" ON project_cash_transactions
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE organization_id IN (
                SELECT id FROM organizations 
                WHERE created_by = auth.uid()
            )
        )
    );

-- Expense Categories - Solo el owner
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Expense categories owner access" ON expense_categories
    FOR ALL USING (
        organization_id IN (
            SELECT id FROM organizations 
            WHERE created_by = auth.uid()
        )
    );

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar categorías de gastos por defecto cuando se crea una organización
CREATE OR REPLACE FUNCTION create_default_expense_categories()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO expense_categories (organization_id, name, color, icon) VALUES
    (NEW.id, 'Honorarios Profesionales', '#3B82F6', 'briefcase'),
    (NEW.id, 'Gastos Operativos', '#10B981', 'settings'),
    (NEW.id, 'Impuestos', '#EF4444', 'receipt'),
    (NEW.id, 'Marketing', '#F59E0B', 'megaphone'),
    (NEW.id, 'Tecnología', '#8B5CF6', 'computer'),
    (NEW.id, 'Viajes y Viáticos', '#EC4899', 'airplane'),
    (NEW.id, 'Servicios', '#06B6D4', 'tools'),
    (NEW.id, 'Otros', '#6B7280', 'dots');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_expense_categories_on_org_create
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION create_default_expense_categories();