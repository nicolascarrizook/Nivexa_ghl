-- Migration: Studio Settings
-- Description: Create a table to store studio-wide configurations
-- Author: System
-- Date: 2024-12-19

-- Studio Settings Table
CREATE TABLE studio_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB,
    setting_type TEXT CHECK (setting_type IN ('string', 'number', 'boolean', 'json', 'percentage')) DEFAULT 'string',
    display_name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_editable BOOLEAN DEFAULT true,
    validation_rules JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient lookups
CREATE INDEX idx_studio_settings_key ON studio_settings(setting_key);
CREATE INDEX idx_studio_settings_category ON studio_settings(category);

-- Insert default configuration values
INSERT INTO studio_settings (setting_key, setting_value, setting_type, display_name, description, category, validation_rules) VALUES
(
    'admin_fee_percentage',
    '15'::jsonb,
    'percentage',
    'Porcentaje de Honorarios Administrativos',
    'Porcentaje de honorarios que se cobra sobre los ingresos de cada proyecto. Valor entre 0 y 100.',
    'financial',
    '{"min": 0, "max": 100, "decimals": 2}'::jsonb
),
(
    'studio_name',
    '"Estudio de Arquitectura"'::jsonb,
    'string',
    'Nombre del Estudio',
    'Nombre oficial del estudio que aparece en documentos y reportes.',
    'general',
    '{"maxLength": 100, "required": true}'::jsonb
),
(
    'default_currency',
    '"ARS"'::jsonb,
    'string',
    'Moneda por Defecto',
    'Moneda principal utilizada para los cálculos financieros.',
    'financial',
    '{"options": ["ARS", "USD", "EUR"], "required": true}'::jsonb
),
(
    'late_fee_grace_days',
    '5'::jsonb,
    'number',
    'Días de Gracia para Pagos',
    'Número de días después del vencimiento antes de aplicar recargos.',
    'financial',
    '{"min": 0, "max": 30}'::jsonb
),
(
    'project_code_prefix',
    '"PRY"'::jsonb,
    'string',
    'Prefijo de Código de Proyecto',
    'Prefijo utilizado para generar códigos automáticos de proyectos (ej: PRY-2024-001).',
    'projects',
    '{"maxLength": 10, "pattern": "^[A-Z]{2,10}$"}'::jsonb
);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_studio_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_studio_settings_updated_at
    BEFORE UPDATE ON studio_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_studio_settings_updated_at();

-- Add RLS (Row Level Security) if needed
-- ALTER TABLE studio_settings ENABLE ROW LEVEL SECURITY;

-- Grant permissions (adjust based on your auth setup)
-- GRANT ALL ON studio_settings TO authenticated;
-- GRANT SELECT ON studio_settings TO anon;

-- Function to get a setting value by key with type casting
CREATE OR REPLACE FUNCTION get_studio_setting(setting_key_param TEXT)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT setting_value INTO result
    FROM studio_settings
    WHERE setting_key = setting_key_param
    AND is_editable = true
    LIMIT 1;
    
    RETURN COALESCE(result, NULL);
END;
$$ language 'plpgsql';

-- Function to update a setting value
CREATE OR REPLACE FUNCTION update_studio_setting(setting_key_param TEXT, new_value JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    updated_rows INTEGER;
BEGIN
    UPDATE studio_settings
    SET setting_value = new_value,
        updated_at = NOW()
    WHERE setting_key = setting_key_param
    AND is_editable = true;
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    
    RETURN updated_rows > 0;
END;
$$ language 'plpgsql';

-- Add comment to the table
COMMENT ON TABLE studio_settings IS 'Configuration settings for the studio application';
COMMENT ON COLUMN studio_settings.setting_key IS 'Unique identifier for the setting';
COMMENT ON COLUMN studio_settings.setting_value IS 'JSON value of the setting';
COMMENT ON COLUMN studio_settings.setting_type IS 'Data type hint for UI rendering';
COMMENT ON COLUMN studio_settings.validation_rules IS 'JSON object with validation constraints';