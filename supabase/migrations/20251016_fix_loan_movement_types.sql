-- Migration: Fix Loan Movement Types
-- Date: 2025-10-16
-- Description: Update movement_type for loans from 'adjustment' to 'loan_disbursement'

-- =====================================================
-- FIX HISTORICAL LOAN MOVEMENTS
-- =====================================================

-- Update movements that are loans but marked as 'adjustment'
-- Identify them by metadata->>'movement_type' = 'loan_disbursement'
UPDATE cash_movements
SET movement_type = 'loan_disbursement'
WHERE movement_type = 'adjustment'
  AND metadata->>'movement_type' = 'loan_disbursement';

-- Update loan payment movements
UPDATE cash_movements
SET movement_type = 'loan_payment'
WHERE movement_type = 'adjustment'
  AND metadata->>'movement_type' = 'loan_payment';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Show corrected movements
SELECT
  id,
  movement_type,
  description,
  amount,
  currency,
  metadata->>'loan_code' as loan_code,
  metadata->>'movement_type' as metadata_movement_type,
  created_at
FROM cash_movements
WHERE metadata->>'movement_type' IN ('loan_disbursement', 'loan_payment')
ORDER BY created_at DESC;

-- Count by type
SELECT
  movement_type,
  COUNT(*) as total,
  COUNT(DISTINCT metadata->>'loan_code') as unique_loans
FROM cash_movements
WHERE metadata->>'loan_code' IS NOT NULL
GROUP BY movement_type
ORDER BY movement_type;
