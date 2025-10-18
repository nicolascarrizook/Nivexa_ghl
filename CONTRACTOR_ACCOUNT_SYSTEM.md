# Sistema de Cuenta Corriente para Proveedores

## 📋 Descripción General

Sistema flexible de cuenta corriente que permite registrar pagos variables a proveedores según el avance del trabajo, sin necesidad de un cronograma fijo de cuotas como con los clientes.

## 🎯 Problema que Resuelve

Los proveedores no siempre se pagan en cuotas fijas. En lugar de eso, se les paga según el avance del trabajo:
- Primera vez: $10,000 (anticipo)
- Segunda vez: $5,900 (avance 30%)
- Tercera vez: $8,500 (avance 50%)
- etc.

Esto es fundamentalmente diferente al sistema de cuotas de clientes, donde el monto y las fechas están predeterminados.

## 🏗️ Arquitectura

### 1. Base de Datos

**Tabla**: `contractor_payments`

```sql
-- Campos existentes:
- payment_type: 'advance' | 'progress' | 'final' | 'adjustment'
- amount: DECIMAL(12,2)  -- Monto variable
- currency: VARCHAR  -- ARS o USD
- due_date: DATE  -- Opcional y flexible
- notes: TEXT  -- Descripción del pago

-- Campo NUEVO:
- progress_percentage: DECIMAL(5,2)  -- Opcional: % de avance (0-100)
```

**Características**:
- ✅ Pagos con montos variables
- ✅ Fechas flexibles (no cronograma fijo)
- ✅ Porcentaje de avance opcional
- ✅ Integración completa con sistema de cajas
- ✅ Trazabilidad mediante `movement_id`

### 2. Servicios (Backend)

**ContractorPaymentService**

**Método Principal**: `getAccountStatement(projectContractorId)`

Retorna:
```typescript
{
  contractor_id: string;
  contractor_name: string;
  budget_total: number;           // Presupuesto total
  total_paid: number;             // Total pagado hasta ahora
  pending_balance: number;        // Saldo pendiente
  currency: 'ARS' | 'USD';
  payment_history: Array<{        // Historial completo
    date: string;
    amount: number;
    payment_type: string;
    progress_percentage: number | null;
    notes: string | null;
    status: string;
  }>;
  last_payment_date: string | null;
  progress_percentage_total: number;  // Suma de % de avance
}
```

### 3. Hooks React

**useContractorAccountStatement(projectContractorId)**
- Integrado con React Query
- Auto-refresh cada 1 minuto
- Refetch al volver a la ventana
- Cache inteligente

### 4. Componentes UI

**ContractorAccountStatementCard**

Vista completa del estado de cuenta:

```
┌─────────────────────────────────────────┐
│ 💰 Estado de Cuenta                     │
│ Nombre del Proveedor                    │
├─────────────────────────────────────────┤
│                                         │
│  Presupuesto Total    Total Pagado     │
│  $50,000              $15,900          │
│                       31.8% del total   │
│                                         │
│  Saldo Pendiente                        │
│  $34,100                                │
│                                         │
├─────────────────────────────────────────┤
│  📅 Último pago: 15/01/2025            │
│  📈 Avance total registrado: 30%       │
├─────────────────────────────────────────┤
│  Historial de Pagos                    │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │ 15/01/2025  [Avance] [Pagado]  │  │
│  │ Avance: 30%                     │  │
│  │ Pago por estructura             │  │
│  │                         $5,900  │  │
│  └─────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │ 12/01/2025  [Anticipo] [Pagado]│  │
│  │ Anticipo inicial                │  │
│  │                        $10,000  │  │
│  └─────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## 🚀 Uso

### Registrar un Pago Variable

```typescript
import { contractorPaymentService } from '@/modules/providers/services';

// Pago por avance - monto variable según el trabajo realizado
await contractorPaymentService.create({
  project_contractor_id: contractorId,
  payment_type: 'progress',
  amount: 5900,  // Monto según avance real
  currency: 'ARS',
  progress_percentage: 30,  // Opcional: registrar el % de avance
  notes: 'Pago por avance de estructura',
  due_date: '2025-01-15'  // Opcional y flexible
});
```

### Mostrar Estado de Cuenta

```tsx
import { ContractorAccountStatementCard } from '@/modules/providers/components';

function ContractorView({ projectContractorId }) {
  return (
    <div>
      <ContractorAccountStatementCard
        projectContractorId={projectContractorId}
      />
    </div>
  );
}
```

### Consultar Estado de Cuenta Programáticamente

```typescript
import { useContractorAccountStatement } from '@/modules/providers/hooks';

function MyComponent({ projectContractorId }) {
  const { data: statement, isLoading, error } = useContractorAccountStatement(projectContractorId);

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>Total Pagado: ${statement.total_paid}</p>
      <p>Saldo Pendiente: ${statement.pending_balance}</p>
      <p>Avance Total: {statement.progress_percentage_total}%</p>
    </div>
  );
}
```

## 📍 Integración en la UI

El componente **ContractorAccountStatementCard** está integrado en:

1. **PaymentSection.tsx** → Modal de gestión de pagos
2. Ubicación: Después del resumen financiero general
3. Accesible desde: Modal "Gestionar Pagos" de cualquier proveedor

**Flujo de Usuario**:
1. Usuario abre proyecto
2. Navega a sección de Proveedores
3. Click en "Gestionar Pagos" de un proveedor
4. Ve el estado de cuenta completo + lista de trabajos y pagos

## 🔄 Integración con Sistema de Cajas

**Flujo automático al marcar pago como pagado**:

```
1. Usuario marca pago como "Pagado"
   ↓
2. Sistema valida fondos suficientes en:
   - project_cash_box
   - master_cash_box
   ↓
3. Sistema registra movimiento en cash_movements
   ↓
4. Sistema deduce automáticamente de ambas cajas
   ↓
5. Sistema vincula pago con movimiento (movement_id)
   ↓
6. Estado de cuenta se actualiza en tiempo real
```

## 🎨 Características Visuales

- **Multi-moneda**: Soporte completo ARS y USD
- **Estados con color**:
  - Verde: Pagos completados
  - Naranja: Pendientes
  - Rojo: Vencidos
- **Badges descriptivos**: Tipo de pago (Anticipo, Avance, Final)
- **Responsive**: Adaptable a móvil y desktop
- **Iconos informativos**: Wallet, Calendar, TrendingUp

## 📊 Diferencias con Sistema de Cuotas de Clientes

| Aspecto | Clientes (Installments) | Proveedores (Cuenta Corriente) |
|---------|-------------------------|-------------------------------|
| Cronograma | ✅ Fijo, predeterminado | ❌ Flexible, según avance |
| Montos | ✅ Fijos por cuota | ✅ Variables por pago |
| Fechas | ✅ Generadas automáticamente | ✅ Definidas manualmente |
| Frecuencia | ✅ Mensual, quincenal, etc. | ❌ Sin frecuencia fija |
| % Avance | ❌ No aplica | ✅ Opcional por pago |

## 🔍 Testing

### Verificar Migración

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'contractor_payments'
  AND column_name = 'progress_percentage';
```

### Test Manual

1. Crear proyecto con proveedor
2. Registrar pago de $10,000 (anticipo)
3. Ver estado de cuenta: debe mostrar $10,000 pagado
4. Registrar pago de $5,900 con 30% avance
5. Ver estado de cuenta actualizado:
   - Total pagado: $15,900
   - Avance total: 30%
   - Historial: 2 pagos listados

## 📝 Notas Técnicas

- El campo `progress_percentage` es completamente opcional
- Los pagos sin `progress_percentage` son válidos y normales
- El sistema suma los porcentajes de avance registrados (no necesariamente suma 100%)
- La moneda se hereda de la configuración del `project_contractor`
- Los pagos se vinculan opcionalmente con `budget_items` para organización

## 🎯 Próximas Mejoras Sugeridas

- [ ] Reportes de avance por proveedor
- [ ] Gráfico de progreso vs. pagos
- [ ] Alertas de pagos pendientes
- [ ] Exportación de estado de cuenta a PDF
- [ ] Historial de cambios (audit log)
- [ ] Comparativa presupuestado vs. real

## 📚 Referencias

- Servicio: `src/modules/providers/services/ContractorPaymentService.ts`
- Hook: `src/modules/providers/hooks/useContractorAccountStatement.ts`
- Componente: `src/modules/providers/components/ContractorAccountStatementCard.tsx`
- Migración: `supabase/migrations/20250117_add_progress_percentage_to_contractor_payments.sql`
- Instrucciones: `MIGRATION_INSTRUCTIONS.md`
