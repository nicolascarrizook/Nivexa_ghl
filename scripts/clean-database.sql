-- =====================================================
-- Script de Limpieza Total de Base de Datos
-- =====================================================
-- ADVERTENCIA: Este script elimina TODOS los datos
-- =====================================================

-- Eliminar todos los registros en el orden correcto
-- (respetando foreign keys)

DELETE FROM contractor_payments;
DELETE FROM contractor_budgets;
DELETE FROM project_contractors;
DELETE FROM cash_movements;
DELETE FROM payments;
DELETE FROM installments;
DELETE FROM project_cash_box;
DELETE FROM projects;
DELETE FROM providers;
DELETE FROM clients;

-- Reiniciar cajas especiales a $0
UPDATE master_cash
SET
  balance = 0,
  balance_ars = 0,
  balance_usd = 0,
  last_movement_at = NOW();

UPDATE admin_cash
SET
  balance = 0,
  balance_ars = 0,
  balance_usd = 0,
  total_collected = 0,
  last_collection_at = NULL;

-- Verificar que todo quedó limpio
SELECT 'contractor_payments' as tabla, COUNT(*) as registros FROM contractor_payments
UNION ALL
SELECT 'contractor_budgets', COUNT(*) FROM contractor_budgets
UNION ALL
SELECT 'project_contractors', COUNT(*) FROM project_contractors
UNION ALL
SELECT 'cash_movements', COUNT(*) FROM cash_movements
UNION ALL
SELECT 'installments', COUNT(*) FROM installments
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'project_cash_box', COUNT(*) FROM project_cash_box
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'providers', COUNT(*) FROM providers
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'master_cash', COUNT(*) FROM master_cash
UNION ALL
SELECT 'admin_cash', COUNT(*) FROM admin_cash;
