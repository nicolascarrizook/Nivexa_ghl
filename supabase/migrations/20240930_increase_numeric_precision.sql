-- Increase numeric precision for contractor budget and payment fields
-- From DECIMAL(12,2) to DECIMAL(15,2) to support larger amounts

ALTER TABLE contractor_budgets
    ALTER COLUMN unit_price TYPE DECIMAL(15,2),
    ALTER COLUMN total_amount TYPE DECIMAL(15,2);

ALTER TABLE contractor_payments
    ALTER COLUMN amount TYPE DECIMAL(15,2);

ALTER TABLE project_contractors
    ALTER COLUMN budget_amount TYPE DECIMAL(15,2);