-- Add progress_percentage field to contractor_payments
-- Allows tracking progress percentage for each payment (optional)

ALTER TABLE contractor_payments
ADD COLUMN progress_percentage DECIMAL(5,2) NULL;

-- Add comment explaining the field
COMMENT ON COLUMN contractor_payments.progress_percentage IS
'Optional percentage of work completed at time of payment (e.g., 30.00 for 30%)';

-- Add check constraint to ensure valid percentage range
ALTER TABLE contractor_payments
ADD CONSTRAINT check_progress_percentage_range
CHECK (progress_percentage IS NULL OR (progress_percentage >= 0 AND progress_percentage <= 100));

-- Create index for querying by progress
CREATE INDEX idx_contractor_payments_progress
ON contractor_payments(progress_percentage)
WHERE progress_percentage IS NOT NULL;
