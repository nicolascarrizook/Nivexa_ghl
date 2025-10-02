-- ===============================================
-- ADD MASTER FEE PERCENTAGE TO PROJECTS
-- ===============================================
-- This migration adds a configurable percentage field
-- to determine how much of project payments go to master cash
-- vs project cash
-- ===============================================

-- Add master_fee_percentage column to projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS master_fee_percentage DECIMAL(5,2) DEFAULT 20.00;

-- Add comment explaining the field
COMMENT ON COLUMN projects.master_fee_percentage IS 'Percentage of project payments that go to master cash as administrative fees (0-100)';

-- Add constraint to ensure percentage is between 0 and 100
ALTER TABLE projects
ADD CONSTRAINT check_master_fee_percentage
CHECK (master_fee_percentage >= 0 AND master_fee_percentage <= 100);
