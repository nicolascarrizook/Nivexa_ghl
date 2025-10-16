-- =====================================================
-- LIMPIEZA COMPLETA DE BASE DE DATOS
-- =====================================================
-- Este script elimina TODOS los datos transaccionales
-- pero mantiene la estructura de tablas y configuración básica
-- =====================================================

DO $$
BEGIN
  -- ============================================
  -- PASO 1: Desactivar triggers temporalmente
  -- ============================================
  EXECUTE 'SET session_replication_role = ''replica''';

  -- ============================================
  -- PASO 2: Eliminar datos transaccionales en orden
  -- ============================================

  -- Eliminar contractor payments (depende de project_contractors y movements)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contractor_payments') THEN
    DELETE FROM contractor_payments;
    RAISE NOTICE '✅ contractor_payments limpiado';
  END IF;

  -- Eliminar cash movements
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cash_movements') THEN
    DELETE FROM cash_movements;
    RAISE NOTICE '✅ cash_movements limpiado';
  END IF;

  -- Eliminar payments (depende de installments)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
    DELETE FROM payments;
    RAISE NOTICE '✅ payments limpiado';
  END IF;

  -- Eliminar installments (depende de projects)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'installments') THEN
    DELETE FROM installments;
    RAISE NOTICE '✅ installments limpiado';
  END IF;

  -- Eliminar project contractors (depende de projects y providers)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_contractors') THEN
    DELETE FROM project_contractors;
    RAISE NOTICE '✅ project_contractors limpiado';
  END IF;

  -- Eliminar project cash boxes (depende de projects)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_cash_box') THEN
    DELETE FROM project_cash_box;
    RAISE NOTICE '✅ project_cash_box limpiado';
  END IF;

  -- Eliminar projects (depende de clients)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'projects') THEN
    DELETE FROM projects;
    RAISE NOTICE '✅ projects limpiado';
  END IF;

  -- Eliminar providers (proveedores/contractors)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'providers') THEN
    DELETE FROM providers;
    RAISE NOTICE '✅ providers limpiado';
  END IF;

  -- Eliminar clients
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
    DELETE FROM clients;
    RAISE NOTICE '✅ clients limpiado';
  END IF;

  -- ============================================
  -- PASO 3: Resetear cajas a balance 0
  -- ============================================

  -- Resetear master_cash
  UPDATE master_cash SET
    balance = 0,
    balance_ars = 0,
    balance_usd = 0,
    last_movement_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP;
  RAISE NOTICE '✅ master_cash reseteado a 0';

  -- Resetear admin_cash
  UPDATE admin_cash SET
    balance = 0,
    balance_ars = 0,
    balance_usd = 0,
    total_collected = 0,
    last_movement_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP;
  RAISE NOTICE '✅ admin_cash reseteado a 0';

  -- Resetear master_cash_box si existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'master_cash_box') THEN
    UPDATE master_cash_box SET
      current_balance_ars = 0,
      current_balance_usd = 0,
      total_income_ars = 0,
      total_income_usd = 0,
      total_expenses_ars = 0,
      total_expenses_usd = 0,
      updated_at = CURRENT_TIMESTAMP;
    RAISE NOTICE '✅ master_cash_box reseteado a 0';
  END IF;

  -- ============================================
  -- PASO 4: Reactivar triggers
  -- ============================================
  EXECUTE 'SET session_replication_role = ''origin''';
END $$;

-- ============================================
-- PASO 5: Verificación final
-- ============================================

DO $$
DECLARE
  v_clients_count INTEGER := 0;
  v_providers_count INTEGER := 0;
  v_projects_count INTEGER := 0;
  v_installments_count INTEGER := 0;
  v_payments_count INTEGER := 0;
  v_movements_count INTEGER := 0;
  v_project_cash_count INTEGER := 0;
  v_contractor_payments_count INTEGER := 0;
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
    SELECT COUNT(*) INTO v_clients_count FROM clients;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'providers') THEN
    SELECT COUNT(*) INTO v_providers_count FROM providers;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'projects') THEN
    SELECT COUNT(*) INTO v_projects_count FROM projects;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'installments') THEN
    SELECT COUNT(*) INTO v_installments_count FROM installments;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
    SELECT COUNT(*) INTO v_payments_count FROM payments;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cash_movements') THEN
    SELECT COUNT(*) INTO v_movements_count FROM cash_movements;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'project_cash_box') THEN
    SELECT COUNT(*) INTO v_project_cash_count FROM project_cash_box;
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contractor_payments') THEN
    SELECT COUNT(*) INTO v_contractor_payments_count FROM contractor_payments;
  END IF;

  RAISE NOTICE '=== VERIFICACIÓN FINAL ===';
  RAISE NOTICE 'Clientes: %', v_clients_count;
  RAISE NOTICE 'Providers: %', v_providers_count;
  RAISE NOTICE 'Proyectos: %', v_projects_count;
  RAISE NOTICE 'Cuotas: %', v_installments_count;
  RAISE NOTICE 'Pagos: %', v_payments_count;
  RAISE NOTICE 'Movimientos de caja: %', v_movements_count;
  RAISE NOTICE 'Project cash boxes: %', v_project_cash_count;
  RAISE NOTICE 'Contractor payments: %', v_contractor_payments_count;

  IF v_clients_count + v_providers_count + v_projects_count +
     v_installments_count + v_payments_count + v_movements_count +
     v_project_cash_count + v_contractor_payments_count = 0 THEN
    RAISE NOTICE '✅ Base de datos limpiada exitosamente';
  ELSE
    RAISE WARNING '⚠️  Algunos registros permanecen en la base de datos';
  END IF;
END $$;

-- Mostrar estado de las cajas
SELECT
  'master_cash' as caja,
  balance,
  balance_ars,
  balance_usd
FROM master_cash;

SELECT
  'admin_cash' as caja,
  balance,
  balance_ars,
  balance_usd,
  total_collected
FROM admin_cash;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- ⚠️  ADVERTENCIA: Este script ELIMINA TODOS LOS DATOS
-- 1. Mantiene la estructura de tablas intacta
-- 2. Mantiene organizations, master_cash, admin_cash
-- 3. Resetea balances de cajas a 0
-- 4. Elimina TODOS los datos transaccionales
-- 5. NO se puede revertir - hacer backup antes de ejecutar
-- =====================================================
