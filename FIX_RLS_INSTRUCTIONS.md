# Instrucciones para Solucionar el Error: Tabla project_cash_box No Existe

## Problema Identificado

Error: `"relation \"public.project_cash_box\" does not exist"`

**Causa**: La tabla `project_cash_box` **nunca fue creada en la base de datos**. La migración original no se ejecutó.

## Solución

He creado una migración completa `supabase/migrations/20250131_create_project_cash_box_with_rls.sql` que:

1. ✅ Crea la tabla `project_cash_box` con estructura multi-moneda
2. ✅ Migra datos de `project_cash` (si existe la tabla vieja)
3. ✅ Crea cajas para proyectos que no tienen caja
4. ✅ Configura políticas RLS completas (4 políticas de seguridad)
5. ✅ Incluye verificación automática al final

### Opción 1: Aplicar mediante Supabase Dashboard (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor** en el menú lateral
3. Copia y pega el contenido completo del archivo:
   ```
   supabase/migrations/20250131_create_project_cash_box_with_rls.sql
   ```
4. Haz clic en **Run** para ejecutar la migración
5. Verifica que se ejecutó correctamente. Deberías ver al final:
   - ✅ Tabla creada
   - ✅ Datos migrados (si había tabla vieja)
   - ✅ Cajas creadas para proyectos
   - ✅ RLS habilitado con 4 políticas
   - 📊 Verificación con estadísticas finales

### Opción 2: Aplicar mediante Supabase CLI

Si tienes el CLI configurado:

```bash
# 1. Linkear tu proyecto (si aún no lo has hecho)
npx supabase link --project-ref TU_PROJECT_REF

# 2. Aplicar la migración
npx supabase db push
```

## Políticas RLS Creadas

La migración crea 4 políticas de seguridad:

### 1. **Users can view their project cash boxes** (SELECT)
- Permite a usuarios autenticados ver cajas de proyectos no eliminados
- Valida que el proyecto existe y no está eliminado (`deleted_at IS NULL`)

### 2. **Users can create project cash boxes** (INSERT) ⭐ **CRÍTICA**
- **Esta es la política que soluciona tu error actual**
- Permite a usuarios autenticados crear cajas de proyecto
- Valida que el proyecto asociado existe y no está eliminado

### 3. **Users can update their project cash boxes** (UPDATE)
- Permite actualizar cajas de proyecto existentes
- Mantiene las mismas validaciones de proyecto válido

### 4. **Service role can manage all project cash boxes** (ALL)
- Permite al service role (backend) acceso completo sin restricciones
- Necesario para operaciones automáticas del sistema

## Verificación Post-Migración

Después de aplicar la migración, puedes verificar que las políticas fueron creadas ejecutando esta consulta en el SQL Editor:

```sql
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'project_cash_box'
ORDER BY policyname;
```

Deberías ver 4 filas con las políticas listadas arriba.

## Prueba de Funcionamiento

Una vez aplicada la migración:

1. Intenta crear un nuevo proyecto desde tu aplicación
2. La creación del `project_cash_box` debería funcionar sin errores
3. Verifica que el proyecto y su caja se crearon correctamente

## Contexto Técnico

### ¿Por qué ocurrió este error?

La migración original `20250110_create_and_migrate_project_cash_box.sql` **nunca fue ejecutada en tu base de datos**. Esto causó:

1. ❌ La tabla `project_cash_box` no existe
2. ❌ El código TypeScript intenta insertar en una tabla inexistente
3. ❌ PostgreSQL retorna error: `relation "public.project_cash_box" does not exist`

**Resultado**: Cuando intentas crear un proyecto, el servicio `ProjectService.createProjectFromForm()` falla al intentar crear la caja del proyecto.

### Flujo de Creación de Proyecto

```
ANTES (Error):
1. Usuario crea proyecto → ProjectService.createProjectFromForm()
2. Se crea registro en 'projects' ✅
3. ⚠️ Intenta INSERT en 'project_cash_box' → ❌ ERROR: table does not exist

DESPUÉS (Con migración aplicada):
1. Usuario crea proyecto → ProjectService.createProjectFromForm()
2. Se crea registro en 'projects' ✅
3. Se crea 'project_cash_box' ✅ (tabla existe + políticas RLS permiten INSERT)
4. Proyecto creado exitosamente con su caja multi-moneda
```

### Validaciones de las Políticas

Todas las políticas validan:
```sql
EXISTS (
  SELECT 1 FROM public.projects
  WHERE projects.id = project_cash_box.project_id
  AND projects.deleted_at IS NULL
)
```

Esto asegura que:
- El proyecto existe en la base de datos
- El proyecto no está en estado eliminado (soft delete)
- Hay integridad referencial entre las tablas

## Soporte Adicional

Si después de aplicar la migración sigues teniendo errores:

1. Verifica que tu usuario esté autenticado (`auth.uid()` no sea NULL)
2. Confirma que el `project_id` en el INSERT existe en la tabla `projects`
3. Revisa los logs de Supabase Dashboard para más detalles del error

## Archivos Relacionados

- **Migración COMPLETA**: `supabase/migrations/20250131_create_project_cash_box_with_rls.sql` (USAR ESTA)
- **Migración original (no ejecutada)**: `supabase/migrations/20250110_create_and_migrate_project_cash_box.sql`
- **Servicio afectado**: `src/modules/projects/services/ProjectService.ts`
- **Método específico**: `ProjectService.createProjectFromForm()` (crea el project_cash_box)
- **Script de diagnóstico**: `check_database_state.sql` (opcional, para verificar estado previo)
