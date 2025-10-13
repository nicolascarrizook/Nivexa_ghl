-- =====================================================
-- MIGRACIÓN COMPLETA: Crear project_cash_box + Migrar datos
-- =====================================================
-- 1. Crea la tabla project_cash_box con multi-moneda
-- 2. Migra datos de project_cash → project_cash_box
-- 3. Crea cajas para proyectos sin caja
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

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_project_cash_box_project_id ON project_cash_box(project_id);
CREATE INDEX IF NOT EXISTS idx_project_cash_box_is_active ON project_cash_box(is_active);

-- Comentario
COMMENT ON TABLE project_cash_box IS 'Caja individual por proyecto con soporte multi-moneda (ARS/USD)';

-- ============================================
-- PASO 2: Migrar datos de project_cash (si existe)
-- ============================================

DO $$
BEGIN
    -- Solo migrar si la tabla project_cash existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_cash') THEN

        RAISE NOTICE '📦 Migrando datos de project_cash a project_cash_box...';

        -- Insertar datos de project_cash a project_cash_box
        -- Solo si no existen ya en project_cash_box
        INSERT INTO project_cash_box (
            project_id,
            current_balance_ars,
            current_balance_usd,
            total_income_ars,
            total_income_usd,
            created_at,
            updated_at
        )
        SELECT
            pc.project_id,
            COALESCE(pc.balance, 0) as current_balance_ars,  -- Asumimos balances viejos en ARS
            0 as current_balance_usd,
            COALESCE(pc.total_received, 0) as total_income_ars,
            0 as total_income_usd,
            pc.created_at,
            pc.updated_at
        FROM project_cash pc
        LEFT JOIN project_cash_box pcb ON pc.project_id = pcb.project_id
        WHERE pcb.id IS NULL;  -- Solo insertar si no existe ya

        -- Contar cuántos registros se migraron
        RAISE NOTICE '✅ Migrados % registros de project_cash',
            (SELECT COUNT(*) FROM project_cash pc
             LEFT JOIN project_cash_box pcb ON pc.project_id = pcb.project_id
             WHERE pcb.id IS NOT NULL);

        -- Marcar tabla project_cash como deprecada
        COMMENT ON TABLE project_cash IS 'DEPRECATED: Use project_cash_box instead. This table will be removed in a future migration.';

    ELSE
        RAISE NOTICE 'ℹ️  Tabla project_cash no existe, saltando migración';
    END IF;
END $$;

-- ============================================
-- PASO 3: Crear cajas para proyectos sin caja
-- ============================================

DO $$
DECLARE
    missing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO missing_count
    FROM projects p
    LEFT JOIN project_cash_box pcb ON p.id = pcb.project_id
    WHERE pcb.id IS NULL;

    IF missing_count > 0 THEN
        RAISE NOTICE '⚠️  Hay % proyecto(s) sin caja. Creando cajas...', missing_count;

        -- Crear cajas para proyectos sin caja
        INSERT INTO project_cash_box (
            project_id,
            current_balance_ars,
            current_balance_usd,
            total_income_ars,
            total_income_usd
        )
        SELECT
            p.id,
            0,
            0,
            0,
            0
        FROM projects p
        LEFT JOIN project_cash_box pcb ON p.id = pcb.project_id
        WHERE pcb.id IS NULL;

        RAISE NOTICE '✅ Cajas creadas para % proyectos', missing_count;
    ELSE
        RAISE NOTICE '✅ Todos los proyectos tienen caja';
    END IF;
END $$;

COMMIT;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT
    'Total proyectos' as tipo,
    COUNT(*) as cantidad
FROM projects

UNION ALL

SELECT
    'Proyectos con project_cash_box' as tipo,
    COUNT(*) as cantidad
FROM project_cash_box

UNION ALL

SELECT
    'Proyectos con project_cash (OLD)' as tipo,
    COUNT(*) as cantidad
FROM project_cash
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_cash')

ORDER BY tipo;

-- Mostrar balances totales
SELECT
    'Total Balance ARS' as concepto,
    SUM(current_balance_ars) as valor
FROM project_cash_box

UNION ALL

SELECT
    'Total Balance USD' as concepto,
    SUM(current_balance_usd) as valor
FROM project_cash_box

UNION ALL

SELECT
    'Total Income ARS' as concepto,
    SUM(total_income_ars) as valor
FROM project_cash_box

UNION ALL

SELECT
    'Total Income USD' as concepto,
    SUM(total_income_usd) as valor
FROM project_cash_box;
