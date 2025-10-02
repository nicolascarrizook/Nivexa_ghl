-- Migration: Create contractor financial summary view
-- Description: Creates a view that calculates financial summaries for project contractors
-- Author: System
-- Date: 2025-01-29

-- Drop view if exists
DROP VIEW IF EXISTS contractor_financial_summary;

-- Create contractor financial summary view
CREATE OR REPLACE VIEW contractor_financial_summary AS
SELECT
  pc.id AS project_contractor_id,
  pc.project_id,
  pc.contractor_id,
  pc.budget_amount,
  COALESCE(SUM(CASE WHEN cp.status = 'paid' THEN cp.amount ELSE 0 END), 0) AS total_paid,
  COALESCE(SUM(CASE WHEN cp.status = 'pending' THEN cp.amount ELSE 0 END), 0) AS total_pending,
  pc.budget_amount - COALESCE(SUM(CASE WHEN cp.status = 'paid' THEN cp.amount ELSE 0 END), 0) AS balance_due,
  CASE 
    WHEN pc.budget_amount > 0 THEN 
      (COALESCE(SUM(CASE WHEN cp.status = 'paid' THEN cp.amount ELSE 0 END), 0) / pc.budget_amount * 100)
    ELSE 0 
  END AS payment_progress_percentage,
  COUNT(cp.id) AS total_payments,
  COUNT(CASE WHEN cp.status = 'overdue' THEN 1 END) AS overdue_payments,
  MIN(CASE WHEN cp.status = 'pending' AND cp.due_date IS NOT NULL THEN cp.due_date END) AS next_payment_due_date,
  MIN(CASE WHEN cp.status = 'pending' THEN cp.amount END) AS next_payment_amount
FROM
  project_contractors pc
  LEFT JOIN contractor_payments cp ON pc.id = cp.project_contractor_id
GROUP BY
  pc.id, pc.project_id, pc.contractor_id, pc.budget_amount;

-- Add comment
COMMENT ON VIEW contractor_financial_summary IS 'Financial summary view for project contractors including payment progress';
