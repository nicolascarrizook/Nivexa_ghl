# Instrucciones de Migración - Progress Percentage

## Migración a aplicar

Esta migración agrega el campo `progress_percentage` a la tabla `contractor_payments` para permitir el registro opcional del porcentaje de avance en cada pago.

## Pasos para aplicar la migración

### Opción 1: Supabase Dashboard (Recomendado)

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Navega a **SQL Editor** en el menú lateral
4. Copia y pega el siguiente SQL:

```sql
-- Add progress_percentage field to contractor_payments
-- Allows tracking progress percentage for each payment (optional)

ALTER TABLE contractor_payments
ADD COLUMN progress_percentage DECIMAL(5,2) NULL;

-- Add comment explaining the field
COMMENT ON COLUMN contractor_payments.progress_percentage IS
'Optional percentage of work completed at time of payment (e.g., 30.00 for 30%)';

-- Add check constraint to ensure valid percentage range
ALTER TABLE contractor_payments
ADD CONSTRAINT check_progress_percentage_range
CHECK (progress_percentage IS NULL OR (progress_percentage >= 0 AND progress_percentage <= 100));

-- Create index for querying by progress
CREATE INDEX idx_contractor_payments_progress
ON contractor_payments(progress_percentage)
WHERE progress_percentage IS NOT NULL;
```

5. Haz clic en **Run** para ejecutar la migración

### Opción 2: Archivo de Migración

El archivo de migración completo está disponible en:
```
supabase/migrations/20250117_add_progress_percentage_to_contractor_payments.sql
```

## Verificación

Para verificar que la migración se aplicó correctamente, ejecuta:

```sql
-- Verificar que la columna existe
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'contractor_payments'
  AND column_name = 'progress_percentage';

-- Verificar que el constraint existe
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'check_progress_percentage_range';

-- Verificar que el índice existe
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'contractor_payments'
  AND indexname = 'idx_contractor_payments_progress';
```

## Actualización de tipos TypeScript

Después de aplicar la migración, regenera los tipos TypeScript de Supabase:

```bash
# Si tienes Supabase CLI configurado
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

## Uso

Una vez aplicada la migración, puedes registrar pagos con porcentaje de avance:

```typescript
await contractorPaymentService.create({
  project_contractor_id: contractorId,
  payment_type: 'progress',
  amount: 5900,
  currency: 'ARS',
  progress_percentage: 30, // Opcional: 30% de avance
  notes: 'Pago por avance de estructura'
});
```

## Rollback (si es necesario)

Si necesitas revertir la migración:

```sql
-- Eliminar índice
DROP INDEX IF EXISTS idx_contractor_payments_progress;

-- Eliminar constraint
ALTER TABLE contractor_payments
DROP CONSTRAINT IF EXISTS check_progress_percentage_range;

-- Eliminar columna
ALTER TABLE contractor_payments
DROP COLUMN IF EXISTS progress_percentage;
```
