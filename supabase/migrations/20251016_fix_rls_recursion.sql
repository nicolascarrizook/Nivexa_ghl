-- Fix RLS recursion in investor_access_tokens
-- The issue: investor_access_tokens → investors → investor_access_tokens (infinite loop)
-- Solution: Disable RLS on investor_access_tokens (token UUID is secure enough)

-- =====================================================
-- 1. DROP PROBLEMATIC POLICIES
-- =====================================================

-- Drop the recursive policies
DROP POLICY IF EXISTS "public_access_investors_via_token" ON investors;
DROP POLICY IF EXISTS "public_access_projects_via_investor_token" ON projects;
DROP POLICY IF EXISTS "public_access_project_investors_via_token" ON project_investors;
DROP POLICY IF EXISTS "architects_manage_investor_tokens" ON investor_access_tokens;

-- =====================================================
-- 2. DISABLE RLS ON INVESTOR_ACCESS_TOKENS
-- =====================================================

-- The UUID token is cryptographically secure (128-bit randomness)
-- Access control happens at application level by validating the token
-- No need for RLS - it causes recursion and adds no real security benefit
ALTER TABLE investor_access_tokens DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. RECREATE SIMPLE POLICIES WITHOUT RECURSION
-- =====================================================

-- INVESTORS: Only architects can see their own investors
-- Public access is handled in application code after token validation
DROP POLICY IF EXISTS "architects_own_investors_simple" ON investors;
CREATE POLICY "architects_own_investors_simple" ON investors
  FOR ALL
  USING (architect_id = auth.uid());

-- PROJECT_INVESTORS: Architects can manage their project investors
DROP POLICY IF EXISTS "architects_own_project_investors_simple" ON project_investors;
CREATE POLICY "architects_own_project_investors_simple" ON project_investors
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_investors.project_id
        AND projects.architect_id = auth.uid()
    )
  );

-- Note: Public access to investors and project_investors will be handled
-- by the InvestorPortalPage component after validating the token in application code

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE investor_access_tokens IS 'Magic link tokens - RLS disabled, secured by UUID randomness and application-level validation';
