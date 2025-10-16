-- Migration: Investor System
-- Date: 2025-10-16
-- Description: Add support for multiple investors per project with magic link access

-- =====================================================
-- 1. CREATE INVESTORS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  architect_id UUID REFERENCES auth.users(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  tax_id VARCHAR(50),
  investor_type VARCHAR(50) DEFAULT 'individual' CHECK (investor_type IN ('individual', 'company')),
  address TEXT,
  city VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT investors_email_unique UNIQUE (email, architect_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_investors_architect_id ON investors(architect_id);
CREATE INDEX IF NOT EXISTS idx_investors_email ON investors(email) WHERE email IS NOT NULL;

COMMENT ON TABLE investors IS 'Investors who participate in projects with capital contributions';
COMMENT ON COLUMN investors.investor_type IS 'Type of investor: individual or company';

-- =====================================================
-- 2. CREATE PROJECT_INVESTORS TABLE (Junction Table)
-- =====================================================

CREATE TABLE IF NOT EXISTS project_investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  investor_id UUID REFERENCES investors(id) ON DELETE RESTRICT NOT NULL,

  -- Investment type and details
  investment_type VARCHAR(50) NOT NULL CHECK (investment_type IN (
    'cash_ars',
    'cash_usd',
    'materials',
    'land',
    'labor',
    'equipment',
    'other'
  )),

  -- Monetary investments
  investment_amount_ars NUMERIC(15,2) DEFAULT 0 CHECK (investment_amount_ars >= 0),
  investment_amount_usd NUMERIC(15,2) DEFAULT 0 CHECK (investment_amount_usd >= 0),

  -- Non-monetary investments
  investment_description TEXT,
  estimated_value_ars NUMERIC(15,2) DEFAULT 0 CHECK (estimated_value_ars >= 0),
  estimated_value_usd NUMERIC(15,2) DEFAULT 0 CHECK (estimated_value_usd >= 0),

  -- Participation percentage
  percentage_share NUMERIC(5,2) NOT NULL CHECK (percentage_share > 0 AND percentage_share <= 100),

  -- Metadata
  investment_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'removed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one investor per project (can have multiple investments, but combine them)
  CONSTRAINT project_investors_unique UNIQUE (project_id, investor_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_investors_project_id ON project_investors(project_id);
CREATE INDEX IF NOT EXISTS idx_project_investors_investor_id ON project_investors(investor_id);
CREATE INDEX IF NOT EXISTS idx_project_investors_status ON project_investors(status);

COMMENT ON TABLE project_investors IS 'Junction table linking projects to investors with investment details';
COMMENT ON COLUMN project_investors.investment_type IS 'Type of investment: cash_ars, cash_usd, materials, land, labor, equipment, other';
COMMENT ON COLUMN project_investors.percentage_share IS 'Percentage of capital participation in the project';
COMMENT ON COLUMN project_investors.status IS 'active or removed (soft delete for history)';

-- =====================================================
-- 3. CREATE INVESTOR_ACCESS_TOKENS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS investor_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE NOT NULL,
  token VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NULL,
  last_accessed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT investor_access_tokens_token_unique UNIQUE (token)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_investor_access_tokens_investor_id ON investor_access_tokens(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_access_tokens_token ON investor_access_tokens(token) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_investor_access_tokens_active ON investor_access_tokens(is_active, expires_at);

COMMENT ON TABLE investor_access_tokens IS 'Magic link tokens for investors to access their project dashboards';
COMMENT ON COLUMN investor_access_tokens.token IS 'Unique cryptographic token for magic link access';
COMMENT ON COLUMN investor_access_tokens.expires_at IS 'Token expiration date (NULL = never expires)';

-- =====================================================
-- 4. MODIFY PROJECTS TABLE
-- =====================================================

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS has_investors BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS project_financing_type VARCHAR(50) DEFAULT 'owner_financed'
  CHECK (project_financing_type IN ('owner_financed', 'investor_financed', 'mixed'));

-- Make client_id nullable for investor-only projects
ALTER TABLE projects ALTER COLUMN client_id DROP NOT NULL;

-- Add index
CREATE INDEX IF NOT EXISTS idx_projects_has_investors ON projects(has_investors) WHERE has_investors = TRUE;

COMMENT ON COLUMN projects.has_investors IS 'Whether this project has investors (not just a single client)';
COMMENT ON COLUMN projects.project_financing_type IS 'owner_financed (client only), investor_financed (investors only), mixed (both)';

-- =====================================================
-- 5. CREATE TRIGGER FOR PERCENTAGE VALIDATION
-- =====================================================

CREATE OR REPLACE FUNCTION validate_investor_percentages()
RETURNS TRIGGER AS $$
DECLARE
  total_percentage NUMERIC;
BEGIN
  -- Calculate total percentage for this project, excluding current record if updating
  SELECT COALESCE(SUM(percentage_share), 0)
  INTO total_percentage
  FROM project_investors
  WHERE project_id = NEW.project_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND status = 'active';

  -- Add new/updated percentage
  total_percentage := total_percentage + NEW.percentage_share;

  -- Validate total doesn't exceed 100%
  IF total_percentage > 100 THEN
    RAISE EXCEPTION 'La suma de porcentajes de participación no puede exceder 100%%. Total actual: %', total_percentage;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS validate_investor_percentages_trigger ON project_investors;

CREATE TRIGGER validate_investor_percentages_trigger
BEFORE INSERT OR UPDATE ON project_investors
FOR EACH ROW
WHEN (NEW.status = 'active')
EXECUTE FUNCTION validate_investor_percentages();

COMMENT ON FUNCTION validate_investor_percentages() IS 'Ensures total investor percentages per project do not exceed 100%';

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_access_tokens ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. CREATE RLS POLICIES
-- =====================================================

-- INVESTORS table policies

-- Architects can manage their own investors
DROP POLICY IF EXISTS "architects_own_investors" ON investors;
CREATE POLICY "architects_own_investors" ON investors
  FOR ALL
  USING (architect_id = auth.uid());

-- COMMENT: This allows architects to CRUD their own investors


-- PROJECT_INVESTORS table policies

-- Architects can manage project_investors for their projects
DROP POLICY IF EXISTS "architects_own_project_investors" ON project_investors;
CREATE POLICY "architects_own_project_investors" ON project_investors
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_investors.project_id
        AND projects.architect_id = auth.uid()
    )
  );

-- Public SELECT access for valid token holders (for investor portal)
DROP POLICY IF EXISTS "public_access_project_investors_via_token" ON project_investors;
CREATE POLICY "public_access_project_investors_via_token" ON project_investors
  FOR SELECT
  USING (
    -- Allow if there's a valid active token for this investor
    EXISTS (
      SELECT 1 FROM investor_access_tokens
      WHERE investor_access_tokens.investor_id = project_investors.investor_id
        AND investor_access_tokens.is_active = TRUE
        AND (investor_access_tokens.expires_at IS NULL
             OR investor_access_tokens.expires_at > NOW())
    )
  );

-- COMMENT: This allows investors to view their own project investments via magic link


-- INVESTORS table - public SELECT for token holders
DROP POLICY IF EXISTS "public_access_investors_via_token" ON investors;
CREATE POLICY "public_access_investors_via_token" ON investors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM investor_access_tokens
      WHERE investor_access_tokens.investor_id = investors.id
        AND investor_access_tokens.is_active = TRUE
        AND (investor_access_tokens.expires_at IS NULL
             OR investor_access_tokens.expires_at > NOW())
    )
  );

-- COMMENT: Allows investors to read their own data via magic link


-- PROJECTS table - allow public SELECT for projects with valid investor tokens
-- Note: projects table already has RLS enabled, we just add a new policy
DROP POLICY IF EXISTS "public_access_projects_via_investor_token" ON projects;
CREATE POLICY "public_access_projects_via_investor_token" ON projects
  FOR SELECT
  USING (
    -- Allow if user is an investor with valid token in this project
    EXISTS (
      SELECT 1 FROM project_investors pi
      JOIN investor_access_tokens iat ON iat.investor_id = pi.investor_id
      WHERE pi.project_id = projects.id
        AND iat.is_active = TRUE
        AND (iat.expires_at IS NULL OR iat.expires_at > NOW())
    )
  );

-- COMMENT: Allows investors to view projects they're invested in via magic link


-- INVESTOR_ACCESS_TOKENS table policies

-- Architects can manage tokens for their investors
DROP POLICY IF EXISTS "architects_manage_investor_tokens" ON investor_access_tokens;
CREATE POLICY "architects_manage_investor_tokens" ON investor_access_tokens
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM investors
      WHERE investors.id = investor_access_tokens.investor_id
        AND investors.architect_id = auth.uid()
    )
  );

-- Public can SELECT tokens for validation (but not see the token value, only validate)
-- This is handled in application logic, not RLS

-- COMMENT: Architects manage tokens for their investors


-- =====================================================
-- 8. UPDATE CASH_MOVEMENTS FOR INVESTOR CONTRIBUTIONS
-- =====================================================

-- Add comment to document new source_type
COMMENT ON COLUMN cash_movements.source_type IS 'Type of source: project_cash_box, master_cash, admin_cash, contractor_payment, investor_contribution';

-- No structural changes needed - cash_movements already supports flexible source/destination types
-- Just document that investor_contribution is a valid source_type

-- =====================================================
-- 9. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get total invested amount in a project
CREATE OR REPLACE FUNCTION get_project_total_invested(project_uuid UUID)
RETURNS TABLE(
  total_ars NUMERIC,
  total_usd NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(
      CASE
        WHEN investment_type IN ('cash_ars', 'materials', 'land', 'labor', 'equipment', 'other')
        THEN COALESCE(investment_amount_ars, 0) + COALESCE(estimated_value_ars, 0)
        ELSE 0
      END
    ), 0) as total_ars,
    COALESCE(SUM(
      CASE
        WHEN investment_type = 'cash_usd'
        THEN COALESCE(investment_amount_usd, 0) + COALESCE(estimated_value_usd, 0)
        ELSE 0
      END
    ), 0) as total_usd
  FROM project_investors
  WHERE project_id = project_uuid
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_project_total_invested IS 'Calculate total invested amount (cash + estimated value) in ARS and USD for a project';

-- Function to get remaining percentage available for a project
CREATE OR REPLACE FUNCTION get_project_remaining_percentage(project_uuid UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_percentage NUMERIC;
BEGIN
  SELECT COALESCE(SUM(percentage_share), 0)
  INTO total_percentage
  FROM project_investors
  WHERE project_id = project_uuid
    AND status = 'active';

  RETURN 100 - total_percentage;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_project_remaining_percentage IS 'Calculate remaining percentage available for new investors in a project';

-- =====================================================
-- 10. CREATE UPDATED_AT TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_investors_updated_at ON investors;
CREATE TRIGGER update_investors_updated_at
  BEFORE UPDATE ON investors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_investors_updated_at ON project_investors;
CREATE TRIGGER update_project_investors_updated_at
  BEFORE UPDATE ON project_investors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary of changes:
-- ✅ Created investors table with email uniqueness per architect
-- ✅ Created project_investors junction table with investment details
-- ✅ Created investor_access_tokens for magic link authentication
-- ✅ Modified projects table to support investors (has_investors, financing_type)
-- ✅ Made projects.client_id nullable for investor-only projects
-- ✅ Created trigger to validate investor percentages don't exceed 100%
-- ✅ Enabled RLS on all new tables
-- ✅ Created RLS policies for architects and public (token) access
-- ✅ Added helper functions for calculations
-- ✅ Created updated_at triggers

-- Next steps:
-- 1. Generate TypeScript types: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
-- 2. Create services: InvestorService, ProjectInvestorService, InvestorAccessService
-- 3. Create React Query hooks
-- 4. Build UI components
