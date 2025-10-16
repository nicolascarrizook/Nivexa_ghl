import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0a294ZnN3b2ZjZ2VibXVvZXlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY3MTY3MCwiZXhwIjoyMDc0MjQ3NjcwfQ.2RxAkJUQdLRtvIz0dKpSaQtxtYHWPCxkCGYbvdXaMZQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanEverything() {
  console.log('🗑️  LIMPIEZA TOTAL - ELIMINANDO TODO...\n');
  console.log('⚠️  Esto eliminará TODOS los datos excepto clientes\n');

  try {
    // 1. Eliminar datos dependientes primero
    console.log('📦 Paso 1: Eliminando datos dependientes...');

    const { count: contractorPayments } = await supabase
      .from('contractor_payments')
      .select('*', { count: 'exact', head: true });

    await supabase.from('contractor_payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(`   ✅ ${contractorPayments || 0} pagos de contratistas eliminados`);

    const { count: feeCollections } = await supabase
      .from('fee_collections')
      .select('*', { count: 'exact', head: true });

    await supabase.from('fee_collections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(`   ✅ ${feeCollections || 0} cobros de honorarios eliminados`);

    const { count: payments } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true });

    await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(`   ✅ ${payments || 0} pagos eliminados`);

    const { count: installments } = await supabase
      .from('installments')
      .select('*', { count: 'exact', head: true });

    await supabase.from('installments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(`   ✅ ${installments || 0} cuotas de proyectos eliminadas`);

    // 2. Eliminar préstamos
    console.log('\n💰 Paso 2: Eliminando préstamos...');

    const { count: loanInstallments } = await supabase
      .from('loan_installments')
      .select('*', { count: 'exact', head: true });

    await supabase.from('loan_installments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(`   ✅ ${loanInstallments || 0} cuotas de préstamos eliminadas`);

    const { count: masterLoans } = await supabase
      .from('master_loans')
      .select('*', { count: 'exact', head: true });

    await supabase.from('master_loans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(`   ✅ ${masterLoans || 0} préstamos eliminados`);

    // 3. Eliminar movimientos de caja
    console.log('\n💵 Paso 3: Eliminando movimientos de caja...');

    const { count: cashMovements } = await supabase
      .from('cash_movements')
      .select('*', { count: 'exact', head: true });

    await supabase.from('cash_movements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(`   ✅ ${cashMovements || 0} movimientos eliminados`);

    // 4. Eliminar cajas de proyectos
    console.log('\n📦 Paso 4: Eliminando cajas de proyectos...');

    const { count: projectCashBoxes } = await supabase
      .from('project_cash_box')
      .select('*', { count: 'exact', head: true });

    await supabase.from('project_cash_box').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log(`   ✅ ${projectCashBoxes || 0} cajas de proyectos eliminadas`);

    // 5. Soft delete de proyectos
    console.log('\n🏗️  Paso 5: Eliminando proyectos (soft delete)...');

    const { count: projectsBefore } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    await supabase
      .from('projects')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .is('deleted_at', null);

    console.log(`   ✅ ${projectsBefore || 0} proyectos marcados como eliminados`);

    // 6. Resetear balances
    console.log('\n🔄 Paso 6: Reseteando balances...');

    await supabase
      .from('master_cash')
      .update({
        balance: 0,
        balance_ars: 0,
        balance_usd: 0,
        last_movement_at: null,
        updated_at: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('   ✅ Master Cash reseteada a $0');

    await supabase
      .from('admin_cash')
      .update({
        balance: 0,
        updated_at: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('   ✅ Admin Cash reseteada a $0');

    // 7. Verificación final
    console.log('\n📊 Verificación final:');

    const { data: masterCash } = await supabase
      .from('master_cash')
      .select('balance_ars, balance_usd')
      .single();

    const { data: adminCash } = await supabase
      .from('admin_cash')
      .select('balance')
      .single();

    const { count: activeProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    const { count: deletedProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .not('deleted_at', 'is', null);

    const { count: clients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });

    const { count: remainingMovements } = await supabase
      .from('cash_movements')
      .select('*', { count: 'exact', head: true });

    const { count: remainingLoans } = await supabase
      .from('master_loans')
      .select('*', { count: 'exact', head: true });

    const { count: remainingCashBoxes } = await supabase
      .from('project_cash_box')
      .select('*', { count: 'exact', head: true });

    console.log(`
   Master Cash: ARS $${masterCash?.balance_ars || 0} | USD $${masterCash?.balance_usd || 0}
   Admin Cash: ARS $${adminCash?.balance || 0}

   Proyectos activos: ${activeProjects || 0}
   Proyectos eliminados: ${deletedProjects || 0}
   Clientes: ${clients || 0} ✅ (mantenidos)

   Movimientos: ${remainingMovements || 0}
   Préstamos: ${remainingLoans || 0}
   Cajas de proyectos: ${remainingCashBoxes || 0}
    `);

    console.log('\n✅ ¡LIMPIEZA TOTAL COMPLETADA!');
    console.log('🎯 Base de datos completamente limpia');
    console.log('📝 Clientes preservados para crear nuevos proyectos\n');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
    console.error(error);
    process.exit(1);
  }
}

cleanEverything();
