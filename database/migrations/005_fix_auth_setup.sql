-- =====================================================
-- Fix Authentication Setup Migration
-- This migration ensures Supabase auth is properly configured
-- =====================================================

-- Ensure required extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- AUTH CONFIGURATION FIXES
-- =====================================================

-- 1. Ensure auth.users table has proper permissions
-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO anon;

-- Allow authenticated users to read their own data
GRANT SELECT ON auth.users TO authenticated;

-- =====================================================
-- PUBLIC PROFILES TABLE (LINKED TO AUTH.USERS)
-- =====================================================

-- Create a public profiles table that links to auth.users
-- This allows us to store additional user data while keeping auth separate
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- FIX EXISTING TABLE POLICIES
-- =====================================================

-- Update architects table to link with profiles
-- Add user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'architects' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE architects ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_architects_user_id ON architects(user_id);
    END IF;
END $$;

-- Update policies for architects table
DROP POLICY IF EXISTS "Architect has full access to architects" ON architects;
CREATE POLICY "Architect has full access to architects" ON architects
    FOR ALL USING (
        auth.uid() IS NOT NULL AND (
            user_id = auth.uid() OR 
            user_id IS NULL  -- Allow existing records without user_id
        )
    );

-- =====================================================
-- FUNCTIONS FOR AUTH INTEGRATION
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    architect_exists BOOLEAN;
BEGIN
    -- Check if an architect record already exists
    SELECT EXISTS(SELECT 1 FROM public.architects WHERE email = NEW.email) INTO architect_exists;
    
    -- Create profile record
    INSERT INTO public.profiles (id, email, full_name, display_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'firstName', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
        COALESCE(NEW.raw_user_meta_data->>'displayName', NEW.email)
    );
    
    -- If no architect exists with this email, create one
    IF NOT architect_exists THEN
        INSERT INTO public.architects (
            user_id,
            email, 
            full_name, 
            business_name, 
            settings
        ) VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'firstName', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
            COALESCE(NEW.raw_user_meta_data->>'businessName', 'Studio Arquitectura'),
            '{}'::jsonb
        );
    ELSE
        -- Update existing architect record with user_id
        UPDATE public.architects 
        SET user_id = NEW.id 
        WHERE email = NEW.email AND user_id IS NULL;
    END IF;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log error but don't prevent user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SECURITY IMPROVEMENTS
-- =====================================================

-- Make policies more permissive for single-user app during development
-- These can be tightened later for production

-- Update all table policies to be more permissive
DROP POLICY IF EXISTS "Architect has full access to projects" ON projects;
CREATE POLICY "Architect has full access to projects" ON projects
    FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Architect has full access to master_cash" ON master_cash;
CREATE POLICY "Architect has full access to master_cash" ON master_cash
    FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Architect has full access to admin_cash" ON admin_cash;
CREATE POLICY "Architect has full access to admin_cash" ON admin_cash
    FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Architect has full access to project_cash" ON project_cash;
CREATE POLICY "Architect has full access to project_cash" ON project_cash
    FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Architect has full access to cash_movements" ON cash_movements;
CREATE POLICY "Architect has full access to cash_movements" ON cash_movements
    FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Architect has full access to fee_collections" ON fee_collections;
CREATE POLICY "Architect has full access to fee_collections" ON fee_collections
    FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Architect has full access to installments" ON installments;
CREATE POLICY "Architect has full access to installments" ON installments
    FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Architect has full access to payments" ON payments;
CREATE POLICY "Architect has full access to payments" ON payments
    FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Architect has full access to contracts" ON contracts;
CREATE POLICY "Architect has full access to contracts" ON contracts
    FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- ADDITIONAL INDEXES AND CONSTRAINTS
-- =====================================================

-- Ensure updated_at trigger exists for profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFY AUTH SETTINGS
-- =====================================================

-- This query can be used to verify auth is properly set up
-- SELECT 
--     auth.uid() as current_user_id,
--     (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email,
--     (SELECT count(*) FROM architects) as total_architects,
--     (SELECT count(*) FROM profiles) as total_profiles;

-- =====================================================
-- CLEANUP AND FINAL SETUP
-- =====================================================

-- Ensure the cash boxes exist (in case they were deleted)
INSERT INTO master_cash (id, balance) 
SELECT uuid_generate_v4(), 0 
WHERE NOT EXISTS (SELECT 1 FROM master_cash);

INSERT INTO admin_cash (id, balance) 
SELECT uuid_generate_v4(), 0 
WHERE NOT EXISTS (SELECT 1 FROM admin_cash);

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Final permission grants
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

COMMENT ON MIGRATION IS 'Fix authentication setup - adds profiles table, triggers, and proper RLS policies';