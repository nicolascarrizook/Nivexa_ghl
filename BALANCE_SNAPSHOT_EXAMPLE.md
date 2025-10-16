# Balance Snapshot - Ejemplo Visual

## Problema Anterior ❌

Antes solo veías:

| Fecha | Tipo | Descripción | Monto |
|-------|------|-------------|-------|
| 16/10 | Préstamo | Préstamo MLN-2025-001 - Casa bunker | USD 20,000 |

**Problema:** No sabes cuánto tenías antes ni cuánto quedó después.

---

## Solución Nueva ✅

Ahora verás el historial completo como un estado de cuenta bancario:

| Fecha | Tipo | Descripción | **Saldo Anterior** | Monto | **Saldo Nuevo** |
|-------|------|-------------|-------------------|-------|----------------|
| 16/10 | Préstamo | Préstamo MLN-2025-001 - Casa bunker | **USD 52,000.00** | -USD 20,000 | **USD 32,000.00** |
| 14/10 | Conversión | Conversión USD → ARS | **ARS 50,000.00** | +ARS 9,000 | **ARS 59,000.00** |
| 13/10 | Ingreso | Pago anticipo - Proyecto XYZ | **USD 30,000.00** | +USD 22,000 | **USD 52,000.00** |

---

## Ejemplo Real: Préstamo Master → Proyecto

### Vista de Caja Master (origen)

| Descripción | Saldo Anterior | Monto | Saldo Nuevo |
|-------------|----------------|-------|-------------|
| Préstamo a Casa Bunker | USD 52,000.00 | **-USD 20,000** | **USD 32,000.00** |

✅ Puedes ver claramente que la Caja Master **bajó** de USD 52k a USD 32k

### Vista de Caja Proyecto (destino)

| Descripción | Saldo Anterior | Monto | Saldo Nuevo |
|-------------|----------------|-------|-------------|
| Préstamo recibido de Master | USD 0.00 | **+USD 20,000** | **USD 20,000.00** |

✅ Puedes ver claramente que el Proyecto **subió** de USD 0 a USD 20k

---

## Casos Especiales

### Movimientos Históricos (antes de esta actualización)

| Descripción | Saldo Anterior | Monto | Saldo Nuevo |
|-------------|----------------|-------|-------------|
| Movimiento antiguo | **Sin datos** | USD 5,000 | **Sin datos** |

⚠️ Los movimientos creados ANTES de esta migración no tienen snapshots (no es posible reconstruirlos con exactitud)

### Nuevos Movimientos (después de esta actualización)

| Descripción | Saldo Anterior | Monto | Saldo Nuevo |
|-------------|----------------|-------|-------------|
| Nuevo préstamo | **USD 32,000.00** | -USD 10,000 | **USD 22,000.00** |

✅ Todos los movimientos nuevos tendrán snapshots completos automáticamente

---

## Beneficios

1. **Visibilidad Total:** Sabes exactamente cuánto tenías y cuánto quedó en cada operación
2. **Auditoría Perfecta:** Puedes reconstruir el historial completo de balances
3. **Detección de Errores:** Es fácil detectar si algún cálculo está mal
4. **Transparencia:** Como un estado de cuenta bancario profesional

---

## Implementación Técnica

### Base de Datos
```sql
ALTER TABLE cash_movements
ADD COLUMN balance_before_ars DECIMAL(15,2),
ADD COLUMN balance_after_ars DECIMAL(15,2),
ADD COLUMN balance_before_usd DECIMAL(15,2),
ADD COLUMN balance_after_usd DECIMAL(15,2);
```

### Servicio
```typescript
// Captura balances ANTES del movimiento
const balanceBefore = {
  ars: masterCash.balance_ars || 0,
  usd: masterCash.balance_usd || 0,
};

// Calcula balances DESPUÉS del movimiento
const balanceAfter = {
  ars: currency === 'ARS' ? balanceBefore.ars - amount : balanceBefore.ars,
  usd: currency === 'USD' ? balanceBefore.usd - amount : balanceBefore.usd,
};

// Guarda ambos en el movimiento
await supabase.from('cash_movements').insert({
  // ... otros campos
  balance_before_ars: balanceBefore.ars,
  balance_after_ars: balanceAfter.ars,
  balance_before_usd: balanceBefore.usd,
  balance_after_usd: balanceAfter.usd,
});
```

### Interfaz de Usuario
- Nueva columna "Saldo Anterior" (color gris)
- Nueva columna "Saldo Nuevo" (color verde, bold)
- Muestra "Sin datos" para movimientos históricos sin snapshots

---

## Verificación

Después de ejecutar la migración, prueba creando un nuevo préstamo y verifica que:

1. ✅ Se muestra el "Saldo Anterior" correcto
2. ✅ Se muestra el "Monto" del préstamo
3. ✅ Se muestra el "Saldo Nuevo" calculado correctamente
4. ✅ La fórmula es exacta: `Saldo Nuevo = Saldo Anterior - Monto` (para salidas)
5. ✅ Funciona para ambas monedas (ARS y USD)
