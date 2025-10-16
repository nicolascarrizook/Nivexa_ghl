# Guía de Limpieza de Base de Datos

Antes de la demo, necesitas limpiar los datos de prueba. Tienes 2 opciones según qué tan profunda quieras la limpieza.

## 🔵 Opción 1: Limpieza Básica (Recomendada)

**Archivo:** `20251016_clean_test_data.sql`

### ✅ Qué Elimina:
- ✅ Todos los movimientos de caja
- ✅ Todos los préstamos y cuotas
- ✅ Resetea balances a $0

### ❌ Qué NO Elimina:
- ❌ Proyectos (los mantiene)
- ❌ Clientes
- ❌ Cuotas de proyectos
- ❌ Pagos de proyectos
- ❌ Contratistas

### 📊 Resultado:
```
Proyectos: ✅ Mantenidos (con datos intactos)
Clientes: ✅ Mantenidos
Cajas: 🔄 Reseteadas a $0
Movimientos: 🗑️ Eliminados
Préstamos: 🗑️ Eliminados
```

### 🎯 Úsalo Si:
- Quieres mantener los proyectos pero limpiar el historial financiero
- Necesitas probar flujos de caja desde cero
- Quieres conservar la estructura de proyectos

---

## 🔴 Opción 2: Limpieza Completa (Destructiva)

**Archivo:** `20251016_full_clean_with_projects.sql`

### ✅ Qué Elimina:
- ✅ Todos los movimientos de caja
- ✅ Todos los préstamos y cuotas
- ✅ Todos los proyectos (soft delete)
- ✅ Todas las cuotas de proyectos
- ✅ Todos los pagos
- ✅ Todos los contratistas
- ✅ Resetea balances a $0

### ❌ Qué NO Elimina:
- ❌ Clientes (los mantiene para crear nuevos proyectos)

### 📊 Resultado:
```
Proyectos: 🗑️ Eliminados (soft delete)
Clientes: ✅ Mantenidos
Cajas: 🔄 Reseteadas a $0
TODO lo demás: 🗑️ Eliminado
```

### 🎯 Úsalo Si:
- Quieres empezar 100% desde cero
- Los proyectos de prueba no son útiles
- Necesitas una demo con proyectos nuevos

---

## 📋 Pasos para Ejecutar

### 1. Decidir Qué Limpieza Usar

**Limpieza Básica:**
```bash
Conserva proyectos, solo limpia finanzas
```

**Limpieza Completa:**
```bash
Elimina TODO excepto clientes
```

### 2. Ejecutar en Supabase

1. Abre **Supabase Dashboard** → **SQL Editor**
2. Copia el contenido del archivo que elegiste
3. **Revisa** el SQL antes de ejecutar
4. Click en **Run**
5. Verifica los resultados

### 3. Verificar el Resultado

Después de ejecutar, deberías ver:

**Limpieza Básica:**
```sql
-- Verificar
SELECT COUNT(*) FROM projects;           -- Deberías ver tus proyectos
SELECT COUNT(*) FROM cash_movements;     -- 0
SELECT COUNT(*) FROM master_loans;       -- 0
SELECT balance_usd FROM master_cash;     -- 0.00
```

**Limpieza Completa:**
```sql
-- Verificar
SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL;  -- 0
SELECT COUNT(*) FROM cash_movements;                      -- 0
SELECT COUNT(*) FROM master_loans;                        -- 0
SELECT COUNT(*) FROM clients;                            -- Tus clientes
```

---

## ⚠️ Advertencias Importantes

### Antes de Ejecutar:

1. **🔒 Backup:** No hay forma de recuperar datos después de limpiar
2. **👀 Revisar:** Lee el SQL completo antes de ejecutar
3. **🎯 Entorno:** Asegúrate de estar en el entorno correcto (dev/staging, NO production)
4. **💾 Exportar:** Si hay datos importantes, expórtalos primero

### No Puedes Recuperar:

- ❌ Movimientos de caja eliminados
- ❌ Préstamos eliminados
- ❌ Balances históricos
- ❌ Proyectos eliminados (en limpieza completa)

### Puedes Recrear:

- ✅ Nuevos proyectos (los clientes se mantienen)
- ✅ Nuevos movimientos
- ✅ Nuevos préstamos
- ✅ Balances desde cero

---

## 🎬 Flujo de Demo Recomendado

### Después de Limpiar:

1. **Crear Capital Inicial**
   ```
   Master Cash: USD 100,000
   (simula capital del estudio)
   ```

2. **Crear Proyecto Demo**
   ```
   Cliente: [Cliente existente]
   Monto: USD 50,000
   Anticipo: USD 10,000
   ```

3. **Simular Préstamo**
   ```
   Desde: Master Cash
   Para: Proyecto Demo
   Monto: USD 20,000
   ```

4. **Verificar Visibilidad**
   ```
   - Saldo Anterior: USD 100,000
   - Monto: -USD 20,000
   - Saldo Nuevo: USD 80,000
   ```

5. **Mostrar Trazabilidad**
   ```
   - Préstamo visible como "Desembolso de Préstamo"
   - Balance completo en cada movimiento
   - Proyecto sin "Proyecto Eliminado"
   ```

---

## 🆘 Troubleshooting

### Error: "Cannot delete referenced rows"

**Causa:** Hay relaciones que impiden eliminar

**Solución:** Usa la limpieza completa que elimina en orden correcto

### Error: "Syntax error near..."

**Causa:** Comillas o caracteres especiales

**Solución:** Copia directamente desde el archivo .sql

### Limpieza No Completa

**Síntoma:** Todavía hay datos después de limpiar

**Solución:** Ejecuta las queries de verificación para ver qué quedó

---

## 📚 Archivos Relacionados

- `20251016_clean_test_data.sql` - Limpieza básica
- `20251016_full_clean_with_projects.sql` - Limpieza completa
- `MIGRATION_CHECKLIST.md` - Checklist de migraciones
- `BALANCE_SNAPSHOT_EXAMPLE.md` - Ejemplo de snapshots

---

## ✅ Checklist Pre-Demo

Después de limpiar, verifica:

- [ ] Master Cash en $0
- [ ] Admin Cash en $0
- [ ] Proyectos activos (básica) o 0 (completa)
- [ ] Clientes disponibles
- [ ] Sin movimientos pendientes
- [ ] Sin préstamos activos
- [ ] Sistema funcionando correctamente

**¡Listo para la demo!** 🎉
