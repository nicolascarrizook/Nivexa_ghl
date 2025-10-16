-- Add movement_id to contractor_payments table
ALTER TABLE contractor_payments
ADD COLUMN movement_id UUID REFERENCES cash_movements(id);

-- Add index for better query performance
CREATE INDEX idx_contractor_payments_movement
ON contractor_payments(movement_id);
