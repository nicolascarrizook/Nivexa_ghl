-- Add movement_id to contractor_payments table
-- This links provider payments to cash movements for traceability

-- Add the column
ALTER TABLE contractor_payments
ADD COLUMN movement_id UUID REFERENCES cash_movements(id);

-- Add index for better query performance
CREATE INDEX idx_contractor_payments_movement
ON contractor_payments(movement_id);

-- Add comment for documentation
COMMENT ON COLUMN contractor_payments.movement_id IS
'References the cash_movement that was created when this payment was marked as paid. Links provider payments to cash box transactions.';
