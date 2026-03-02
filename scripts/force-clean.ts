/**
 * Limpieza forzada de base de datos
 * Elimina todas las referencias antes de eliminar los registros principales
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceClean() {
  console.log('\n🧹 Iniciando limpieza forzada...\n');

  // Paso 1: Limpiar cash_movements repetidamente hasta que no queden
  console.log('🔄 Limpiando cash_movements...');
  let attempts = 0;
  while (attempts < 5) {
    const { error, count } = await supabase
      .from('cash_movements')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (count === 0 || error) break;
    attempts++;
  }
  console.log('✅ cash_movements limpiado');

  // Paso 2: Limpiar providers repetidamente
  console.log('🔄 Limpiando providers...');
  attempts = 0;
  while (attempts < 5) {
    const { error, count } = await supabase
      .from('providers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (count === 0 || error) break;
    attempts++;
  }
  console.log('✅ providers limpiado');

  // Paso 3: Verificar estado final
  console.log('\n📊 Estado final:\n');

  const tables = [
    'cash_movements',
    'providers',
    'clients',
    'projects',
    'project_cash_box',
    'installments',
    'payments',
    'project_contractors',
    'contractor_budgets',
    'contractor_payments',
  ];

  for (const table of tables) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`  ${count === 0 ? '✅' : '⚠️'}  ${table}: ${count} registros`);
  }

  // Paso 4: Reiniciar cajas especiales
  console.log('\n🔄 Reiniciando cajas especiales...\n');

  const { data: masterCash } = await supabase.from('master_cash').select('id').limit(1).single();
  if (masterCash) {
    await supabase
      .from('master_cash')
      .update({
        balance: 0,
        balance_ars: 0,
        balance_usd: 0,
        last_movement_at: new Date().toISOString(),
      })
      .eq('id', masterCash.id);
    console.log('✅ master_cash reiniciada');
  }

  const { data: adminCash } = await supabase.from('admin_cash').select('id').limit(1).single();
  if (adminCash) {
    await supabase
      .from('admin_cash')
      .update({
        balance: 0,
        balance_ars: 0,
        balance_usd: 0,
        total_collected: 0,
        last_collection_at: null,
      })
      .eq('id', adminCash.id);
    console.log('✅ admin_cash reiniciada');
  }

  console.log('\n✅ Limpieza forzada completada!\n');
}

forceClean().catch(console.error);
