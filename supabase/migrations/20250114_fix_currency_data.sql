-- =====================================================
-- FIX CURRENCY DATA
-- Corrige la moneda de proyectos que son en USD
-- =====================================================
-- Este script actualiza los datos existentes que fueron
-- marcados como ARS por defecto cuando se agregó la columna
-- =====================================================

-- PASO 1: Identificar proyectos en USD
-- Ejecuta esta query primero para ver qué proyectos actualizar
SELECT
  id,
  name,
  code,
  total_amount,
  currency as project_currency
FROM projects
WHERE currency = 'USD' OR name LIKE '%bunker%';

-- =====================================================
-- PASO 2: Actualizar Casa bunker a USD
-- =====================================================

-- Actualizar proyecto Casa bunker a USD
UPDATE projects
SET currency = 'USD'
WHERE name ILIKE '%bunker%';

-- Actualizar todas las cuotas del proyecto Casa bunker a USD
UPDATE installments
SET currency = 'USD'
WHERE project_id IN (
  SELECT id FROM projects WHERE name ILIKE '%bunker%'
);

-- Actualizar todos los pagos relacionados con Casa bunker a USD
UPDATE payments
SET currency = 'USD'
WHERE installment_id IN (
  SELECT id FROM installments
  WHERE project_id IN (
    SELECT id FROM projects WHERE name ILIKE '%bunker%'
  )
);

-- =====================================================
-- PASO 3: Actualizar TODOS los proyectos que son USD
-- =====================================================
-- Solo ejecutar si TODOS los proyectos son en USD
-- COMENTADO por seguridad - descomentar si es necesario

-- UPDATE installments
-- SET currency = 'USD'
-- WHERE project_id IN (
--   SELECT id FROM projects WHERE currency = 'USD'
-- );

-- UPDATE payments
-- SET currency = 'USD'
-- WHERE installment_id IN (
--   SELECT id FROM installments
--   WHERE project_id IN (
--     SELECT id FROM projects WHERE currency = 'USD'
--   )
-- );

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar Casa bunker
SELECT
  'Casa bunker - Project' as tabla,
  currency,
  COUNT(*) as registros
FROM projects
WHERE name ILIKE '%bunker%'
GROUP BY currency

UNION ALL

SELECT
  'Casa bunker - Installments' as tabla,
  currency,
  COUNT(*) as registros
FROM installments
WHERE project_id IN (SELECT id FROM projects WHERE name ILIKE '%bunker%')
GROUP BY currency

UNION ALL

SELECT
  'Casa bunker - Payments' as tabla,
  currency,
  COUNT(*) as registros
FROM payments
WHERE installment_id IN (
  SELECT id FROM installments
  WHERE project_id IN (SELECT id FROM projects WHERE name ILIKE '%bunker%')
)
GROUP BY currency;

-- Ver resumen de todos los proyectos
SELECT
  p.name,
  p.code,
  p.currency as project_currency,
  COUNT(DISTINCT i.id) as total_installments,
  COUNT(DISTINCT CASE WHEN i.currency = 'USD' THEN i.id END) as installments_usd,
  COUNT(DISTINCT CASE WHEN i.currency = 'ARS' THEN i.id END) as installments_ars,
  COUNT(DISTINCT pay.id) as total_payments,
  COUNT(DISTINCT CASE WHEN pay.currency = 'USD' THEN pay.id END) as payments_usd,
  COUNT(DISTINCT CASE WHEN pay.currency = 'ARS' THEN pay.id END) as payments_ars
FROM projects p
LEFT JOIN installments i ON i.project_id = p.id
LEFT JOIN payments pay ON pay.installment_id = i.id
GROUP BY p.id, p.name, p.code, p.currency
ORDER BY p.name;
