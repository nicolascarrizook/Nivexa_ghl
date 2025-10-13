-- =====================================================
-- SCRIPT DE LIMPIEZA SEGURA DE BASE DE DATOS
-- =====================================================
-- Limpia toda la base de datos EXCEPTO:
-- - Usuarios (auth.users)
-- - Clientes (clients)
--
-- IMPORTANTE: Este script elimina TODOS los datos de proyectos,
-- cajas, movimientos, honorarios, cuotas, pagos, etc.
-- =====================================================

DO $$
BEGIN
    -- 1. Eliminar movimientos de caja
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cash_movements') THEN
        DELETE FROM cash_movements;
        RAISE NOTICE 'Eliminados registros de cash_movements';
    END IF;

    -- 2. Eliminar honorarios de administrador
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'administrator_fees') THEN
        DELETE FROM administrator_fees;
        RAISE NOTICE 'Eliminados registros de administrator_fees';
    END IF;

    -- 3. Eliminar pagos
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        DELETE FROM payments;
        RAISE NOTICE 'Eliminados registros de payments';
    END IF;

    -- 4. Eliminar cuotas
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'installments') THEN
        DELETE FROM installments;
        RAISE NOTICE 'Eliminados registros de installments';
    END IF;

    -- 5. Eliminar cajas de proyectos
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_cash') THEN
        DELETE FROM project_cash;
        RAISE NOTICE 'Eliminados registros de project_cash';
    END IF;

    -- 6. Eliminar préstamos inter-proyecto
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inter_project_loan_payments') THEN
        DELETE FROM inter_project_loan_payments;
        RAISE NOTICE 'Eliminados registros de inter_project_loan_payments';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inter_project_loan_installments') THEN
        DELETE FROM inter_project_loan_installments;
        RAISE NOTICE 'Eliminados registros de inter_project_loan_installments';
    END IF;

    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inter_project_loans') THEN
        DELETE FROM inter_project_loans;
        RAISE NOTICE 'Eliminados registros de inter_project_loans';
    END IF;

    -- 7. Eliminar transferencias bancarias
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bank_transfers') THEN
        DELETE FROM bank_transfers;
        RAISE NOTICE 'Eliminados registros de bank_transfers';
    END IF;

    -- 8. Eliminar todas las cuentas bancarias
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bank_accounts') THEN
        DELETE FROM bank_accounts;
        RAISE NOTICE 'Eliminadas todas las cuentas bancarias';
    END IF;

    -- 9. Eliminar proyectos
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'projects') THEN
        DELETE FROM projects;
        RAISE NOTICE 'Eliminados registros de projects';
    END IF;

    -- 10. Resetear Master Cash (solo campos que existen)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'master_cash') THEN
        -- Primero verificar qué campos existen
        IF EXISTS (SELECT FROM information_schema.columns
                   WHERE table_name = 'master_cash' AND column_name = 'balance_ars') THEN
            -- Tiene campos multi-moneda
            UPDATE master_cash
            SET
                balance = 0,
                balance_ars = 0,
                balance_usd = 0,
                last_movement_at = NULL,
                updated_at = NOW();
        ELSE
            -- Solo tiene balance simple
            UPDATE master_cash
            SET
                balance = 0,
                last_movement_at = NULL,
                updated_at = NOW();
        END IF;
        RAISE NOTICE 'Reseteada master_cash';
    END IF;

    -- 11. Resetear Admin Cash (solo campos que existen)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_cash') THEN
        IF EXISTS (SELECT FROM information_schema.columns
                   WHERE table_name = 'admin_cash' AND column_name = 'balance_ars') THEN
            -- Tiene campos multi-moneda
            UPDATE admin_cash
            SET
                balance = 0,
                balance_ars = 0,
                balance_usd = 0,
                total_collected = 0,
                last_movement_at = NULL,
                updated_at = NOW();
        ELSE
            -- Solo tiene balance simple
            UPDATE admin_cash
            SET
                balance = 0,
                total_collected = 0,
                last_movement_at = NULL,
                updated_at = NOW();
        END IF;
        RAISE NOTICE 'Reseteada admin_cash';
    END IF;

    RAISE NOTICE '✅ Limpieza completada exitosamente';
END $$;

-- Verificación: Mostrar conteo de registros restantes
SELECT
    'clients' as tabla,
    COUNT(*) as registros
FROM clients

UNION ALL

SELECT
    'projects' as tabla,
    COUNT(*) as registros
FROM projects

UNION ALL

SELECT
    'installments' as tabla,
    COUNT(*) as registros
FROM installments

UNION ALL

SELECT
    'payments' as tabla,
    COUNT(*) as registros
FROM payments

UNION ALL

SELECT
    'project_cash' as tabla,
    COUNT(*) as registros
FROM project_cash

UNION ALL

SELECT
    'cash_movements' as tabla,
    COUNT(*) as registros
FROM cash_movements

UNION ALL

SELECT
    'administrator_fees' as tabla,
    COUNT(*) as registros
FROM administrator_fees

UNION ALL

SELECT
    'master_cash (balance_ars)' as tabla,
    COALESCE(SUM(balance_ars), 0) as registros
FROM master_cash

UNION ALL

SELECT
    'master_cash (balance_usd)' as tabla,
    COALESCE(SUM(balance_usd), 0) as registros
FROM master_cash

UNION ALL

SELECT
    'admin_cash (balance_ars)' as tabla,
    COALESCE(SUM(balance_ars), 0) as registros
FROM admin_cash

UNION ALL

SELECT
    'admin_cash (balance_usd)' as tabla,
    COALESCE(SUM(balance_usd), 0) as registros
FROM admin_cash

ORDER BY tabla;

-- =====================================================
-- RESULTADO ESPERADO:
-- - clients: 1 (el cliente que creaste)
-- - projects: 0
-- - installments: 0
-- - payments: 0
-- - project_cash: 0
-- - cash_movements: 0
-- - administrator_fees: 0
-- - master_cash (balance_ars): 0
-- - master_cash (balance_usd): 0
-- - admin_cash (balance_ars): 0
-- - admin_cash (balance_usd): 0
-- =====================================================
