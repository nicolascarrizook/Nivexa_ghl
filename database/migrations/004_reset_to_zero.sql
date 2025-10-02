-- Reset ALL Cash Boxes to ZERO
-- This script sets all cash boxes to 0 for a fresh start

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

-- Step 2: Clean ALL existing data
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE installments CASCADE;
TRUNCATE TABLE cash_movements CASCADE;
TRUNCATE TABLE fee_collections CASCADE;
TRUNCATE TABLE contracts CASCADE;
TRUNCATE TABLE project_cash CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE admin_cash CASCADE;
TRUNCATE TABLE master_cash CASCADE;

-- Step 3: Create cash boxes with ZERO balance

-- Caja Maestra: $0.00
INSERT INTO master_cash (id, balance, last_movement_at, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    0.00,  -- ZERO
    NOW(),
    NOW(),
    NOW()
);

-- Caja Admin: $0.00
INSERT INTO admin_cash (id, balance, total_collected, last_movement_at, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    0.00,  -- ZERO
    0.00,  -- ZERO total collected
    NOW(),
    NOW(),
    NOW()
);

-- No projects needed since everything is at zero
-- The system will create project cash boxes as new projects are added

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
DROP POLICY IF EXISTS "Public delete master_cash" ON master_cash;

DROP POLICY IF EXISTS "Public read admin_cash" ON admin_cash;
DROP POLICY IF EXISTS "Public insert admin_cash" ON admin_cash;
DROP POLICY IF EXISTS "Public update admin_cash" ON admin_cash;
DROP POLICY IF EXISTS "Public delete admin_cash" ON admin_cash;

DROP POLICY IF EXISTS "Public read projects" ON projects;
DROP POLICY IF EXISTS "Public insert projects" ON projects;
DROP POLICY IF EXISTS "Public update projects" ON projects;
DROP POLICY IF EXISTS "Public delete projects" ON projects;

DROP POLICY IF EXISTS "Public read project_cash" ON project_cash;
DROP POLICY IF EXISTS "Public insert project_cash" ON project_cash;
DROP POLICY IF EXISTS "Public update project_cash" ON project_cash;
DROP POLICY IF EXISTS "Public delete project_cash" ON project_cash;

DROP POLICY IF EXISTS "Public read installments" ON installments;
DROP POLICY IF EXISTS "Public insert installments" ON installments;
DROP POLICY IF EXISTS "Public update installments" ON installments;
DROP POLICY IF EXISTS "Public delete installments" ON installments;

DROP POLICY IF EXISTS "Public read payments" ON payments;
DROP POLICY IF EXISTS "Public insert payments" ON payments;
DROP POLICY IF EXISTS "Public update payments" ON payments;
DROP POLICY IF EXISTS "Public delete payments" ON payments;

DROP POLICY IF EXISTS "Public read cash_movements" ON cash_movements;
DROP POLICY IF EXISTS "Public insert cash_movements" ON cash_movements;
DROP POLICY IF EXISTS "Public update cash_movements" ON cash_movements;

DROP POLICY IF EXISTS "Public read fee_collections" ON fee_collections;
DROP POLICY IF EXISTS "Public insert fee_collections" ON fee_collections;
DROP POLICY IF EXISTS "Public update fee_collections" ON fee_collections;

DROP POLICY IF EXISTS "Public read contracts" ON contracts;
DROP POLICY IF EXISTS "Public insert contracts" ON contracts;
DROP POLICY IF EXISTS "Public update contracts" ON contracts;

-- Create comprehensive public policies
CREATE POLICY "Public full access master_cash" ON master_cash FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access admin_cash" ON admin_cash FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access project_cash" ON project_cash FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access installments" ON installments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cash_movements" ON cash_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access fee_collections" ON fee_collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access contracts" ON contracts FOR ALL USING (true) WITH CHECK (true);

-- Step 5: Verify everything is at ZERO
SELECT '=== SISTEMA RESETEADO A CERO ===' as titulo;

SELECT 
    'Caja Maestra' as tipo_caja,
    COALESCE(balance, 0) as balance,
    'Iniciando en CERO' as estado
FROM master_cash
UNION ALL
SELECT 
    'Caja Admin' as tipo_caja,
    COALESCE(balance, 0) as balance,
    'Iniciando en CERO' as estado
FROM admin_cash
UNION ALL
SELECT 
    'Cajas de Proyectos' as tipo_caja,
    COALESCE(SUM(balance), 0) as balance,
    'Sin proyectos' as estado
FROM project_cash
GROUP BY tipo_caja
UNION ALL
SELECT 
    '────────────────' as tipo_caja,
    NULL as balance,
    '────────────────' as estado
UNION ALL
SELECT 
    'TOTAL SISTEMA' as tipo_caja,
    (SELECT COALESCE(SUM(balance), 0) FROM master_cash) + 
    (SELECT COALESCE(SUM(balance), 0) FROM admin_cash) + 
    (SELECT COALESCE(SUM(balance), 0) FROM project_cash) as balance,
    'Todo en CERO ✓' as estado;

-- The system is now completely reset to ZERO and ready for fresh data