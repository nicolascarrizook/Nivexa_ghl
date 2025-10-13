# Guía de Migración: Sistema Multi-Moneda

## ⚠️ IMPORTANTE: Evitar Problemas Futuros

Este documento describe cómo evitar que vuelvan a ocurrir problemas de inconsistencia entre tablas legacy y nuevas.

## Problema Identificado

El sistema tenía dos esquemas de tablas en paralelo:
- **Legacy**: `project_cash` con campos `balance_ars`, `balance_usd`, `total_received`
- **Nuevo**: `project_cash_box` con campos `current_balance_ars`, `current_balance_usd`, `total_income_ars`, etc.

Cuando se limpiaba la base de datos, solo se recreaban las tablas nuevas, causando que el código que aún usaba tablas legacy fallara silenciosamente.

## Solución Implementada

### 1. Migración de Base de Datos

Ejecutar el script `/supabase/migrations/20250110_migrate_to_multi_currency.sql`:

```bash
# Desde Supabase SQL Editor
1. Ir a SQL Editor
2. Ejecutar: supabase/migrations/20250110_migrate_to_multi_currency.sql
```

Este script:
- ✅ Crea `project_cash_box` si no existe
- ✅ Migra datos de `project_cash` a `project_cash_box`
- ✅ Elimina la tabla obsoleta `project_cash`
- ✅ Crea vista de compatibilidad temporal
- ✅ Valida que todos los proyectos tengan cash box

### 2. Campos Correctos por Tabla

#### `project_cash_box` (NUEVA - USAR ESTA)
```typescript
{
  id: UUID
  project_id: UUID
  current_balance_ars: DECIMAL(15,2)  // Balance actual en pesos
  current_balance_usd: DECIMAL(15,2)  // Balance actual en dólares
  total_income_ars: DECIMAL(15,2)     // Total ingreso histórico ARS
  total_income_usd: DECIMAL(15,2)     // Total ingreso histórico USD
  total_expenses_ars: DECIMAL(15,2)   // Total gasto histórico ARS
  total_expenses_usd: DECIMAL(15,2)   // Total gasto histórico USD
  budget_allocated_ars: DECIMAL(15,2) // Presupuesto asignado ARS
  budget_allocated_usd: DECIMAL(15,2) // Presupuesto asignado USD
  is_active: BOOLEAN
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

#### `project_cash` (LEGACY - NO USAR)
```typescript
{
  id: UUID
  project_id: UUID
  balance: DECIMAL(15,2)          // ❌ OBSOLETO
  balance_ars: DECIMAL(15,2)      // ❌ OBSOLETO
  balance_usd: DECIMAL(15,2)      // ❌ OBSOLETO
  total_received: DECIMAL(15,2)   // ❌ OBSOLETO
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

### 3. Archivos que Requieren Actualización

**CRÍTICOS** (afectan funcionalidad principal):
- [x] `/src/modules/projects/services/ProjectService.ts` - ✅ ACTUALIZADO
- [x] `/src/services/cash/NewCashBoxService.ts` - ⚠️ PARCIALMENTE ACTUALIZADO
  - ✅ Tabla cambiada a `project_cash_box`
  - ⏳ Campos legacy aún en uso en algunos métodos

**SECUNDARIOS** (scripts, tests, páginas):
- [ ] `/src/modules/dashboard/hooks/useDashboardData.ts`
- [ ] `/src/modules/finance/services/CashBoxService.ts`
- [ ] `/src/modules/projects/components/details/ProjectExpensesTab.tsx`
- [ ] `/src/pages/EnhancedFinancePage.tsx`
- [ ] `/src/services/BankAccountService.ts`
- [ ] `/src/services/MasterCashService.ts`

**SCRIPTS** (diagnóstico y tests):
- [ ] `/src/scripts/diagnose-cash-system.ts`
- [ ] `/src/scripts/diagnose-detailed.ts`
- [ ] `/src/scripts/fix-paid-contractor-payments-node.ts`
- [ ] `/src/tests/integration/cash-flow.integration.test.ts`
- [ ] `/src/utils/testProjectCreation.ts`

## Patrón de Actualización

### ANTES (Legacy):
```typescript
// ❌ NO USAR
const { data } = await supabase
  .from('project_cash')
  .select('*')
  .eq('project_id', projectId);

// Actualizar balance
await supabase
  .from('project_cash')
  .update({
    balance_ars: cash.balance_ars + amount,
    total_received: cash.total_received + amount
  })
  .eq('id', cashId);
```

### DESPUÉS (Multi-Currency):
```typescript
// ✅ USAR
const { data } = await supabase
  .from('project_cash_box')
  .select('*')
  .eq('project_id', projectId);

// Actualizar balance según moneda
const currency = 'USD'; // o 'ARS'
await supabase
  .from('project_cash_box')
  .update({
    current_balance_usd: cash.current_balance_usd + amount,
    total_income_usd: cash.total_income_usd + amount,
    updated_at: new Date().toISOString()
  })
  .eq('id', cashId);
```

## Procedimiento para Nuevos Desarrollos

### 1. Al Crear Proyecto
```typescript
// Crear project_cash_box automáticamente
await supabase
  .from('project_cash_box')
  .insert({
    project_id: newProject.id,
    current_balance_ars: 0,
    current_balance_usd: 0,
    total_income_ars: 0,
    total_income_usd: 0,
    total_expenses_ars: 0,
    total_expenses_usd: 0,
    is_active: true
  });
```

### 2. Al Registrar Pago
```typescript
// Usar NewCashBoxService.processProjectPayment
await newCashBoxService.processProjectPayment({
  projectId: project.id,
  amount: paymentAmount,
  currency: project.currency, // 'ARS' | 'USD'
  description: `Pago cuota #${installmentNumber}`,
  installmentId: installment.id
});
```

### 3. Al Consultar Balance
```typescript
// Obtener balance según moneda del proyecto
const { data: cashBox } = await supabase
  .from('project_cash_box')
  .select('current_balance_ars, current_balance_usd')
  .eq('project_id', projectId)
  .single();

const balance = project.currency === 'USD'
  ? cashBox.current_balance_usd
  : cashBox.current_balance_ars;
```

## Validación del Sistema

### Verificar Migración Exitosa
```sql
-- 1. Verificar que project_cash no existe
SELECT table_name FROM information_schema.tables
WHERE table_name = 'project_cash';
-- Debe retornar 0 filas

-- 2. Verificar que todos los proyectos tienen cash box
SELECT
  COUNT(DISTINCT p.id) as total_proyectos,
  COUNT(DISTINCT pcb.project_id) as proyectos_con_cash_box
FROM projects p
LEFT JOIN project_cash_box pcb ON p.id = pcb.project_id;
-- Los números deben ser iguales

-- 3. Verificar balances multi-moneda
SELECT
  p.code,
  p.currency,
  pcb.current_balance_ars,
  pcb.current_balance_usd,
  pcb.total_income_ars,
  pcb.total_income_usd
FROM projects p
JOIN project_cash_box pcb ON p.id = pcb.project_id
ORDER BY p.created_at DESC;
```

### Prueba de Humo
1. Crear un proyecto nuevo en USD con anticipo de $10,000
2. Verificar que `project_cash_box.current_balance_usd = 10000`
3. Verificar que `project_cash_box.total_income_usd = 10000`
4. Verificar que `master_cash.balance_usd` aumentó en $10,000
5. Verificar registros en `cash_movements`

## Prevención de Regresiones

### Tests a Crear
```typescript
// test: Proyecto en USD registra balance USD correctamente
// test: Proyecto en ARS registra balance ARS correctamente
// test: No se debe permitir usar tabla project_cash
// test: Todos los proyectos tienen project_cash_box
```

### CI/CD Checks
- [ ] Agregar validación que bloquee commits con referencias a `project_cash`
- [ ] Agregar test de integración que valide flujo completo de pagos
- [ ] Validar esquema de base de datos en cada deploy

## Rollback Plan

Si algo falla:

1. La vista de compatibilidad `project_cash` (creada por la migración) permite que código legacy siga funcionando temporalmente
2. Para rollback completo:
```sql
-- Recrear tabla legacy desde project_cash_box
CREATE TABLE project_cash AS
SELECT
  id,
  project_id,
  (current_balance_ars + current_balance_usd) as balance,
  current_balance_ars as balance_ars,
  current_balance_usd as balance_usd,
  (total_income_ars + total_income_usd) as total_received,
  created_at,
  updated_at
FROM project_cash_box;
```

## Contacto y Soporte

Para preguntas sobre esta migración:
- Revisar este documento primero
- Verificar logs de Supabase
- Ejecutar queries de validación arriba
- Contactar al equipo si los problemas persisten

---

**Última actualización**: 2025-01-10
**Versión**: 1.0
**Estado**: En progreso - Migración parcial completada
