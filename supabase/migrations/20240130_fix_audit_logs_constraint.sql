-- Fix audit_logs foreign key constraint issue
-- The audit_logs table is trying to reference users that don't exist in architects table

-- First, check if audit_logs table exists and drop the problematic constraint
DO $$ 
BEGIN
    -- Check if the constraint exists before trying to drop it
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'audit_logs_user_id_fkey' 
        AND table_name = 'audit_logs'
    ) THEN
        ALTER TABLE audit_logs DROP CONSTRAINT audit_logs_user_id_fkey;
    END IF;
END $$;

-- If audit_logs table exists, update it to reference auth.users instead of architects
DO $$ 
BEGIN
    -- Check if audit_logs table exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'audit_logs'
    ) THEN
        -- Add a proper foreign key to auth.users instead
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE constraint_name = 'audit_logs_user_id_auth_fkey' 
            AND table_name = 'audit_logs'
        ) THEN
            ALTER TABLE audit_logs 
            ADD CONSTRAINT audit_logs_user_id_auth_fkey 
            FOREIGN KEY (user_id) 
            REFERENCES auth.users(id) 
            ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Create audit_logs table if it doesn't exist with proper structure
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for audit_logs (only admins can view)
CREATE POLICY IF NOT EXISTS "Admin access to audit logs" ON audit_logs
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT created_by FROM organizations 
            WHERE id IN (
                SELECT organization_id FROM organization_members 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            )
        )
    );

-- Also ensure that architects table doesn't require audit_logs
-- Remove any triggers that might be causing issues
DO $$ 
BEGIN
    -- Drop any audit trigger on architects table if it exists
    DROP TRIGGER IF EXISTS audit_architects_changes ON architects;
    DROP FUNCTION IF EXISTS audit_architects_changes_fn();
END $$;

-- Create a simpler audit function that doesn't require architects table
CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if user is authenticated
    IF auth.uid() IS NOT NULL THEN
        INSERT INTO audit_logs (
            user_id,
            action,
            table_name,
            record_id,
            old_data,
            new_data
        ) VALUES (
            auth.uid(),
            TG_OP,
            TG_TABLE_NAME,
            CASE 
                WHEN TG_OP = 'DELETE' THEN OLD.id
                ELSE NEW.id
            END,
            CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
            CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
        );
    END IF;
    
    RETURN CASE
        WHEN TG_OP = 'DELETE' THEN OLD
        ELSE NEW
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Only add audit triggers to tables that need them, not all tables
-- For now, we'll skip adding triggers until we identify which tables need auditing