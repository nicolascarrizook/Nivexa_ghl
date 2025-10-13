-- =====================================================
-- RESET COMPLETO: MIGRACIÓN + LIMPIEZA
-- =====================================================
-- Este script:
-- 1. Migra a sistema multi-moneda (elimina tablas legacy)
-- 2. Limpia todos los datos
-- 3. Deja la base de datos lista para empezar de cero
-- =====================================================

BEGIN;

-- ============================================
-- PARTE 1: MIGRACIÓN A MULTI-MONEDA
-- ============================================

-- Crear tabla project_cash_box si no existe
CREATE TABLE IF NOT EXISTS project_cash_box (
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

CREATE INDEX IF NOT EXISTS idx_project_cash_box_project_id ON project_cash_box(project_id);
CREATE INDEX IF NOT EXISTS idx_project_cash_box_is_active ON project_cash_box(is_active);

-- Eliminar vista legacy project_cash (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.views WHERE table_name = 'project_cash') THEN
        DROP VIEW project_cash CASCADE;
        RAISE NOTICE '✅ Vista legacy project_cash eliminada';
    END IF;
END $$;

-- Eliminar tabla legacy project_cash (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_cash' AND table_type = 'BASE TABLE') THEN
        DROP TABLE project_cash CASCADE;
        RAISE NOTICE '✅ Tabla legacy project_cash eliminada';
    END IF;
END $$;

-- ============================================
-- PARTE 2: LIMPIEZA DE DATOS
-- ============================================

SET session_replication_role = 'replica';

-- Limpiar movimientos de caja (primero por FK)
DELETE FROM cash_movements;

-- Limpiar pagos
DELETE FROM payments;

-- Limpiar cuotas
DELETE FROM installments;

-- Limpiar préstamos entre proyectos (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inter_project_loans') THEN
        DELETE FROM inter_project_loans;
    END IF;
END $$;

-- Limpiar colecciones de honorarios
DELETE FROM fee_collections;

-- Limpiar honorarios administrativos
DELETE FROM administrator_fees;

-- Limpiar cajas de proyectos
DELETE FROM project_cash_box;

-- Limpiar asignaciones de contractors (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_contractors') THEN
        DELETE FROM project_contractors;
    END IF;
END $$;

-- Limpiar budgets
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'budgets') THEN
        DELETE FROM budgets;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contractor_budgets') THEN
        DELETE FROM contractor_budgets;
    END IF;
END $$;

-- Limpiar progreso de contractors (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contractor_progress') THEN
        DELETE FROM contractor_progress;
    END IF;
END $$;

-- Limpiar payment schedules (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_schedules') THEN
        DELETE FROM payment_schedules;
    END IF;
END $$;

-- Limpiar pagos a contractors (si existe)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contractor_payments') THEN
        DELETE FROM contractor_payments;
    END IF;
END $$;

-- Limpiar proyectos
DELETE FROM projects;

-- Limpiar providers
DELETE FROM providers;

-- Limpiar clientes
DELETE FROM clients;

-- Limpiar cuentas bancarias
DELETE FROM bank_accounts;

-- Limpiar transacciones de cash (si existen)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'master_cash_transactions') THEN
        DELETE FROM master_cash_transactions;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_cash_transactions') THEN
        DELETE FROM project_cash_transactions;
    END IF;
END $$;

-- Limpiar master_cash y admin_cash
DELETE FROM master_cash;
DELETE FROM admin_cash;

-- Limpiar master_cash_box si existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'master_cash_box') THEN
        DELETE FROM master_cash_box;
    END IF;
END $$;

SET session_replication_role = 'origin';

-- ============================================
-- PARTE 3: RECREAR REGISTROS INICIALES
-- ============================================

-- Agregar campos multi-moneda si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'master_cash' AND column_name = 'balance_ars') THEN
        ALTER TABLE master_cash ADD COLUMN balance_ars DECIMAL(15,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'master_cash' AND column_name = 'balance_usd') THEN
        ALTER TABLE master_cash ADD COLUMN balance_usd DECIMAL(15,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_cash' AND column_name = 'balance_ars') THEN
        ALTER TABLE admin_cash ADD COLUMN balance_ars DECIMAL(15,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_cash' AND column_name = 'balance_usd') THEN
        ALTER TABLE admin_cash ADD COLUMN balance_usd DECIMAL(15,2) DEFAULT 0;
    END IF;
END $$;

-- Crear master_cash inicial con multi-moneda
INSERT INTO master_cash (
    id,
    balance,
    balance_ars,
    balance_usd
) VALUES (
    gen_random_uuid(),
    0,
    0,
    0
)
ON CONFLICT DO NOTHING;

-- Crear admin_cash inicial con multi-moneda
INSERT INTO admin_cash (
    id,
    balance,
    balance_ars,
    balance_usd,
    total_collected
) VALUES (
    gen_random_uuid(),
    0,
    0,
    0,
    0
)
ON CONFLICT DO NOTHING;

-- Crear master_cash_box inicial si la tabla existe (nueva tabla multi-moneda)
DO $$
DECLARE
    org_id UUID;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'master_cash_box') THEN
        -- Obtener organization_id del usuario actual (si existe)
        SELECT id INTO org_id FROM auth.users LIMIT 1;

        IF org_id IS NOT NULL THEN
            INSERT INTO master_cash_box (
                organization_id,
                current_balance_ars,
                current_balance_usd,
                total_income_ars,
                total_income_usd,
                total_expenses_ars,
                total_expenses_usd,
                is_active
            ) VALUES (
                org_id,
                0,
                0,
                0,
                0,
                0,
                0,
                true
            )
            ON CONFLICT (organization_id) DO NOTHING;
        END IF;
    END IF;
END $$;

COMMIT;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Mostrar estado de las tablas
SELECT
    'projects' as tabla,
    COUNT(*) as registros
FROM projects

UNION ALL

SELECT
    'clients' as tabla,
    COUNT(*) as registros
FROM clients

UNION ALL

SELECT
    'project_cash_box' as tabla,
    COUNT(*) as registros
FROM project_cash_box

UNION ALL

SELECT
    'installments' as tabla,
    COUNT(*) as registros
FROM installments

UNION ALL

SELECT
    'cash_movements' as tabla,
    COUNT(*) as registros
FROM cash_movements

UNION ALL

SELECT
    'master_cash' as tabla,
    COUNT(*) as registros
FROM master_cash

UNION ALL

SELECT
    'admin_cash' as tabla,
    COUNT(*) as registros
FROM admin_cash

ORDER BY tabla;

-- Verificar balances
DO $$
BEGIN
    RAISE NOTICE '=== BALANCES DE CAJAS ===';
    RAISE NOTICE 'Master Cash: %', (SELECT COALESCE(SUM(balance), 0) FROM master_cash);
    RAISE NOTICE 'Admin Cash: %', (SELECT COALESCE(SUM(balance), 0) FROM admin_cash);

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'master_cash_box') THEN
        RAISE NOTICE 'Master Cash Box ARS: %', (SELECT COALESCE(SUM(current_balance_ars), 0) FROM master_cash_box);
        RAISE NOTICE 'Master Cash Box USD: %', (SELECT COALESCE(SUM(current_balance_usd), 0) FROM master_cash_box);
    END IF;

    -- Verificar que tabla/vista legacy no exista
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_cash')
       AND NOT EXISTS (SELECT FROM information_schema.views WHERE table_name = 'project_cash') THEN
        RAISE NOTICE '✅ Tabla/vista legacy project_cash NO existe (correcto)';
    ELSE
        RAISE NOTICE '⚠️  Tabla/vista legacy project_cash todavía existe';
    END IF;

    RAISE NOTICE '✅ Base de datos limpia y lista para usar';
END $$;
