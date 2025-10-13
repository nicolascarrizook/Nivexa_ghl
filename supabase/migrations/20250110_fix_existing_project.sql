-- =====================================================
-- CORRECCIÓN: Aplicar multi-moneda a proyecto existente
-- =====================================================
-- Este script:
-- 1. Crea project_cash_box si no existe
-- 2. Crea cash box para el proyecto PRY-2025-001
-- 3. Registra el pago de $30,000 USD correctamente
-- =====================================================

BEGIN;

-- ============================================
-- PASO 1: Crear tabla project_cash_box si no existe
-- ============================================

CREATE TABLE IF NOT EXISTS project_cash_box (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Balances por moneda
    current_balance_ars DECIMAL(15,2) DEFAULT 0,
    current_balance_usd DECIMAL(15,2) DEFAULT 0,

    -- Totales históricos por moneda
    total_income_ars DECIMAL(15,2) DEFAULT 0,
    total_income_usd DECIMAL(15,2) DEFAULT 0,
    total_expenses_ars DECIMAL(15,2) DEFAULT 0,
    total_expenses_usd DECIMAL(15,2) DEFAULT 0,

    -- Presupuestos asignados por moneda
    budget_allocated_ars DECIMAL(15,2) DEFAULT 0,
    budget_allocated_usd DECIMAL(15,2) DEFAULT 0,

    -- Metadatos
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraint: Un solo cash box por proyecto
    CONSTRAINT unique_cash_per_project UNIQUE (project_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_project_cash_box_project_id ON project_cash_box(project_id);
CREATE INDEX IF NOT EXISTS idx_project_cash_box_is_active ON project_cash_box(is_active);

-- ============================================
-- PASO 2: Crear cash box para proyecto PRY-2025-001
-- ============================================

DO $$
DECLARE
    v_project_id UUID;
    v_project_currency TEXT;
    v_paid_amount DECIMAL(15,2);
BEGIN
    -- Obtener ID y moneda del proyecto
    SELECT id, currency INTO v_project_id, v_project_currency
    FROM projects
    WHERE code = 'PRY-2025-001';

    IF v_project_id IS NULL THEN
        RAISE EXCEPTION 'Proyecto PRY-2025-001 no encontrado';
    END IF;

    -- Obtener el monto pagado (cuota 0 = anticipo)
    SELECT amount INTO v_paid_amount
    FROM installments
    WHERE project_id = v_project_id
    AND installment_number = 0
    AND status = 'paid';

    IF v_paid_amount IS NULL THEN
        v_paid_amount := 0;
    END IF;

    RAISE NOTICE 'Proyecto: %, Moneda: %, Monto pagado: %', v_project_id, v_project_currency, v_paid_amount;

    -- Crear o actualizar project_cash_box
    INSERT INTO project_cash_box (
        project_id,
        current_balance_ars,
        current_balance_usd,
        total_income_ars,
        total_income_usd
    ) VALUES (
        v_project_id,
        CASE WHEN v_project_currency = 'ARS' THEN v_paid_amount ELSE 0 END,
        CASE WHEN v_project_currency = 'USD' THEN v_paid_amount ELSE 0 END,
        CASE WHEN v_project_currency = 'ARS' THEN v_paid_amount ELSE 0 END,
        CASE WHEN v_project_currency = 'USD' THEN v_paid_amount ELSE 0 END
    )
    ON CONFLICT (project_id) DO UPDATE SET
        current_balance_ars = CASE WHEN v_project_currency = 'ARS' THEN v_paid_amount ELSE 0 END,
        current_balance_usd = CASE WHEN v_project_currency = 'USD' THEN v_paid_amount ELSE 0 END,
        total_income_ars = CASE WHEN v_project_currency = 'ARS' THEN v_paid_amount ELSE 0 END,
        total_income_usd = CASE WHEN v_project_currency = 'USD' THEN v_paid_amount ELSE 0 END,
        updated_at = CURRENT_TIMESTAMP;

    RAISE NOTICE '✅ Cash box creado/actualizado para proyecto PRY-2025-001';
END $$;

-- ============================================
-- PASO 3: Crear movimiento de caja si no existe
-- ============================================

DO $$
DECLARE
    v_project_id UUID;
    v_installment_id UUID;
    v_project_currency TEXT;
    v_paid_amount DECIMAL(15,2);
    v_movement_exists BOOLEAN;
BEGIN
    -- Obtener datos del proyecto y pago
    SELECT
        p.id,
        p.currency,
        i.id,
        i.amount
    INTO
        v_project_id,
        v_project_currency,
        v_installment_id,
        v_paid_amount
    FROM projects p
    JOIN installments i ON p.id = i.project_id
    WHERE p.code = 'PRY-2025-001'
    AND i.installment_number = 0
    AND i.status = 'paid';

    -- Verificar si ya existe el movimiento
    SELECT EXISTS (
        SELECT 1 FROM cash_movements
        WHERE installment_id = v_installment_id
    ) INTO v_movement_exists;

    IF NOT v_movement_exists THEN
        -- Crear movimiento de caja
        INSERT INTO cash_movements (
            id,
            project_id,
            installment_id,
            amount,
            currency,
            movement_type,
            source_type,
            destination_type,
            destination_id,
            description,
            created_at
        ) VALUES (
            gen_random_uuid(),
            v_project_id,
            v_installment_id,
            v_paid_amount,
            v_project_currency,
            'income',
            'client_payment',
            'project',
            (SELECT id FROM project_cash_box WHERE project_id = v_project_id),
            'Pago cuota #0 (Anticipo) - Casa Ejemplo 1',
            CURRENT_TIMESTAMP
        );

        RAISE NOTICE '✅ Movimiento de caja creado';
    ELSE
        RAISE NOTICE 'ℹ️  Movimiento de caja ya existe';
    END IF;
END $$;

COMMIT;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

SELECT
    p.code as proyecto,
    p.name as nombre,
    p.currency as moneda,
    pcb.current_balance_ars as balance_ars,
    pcb.current_balance_usd as balance_usd,
    pcb.total_income_ars as ingreso_ars,
    pcb.total_income_usd as ingreso_usd
FROM projects p
LEFT JOIN project_cash_box pcb ON p.id = pcb.project_id
WHERE p.code = 'PRY-2025-001';

-- Verificar movimientos
SELECT
    cm.description,
    cm.amount,
    cm.currency,
    cm.movement_type,
    cm.created_at
FROM cash_movements cm
JOIN projects p ON cm.project_id = p.id
WHERE p.code = 'PRY-2025-001'
ORDER BY cm.created_at DESC;
