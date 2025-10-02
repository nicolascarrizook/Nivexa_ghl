-- Migration: Add performance indexes for dashboard queries
-- Description: Creates indexes to optimize dashboard data loading

-- Index for cash_movements queries filtered by date
CREATE INDEX IF NOT EXISTS idx_cash_movements_created_at
ON cash_movements(created_at DESC);

-- Index for cash_movements queries filtered by movement_type
CREATE INDEX IF NOT EXISTS idx_cash_movements_movement_type
ON cash_movements(movement_type);

-- Composite index for cash_movements date range + amount filters
CREATE INDEX IF NOT EXISTS idx_cash_movements_date_amount
ON cash_movements(created_at DESC, amount);

-- Index for projects queries filtered by status
CREATE INDEX IF NOT EXISTS idx_projects_status
ON projects(status);

-- Index for projects queries filtered by created_at
CREATE INDEX IF NOT EXISTS idx_projects_created_at
ON projects(created_at DESC);

-- Composite index for projects status + total_amount (for top projects)
CREATE INDEX IF NOT EXISTS idx_projects_status_amount
ON projects(status, total_amount DESC);

-- Index for installments queries filtered by status
CREATE INDEX IF NOT EXISTS idx_installments_status
ON installments(status);

-- Index for installments queries filtered by project_id (should exist from FK, but ensuring)
CREATE INDEX IF NOT EXISTS idx_installments_project_id
ON installments(project_id);

-- Composite index for installments project_id + paid_amount
CREATE INDEX IF NOT EXISTS idx_installments_project_paid
ON installments(project_id, paid_amount);

-- Index for currency_conversions queries filtered by created_at
CREATE INDEX IF NOT EXISTS idx_currency_conversions_created_at
ON currency_conversions(created_at DESC);

-- Analyze tables to update statistics for query planner
ANALYZE cash_movements;
ANALYZE projects;
ANALYZE installments;
ANALYZE currency_conversions;