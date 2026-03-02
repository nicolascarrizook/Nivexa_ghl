/**
 * Ejecutar limpieza de base de datos usando queries SQL directas
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

async function executeCleanup() {
  console.log('\n🧹 Ejecutando limpieza de base de datos...\n');

  try {
    // 1. Eliminar contractor_payments
    const { error: e1 } = await supabase.from('contractor_payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(e1 ? `❌ contractor_payments: ${e1.message}` : '✅ contractor_payments eliminados');

    // 2. Eliminar contractor_budgets
    const { error: e2 } = await supabase.from('contractor_budgets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(e2 ? `❌ contractor_budgets: ${e2.message}` : '✅ contractor_budgets eliminados');

    // 3. Eliminar project_contractors
    const { error: e3 } = await supabase.from('project_contractors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(e3 ? `❌ project_contractors: ${e3.message}` : '✅ project_contractors eliminados');

    // 4. Eliminar cash_movements
    const { error: e4 } = await supabase.from('cash_movements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(e4 ? `❌ cash_movements: ${e4.message}` : '✅ cash_movements eliminados');

    // 5. Eliminar payments
    const { error: e5 } = await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(e5 ? `❌ payments: ${e5.message}` : '✅ payments eliminados');

    // 6. Eliminar installments
    const { error: e6 } = await supabase.from('installments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(e6 ? `❌ installments: ${e6.message}` : '✅ installments eliminados');

    // 7. Eliminar project_cash_box
    const { error: e7 } = await supabase.from('project_cash_box').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(e7 ? `❌ project_cash_box: ${e7.message}` : '✅ project_cash_box eliminadas');

    // 8. Eliminar projects
    const { error: e8 } = await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(e8 ? `❌ projects: ${e8.message}` : '✅ projects eliminados');

    // 9. Eliminar providers
    const { error: e9 } = await supabase.from('providers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(e9 ? `❌ providers: ${e9.message}` : '✅ providers eliminados');

    // 10. Eliminar clients
    const { error: e10 } = await supabase.from('clients').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(e10 ? `❌ clients: ${e10.message}` : '✅ clients eliminados');

    // 11. Reiniciar master_cash
    const { data: masterCash } = await supabase.from('master_cash').select('id').limit(1).single();
    if (masterCash) {
      const { error: e11 } = await supabase
        .from('master_cash')
        .update({
          balance: 0,
          balance_ars: 0,
          balance_usd: 0,
          last_movement_at: new Date().toISOString(),
        })
        .eq('id', masterCash.id);
      console.log(e11 ? `❌ master_cash: ${e11.message}` : '✅ master_cash reiniciada a $0');
    }

    // 12. Reiniciar admin_cash
    const { data: adminCash } = await supabase.from('admin_cash').select('id').limit(1).single();
    if (adminCash) {
      const { error: e12 } = await supabase
        .from('admin_cash')
        .update({
          balance: 0,
          balance_ars: 0,
          balance_usd: 0,
          total_collected: 0,
          last_collection_at: null,
        })
        .eq('id', adminCash.id);
      console.log(e12 ? `❌ admin_cash: ${e12.message}` : '✅ admin_cash reiniciada a $0');
    }

    // Verificar estado final
    console.log('\n📊 Estado final de la base de datos:\n');

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

    for (const table of tables) {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      console.log(`  ${count === 0 ? '✅' : '⚠️'}  ${table}: ${count} registros`);
    }

    console.log('\n✅ Limpieza completada!\n');
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    process.exit(1);
  }
}

executeCleanup();
