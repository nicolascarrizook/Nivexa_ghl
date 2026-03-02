-- =====================================================
-- MIGRACIÓN COMPLETA: Crear project_cash_box + RLS Policies
-- =====================================================
-- Fecha: 2025-01-31
-- Descripción:
--   1. Crea la tabla project_cash_box con multi-moneda
--   2. Migra datos de project_cash → project_cash_box (si existe)
--   3. Crea cajas para proyectos sin caja
--   4. Configura políticas RLS completas
-- =====================================================

BEGIN;

-- ============================================
-- PASO 1: Crear tabla project_cash_box
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

RAISE NOTICE '✅ Tabla project_cash_box creada';

-- ============================================
-- PASO 2: Migrar datos de project_cash (si existe)
-- ============================================

DO $$
BEGIN
    -- Solo migrar si la tabla project_cash existe
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_cash') THEN

        RAISE NOTICE '📦 Migrando datos de project_cash a project_cash_box...';

        -- Insertar datos de project_cash a project_cash_box
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
            COALESCE(pc.balance, 0) as current_balance_ars,
            0 as current_balance_usd,
            COALESCE(pc.total_received, 0) as total_income_ars,
            0 as total_income_usd,
            pc.created_at,
            pc.updated_at
        FROM project_cash pc
        LEFT JOIN project_cash_box pcb ON pc.project_id = pcb.project_id
        WHERE pcb.id IS NULL;

        RAISE NOTICE '✅ Datos migrados de project_cash';

        -- Marcar tabla como deprecada
        COMMENT ON TABLE project_cash IS 'DEPRECATED: Use project_cash_box. Will be removed in future migration.';

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
    WHERE pcb.id IS NULL
      AND p.deleted_at IS NULL;

    IF missing_count > 0 THEN
        RAISE NOTICE '⚠️  Creando cajas para % proyectos sin caja...', missing_count;

        INSERT INTO project_cash_box (
            project_id,
            current_balance_ars,
            current_balance_usd,
            total_income_ars,
            total_income_usd
        )
        SELECT
            p.id,
            0, 0, 0, 0
        FROM projects p
        LEFT JOIN project_cash_box pcb ON p.id = pcb.project_id
        WHERE pcb.id IS NULL
          AND p.deleted_at IS NULL;

        RAISE NOTICE '✅ Cajas creadas para % proyectos', missing_count;
    ELSE
        RAISE NOTICE '✅ Todos los proyectos tienen caja';
    END IF;
END $$;

-- ============================================
-- PASO 4: Configurar Row Level Security (RLS)
-- ============================================

-- Habilitar RLS en la tabla
ALTER TABLE project_cash_box ENABLE ROW LEVEL SECURITY;

RAISE NOTICE '✅ RLS habilitado en project_cash_box';

-- Eliminar políticas existentes (si existen)
DROP POLICY IF EXISTS "Users can view their project cash boxes" ON project_cash_box;
DROP POLICY IF EXISTS "Users can create project cash boxes" ON project_cash_box;
DROP POLICY IF EXISTS "Users can update their project cash boxes" ON project_cash_box;
DROP POLICY IF EXISTS "Service role can manage all project cash boxes" ON project_cash_box;

-- Política 1: SELECT - Ver cajas de proyecto
CREATE POLICY "Users can view their project cash boxes"
ON project_cash_box
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_cash_box.project_id
        AND projects.deleted_at IS NULL
    )
);

-- Política 2: INSERT - Crear cajas de proyecto
CREATE POLICY "Users can create project cash boxes"
ON project_cash_box
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_cash_box.project_id
        AND projects.deleted_at IS NULL
    )
);

-- Política 3: UPDATE - Actualizar cajas de proyecto
CREATE POLICY "Users can update their project cash boxes"
ON project_cash_box
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_cash_box.project_id
        AND projects.deleted_at IS NULL
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = project_cash_box.project_id
        AND projects.deleted_at IS NULL
    )
);

-- Política 4: Service role - Acceso completo para backend
CREATE POLICY "Service role can manage all project cash boxes"
ON project_cash_box
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

RAISE NOTICE '✅ Políticas RLS creadas (4 políticas)';

COMMIT;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar tabla y políticas
SELECT
    '📊 VERIFICACIÓN FINAL' as titulo,
    '' as detalle
UNION ALL
SELECT
    '1. Total proyectos' as titulo,
    COUNT(*)::TEXT as detalle
FROM projects
WHERE deleted_at IS NULL
UNION ALL
SELECT
    '2. Proyectos con cash_box' as titulo,
    COUNT(*)::TEXT as detalle
FROM project_cash_box
UNION ALL
SELECT
    '3. Políticas RLS creadas' as titulo,
    COUNT(*)::TEXT as detalle
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'project_cash_box'
UNION ALL
SELECT
    '4. Balance total ARS' as titulo,
    TO_CHAR(COALESCE(SUM(current_balance_ars), 0), 'FM999999999.00') as detalle
FROM project_cash_box
UNION ALL
SELECT
    '5. Balance total USD' as titulo,
    TO_CHAR(COALESCE(SUM(current_balance_usd), 0), 'FM999999999.00') as detalle
FROM project_cash_box;

-- Listar políticas creadas
SELECT
    'RLS Policy: ' || policyname as politica,
    cmd as comando
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'project_cash_box'
ORDER BY policyname;
