# Migration Checklist - Soft Delete & Financial System Fixes

## Overview
This checklist covers the implementation of soft delete for projects and related financial system fixes to preserve complete audit trail and prevent "Proyecto Eliminado" from appearing in cash movements.

## Code Changes Completed ✅

### 1. Soft Delete Implementation
- **ProjectService.ts** - Modified to use soft delete instead of hard delete
  - `deleteProject()` now sets `deleted_at` timestamp
  - Added `restoreProject()` method
  - `getProjects()` filters deleted projects with `.is('deleted_at', null)`

### 2. Query Updates - Exclude Soft-Deleted Projects
Updated the following files to filter out deleted projects:
- `src/modules/dashboard/hooks/useDashboardData.ts` - Dashboard metrics
- `src/hooks/useSidebarBadges.ts` - Sidebar project count
- `src/modules/master-cash/components/CreateLoanModal.tsx` - Project selection for loans
- `src/modules/clients/services/ClientService.ts` - Client project counts and revenue
- `src/services/MasterLoanService.ts` - Loan validation (prevent loans to deleted projects)
- `src/services/MasterCashService.ts` - Monthly project count

### 3. Cash Movement Enhancements
- **NewCashBoxService.ts** - Added explicit `currency` and `project_id` fields to movement inserts
  - `transferMasterToProject()` - Enhanced traceability
  - `transferProjectToMaster()` - Enhanced traceability

### 4. Audit Trail Component
- **AuditTrailTable.tsx** - Already correctly shows project names for deleted projects
  - Query at line 119-122 intentionally includes deleted projects for historical reference

## Database Migrations to Execute

### Migration Execution Order (IMPORTANT!)

Run these migrations in Supabase SQL Editor **in this exact order**:

#### 1️⃣ Fix RLS Recursion
**File:** `supabase/migrations/20251016_fix_rls_recursion.sql`
**Purpose:** Fix infinite recursion in investor access token policies
**Impact:** Resolves RLS circular dependency errors

#### 2️⃣ Sync Master Cash Balances (One-Time)
**File:** `supabase/migrations/20251016_sync_master_cash_balances.sql`
**Purpose:** One-time sync of master_cash balances from project totals
**Impact:** Corrects USD balance discrepancies

#### 3️⃣ Add Currency Field
**File:** `supabase/migrations/20251016_add_currency_to_cash_movements.sql`
**Purpose:** Add explicit currency field to cash_movements for better traceability
**Impact:** Improves loan tracking and financial reporting

#### 4️⃣ Fix Trigger Interference
**File:** `supabase/migrations/20251016_fix_trigger_interference.sql`
**Purpose:** Disable auto-sync trigger that interfered with loan transfers
**Impact:** Allows manual balance updates in loan service to work correctly

#### 5️⃣ Implement Soft Delete
**File:** `supabase/migrations/20251016_implement_soft_delete_projects.sql`
**Purpose:** Add soft delete capability to preserve financial history
**Impact:** Prevents "Proyecto Eliminado" in movement logs

#### 6️⃣ Add Balance Snapshots
**File:** `supabase/migrations/20251016_add_balance_snapshots.sql`
**Purpose:** Add before/after balance fields for complete audit trail visibility
**Impact:** Shows "Saldo Anterior" and "Saldo Nuevo" in movement history (like bank statements)

#### 7️⃣ Fix Loan Movement Types
**File:** `supabase/migrations/20251016_fix_loan_movement_types.sql`
**Purpose:** Update historical loan movements from 'adjustment' to 'loan_disbursement'
**Impact:** Loans now show correctly as "Desembolso de Préstamo" in audit trail

## Testing Checklist

After running all migrations, verify:

### ✅ Soft Delete Functionality
1. [ ] Delete a project with financial movements
2. [ ] Verify project no longer appears in project lists
3. [ ] Check cash movements still show project name (not "Proyecto Eliminado")
4. [ ] Restore deleted project using `restoreProject()` method
5. [ ] Verify restored project appears in lists again

### ✅ Loan System
1. [ ] Create a new loan from master cash to a project
2. [ ] Verify master_cash balance decreased by loan amount
3. [ ] Verify project_cash_box balance increased by loan amount
4. [ ] Check cash_movements shows:
   - Proper `currency` field (ARS or USD)
   - Proper `project_id` field
   - Descriptive loan code in description

### ✅ Balance Accuracy
1. [ ] Check dashboard USD balance matches sum of project USD balances
2. [ ] Verify master_cash.balance_usd is accurate
3. [ ] Confirm no "Balance USD USD 0.00" issues

### ✅ Audit Trail
1. [ ] View audit trail in master cash page
2. [ ] Verify all movements show project names correctly
3. [ ] Check deleted projects show with proper name in historical movements
4. [ ] Verify loans show as "Desembolso de Préstamo" (not "Ajuste")
5. [ ] Verify loan payments show as "Pago de Préstamo"

### ✅ Balance Snapshots
1. [ ] Create a new loan and check the movement shows:
   - "Saldo Anterior" column with balance before the loan
   - "Monto" column with the loan amount
   - "Saldo Nuevo" column with balance after the loan
2. [ ] Verify balance calculation is correct: Saldo Nuevo = Saldo Anterior - Monto (for outgoing)
3. [ ] Check historical movements without snapshots show "Sin datos"
4. [ ] Verify both ARS and USD balances are tracked correctly

## SQL Verification Queries

### Check for soft-deleted projects
```sql
SELECT
  id,
  name,
  code,
  deleted_at,
  CASE
    WHEN deleted_at IS NULL THEN 'Active'
    ELSE 'Deleted'
  END as status
FROM projects
ORDER BY deleted_at DESC NULLS LAST;
```

### Verify cash movements have currency
```sql
SELECT
  id,
  movement_type,
  currency,
  amount,
  description,
  metadata->>'currency' as metadata_currency
FROM cash_movements
ORDER BY created_at DESC
LIMIT 20;
```

### Check orphaned movements
```sql
SELECT COUNT(*) as orphaned_movements
FROM cash_movements
WHERE project_id IS NULL;
```

### Verify balance accuracy
```sql
-- Master cash vs sum of projects
SELECT
  (SELECT balance_usd FROM master_cash) as master_usd,
  (SELECT SUM(current_balance_usd) FROM project_cash_box) as projects_total_usd,
  (SELECT balance_ars FROM master_cash) as master_ars,
  (SELECT SUM(current_balance_ars) FROM project_cash_box) as projects_total_ars;
```

### Verify balance snapshots
```sql
-- Check recent movements with balance snapshots
SELECT
  created_at,
  movement_type,
  description,
  currency,
  amount,
  balance_before_ars,
  balance_after_ars,
  balance_before_usd,
  balance_after_usd,
  CASE
    WHEN balance_before_ars IS NOT NULL OR balance_before_usd IS NOT NULL
    THEN 'Con snapshot'
    ELSE 'Sin snapshot'
  END as snapshot_status
FROM cash_movements
ORDER BY created_at DESC
LIMIT 10;
```

### Verify balance calculations
```sql
-- Verify balance math for ARS movements
SELECT
  id,
  description,
  currency,
  amount,
  balance_before_ars,
  balance_after_ars,
  (balance_before_ars - amount) as calculated_after,
  CASE
    WHEN ABS((balance_before_ars - amount) - balance_after_ars) < 0.01
    THEN '✅ Correcto'
    ELSE '❌ Error'
  END as validation
FROM cash_movements
WHERE currency = 'ARS'
  AND balance_before_ars IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

## Rollback Plan (If Needed)

If issues occur after migration:

1. **Restore hard delete behavior:**
```sql
ALTER TABLE projects DROP COLUMN deleted_at;
```

2. **Re-enable auto-sync trigger (if needed):**
```sql
-- See supabase/migrations/20251016_auto_sync_master_cash.sql
-- (This was intentionally disabled, only re-enable if you understand the implications)
```

## Summary of Benefits

✅ **Complete Financial History:** Deleted projects remain in database, preserving audit trail

✅ **Better Traceability:** Explicit `currency` field in movements improves reporting

✅ **Accurate Balances:** Fixed master cash sync issues

✅ **Clean UI:** Deleted projects hidden from lists but show properly in historical movements

✅ **Loan System:** Proper traceability and balance updates in loan transfers

✅ **Balance Visibility:** New "Saldo Anterior" and "Saldo Nuevo" columns show complete balance history like bank statements

✅ **Audit Trail:** Complete snapshot of balances at each transaction moment for perfect auditability

## Next Steps

1. Execute all 7 migrations in order
2. Run verification queries
3. Test each functionality in the checklist
4. **[OPTIONAL]** Clean test data before demo (see CLEANUP_GUIDE.md)
5. Monitor for any issues in production

## Pre-Demo Cleanup (Optional)

If you need to clean test data before the demo, see **CLEANUP_GUIDE.md** for detailed instructions.

**Two Options:**

1. **Basic Cleanup** (`20251016_clean_test_data.sql`)
   - Keeps projects and clients
   - Cleans financial movements only
   - ✅ Recommended for most cases

2. **Full Cleanup** (`20251016_full_clean_with_projects.sql`)
   - Removes everything except clients
   - Complete fresh start
   - ⚠️ More destructive

## Support

If you encounter any issues:
- Check Supabase logs for SQL errors
- Verify migration order was followed correctly
- Run verification queries to check data state
- Review error messages in browser console
