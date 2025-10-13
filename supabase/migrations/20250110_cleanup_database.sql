-- =====================================================
-- LIMPIEZA COMPLETA DE BASE DE DATOS
-- =====================================================
-- ADVERTENCIA: Este script eliminará TODOS los datos
-- de la base de datos. Solo ejecutar en desarrollo.
-- =====================================================

BEGIN;

-- ============================================
-- PASO 1: Deshabilitar triggers temporalmente
-- ============================================
SET session_replication_role = 'replica';

-- ============================================
-- PASO 2: Limpiar datos de todas las tablas
-- ============================================

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

-- Limpiar tabla vieja solo si existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_cash') THEN
        DELETE FROM project_cash;
    END IF;
END $$;

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

-- Limpiar providers (no existe tabla contractors)
DELETE FROM providers;

-- Limpiar clientes
DELETE FROM clients;

-- Limpiar cuentas bancarias
DELETE FROM bank_accounts;

-- Limpiar tasas de cambio (opcional - mantener las más recientes)
-- DELETE FROM exchange_rates;

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

-- Limpiar master_cash_box si existe (puede ser tabla nueva)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'master_cash_box') THEN
        DELETE FROM master_cash_box;
    END IF;
END $$;

-- ============================================
-- PASO 3: Reiniciar secuencias (si las hay)
-- ============================================

-- Reiniciar secuencias de códigos de proyecto si es necesario
-- No hay secuencias auto-incrementales en este esquema

-- ============================================
-- PASO 4: Rehabilitar triggers
-- ============================================
SET session_replication_role = 'origin';

-- ============================================
-- PASO 5: Recrear registros iniciales necesarios
-- ============================================

-- Crear master_cash inicial (tabla legacy con un solo balance)
INSERT INTO master_cash (
    id,
    balance
) VALUES (
    gen_random_uuid(),
    0
)
ON CONFLICT DO NOTHING;

-- Crear admin_cash inicial (tabla legacy con un solo balance)
INSERT INTO admin_cash (
    id,
    balance,
    total_collected
) VALUES (
    gen_random_uuid(),
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
END $$;
