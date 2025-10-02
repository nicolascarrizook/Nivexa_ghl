-- Migration: Add payment frequency fields to project_contractors
-- Description: Adds payment_frequency and payment_interval_days fields to track periodic payments
-- Author: System
-- Date: 2024-01-29

-- Add payment frequency field
ALTER TABLE project_contractors
ADD COLUMN IF NOT EXISTS payment_frequency TEXT DEFAULT 'monthly' CHECK (payment_frequency IN ('weekly', 'biweekly', 'monthly', 'custom'));

-- Add payment interval days field
ALTER TABLE project_contractors
ADD COLUMN IF NOT EXISTS payment_interval_days INTEGER DEFAULT 30 CHECK (payment_interval_days > 0);

-- Add estimated_end_date field if not exists
ALTER TABLE project_contractors
ADD COLUMN IF NOT EXISTS estimated_end_date DATE;

-- Add comment to explain fields
COMMENT ON COLUMN project_contractors.payment_frequency IS 'Frequency of payments: weekly (7 days), biweekly (15 days), monthly (30 days), or custom interval';
COMMENT ON COLUMN project_contractors.payment_interval_days IS 'Number of days between payments. Auto-set based on payment_frequency or custom value';
COMMENT ON COLUMN project_contractors.estimated_end_date IS 'Estimated completion date for the contractor work';