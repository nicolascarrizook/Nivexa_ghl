-- Migration: Add currency_exchange to movement_type constraint
-- Description: Allows currency conversion movements in cash_movements table

-- Drop the existing constraint
ALTER TABLE cash_movements
DROP CONSTRAINT IF EXISTS cash_movements_movement_type_check;

-- Add the constraint with currency_exchange included
ALTER TABLE cash_movements
ADD CONSTRAINT cash_movements_movement_type_check
CHECK (movement_type = ANY (ARRAY[
  'project_income'::text,
  'master_income'::text,
  'master_duplication'::text,
  'fee_collection'::text,
  'expense'::text,
  'transfer'::text,
  'adjustment'::text,
  'down_payment'::text,
  'currency_exchange'::text
]));