# 📋 DOCUMENTACIÓN COMPLETA DE LÓGICA DE NEGOCIO - NIVEXA

## 🎯 Visión General del Sistema

**Nivexa** es un sistema de gestión financiera especializado para estudios de arquitectura que implementa un modelo único de **triple caja de efectivo** con soporte multi-moneda (ARS/USD) para proyectos con financiamiento.

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Patrón Arquitectónico

**Clean Architecture con Service Layer**:
```
BaseService (Abstracto)
    ↓
Servicios de Dominio (ProjectService, CashBoxService, etc.)
    ↓
Controladores/Hooks de React
    ↓
Componentes UI
```

**BaseService** (`src/core/services/BaseService.ts`):
- CRUD genérico con type safety completo
- Respuestas estandarizadas: `ServiceResponse<T> = { data: T | null, error: Error | null }`
- Paginación optimizada (single query con count)
- Suscripciones real-time a cambios
- Filtros, búsqueda y ordenamiento

---

## 💰 SISTEMA DE TRIPLE CAJA DE EFECTIVO

### Concepto Central

El sistema implementa un flujo financiero especializado con **tres cajas independientes**:

### 1️⃣ **Caja Maestra (Master Cash Box)**
📊 **Tabla**: `master_cash_box`

**Propósito**: Caja principal del estudio que recibe automáticamente duplicados de todos los ingresos de proyectos.

**Campos clave**:
```typescript
{
  id: string
  organization_id: string
  current_balance_ars: number  // Saldo en pesos argentinos
  current_balance_usd: number  // Saldo en dólares
  total_income_ars: number     // Total ingresado histórico ARS
  total_income_usd: number     // Total ingresado histórico USD
  last_transaction_at: timestamp
}
```

**Reglas de negocio**:
- ✅ **Recibe automáticamente** copia de TODOS los pagos de clientes
- ✅ Fuente para cobro de honorarios administrativos
- ✅ Los honorarios se cobran **manualmente** (decisión del arquitecto)
- ✅ Soporte multi-moneda (ARS y USD separados)

### 2️⃣ **Caja Administrativa (Admin Cash)**
📊 **Tabla**: `admin_cash`

**Propósito**: Caja personal del arquitecto donde se acumulan los honorarios cobrados.

**Campos clave**:
```typescript
{
  id: string
  balance_ars: number         // Saldo en ARS
  balance_usd: number         // Saldo en USD
  total_collected: number     // Total cobrado histórico
  last_movement_at: timestamp
}
```

**Reglas de negocio**:
- ✅ Recibe honorarios **manualmente** desde la caja maestra
- ✅ El arquitecto decide **cuándo** y **cuánto** cobrar
- ✅ Puede realizar retiros para gastos personales
- ❌ **NO** recibe automáticamente ningún ingreso

### 3️⃣ **Cajas de Proyecto (Project Cash Box)**
📊 **Tabla**: `project_cash_box`

**Propósito**: Una caja por proyecto para tracking financiero específico.

**Campos clave**:
```typescript
{
  id: string
  project_id: string (FK)
  current_balance_ars: number
  current_balance_usd: number
  total_received_ars: number
  total_received_usd: number
  total_expenses_ars: number
  total_expenses_usd: number
  last_transaction_at: timestamp
}
```

**Reglas de negocio**:
- ✅ Recibe pagos del cliente
- ✅ Paga a proveedores/contratistas
- ✅ Balance independiente por proyecto
- ✅ Al recibir pago → se duplica automáticamente a caja maestra

---

## 💸 FLUJO DE EFECTIVO

### Flujo Principal: Pago de Cliente

```
1. Cliente paga cuota → Project Cash Box (+monto)
                      ↓
2. Duplicación automática → Master Cash Box (+monto)
                      ↓
3. Cobro manual de honorarios → Admin Cash (cuando el arquitecto decida)
```

**Implementación** (`CashBoxService.recordProjectIncome`):
```typescript
async recordProjectIncome(
  projectId: string,
  amount: number,
  description: string,
  installmentId?: string
): Promise<void> {
  // 1. Registra movimiento a project_cash_box
  // 2. Registra movimiento automático a master_cash_box (duplication)
  // 3. Actualiza balances de ambas cajas
  // 4. Valida límites de moneda
}
```

### Flujo Secundario: Pago a Proveedor

```
Project Cash Box (-monto) → Proveedor
        ↓
Master Cash Box (-monto) → Reflejo espejo
```

**Implementación** (`CashBoxService.recordProviderPayment`):
```typescript
async recordProviderPayment(
  projectId: string,
  amount: number,
  currency: 'ARS' | 'USD',
  description: string,
  contractorPaymentId?: string
): Promise<string> {
  // 1. Deduce de project_cash_box
  // 2. Deduce TAMBIÉN de master_cash_box (espejo)
  // 3. Registra ambos movimientos
  // 4. Valida fondos suficientes en ambas cajas
}
```

### Flujo de Honorarios

```
Master Cash Box (-monto) → Admin Cash (+monto)
```

**Implementación** (`CashBoxService.collectFees`):
```typescript
async collectFees(
  amount: number,
  reason: string,
  projectId?: string,
  projectIncomeBase?: number,
  percentageApplied?: number
): Promise<FeeCollection> {
  // 1. Valida saldo en master cash
  // 2. Crea movimiento de tipo 'fee_collection'
  // 3. Registra en fee_collections
  // 4. Actualiza balances master → admin
}
```

---

## 📊 GESTIÓN DE PROYECTOS

### Ciclo de Vida del Proyecto

**Tabla principal**: `projects`

**Estados**:
- `draft`: Borrador inicial
- `active`: Proyecto en ejecución
- `on_hold`: Pausado temporalmente
- `completed`: Finalizado exitosamente
- `cancelled`: Cancelado

### Creación de Proyecto

**Servicio**: `ProjectService.createProjectFromForm()`

**Flujo**:
```
1. Validar/crear cliente (findOrCreateClient)
2. Generar código único (PRY-2024-001, PRY-2024-002, etc.)
3. Crear registro de proyecto
4. Crear project_cash_box con balance 0
5. Generar installments si aplica
6. Crear installment 0 (anticipo) si hay down_payment
7. Auto-confirmar anticipo y procesar pago
8. Crear y liquidar honorarios administrativos automáticamente
```

**Reglas de negocio**:
- ✅ Un proyecto puede tener 0 o 1 cliente asociado
- ✅ Generación automática de código `PRY-YYYY-###`
- ✅ Creación atómica: proyecto + cash_box
- ✅ Anticipo se marca como pagado automáticamente
- ✅ Honorarios se liquidan inmediatamente tras confirmar anticipo
- ✅ Soft delete: proyectos nunca se eliminan físicamente

### Sistema de Cuotas (Installments)

**Tabla**: `installments`

**Tipos de cuotas**:
- **Cuota 0**: Anticipo (down payment)
- **Cuotas 1-N**: Pagos regulares

**Campos clave**:
```typescript
{
  id: string
  project_id: string (FK)
  installment_number: number  // 0 = anticipo
  amount: number
  due_date: date
  status: 'pending' | 'paid' | 'overdue'
  paid_amount: number
  paid_date: timestamp
  late_fee_applied: number
}
```

**Frecuencias de pago**:
- `monthly`: Mensual
- `biweekly`: Quincenal
- `weekly`: Semanal
- `quarterly`: Trimestral

**Generación automática** (`ProjectService.generateInstallments`):
```typescript
// Calcula fechas de vencimiento basadas en frecuencia
// Divide monto restante entre número de cuotas
// Crea registros en installments
```

### Pagos de Cuotas

**Tabla**: `payments`

Cada installment puede tener múltiples payments (pagos parciales).

**Flujo de pago**:
```
1. Cliente realiza pago
2. Se registra en payments
3. Se actualiza installment.paid_amount
4. Si paid_amount >= amount → status = 'paid'
5. Se procesa en cash boxes (project + master)
6. Se calculan y liquidan honorarios si corresponde
```

---

## 👥 GESTIÓN DE CLIENTES

**Tabla**: `clients`

**Servicio**: `ClientService`

### Funcionalidades Clave

**1. Búsqueda inteligente** (`searchClients`):
```typescript
// Búsqueda por: name, email, phone, tax_id
// Búsqueda fuzzy con trigram matching
```

**2. Prevención de duplicados** (`findOrCreateClient`):
```typescript
// 1. Busca por email (identificador único)
// 2. Si no existe, busca por nombre (case-insensitive)
// 3. Si existe, retorna existente
// 4. Si no existe, crea nuevo
```

**3. Estadísticas**:
- Total de proyectos
- Proyectos activos
- Ingresos totales (ARS y USD separados)

**Reglas de negocio**:
- ✅ Un cliente puede tener múltiples proyectos
- ✅ Email es identificador único preferido
- ✅ Validación de duplicados al crear proyectos
- ✅ Soft delete si no tiene proyectos activos

---

## 🏢 GESTIÓN DE PROVEEDORES Y CONTRATISTAS

### Arquitectura

**Tablas principales**:
- `providers`: Catálogo de proveedores
- `project_contractors`: Asignación proveedor-proyecto
- `contractor_budgets`: Presupuestos detallados
- `contractor_payments`: Pagos realizados

### Relación Proveedor-Proyecto

**Servicio**: `ProjectContractorService`

**Campos clave** (`project_contractors`):
```typescript
{
  id: string
  project_id: string (FK)
  contractor_id: string (FK providers)
  budget_amount: number        // Presupuesto total
  progress_percentage: number  // Avance 0-100
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  start_date: date
  expected_end_date: date
}
```

### Presupuestos Detallados

**Tabla**: `contractor_budgets`

Permite dividir el presupuesto total en ítems específicos:

```typescript
{
  id: string
  project_contractor_id: string (FK)
  item_description: string
  quantity: number
  unit_price: number
  total_amount: number  // quantity * unit_price
  category: string      // "materiales", "mano_obra", etc.
}
```

### Pagos a Contratistas

**Tabla**: `contractor_payments`

**Campos clave**:
```typescript
{
  id: string
  project_contractor_id: string (FK)
  amount: number
  currency: 'ARS' | 'USD'
  status: 'pending' | 'paid' | 'overdue'
  due_date: date
  paid_date: timestamp
  payment_method: string
  progress_percentage: number  // % completado al pagar
  cash_movement_id: string (FK) // Vinculación con movimiento de caja
}
```

**Flujo de pago**:
```
1. Contratista completa trabajo (actualizar progress)
2. Crear contractor_payment con status 'pending'
3. Marcar como paid y especificar método de pago
4. CashBoxService.recordProviderPayment():
   - Deduce de project_cash_box
   - Deduce de master_cash_box (espejo)
   - Crea cash_movement vinculado
```

### Resumen Financiero

**Vista**: `contractor_financial_summary`

Calculada dinámicamente por `ProjectContractorService.getByProjectId()`:

```typescript
{
  budget_amount: number           // Del budget_items
  total_paid: number             // Suma de payments status='paid'
  total_pending: number          // Suma de payments status='pending'
  balance_due: number            // budget - total_paid
  payment_progress_percentage: number  // (total_paid / budget) * 100
  total_payments: number         // Cantidad de pagos
  overdue_payments: number       // Cantidad de pagos vencidos
  next_payment_due_date: date   // Próximo pago pendiente
  next_payment_amount: number
}
```

---

## 💼 SISTEMA DE INVERSORES

### Arquitectura

**Tablas**:
- `investors`: Catálogo de inversores
- `project_investors`: Relación proyecto-inversor
- `investor_installments`: Cuotas de devolución

### Inversión en Proyectos

**Tabla**: `project_investors`

**Campos clave**:
```typescript
{
  id: string
  project_id: string (FK)
  investor_id: string (FK)
  investment_type: 'cash' | 'property' | 'service'

  // Inversión en efectivo
  investment_amount_ars: number
  investment_amount_usd: number

  // Inversión en especie
  estimated_value_ars: number
  estimated_value_usd: number

  // Términos de devolución
  return_percentage: number      // % de ganancia acordada
  return_amount_ars: number      // Monto a devolver ARS
  return_amount_usd: number      // Monto a devolver USD
  installments_count: number     // Cuotas de pago

  status: 'active' | 'completed' | 'cancelled'
}
```

### Contribuciones de Capital

**IMPORTANTE**: Las inversiones NO se duplican a master_cash

**Flujo** (`CashBoxService.registerInvestorContribution`):
```
1. Inversor aporta capital
2. Se registra en project_cash_box SOLAMENTE
3. NO se duplica a master_cash (es capital, no ingreso de cliente)
4. Se crea cash_movement tipo 'investor_contribution'
5. Se registra en project_investors
```

**Reglas de negocio**:
- ✅ Inversión es capital, no ingreso por servicios
- ❌ NO genera honorarios automáticos
- ❌ NO se duplica a master cash
- ✅ Incrementa fondos disponibles del proyecto

### Cuotas de Devolución

**Tabla**: `investor_installments`

Similar a installments de clientes, pero para devolver inversión + ganancia:

```typescript
{
  id: string
  project_investor_id: string (FK)
  installment_number: number
  amount_ars: number
  amount_usd: number
  due_date: date
  status: 'pending' | 'paid' | 'overdue'
  paid_date: timestamp
}
```

---

## 💳 SISTEMA DE HONORARIOS ADMINISTRATIVOS

**Tabla**: `administrator_fees`

**Servicio**: `AdministratorFeeService`

### Configuración de Honorarios

**Niveles de configuración**:

1. **Global** (studio_settings):
```typescript
setting_key: 'admin_fee_percentage'
setting_value: 15  // 15% por defecto
```

2. **Por proyecto** (projects.admin_fee_percentage):
```typescript
admin_fee_type: 'percentage' | 'fixed' | 'none'
admin_fee_percentage: number  // Sobrescribe global
admin_fee_amount: number      // Si es fixed
```

### Creación y Liquidación

**Campos clave**:
```typescript
{
  id: string
  project_id: string (FK)
  installment_id: string (FK) // Vincula fee con pago específico
  fee_percentage: number
  amount: number
  currency: 'ARS' | 'USD'
  status: 'pending' | 'collected' | 'cancelled'
  collected_at: timestamp
  collected_amount: number
}
```

**Flujo automático**:
```
1. Cliente paga cuota
2. Se crea administrator_fee automáticamente
3. Se calcula monto según % configurado
4. Se liquida inmediatamente (collectAdminFee):
   - Deduce de master_cash_box
   - Acredita en admin_cash
   - Crea cash_movement
   - Crea financial_transaction (tracking)
   - Marca fee como 'collected'
```

### Cálculo de Honorarios

**Método**: `AdministratorFeeService.calculateAdminFee()`

```typescript
// Ejemplo: Pago de $100,000 con fee 15%
const payment = 100000;
const feePercentage = 15;
const adminFee = (payment * feePercentage) / 100;
// adminFee = $15,000
```

---

## 🔄 SISTEMA DE MOVIMIENTOS DE CAJA

**Tabla central**: `cash_movements`

**Propósito**: Trazabilidad completa de todos los flujos financieros.

### Tipos de Movimientos

```typescript
movement_type:
  | 'project_income'        // Ingreso de cliente a project cash
  | 'master_duplication'    // Duplicación automática a master
  | 'fee_collection'        // Cobro de honorarios master → admin
  | 'expense'               // Gasto desde cualquier caja
  | 'investor_contribution' // Aporte de inversor
  | 'admin_withdrawal'      // Retiro del arquitecto
  | 'currency_conversion'   // Conversión ARS ↔ USD
  | 'inter_project_loan'    // Préstamo entre proyectos
```

### Estructura de Movimiento

```typescript
{
  id: string
  movement_type: string

  // Origen
  source_type: 'master' | 'admin' | 'project' | 'external' | 'investor_contribution'
  source_id: string | null

  // Destino
  destination_type: 'master' | 'admin' | 'project' | 'external' | 'project_cash_box'
  destination_id: string | null

  // Monto y moneda
  amount: number
  currency: 'ARS' | 'USD'
  exchange_rate: number  // Para conversiones

  // Contexto
  description: string
  project_id: string | null
  installment_id: string | null
  fee_collection_id: string | null

  // Snapshots de balance (auditoría)
  balance_before_ars: number
  balance_after_ars: number
  balance_before_usd: number
  balance_after_usd: number

  metadata: JSON  // Información adicional
  created_at: timestamp
}
```

### Ejemplos de Movimientos

**1. Pago de cliente**:
```typescript
// Movimiento 1: External → Project
{
  movement_type: 'project_income',
  source_type: 'external',
  destination_type: 'project',
  destination_id: 'project_cash_box_id',
  amount: 50000,
  currency: 'ARS',
  project_id: 'project_id'
}

// Movimiento 2: External → Master (automático)
{
  movement_type: 'master_duplication',
  source_type: 'external',
  destination_type: 'master',
  destination_id: 'master_cash_id',
  amount: 50000,
  currency: 'ARS',
  project_id: 'project_id'
}
```

**2. Cobro de honorarios**:
```typescript
{
  movement_type: 'fee_collection',
  source_type: 'master',
  source_id: 'master_cash_id',
  destination_type: 'admin',
  destination_id: 'admin_cash_id',
  amount: 7500,  // 15% de 50000
  currency: 'ARS',
  fee_collection_id: 'fee_id',
  project_id: 'project_id'
}
```

**3. Pago a proveedor**:
```typescript
// Movimiento 1: Project → External
{
  movement_type: 'expense',
  source_type: 'project',
  source_id: 'project_cash_box_id',
  destination_type: 'external',
  amount: 30000,
  currency: 'ARS',
  project_id: 'project_id',
  metadata: { contractor_payment_id: 'payment_id' }
}

// Movimiento 2: Master → External (espejo)
{
  movement_type: 'expense',
  source_type: 'master',
  source_id: 'master_cash_id',
  destination_type: 'external',
  amount: 30000,
  currency: 'ARS',
  project_id: 'project_id',
  metadata: {
    contractor_payment_id: 'payment_id',
    mirrored_from_project: true
  }
}
```

---

## 💱 SOPORTE MULTI-MONEDA

### Arquitectura

**Monedas soportadas**: ARS (Peso Argentino), USD (Dólar)

**Separación de balances**:
- Cada caja tiene campos `balance_ars` y `balance_usd`
- Movimientos especifican `currency`
- Conversiones se registran explícitamente

### Validación de Montos

**Utilidades** (`src/utils/validation.ts`):

```typescript
// Prevención de overflow en PostgreSQL numeric(15,2)
function isValidCurrencyAmount(amount: number): boolean {
  const MAX = 9999999999999.99;
  return amount >= 0 && amount <= MAX;
}

function sanitizeCurrencyAmount(amount: number): number {
  return Math.round(amount * 100) / 100; // 2 decimales
}

function getCurrencyOverflowError(amount: number): string {
  return `Monto excede el límite: ${amount}`;
}
```

**Aplicación**:
- ✅ Validación en TODOS los servicios antes de operaciones
- ✅ Sanitización de montos antes de inserción
- ✅ Errores descriptivos si se exceden límites

### Conversión de Moneda

**Tabla**: `currency_conversions`

**Campos**:
```typescript
{
  id: string
  from_currency: 'ARS' | 'USD'
  from_amount: number
  to_currency: 'ARS' | 'USD'
  to_amount: number
  exchange_rate: number
  exchange_rate_source: 'blue' | 'oficial' | 'mep' | 'ccl'
  outbound_movement_id: string  // Movimiento de salida
  inbound_movement_id: string   // Movimiento de entrada
  notes: string
  created_at: timestamp
}
```

**Flujo de conversión**:
```
1. Usuario solicita conversión ARS → USD
2. Se obtiene tipo de cambio (exchange_rate_source)
3. Se calcula to_amount = from_amount / exchange_rate
4. Se crea movimiento salida (ARS -)
5. Se crea movimiento entrada (USD +)
6. Se registra conversion vinculando ambos movimientos
```

---

## 📝 CONTRATOS Y DOCUMENTACIÓN

### Generación de Contratos PDF

**Servicios**:
- `ContractPdfService`: Generación de PDF
- `ContractStorageService`: Almacenamiento en Supabase Storage

### Campos de Proyecto para Contratos

**Metadata del proyecto**:
```typescript
{
  propertyAddress: string      // Dirección de la obra
  propertyType: string         // Tipo de propiedad
  city: string
  zipCode: string
  contractNotes: string        // Notas legales
  paymentTerms: string         // Términos de pago
  specialConditions: string    // Condiciones especiales
  projectPhases: Array<{       // Fases del proyecto
    name: string
    description: string
    durationDays: number
  }>
}
```

### Firmas Digitales

**Tabla**: `contract_signatures`

```typescript
{
  id: string
  project_id: string (FK)
  signer_type: 'client' | 'architect'
  signer_name: string
  signature_data: string  // Base64 de la firma
  signed_at: timestamp
  ip_address: string
}
```

**Flujo**:
```
1. Se genera PDF del contrato
2. Cliente y arquitecto firman digitalmente
3. Se almacenan firmas en contract_signatures
4. Se genera PDF final con ambas firmas
5. Se almacena en Supabase Storage
```

---

## 🔒 VALIDACIONES Y REGLAS DE NEGOCIO

### Validaciones Críticas

**1. Balance suficiente**:
```typescript
// Antes de CUALQUIER egreso
if (currentBalance < amount) {
  throw new Error('Fondos insuficientes');
}
```

**2. Límites de moneda**:
```typescript
if (!isValidCurrencyAmount(amount)) {
  throw new Error(getCurrencyOverflowError(amount));
}
```

**3. Duplicación automática**:
```typescript
// SIEMPRE que project_cash recibe dinero:
1. Registrar en project_cash_box
2. Registrar en master_cash_box (OBLIGATORIO)
```

**4. Honorarios automáticos**:
```typescript
// Al confirmar anticipo O al pagar cuota:
if (project.admin_fee_type !== 'none') {
  1. Calcular fee según % o monto fijo
  2. Crear administrator_fee
  3. Liquidar inmediatamente
}
```

### Integridad Referencial

**Cascadas y restricciones**:
- Proyecto eliminado → Soft delete (`deleted_at`)
- Cliente con proyectos → No se puede eliminar
- Inversor con proyectos activos → No se puede eliminar
- Cash movements → NUNCA se eliminan (auditoría)

---

## 📊 VISTAS Y REPORTES

### Vistas de Base de Datos

**`contractor_financial_summary`**:
- Resumen financiero por contratista
- Calculado desde contractor_payments
- Usado por ProjectContractorService

### Cálculos Dinámicos

**Progreso de proyecto**:
```typescript
async calculateProgress(projectId: string): Promise<{
  totalPaid: number
  totalPending: number
  percentageComplete: number
}> {
  const installments = await getInstallments(projectId);
  const totalPaid = sum(installments.paid_amount);
  const totalProject = project.total_amount;
  const percentage = (totalPaid / totalProject) * 100;

  return { totalPaid, totalPending, percentageComplete: percentage };
}
```

**Resumen financiero global**:
```typescript
{
  masterBalanceArs: number    // Balance master ARS
  masterBalanceUsd: number    // Balance master USD
  adminBalance: number        // Balance arquitecto
  totalProjectsBalance: number // Suma proyectos
  totalSystemBalance: number  // SOLO master (no duplicar)
}
```

---

## 🔄 PRÉSTAMOS ENTRE PROYECTOS

**Tablas**:
- `inter_project_loans`: Registro de préstamos
- `master_loans`: Préstamos desde caja maestra

### Inter-Project Loans

```typescript
{
  id: string
  lender_project_id: string (FK)   // Proyecto que presta
  borrower_project_id: string (FK) // Proyecto que pide
  amount: number
  currency: 'ARS' | 'USD'
  interest_rate: number            // % de interés
  status: 'active' | 'repaid' | 'defaulted'
  repayment_date: date
  repaid_date: timestamp
  notes: string
}
```

**Flujo**:
```
1. Proyecto A tiene excedente
2. Proyecto B necesita fondos
3. Se crea inter_project_loan
4. Se deduce de project_cash_box A
5. Se acredita en project_cash_box B
6. Al pagar, se devuelve con interés
```

### Master Loans

Préstamos desde la caja maestra a proyectos:

```typescript
{
  id: string
  project_id: string (FK)
  amount: number
  currency: 'ARS' | 'USD'
  interest_rate: number
  loan_date: date
  due_date: date
  status: 'active' | 'repaid' | 'overdue'
  repaid_amount: number
  notes: string
}
```

---

## 🎯 CONFIGURACIÓN DEL ESTUDIO

**Tabla**: `studio_settings`

**Campos clave**:
```typescript
{
  id: string
  setting_key: string          // 'admin_fee_percentage', etc.
  setting_value: JSON          // Valor dinámico
  setting_type: 'string' | 'number' | 'boolean' | 'json' | 'percentage'
  display_name: string         // Nombre para UI
  description: string
  category: string             // Agrupación
  is_editable: boolean
  validation_rules: JSON       // Reglas de validación
}
```

**Configuraciones importantes**:
- `admin_fee_percentage`: % de honorarios por defecto
- `default_currency`: Moneda principal del estudio
- `enable_multi_currency`: Activar soporte USD
- `late_fee_percentage`: Recargo por mora
- `grace_period_days`: Días de gracia antes de mora

---

## 🔐 SEGURIDAD Y AUDITORÍA

### Row Level Security (RLS)

**Todas las tablas** tienen RLS habilitado:
- Usuarios solo acceden a sus propios datos
- Filtrado automático por `architect_id` o `organization_id`
- Políticas en Supabase para INSERT/UPDATE/DELETE

### Balance Snapshots

**Auditoría de balances**:
```typescript
// En cash_movements se guardan:
balance_before_ars: number  // Balance ANTES del movimiento
balance_after_ars: number   // Balance DESPUÉS del movimiento
balance_before_usd: number
balance_after_usd: number
```

**Propósito**:
- ✅ Trazabilidad completa de cambios
- ✅ Detección de discrepancias
- ✅ Auditoría fiscal

### Soft Delete

**Proyectos**:
- Campo `deleted_at: timestamp | null`
- Proyectos nunca se eliminan físicamente
- Preserva historial financiero completo

---

## 📈 MÉTRICAS Y KPIs

### Métricas de Proyecto

```typescript
interface ProjectMetrics {
  totalAmount: number          // Valor total
  paidAmount: number           // Pagado hasta ahora
  pendingAmount: number        // Falta por pagar
  progressPercentage: number   // % completado
  nextPaymentDate: date        // Próximo vencimiento
  nextPaymentAmount: number    // Monto próximo pago
  daysUntilNextPayment: number // Días restantes
}
```

### Métricas del Estudio

```typescript
interface StudioMetrics {
  monthlyIncome: number        // Ingresos del mes
  monthlyFees: number          // Honorarios cobrados
  monthlyProjects: number      // Proyectos iniciados
  activeProjects: number       // Proyectos activos
  totalRevenue: number         // Ingresos acumulados
  availableFees: number        // Honorarios disponibles
}
```

---

## 🚀 FLUJOS COMPLETOS DE NEGOCIO

### Flujo 1: Crear Proyecto con Cliente Nuevo

```
1. Usuario llena wizard de proyecto
2. ClientService.findOrCreateClient():
   - Busca por email
   - Si no existe, busca por nombre
   - Si no existe, crea nuevo cliente
3. ProjectService.createProjectFromForm():
   - Genera código PRY-2024-XXX
   - Crea registro en projects
   - Crea project_cash_box (balance 0)
   - Genera installments
   - Crea installment 0 (anticipo) como paid
   - Procesa pago de anticipo:
     * Acredita en project_cash_box
     * Duplica a master_cash_box
     * Calcula honorarios (% configurado)
     * Liquida honorarios a admin_cash
4. Retorna proyecto completo con métricas
```

### Flujo 2: Pagar Cuota de Proyecto

```
1. Usuario marca cuota como pagada
2. InstallmentService.markAsPaid():
   - Actualiza installment.status = 'paid'
   - Registra paid_date y paid_amount
3. CashBoxService.processProjectPayment():
   - Acredita en project_cash_box
   - Duplica automáticamente a master_cash_box
   - Crea 2 cash_movements
4. AdministratorFeeService.createAdminFee():
   - Calcula fee según % del proyecto
   - Crea administrator_fee
5. AdministratorFeeService.collectAdminFee():
   - Deduce de master_cash_box
   - Acredita en admin_cash
   - Crea cash_movement
   - Crea financial_transaction
   - Marca fee como collected
6. Actualiza métricas de progreso del proyecto
```

### Flujo 3: Pagar a Contratista

```
1. Usuario crea contractor_payment
2. Marca como paid con método de pago
3. CashBoxService.recordProviderPayment():
   - Valida fondos en project_cash_box (currency)
   - Valida fondos en master_cash_box (currency)
   - Deduce de project_cash_box
   - Deduce de master_cash_box (espejo)
   - Crea 2 cash_movements vinculados
4. Actualiza contractor_payment.cash_movement_id
5. Actualiza progress_percentage del contratista
6. Recalcula financial_summary del contratista
```

### Flujo 4: Cobrar Honorarios Manualmente

```
1. Arquitecto decide cobrar honorarios
2. MasterCashService.collectFees():
   - Valida saldo en master_cash (por currency)
   - Calcula fee si no se especifica
   - Crea cash_movement tipo 'fee_collection'
   - Crea fee_collection record
   - Deduce de master_cash
   - Acredita en admin_cash
   - Crea financial_transaction para tracking
3. Actualiza balances y timestamps
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. **Duplicación Master ≠ Sumar Proyectos**

```
❌ INCORRECTO:
totalSystemBalance = masterBalance + sum(projectBalances)
// Esto cuenta el dinero dos veces!

✅ CORRECTO:
totalSystemBalance = masterBalance
// Master ya contiene los duplicados de proyectos
```

### 2. **Inversores NO son Clientes**

```
Cliente paga → project_cash + master_cash (duplicado)
Inversor aporta → project_cash SOLAMENTE
// Inversión es capital, no ingreso por servicios
```

### 3. **Honorarios Automáticos**

```
// Al confirmar pago:
1. Se acredita en cajas
2. Se calcula fee (% proyecto o global)
3. Se liquida INMEDIATAMENTE
// No hay "pending" fees en flujo normal
```

### 4. **Soft Delete Obligatorio**

```
// NUNCA hacer:
await supabase.from('projects').delete().eq('id', projectId)

// SIEMPRE hacer:
await supabase.from('projects').update({
  deleted_at: new Date().toISOString()
}).eq('id', projectId)
```

### 5. **Validación de Montos**

```typescript
// SIEMPRE antes de operaciones monetarias:
if (!isValidCurrencyAmount(amount)) {
  throw new Error(getCurrencyOverflowError(amount));
}
const sanitized = sanitizeCurrencyAmount(amount);
// Usar 'sanitized' en operaciones
```

---

## 📚 RESUMEN DE SERVICIOS PRINCIPALES

| Servicio | Propósito | Métodos Clave |
|----------|-----------|---------------|
| `BaseService` | CRUD genérico | `getAll`, `getById`, `create`, `update`, `delete` |
| `ProjectService` | Gestión proyectos | `createProjectFromForm`, `generateInstallments`, `calculateProgress` |
| `CashBoxService` | Triple caja | `recordProjectIncome`, `collectFees`, `recordProviderPayment` |
| `MasterCashService` | Caja maestra | `getMasterCashData`, `collectFees`, `getFinancialSummary` |
| `AdminCashService` | Caja admin | `getAdminCashData`, `withdrawFunds`, `getMonthlyStats` |
| `ClientService` | Clientes | `searchClients`, `findOrCreateClient`, `getAllClientsWithProjects` |
| `InvestorService` | Inversores | `findOrCreateInvestor`, `getAllInvestorsWithStats` |
| `ProjectContractorService` | Contratistas | `getByProjectId`, `getFinancialSummary`, `updateProgress` |
| `AdministratorFeeService` | Honorarios | `createAdminFee`, `collectAdminFee`, `getPendingAdminFees` |

---

## 🎓 GLOSARIO DE TÉRMINOS

- **Triple Caja**: Sistema de tres cajas independientes (Master, Admin, Project)
- **Duplicación**: Copia automática de ingresos de project a master
- **Espejo**: Reflejo de egresos de project en master
- **Honorarios**: Fees del arquitecto cobrados desde master a admin
- **Anticipo**: Down payment (installment 0)
- **Cuota**: Installment regular (1-N)
- **Soft Delete**: Eliminación lógica con timestamp
- **RLS**: Row Level Security (seguridad de filas)
- **Cash Movement**: Registro de movimiento de efectivo
- **Financial Summary**: Resumen financiero calculado
- **Multi-Currency**: Soporte ARS y USD simultáneo
- **Sanitization**: Limpieza y redondeo de montos
- **Overflow**: Exceder límite de campo numérico

---

**Documento generado**: 2024
**Versión**: 1.0
**Sistema**: Nivexa Financial Management
**Última actualización**: Análisis completo de código fuente
