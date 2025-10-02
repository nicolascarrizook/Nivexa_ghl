-- Reset and Clean Cash Boxes
-- This script cleans all corrupted data and sets exact amounts

-- Step 1: Disable RLS temporarily
ALTER TABLE master_cash DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_cash DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_cash DISABLE ROW LEVEL SECURITY;
ALTER TABLE installments DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE fee_collections DISABLE ROW LEVEL SECURITY;
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;

-- Step 2: Clean ALL existing data (full reset)
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE installments CASCADE;
TRUNCATE TABLE cash_movements CASCADE;
TRUNCATE TABLE fee_collections CASCADE;
TRUNCATE TABLE contracts CASCADE;
TRUNCATE TABLE project_cash CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE admin_cash CASCADE;
TRUNCATE TABLE master_cash CASCADE;

-- Step 3: Insert ONLY the exact cash boxes with specified amounts

-- Caja Maestra: $15,750,000.00
INSERT INTO master_cash (id, balance, last_movement_at, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    15750000.00,
    NOW(),
    NOW(),
    NOW()
);

-- Caja Admin: $4,250,000.00
INSERT INTO admin_cash (id, balance, total_collected, last_movement_at, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    4250000.00,
    4250000.00,
    NOW(),
    NOW(),
    NOW()
);

-- Create ONE sample project to hold the project cash
INSERT INTO projects (
    id,
    code,
    name,
    client_name,
    client_email,
    project_type,
    status,
    total_amount,
    down_payment_amount,
    installments_count,
    metadata,
    created_at,
    updated_at
) VALUES (
    uuid_generate_v4(),
    'PRY-2024-001',
    'Proyecto Principal',
    'Cliente Consolidado',
    'cliente@nivexa.com',
    'construction',
    'active',
    85000000.00,
    17050000.00,
    12,
    '{"note": "Proyecto para consolidar caja de proyectos"}'::jsonb,
    NOW(),
    NOW()
);

-- Caja de Proyecto: $17,050,000.00 (exactly as requested)
INSERT INTO project_cash (id, project_id, balance, total_received, last_movement_at, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    p.id,
    17050000.00,  -- Exact amount requested
    17050000.00,
    NOW(),
    NOW(),
    NOW()
FROM projects p
WHERE p.code = 'PRY-2024-001';

-- Step 4: Re-enable RLS with public policies
ALTER TABLE master_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Create/Replace public access policies (for development)
DROP POLICY IF EXISTS "Public read master_cash" ON master_cash;
DROP POLICY IF EXISTS "Public insert master_cash" ON master_cash;
DROP POLICY IF EXISTS "Public update master_cash" ON master_cash;
DROP POLICY IF EXISTS "Public read admin_cash" ON admin_cash;
DROP POLICY IF EXISTS "Public insert admin_cash" ON admin_cash;
DROP POLICY IF EXISTS "Public update admin_cash" ON admin_cash;
DROP POLICY IF EXISTS "Public read projects" ON projects;
DROP POLICY IF EXISTS "Public insert projects" ON projects;
DROP POLICY IF EXISTS "Public update projects" ON projects;
DROP POLICY IF EXISTS "Public delete projects" ON projects;
DROP POLICY IF EXISTS "Public read project_cash" ON project_cash;
DROP POLICY IF EXISTS "Public insert project_cash" ON project_cash;
DROP POLICY IF EXISTS "Public update project_cash" ON project_cash;

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

CREATE POLICY "Public read installments" ON installments FOR SELECT USING (true);
CREATE POLICY "Public insert installments" ON installments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update installments" ON installments FOR UPDATE USING (true);

CREATE POLICY "Public read payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Public insert payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update payments" ON payments FOR UPDATE USING (true);

-- Step 5: Verify the clean setup (should show EXACTLY the requested amounts)
SELECT 'RESUMEN DE CAJAS LIMPIAS' as titulo;

SELECT 
    'Caja Maestra' as tipo_caja,
    balance,
    '$15,750,000.00 (solicitado)' as monto_esperado
FROM master_cash
UNION ALL
SELECT 
    'Caja Admin' as tipo_caja,
    balance,
    '$4,250,000.00 (solicitado)' as monto_esperado
FROM admin_cash
UNION ALL
SELECT 
    'Caja de Proyectos' as tipo_caja,
    SUM(balance) as balance,
    '$17,050,000.00 (solicitado)' as monto_esperado
FROM project_cash
GROUP BY tipo_caja;

-- Total should be exactly: $37,050,000.00