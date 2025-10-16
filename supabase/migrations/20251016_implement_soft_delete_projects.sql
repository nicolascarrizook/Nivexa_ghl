-- Migration: Implement Soft Delete for Projects
-- Date: 2025-10-16
-- Description: Add deleted_at field to preserve financial history

-- =====================================================
-- 1. ADD SOFT DELETE FIELD
-- =====================================================

DO $$
BEGIN
    -- Add deleted_at field if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE projects
        ADD COLUMN deleted_at TIMESTAMPTZ NULL;

        RAISE NOTICE '✅ Campo deleted_at agregado a projects';
    END IF;
END $$;

COMMENT ON COLUMN projects.deleted_at IS
  'Soft delete timestamp. NULL = active project, NOT NULL = deleted project';

-- =====================================================
-- 2. CREATE INDEX FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_projects_deleted_at
ON projects(deleted_at)
WHERE deleted_at IS NULL;

-- =====================================================
-- 3. UPDATE EXISTING QUERIES (Views)
-- =====================================================

-- Create view for active projects only
CREATE OR REPLACE VIEW active_projects AS
SELECT * FROM projects
WHERE deleted_at IS NULL;

COMMENT ON VIEW active_projects IS
  'View that shows only active (non-deleted) projects';

-- =====================================================
-- 4. RESTORE DELETED PROJECTS DATA
-- =====================================================

-- Mark projects without cash_movements as truly deleted
-- Keep projects WITH movements as soft-deleted

DO $$
DECLARE
  v_count INT;
BEGIN
  -- Count projects referenced in cash_movements but not in projects
  SELECT COUNT(DISTINCT project_id)
  INTO v_count
  FROM cash_movements
  WHERE project_id IS NULL;

  RAISE NOTICE 'ℹ️  Movimientos con project_id NULL: %', v_count;

  -- We can't restore deleted projects automatically
  -- But we can identify the movements
  RAISE NOTICE '⚠️  Algunos movimientos tienen proyectos eliminados';
  RAISE NOTICE '   Estos seguirán mostrando "Proyecto Eliminado"';
  RAISE NOTICE '   Para evitarlo en el futuro, usa soft delete';
END $$;

-- =====================================================
-- 5. VERIFICATION
-- =====================================================

-- Show active projects
SELECT
  COUNT(*) as proyectos_activos,
  'Proyectos visibles en el sistema' as descripcion
FROM projects
WHERE deleted_at IS NULL;

-- Show soft-deleted projects (if any)
SELECT
  COUNT(*) as proyectos_eliminados,
  'Proyectos marcados como eliminados' as descripcion
FROM projects
WHERE deleted_at IS NOT NULL;

-- Show orphaned movements
SELECT
  COUNT(*) as movimientos_huerfanos,
  'Movimientos sin proyecto válido' as descripcion
FROM cash_movements
WHERE project_id IS NULL;
