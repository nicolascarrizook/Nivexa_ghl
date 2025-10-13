# Diagnóstico y Testing del Sistema de Cajas

Este documento explica cómo diagnosticar y probar el sistema de triple caja de Nivexa.

## Problema Reportado

**Síntoma**: El dashboard muestra `$0` en ingresos del mes y la caja maestra está vacía, a pesar de haber un proyecto con un anticipo de $3,899.7 pagado.

**Comportamiento esperado**:
- **Ingresos del Mes**: Debe mostrar el total de pagos recibidos en el mes actual
- **Caja Maestra**: Debe mostrar el balance acumulado que incluye todos los anticipos y cuotas pagadas
- **Caja Proyecto**: Debe mostrar el balance del proyecto específico
- **Caja Admin**: Debe estar en $0 hasta que se cobren honorarios manualmente

## Arquitectura del Sistema de Cajas

### Triple Cash Box System

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE CAJA                            │
└─────────────────────────────────────────────────────────────┘

Cliente paga → Project Cash Box
               ↓ (duplicación automática)
               Master Cash Box → (cobro manual) → Admin Cash Box
```

### Tablas Involucradas

**⚠️ IMPORTANTE**: Existen DOS esquemas de tablas en la base de datos:

#### Esquema Antiguo (usado actualmente)
- `master_cash` - Caja maestra
- `project_cash` - Caja de proyectos
- `admin_cash` - Caja administrativa
- `cash_movements` - Movimientos de caja

#### Esquema Nuevo (creado pero no usado)
- `master_cash_box` - Nueva caja maestra con multi-currency
- `project_cash_box` - Nueva caja de proyectos con multi-currency
- `master_cash_transactions` - Transacciones de caja maestra
- `project_cash_transactions` - Transacciones de proyecto

**El código actual usa el esquema antiguo pero puede haber confusión entre ambos.**

## Herramientas de Diagnóstico

### 1. Script de Diagnóstico Rápido

Ejecuta un análisis completo del sistema:

```bash
npm run diagnose:cash
```

Este script verifica:
- ✅ Existencia de tablas necesarias
- ✅ Master cash box y su balance
- ✅ Project cash boxes de todos los proyectos
- ✅ Movimientos de caja registrados
- ✅ Admin cash box
- ⚠️ Detecta proyectos con anticipo pero sin balance
- ⚠️ Detecta installments pagadas sin movimientos

### 1.5. Script de Diagnóstico Detallado

Para análisis profundo con más información:

```bash
npm run diagnose:detailed
```

Este script proporciona:
- 🔐 Verificación de autenticación (usuario conectado)
- 📊 Conteo exacto de registros en cada tabla
- 🚨 Detección de registros duplicados en master_cash/admin_cash
- 📋 Lista completa de proyectos con sus importes
- 💰 Balances de todas las cajas del sistema
- 📝 Últimos movimientos con descripción completa
- 💡 Soluciones SQL para problemas críticos detectados

### 1.75. Script de Reparación Automática

**NUEVO**: Soluciona automáticamente los problemas de registros duplicados:

```bash
npm run fix:cash
```

Este script:
- ✅ Detecta y elimina registros duplicados en master_cash
- ✅ Detecta y elimina registros duplicados en admin_cash
- ✅ Crea registros faltantes si no existen
- ✅ Mantiene el registro con mayor balance (o más reciente)
- ✅ Verifica la reparación al finalizar
- 🚨 Proporciona comandos SQL manuales si la reparación automática falla

**IMPORTANTE**: Este script requiere que estés autenticado en la aplicación web.

**Salida esperada**:
```
╔════════════════════════════════════════════════════════╗
║        DIAGNÓSTICO DEL SISTEMA DE CAJAS               ║
╚════════════════════════════════════════════════════════╝

🔍 === DIAGNÓSTICO: MASTER CASH ===
✅ Master cash existe
Master Cash: { id: '...', balance: 3899.7, ... }

🔍 === DIAGNÓSTICO: PROJECT CASH ===
📊 Total de proyectos: 1

--- Proyecto: PRY-2024-001 ---
Nombre: Test Project
Anticipo: $3899.7
Balance: $3899.7
✅ Project cash correcto

🔍 === DIAGNÓSTICO: MOVIMIENTOS DE CAJA ===
📊 Total de movimientos: 2
Movimientos por tipo:
  - project_income: 1
  - master_duplication: 1

╔════════════════════════════════════════════════════════╗
║                    RESUMEN                             ║
╚════════════════════════════════════════════════════════╝
✅ Correcto: 5
⚠️  Advertencias: 0
❌ Errores: 0
```

### 2. Tests de Integración

Ejecuta tests reales contra la base de datos de desarrollo:

```bash
npm run test:integration
```

**⚠️ ADVERTENCIA**: Estos tests crean y eliminan datos reales. NO ejecutar en producción.

Los tests verifican:
1. ✅ Creación de proyecto con anticipo
2. ✅ Registro automático en project_cash
3. ✅ Duplicación automática en master_cash
4. ✅ Movimientos de caja correctos
5. ✅ Balances actualizados

### 3. Tests Unitarios

Ejecuta tests mockeados sin tocar la base de datos:

```bash
npm test src/modules/finance/services/CashBoxService.test.ts
```

## Problemas Comunes y Soluciones

### Problema CRÍTICO: Registros Duplicados en master_cash

**Síntoma**: El error `Cannot coerce the result to a single JSON object` al acceder a master_cash.

**Causa**: La tabla `master_cash` tiene múltiples registros cuando debería tener **exactamente uno**.

**Verificación**:
```sql
-- Ver todos los registros en master_cash
SELECT * FROM master_cash;
```

**Solución**:
```sql
-- Opción 1: Eliminar todos excepto el más reciente
DELETE FROM master_cash
WHERE id NOT IN (
  SELECT id FROM master_cash
  ORDER BY created_at DESC
  LIMIT 1
);

-- Opción 2: Si todos tienen balance 0, eliminar todos y crear uno nuevo
DELETE FROM master_cash;
INSERT INTO master_cash (balance, last_movement_at)
VALUES (0, NOW());
```

**IMPORTANTE**: Este problema debe resolverse PRIMERO antes de continuar con cualquier otro diagnóstico.

### Problema 1: Balances en $0 después de pagar anticipo

**Causa**: El método `processProjectPayment()` no se está ejecutando correctamente.

**Verificación**:
```sql
-- Verificar si existen movimientos para el proyecto
SELECT * FROM cash_movements WHERE project_id = 'ID_DEL_PROYECTO';

-- Verificar balance de project_cash
SELECT * FROM project_cash WHERE project_id = 'ID_DEL_PROYECTO';

-- Verificar balance de master_cash
SELECT * FROM master_cash LIMIT 1;
```

**Solución**:
El código en `ProjectService.createProject()` (línea 184) debería llamar a:
```typescript
await newCashBoxService.processProjectPayment({
  projectId: projectData.id,
  amount: downPaymentInstallment.amount,
  description: `Anticipo - ${projectData.name}`,
  installmentId: downPaymentInstallment.id
});
```

### Problema 2: Movimientos creados pero balances no actualizados

**Causa**: Las queries de actualización de balance fallan silenciosamente.

**Verificación**:
```typescript
// En NewCashBoxService.processProjectPayment() (líneas 386-405)
// Verificar que las actualizaciones de balance se ejecutan correctamente
const updates = await Promise.all([...]);
console.log('Update results:', updates);
```

### Problema 3: Ingresos del mes en $0

**Causa**: El cálculo de "Ingresos del Mes" no está consultando los movimientos correctamente.

**Verificación SQL**:
```sql
-- Obtener ingresos del mes actual
SELECT SUM(amount) as monthly_income
FROM cash_movements
WHERE movement_type = 'project_income'
  AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE);
```

**Ubicación del código**: Buscar el componente del dashboard que muestra "Ingresos del Mes" y verificar la query.

## Flujo de Pago Correcto

Cuando se crea un proyecto con anticipo:

```typescript
// 1. Crear proyecto
const project = await projectService.createProject(formData);

// 2. Crear installment de anticipo
const installment = await createDownPaymentRecord(project);

// 3. Marcar como pagada
await markInstallmentAsPaid(installment.id);

// 4. CRÍTICO: Procesar pago a las cajas
await newCashBoxService.processProjectPayment({
  projectId: project.id,
  amount: installment.amount,
  description: `Anticipo - ${project.name}`,
  installmentId: installment.id
});

// Esto debe crear DOS movimientos:
// - movement_type: 'project_income' (external → project_cash)
// - movement_type: 'master_duplication' (project_cash → master_cash)

// Y actualizar DOS balances:
// - project_cash.balance += amount
// - master_cash.balance += amount
```

## Queries SQL Útiles

### Ver estado completo de un proyecto
```sql
SELECT
  p.code,
  p.name,
  p.total_amount,
  p.down_payment_amount,
  pc.balance as project_balance,
  pc.total_received,
  (SELECT COUNT(*) FROM cash_movements WHERE project_id = p.id) as movements_count,
  (SELECT COUNT(*) FROM installments WHERE project_id = p.id AND status = 'paid') as paid_installments
FROM projects p
LEFT JOIN project_cash pc ON p.id = pc.project_id
ORDER BY p.created_at DESC
LIMIT 10;
```

### Ver movimientos de caja recientes
```sql
SELECT
  cm.*,
  p.code as project_code,
  p.name as project_name
FROM cash_movements cm
LEFT JOIN projects p ON cm.project_id = p.id
ORDER BY cm.created_at DESC
LIMIT 20;
```

### Ver balance total del sistema
```sql
SELECT
  'Master Cash' as caja,
  balance
FROM master_cash
UNION ALL
SELECT
  'Admin Cash' as caja,
  balance
FROM admin_cash
UNION ALL
SELECT
  'Project: ' || p.code as caja,
  pc.balance
FROM project_cash pc
JOIN projects p ON pc.project_id = p.id;
```

## Pasos para Resolver (Actualizado 2025)

### Solución Rápida Automática

**Si el dashboard muestra $0 en todo**:

1. **Ejecutar diagnóstico detallado**:
   ```bash
   npm run diagnose:detailed
   ```

2. **Si aparece el error "Cannot coerce the result to a single JSON object"**:
   ```bash
   npm run fix:cash
   ```
   Este comando reparará automáticamente los registros duplicados.

3. **Refrescar el dashboard** en el navegador (F5 o Cmd+R)

4. **Verificar la reparación**:
   ```bash
   npm run diagnose:detailed
   ```
   Debería mostrar "✅ Un solo registro en master_cash (correcto)"

### Solución Manual (Si la automática falla)

Si el script automático no funciona o prefieres hacerlo manualmente:

1. **Ejecutar diagnóstico**:
   ```bash
   npm run diagnose:cash
   ```

2. **Revisar output** y identificar:
   - ¿Existen las tablas?
   - ¿Los proyectos tienen cajas asociadas?
   - ¿Hay movimientos registrados?
   - ¿Los balances están actualizados?

3. **Si hay registros duplicados**:
   - Ir a Supabase Dashboard → SQL Editor
   - Ejecutar el SQL de limpieza (ver sección "Problema CRÍTICO" abajo)

4. **Si los balances están en $0**:
   - Verificar que `processProjectPayment()` se ejecuta
   - Revisar logs en consola del navegador
   - Verificar permisos RLS en Supabase

5. **Si no hay movimientos**:
   - El método `processProjectPayment()` no se está llamando
   - Verificar el flujo en `ProjectService.createProject()`

6. **Ejecutar tests de integración**:
   ```bash
   npm run test:integration
   ```
   Si los tests pasan, el problema está en cómo se usa el código en el frontend.

## Contacto y Soporte

Si después de ejecutar el diagnóstico sigues teniendo problemas:

1. Copia la salida completa de `npm run diagnose:cash`
2. Ejecuta y copia los resultados de las queries SQL útiles
3. Revisa los logs en la consola del navegador cuando creas un proyecto
4. Verifica los errores en la consola de Supabase

## Archivos Importantes

- `src/modules/projects/services/ProjectService.ts` - Creación de proyectos
- `src/services/cash/NewCashBoxService.ts` - Lógica de cajas
- `src/modules/finance/services/CashBoxService.ts` - Servicio legacy
- `src/scripts/diagnose-cash-system.ts` - Script de diagnóstico
- `src/tests/integration/cash-flow.integration.test.ts` - Tests de integración
