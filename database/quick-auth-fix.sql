-- =====================================================
-- QUICK AUTH FIX - Run in Supabase SQL Editor
-- This is a simplified version that fixes the most common auth issues
-- =====================================================

-- 1. Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS and create policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 3. Add user_id to architects table (if column doesn't exist)
ALTER TABLE architects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (id, email, full_name, display_name)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'firstName', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
        COALESCE(NEW.raw_user_meta_data->>'displayName', NEW.email)
    );
    
    -- Create architect record if none exists
    INSERT INTO public.architects (
        user_id,
        email, 
        full_name, 
        business_name
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'firstName', '') || ' ' || COALESCE(NEW.raw_user_meta_data->>'lastName', ''),
        'Studio Arquitectura'
    )
    ON CONFLICT (email) DO UPDATE SET user_id = NEW.id;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Update architects policy to be more permissive
DROP POLICY IF EXISTS "Architect has full access to architects" ON architects;
CREATE POLICY "Architect has full access to architects" ON architects
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 7. Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 8. Ensure cash boxes exist
INSERT INTO master_cash (id, balance) 
SELECT gen_random_uuid(), 0 
WHERE NOT EXISTS (SELECT 1 FROM master_cash);

INSERT INTO admin_cash (id, balance) 
SELECT gen_random_uuid(), 0 
WHERE NOT EXISTS (SELECT 1 FROM admin_cash);