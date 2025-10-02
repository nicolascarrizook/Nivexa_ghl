-- Migration to add missing fields and tables
-- Date: 2024-01-30

-- 1. Add currency field to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'ARS' 
CHECK (currency IN ('ARS', 'USD'));

-- 2. Add project-specific admin fee configuration
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS admin_fee_percentage DECIMAL(5,2);

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS admin_fee_type VARCHAR(20) 
CHECK (admin_fee_type IN ('percentage', 'fixed', 'manual', 'none')) 
DEFAULT 'manual';

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS admin_fee_amount DECIMAL(15,2) DEFAULT 0;

-- 3. Create administrator_fees table for tracking fees per project
CREATE TABLE IF NOT EXISTS administrator_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    fee_percentage DECIMAL(5,2),
    fee_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ARS' CHECK (currency IN ('ARS', 'USD')),
    status VARCHAR(20) CHECK (status IN ('pending', 'collected', 'cancelled')) DEFAULT 'pending',
    collected_at TIMESTAMPTZ,
    collected_amount DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id)
);

-- 4. Add index for performance
CREATE INDEX IF NOT EXISTS idx_administrator_fees_project ON administrator_fees(project_id);
CREATE INDEX IF NOT EXISTS idx_administrator_fees_status ON administrator_fees(status);

-- 5. Update existing projects to have default currency
UPDATE projects SET currency = 'ARS' WHERE currency IS NULL;