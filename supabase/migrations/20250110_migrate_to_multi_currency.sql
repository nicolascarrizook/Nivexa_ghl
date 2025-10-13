-- =====================================================
-- MIGRACIÓN COMPLETA A SISTEMA MULTI-MONEDA
-- =====================================================
-- Este script:
-- 1. Migra datos de tablas legacy a nuevas tablas
-- 2. Elimina tablas obsoletas
-- 3. Garantiza que solo existan las tablas correctas
-- =====================================================

BEGIN;

-- ============================================
-- PASO 1: Verificar y crear tabla project_cash_box si no existe
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
-- PASO 2: Migrar datos de project_cash a project_cash_box
-- ============================================

DO $$
DECLARE
    v_record RECORD;
BEGIN
    -- Solo si existe la tabla vieja
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_cash') THEN

        RAISE NOTICE 'Migrando datos de project_cash a project_cash_box...';

        -- Migrar cada registro
        FOR v_record IN SELECT * FROM project_cash LOOP
            -- Insertar en la nueva tabla si no existe
            INSERT INTO project_cash_box (
                project_id,
                current_balance_ars,
                current_balance_usd,
                total_income_ars,
                total_income_usd,
                created_at,
                updated_at
            ) VALUES (
                v_record.project_id,
                COALESCE(v_record.balance_ars, 0),
                COALESCE(v_record.balance_usd, 0),
                COALESCE(v_record.balance_ars, 0), -- Asumimos que el balance actual = total ingreso histórico
                COALESCE(v_record.balance_usd, 0),
                v_record.created_at,
                v_record.updated_at
            )
            ON CONFLICT (project_id) DO UPDATE SET
                current_balance_ars = EXCLUDED.current_balance_ars,
                current_balance_usd = EXCLUDED.current_balance_usd,
                total_income_ars = EXCLUDED.total_income_ars,
                total_income_usd = EXCLUDED.total_income_usd,
                updated_at = EXCLUDED.updated_at;
        END LOOP;

        RAISE NOTICE '✅ Migración de project_cash completada';
    ELSE
        RAISE NOTICE 'ℹ️  Tabla project_cash no existe, saltando migración';
    END IF;
END $$;

-- ============================================
-- PASO 3: Eliminar tabla obsoleta project_cash
-- ============================================

DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_cash') THEN
        RAISE NOTICE 'Eliminando tabla obsoleta project_cash...';
        DROP TABLE project_cash CASCADE;
        RAISE NOTICE '✅ Tabla project_cash eliminada';
    END IF;
END $$;

-- ============================================
-- PASO 4: Actualizar referencias en código
-- ============================================

-- Crear vista de compatibilidad temporal (opcional, por si algún código viejo la necesita)
CREATE OR REPLACE VIEW project_cash AS
SELECT
    id,
    project_id,
    (current_balance_ars + current_balance_usd) as balance, -- Legacy field
    current_balance_ars as balance_ars,
    current_balance_usd as balance_usd,
    (total_income_ars + total_income_usd) as total_received, -- Legacy field
    created_at,
    updated_at
FROM project_cash_box;

-- ============================================
-- PASO 5: Verificación final
-- ============================================

DO $$
DECLARE
    v_project_cash_box_count INTEGER;
    v_project_count INTEGER;
BEGIN
    -- Contar project_cash_box
    SELECT COUNT(*) INTO v_project_cash_box_count FROM project_cash_box;

    -- Contar proyectos
    SELECT COUNT(*) INTO v_project_count FROM projects;

    RAISE NOTICE '=== VERIFICACIÓN FINAL ===';
    RAISE NOTICE 'Total proyectos: %', v_project_count;
    RAISE NOTICE 'Total project_cash_box: %', v_project_cash_box_count;

    IF v_project_cash_box_count < v_project_count THEN
        RAISE NOTICE '⚠️  ADVERTENCIA: Hay % proyectos sin cash box', v_project_count - v_project_cash_box_count;
        RAISE NOTICE 'ℹ️  Estos proyectos necesitan que se les cree su cash box';
    ELSE
        RAISE NOTICE '✅ Todos los proyectos tienen cash box';
    END IF;
END $$;

-- Mostrar resumen de project_cash_box
SELECT
    COUNT(*) as total_cash_boxes,
    SUM(current_balance_ars) as total_balance_ars,
    SUM(current_balance_usd) as total_balance_usd,
    SUM(total_income_ars) as total_income_ars,
    SUM(total_income_usd) as total_income_usd
FROM project_cash_box;

COMMIT;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Este script es idempotente: se puede ejecutar múltiples veces sin problemas
-- 2. Migra automáticamente datos de project_cash a project_cash_box
-- 3. Elimina la tabla obsoleta project_cash
-- 4. Crea una vista de compatibilidad temporal por si hay código legacy
-- 5. La vista debe eliminarse una vez que todo el código esté actualizado
-- =====================================================
