#!/bin/bash

# Script para ejecutar el reset completo de la base de datos
# Este script debe ejecutarse desde la raíz del proyecto

echo "🚀 Iniciando reset completo de la base de datos..."
echo ""
echo "⚠️  ADVERTENCIA: Este script va a:"
echo "   1. Eliminar TODOS los datos"
echo "   2. Migrar a sistema multi-moneda"
echo "   3. Recrear registros iniciales"
echo ""
echo "Presiona CTRL+C para cancelar o ENTER para continuar..."
read

# Verificar que existe el archivo de migración
if [ ! -f "supabase/migrations/20250110_full_reset.sql" ]; then
    echo "❌ Error: No se encuentra el archivo de migración"
    exit 1
fi

echo ""
echo "📝 Ejecutando script de reset..."
echo ""

# Ejecutar usando npx supabase
npx supabase db execute --file supabase/migrations/20250110_full_reset.sql --db-url "postgresql://postgres.jtkoxfswofcgebmuoeyi:[YOUR_PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

echo ""
echo "✅ Script ejecutado"
echo ""
echo "🔍 Próximos pasos:"
echo "   1. Verifica en Supabase Dashboard que las tablas están limpias"
echo "   2. Crea un proyecto de prueba en USD"
echo "   3. Verifica que el dinero se distribuya correctamente"
echo ""
