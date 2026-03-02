/**
 * Script para Limpiar Base de Datos
 *
 * ADVERTENCIA: Este script eliminará TODOS los datos de la base de datos
 * pero preservará la estructura (tablas, columnas, constraints, etc.)
 *
 * Ejecutar con: npm run db:clean -- --confirm
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Cargar variables de entorno
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Verificar si se pasó el flag --confirm
const isConfirmed = process.argv.includes('--confirm');

async function countRecords() {
  console.log('\n📊 ESTADO ACTUAL DE LA BASE DE DATOS:\n');

  const tables = [
    'contractor_payments',
    'contractor_budgets',
    'project_contractors',
    'cash_movements',
    'installments',
    'payments',
    'project_cash_box',
    'projects',
    'providers',
    'clients',
    'master_cash',
    'admin_cash',
  ];

  const counts: Record<string, number> = {};

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`  ⚠️  ${table}: Error al contar`);
    } else {
      counts[table] = count || 0;
      console.log(`  📋 ${table}: ${count || 0} registros`);
    }
  }

  const totalRecords = Object.values(counts).reduce((sum, count) => sum + count, 0);
  console.log(`\n  📊 TOTAL: ${totalRecords} registros\n`);

  return totalRecords;
}

async function cleanDatabase() {
  console.log('\n🧹 INICIANDO LIMPIEZA DE BASE DE DATOS\n');

  // Orden de eliminación respetando foreign keys (de dependiente a independiente)
  const deletionOrder = [
    { table: 'contractor_payments', description: 'Pagos a contractors' },
    { table: 'contractor_budgets', description: 'Presupuestos de contractors' },
    { table: 'project_contractors', description: 'Asignaciones de contractors a proyectos' },
    { table: 'cash_movements', description: 'Movimientos de caja' },
    { table: 'payments', description: 'Pagos de cuotas' },
    { table: 'installments', description: 'Cuotas' },
    { table: 'project_cash_box', description: 'Cajas de proyectos' },
    { table: 'projects', description: 'Proyectos' },
    { table: 'providers', description: 'Proveedores/Contractors' },
    { table: 'clients', description: 'Clientes' },
  ];

  for (const { table, description } of deletionOrder) {
    try {
      const { error, count } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except impossible UUID

      if (error) {
        console.log(`  ❌ ${description} (${table}): ${error.message}`);
      } else {
        console.log(`  ✅ ${description} (${table}): ${count || 'todos los'} registros eliminados`);
      }
    } catch (err: any) {
      console.log(`  ❌ ${description} (${table}): ${err.message}`);
    }
  }

  // Reiniciar cajas especiales (master y admin) a balance cero
  console.log('\n🔄 Reiniciando cajas especiales...\n');

  // Master Cash
  const { data: masterCash } = await supabase
    .from('master_cash')
    .select('id')
    .limit(1)
    .single();

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
    console.log('  ✅ Master Cash reiniciada a $0');
  }

  // Admin Cash
  const { data: adminCash } = await supabase
    .from('admin_cash')
    .select('id')
    .limit(1)
    .single();

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
    console.log('  ✅ Admin Cash reiniciada a $0');
  }

  console.log('\n✅ LIMPIEZA COMPLETADA\n');
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🧹 LIMPIEZA DE BASE DE DATOS');
  console.log('='.repeat(60));

  // Mostrar estado actual
  const totalRecords = await countRecords();

  if (totalRecords === 0) {
    console.log('✅ La base de datos ya está vacía. No hay nada que limpiar.\n');
    return;
  }

  // Verificar confirmación
  console.log('⚠️  ADVERTENCIA: Esta operación es IRREVERSIBLE\n');
  console.log('Se eliminarán TODOS los datos de las siguientes tablas:');
  console.log('  • Proyectos y sus cajas');
  console.log('  • Clientes');
  console.log('  • Proveedores/Contractors');
  console.log('  • Presupuestos y pagos');
  console.log('  • Movimientos de caja');
  console.log('  • Cuotas e installments\n');
  console.log('Las cajas Master y Admin se reiniciarán a $0\n');

  if (!isConfirmed) {
    console.log('❌ Para ejecutar la limpieza, usa: npm run db:clean -- --confirm\n');
    return;
  }

  console.log('✅ Flag --confirm detectado. Procediendo con la limpieza...\n');
  await cleanDatabase();
  await countRecords(); // Mostrar estado final
}

main().catch((error) => {
  console.error('\n❌ Error durante la limpieza:', error);
  process.exit(1);
});
