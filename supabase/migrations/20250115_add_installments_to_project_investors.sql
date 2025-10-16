-- Add installment fields to project_investors table
-- This allows investors to pay their cash contributions in installments

ALTER TABLE public.project_investors
ADD COLUMN IF NOT EXISTS installment_count integer DEFAULT 1 CHECK (installment_count >= 1),
ADD COLUMN IF NOT EXISTS payment_frequency text CHECK (payment_frequency IN ('monthly', 'biweekly', 'weekly', 'quarterly')),
ADD COLUMN IF NOT EXISTS first_payment_date date;

-- Add comments
COMMENT ON COLUMN public.project_investors.installment_count IS 'Number of installments for cash investments (1 = single payment)';
COMMENT ON COLUMN public.project_investors.payment_frequency IS 'Frequency of installment payments: monthly, biweekly, weekly, or quarterly';
COMMENT ON COLUMN public.project_investors.first_payment_date IS 'Date of the first installment payment';

-- These fields only apply to cash_ars and cash_usd investment types
-- For other investment types (materials, land, labor, equipment, other), these fields should be NULL
