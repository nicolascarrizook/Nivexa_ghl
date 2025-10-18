-- =====================================================
-- Script de Diagnóstico - Validación de Fondos
-- =====================================================
-- Este script verifica que el sistema de pagos a contractors
-- valide correctamente los fondos disponibles antes de permitir pagos
-- =====================================================

-- 1. Verificar estructura de tablas de cajas
SELECT
  'project_cash_box' as tabla,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'project_cash_box'
  AND column_name IN ('current_balance_ars', 'current_balance_usd', 'project_id')
ORDER BY ordinal_position;

-- 2. Ver estado actual de cajas de proyectos (primeros 5)
SELECT
  pcb.id,
  p.name as proyecto,
  p.code as codigo_proyecto,
  pcb.current_balance_ars as balance_ars,
  pcb.current_balance_usd as balance_usd,
  pcb.total_income_ars as ingreso_total_ars,
  pcb.total_income_usd as ingreso_total_usd,
  pcb.total_expenses_ars as gasto_total_ars,
  pcb.total_expenses_usd as gasto_total_usd
FROM project_cash_box pcb
JOIN projects p ON p.id = pcb.project_id
WHERE pcb.is_active = true
LIMIT 5;

-- 3. Verificar pagos pendientes a contractors con moneda
SELECT
  cp.id,
  p.name as proyecto,
  p.code as codigo_proyecto,
  prov.name as proveedor,
  cp.amount as monto,
  cp.currency as moneda,
  cp.status as estado,
  pcb.current_balance_ars as balance_ars_disponible,
  pcb.current_balance_usd as balance_usd_disponible,
  CASE
    WHEN cp.currency = 'ARS' AND pcb.current_balance_ars >= cp.amount THEN '✅ Fondos suficientes'
    WHEN cp.currency = 'USD' AND pcb.current_balance_usd >= cp.amount THEN '✅ Fondos suficientes'
    WHEN cp.currency = 'ARS' AND pcb.current_balance_ars < cp.amount THEN '❌ Fondos insuficientes en ARS'
    WHEN cp.currency = 'USD' AND pcb.current_balance_usd < cp.amount THEN '❌ Fondos insuficientes en USD'
    ELSE '⚠️ Error de validación'
  END as validacion_fondos
FROM contractor_payments cp
JOIN project_contractors pc ON pc.id = cp.project_contractor_id
JOIN projects p ON p.id = pc.project_id
JOIN providers prov ON prov.id = pc.contractor_id
JOIN project_cash_box pcb ON pcb.project_id = p.id
WHERE cp.status = 'pending'
ORDER BY p.name, prov.name;

-- 4. Identificar pagos pendientes que NO DEBERÍAN poder pagarse (fondos insuficientes)
SELECT
  cp.id as payment_id,
  p.name as proyecto,
  prov.name as proveedor,
  cp.amount as monto_a_pagar,
  cp.currency as moneda_pago,
  pcb.current_balance_ars as balance_ars,
  pcb.current_balance_usd as balance_usd,
  CASE
    WHEN cp.currency = 'ARS' THEN cp.amount - pcb.current_balance_ars
    WHEN cp.currency = 'USD' THEN cp.amount - pcb.current_balance_usd
  END as deficit
FROM contractor_payments cp
JOIN project_contractors pc ON pc.id = cp.project_contractor_id
JOIN projects p ON p.id = pc.project_id
JOIN providers prov ON prov.id = pc.contractor_id
JOIN project_cash_box pcb ON pcb.project_id = p.id
WHERE cp.status = 'pending'
  AND (
    (cp.currency = 'ARS' AND pcb.current_balance_ars < cp.amount) OR
    (cp.currency = 'USD' AND pcb.current_balance_usd < cp.amount)
  )
ORDER BY deficit DESC;

-- 5. Verificar movimientos de caja recientes relacionados con contractor_payments
SELECT
  cm.id,
  cm.movement_type,
  cm.amount,
  cm.currency,
  cm.description,
  cm.created_at,
  cp.id as payment_id,
  cp.status as payment_status
FROM cash_movements cm
LEFT JOIN contractor_payments cp ON cp.movement_id = cm.id
WHERE cm.movement_type = 'project_expense'
  AND cm.created_at > NOW() - INTERVAL '7 days'
ORDER BY cm.created_at DESC
LIMIT 10;

-- 6. CASO DE PRUEBA: Simulación de escenario problemático
-- Encuentra proyectos con balance cero pero con pagos pendientes
SELECT
  'CASO CRÍTICO' as tipo,
  p.name as proyecto,
  COUNT(cp.id) as pagos_pendientes,
  SUM(cp.amount) as total_a_pagar,
  pcb.current_balance_ars as balance_ars,
  pcb.current_balance_usd as balance_usd,
  '⚠️ RIESGO: Pagos pendientes sin fondos' as alerta
FROM projects p
JOIN project_cash_box pcb ON pcb.project_id = p.id
JOIN project_contractors pc ON pc.project_id = p.id
JOIN contractor_payments cp ON cp.project_contractor_id = pc.id
WHERE cp.status = 'pending'
  AND pcb.current_balance_ars = 0
  AND pcb.current_balance_usd = 0
GROUP BY p.id, p.name, pcb.current_balance_ars, pcb.current_balance_usd;
