-- Initialize Cash Boxes with Default Values
-- Run this in Supabase SQL Editor after creating the tables

-- Disable RLS temporarily for setup (re-enable after if needed)
ALTER TABLE master_cash DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_cash DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_cash DISABLE ROW LEVEL SECURITY;

-- Clear existing cash boxes (optional - comment out if you want to keep existing data)
TRUNCATE TABLE master_cash CASCADE;
TRUNCATE TABLE admin_cash CASCADE;
TRUNCATE TABLE project_cash CASCADE;

-- 1. Initialize Master Cash Box (Caja Maestra)
INSERT INTO master_cash (balance, last_movement_at)
VALUES (15750000.00, NOW())
ON CONFLICT DO NOTHING;

-- 2. Initialize Admin Cash Box (Caja Admin)  
INSERT INTO admin_cash (balance, total_collected, last_movement_at)
VALUES (4250000.00, 4250000.00, NOW())
ON CONFLICT DO NOTHING;

-- 3. Create a sample project if none exists
INSERT INTO projects (
    code, 
    name, 
    client_name, 
    client_email,
    client_phone,
    project_type, 
    status, 
    total_amount, 
    down_payment_amount,
    down_payment_percentage,
    installments_count,
    installment_amount,
    metadata
) 
VALUES (
    'PRY-2024-001',
    'Casa Familia González',
    'Juan González',
    'juan.gonzalez@email.com',
    '+54 11 4567-8900',
    'construction',
    'active',
    50000000.00,
    10000000.00,
    20,
    12,
    3333333.33,
    '{"notes": "Proyecto inicial de ejemplo"}'::jsonb
)
ON CONFLICT (code) DO NOTHING;

-- 4. Initialize Project Cash for the sample project
INSERT INTO project_cash (project_id, balance, total_received, last_movement_at)
SELECT 
    p.id,
    17050000.00,
    17050000.00,
    NOW()
FROM projects p
WHERE p.code = 'PRY-2024-001'
ON CONFLICT (project_id) DO UPDATE
SET 
    balance = 17050000.00,
    total_received = 17050000.00,
    last_movement_at = NOW();

-- Create more sample projects with cash boxes
INSERT INTO projects (
    code, name, client_name, client_email, project_type, 
    status, total_amount, down_payment_amount, installments_count
) VALUES 
    ('PRY-2024-002', 'Remodelación Oficinas', 'María Fernández', 'maria@empresa.com', 'renovation', 'active', 25000000.00, 5000000.00, 6),
    ('PRY-2024-003', 'Diseño Interior Local', 'Pedro Martínez', 'pedro@local.com', 'design', 'active', 15000000.00, 3000000.00, 4),
    ('PRY-2024-004', 'Construcción Duplex', 'Ana Silva', 'ana.silva@email.com', 'construction', 'draft', 75000000.00, 15000000.00, 18)
ON CONFLICT (code) DO NOTHING;

-- Initialize cash boxes for additional projects
INSERT INTO project_cash (project_id, balance, total_received)
SELECT 
    p.id,
    CASE 
        WHEN p.code = 'PRY-2024-002' THEN 8500000.00
        WHEN p.code = 'PRY-2024-003' THEN 5200000.00
        WHEN p.code = 'PRY-2024-004' THEN 3350000.00
        ELSE 0
    END as balance,
    CASE 
        WHEN p.code = 'PRY-2024-002' THEN 8500000.00
        WHEN p.code = 'PRY-2024-003' THEN 5200000.00
        WHEN p.code = 'PRY-2024-004' THEN 3350000.00
        ELSE 0
    END as total_received
FROM projects p
WHERE p.code IN ('PRY-2024-002', 'PRY-2024-003', 'PRY-2024-004')
ON CONFLICT (project_id) DO NOTHING;

-- Create RLS policies for public access (adjust based on your auth needs)
-- These are permissive policies for development - tighten for production

-- Enable RLS with public policies
ALTER TABLE master_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_cash ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (development only - use auth for production)
CREATE POLICY "Public read master_cash" ON master_cash FOR SELECT USING (true);
CREATE POLICY "Public insert master_cash" ON master_cash FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update master_cash" ON master_cash FOR UPDATE USING (true);

CREATE POLICY "Public read admin_cash" ON admin_cash FOR SELECT USING (true);
CREATE POLICY "Public insert admin_cash" ON admin_cash FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update admin_cash" ON admin_cash FOR UPDATE USING (true);

CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public insert projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Public delete projects" ON projects FOR DELETE USING (true);

CREATE POLICY "Public read project_cash" ON project_cash FOR SELECT USING (true);
CREATE POLICY "Public insert project_cash" ON project_cash FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update project_cash" ON project_cash FOR UPDATE USING (true);

-- Verify the setup
SELECT 
    'Caja Maestra' as tipo_caja,
    balance,
    'Principal del estudio' as descripcion
FROM master_cash
UNION ALL
SELECT 
    'Caja Admin' as tipo_caja,
    balance,
    'Total cobrado: $' || total_collected as descripcion
FROM admin_cash
UNION ALL
SELECT 
    'Cajas de Proyectos' as tipo_caja,
    SUM(balance) as balance,
    COUNT(*) || ' proyectos' as descripcion
FROM project_cash
GROUP BY tipo_caja;