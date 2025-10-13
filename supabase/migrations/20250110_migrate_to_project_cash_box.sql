-- =====================================================
-- MIGRACIÓN: project_cash → project_cash_box
-- =====================================================
-- Consolida el uso de project_cash_box (con multi-moneda)
-- y depreca project_cash (sin multi-moneda)
-- =====================================================

BEGIN;

-- 1. Migrar datos existentes de project_cash a project_cash_box
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
    pc.balance as current_balance_ars,  -- Asumimos que los balances viejos están en ARS
    0 as current_balance_usd,
    pc.total_received as total_income_ars,
    0 as total_income_usd,
    pc.created_at,
    pc.updated_at
FROM project_cash pc
LEFT JOIN project_cash_box pcb ON pc.project_id = pcb.project_id
WHERE pcb.id IS NULL;  -- Solo insertar si no existe ya en project_cash_box

-- 2. Actualizar balances de project_cash_box para proyectos que ya existen
-- (en caso de que haya discrepancias)
UPDATE project_cash_box pcb
SET
    current_balance_ars = COALESCE(pc.balance, pcb.current_balance_ars),
    total_income_ars = COALESCE(pc.total_received, pcb.total_income_ars),
    updated_at = NOW()
FROM project_cash pc
WHERE pcb.project_id = pc.project_id
  AND (
    pcb.current_balance_ars != pc.balance
    OR pcb.total_income_ars != pc.total_received
  );

-- 3. Verificación: Mostrar proyectos sin caja
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
        INSERT INTO project_cash_box (project_id, current_balance_ars, current_balance_usd)
        SELECT p.id, 0, 0
        FROM projects p
        LEFT JOIN project_cash_box pcb ON p.id = pcb.project_id
        WHERE pcb.id IS NULL;

        RAISE NOTICE '✅ Cajas creadas para proyectos faltantes';
    ELSE
        RAISE NOTICE '✅ Todos los proyectos tienen caja';
    END IF;
END $$;

-- 4. Comentar tabla project_cash para indicar que está deprecada
COMMENT ON TABLE project_cash IS 'DEPRECATED: Use project_cash_box instead. This table will be removed in a future migration.';

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

ORDER BY tipo;
