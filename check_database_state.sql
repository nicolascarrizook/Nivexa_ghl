-- Script para verificar el estado actual de la base de datos
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar qué tablas existen
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'projects',
    'project_cash',
    'project_cash_box',
    'master_cash_box',
    'admin_cash',
    'cash_movements',
    'clients',
    'installments',
    'payments',
    'project_contractors',
    'contractor_payments',
    'project_investors',
    'investor_contributions',
    'administrator_fees',
    'fee_collections'
  )
ORDER BY table_name;

-- 2. Si project_cash_box no existe pero project_cash sí, necesitas la migración
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_cash_box')
    THEN '✅ project_cash_box existe'
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_cash')
    THEN '⚠️ Solo existe project_cash - NECESITAS EJECUTAR: 20250110_create_and_migrate_project_cash_box.sql'
    ELSE '❌ Ni project_cash ni project_cash_box existen - PROBLEMA GRAVE'
  END as estado_project_cash;

-- 3. Verificar estructura de master_cash_box (debe tener multi-currency)
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'master_cash_box'
ORDER BY ordinal_position;

-- 4. Verificar estructura de admin_cash (debe tener multi-currency)
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'admin_cash'
ORDER BY ordinal_position;
