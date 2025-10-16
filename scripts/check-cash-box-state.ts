/**
 * Script para verificar el estado actual de un project_cash_box específico
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCashBoxState() {
  const projectId = '5143c005-3705-42e5-9fb5-bfd926b0e364';

  console.log('🔍 Verificando estado de project_cash_box...\n');

  // 1. Obtener project_cash_box
  const { data: cashBox, error: cashBoxError } = await supabase
    .from('project_cash_box')
    .select('*')
    .eq('project_id', projectId)
    .single();

  if (cashBoxError || !cashBox) {
    console.error('❌ Error al obtener cashBox:', cashBoxError);
    return;
  }

  console.log('📊 Estado actual de project_cash_box:');
  console.log(`   Balance ARS: $${(cashBox.current_balance_ars || 0).toFixed(2)}`);
  console.log(`   Balance USD: $${(cashBox.current_balance_usd || 0).toFixed(2)}`);
  console.log(`   Total Income ARS: $${(cashBox.total_income_ars || 0).toFixed(2)}`);
  console.log(`   Total Income USD: $${(cashBox.total_income_usd || 0).toFixed(2)}`);
  console.log(`   Total Expenses ARS: $${(cashBox.total_expenses_ars || 0).toFixed(2)}`);
  console.log(`   Total Expenses USD: $${(cashBox.total_expenses_usd || 0).toFixed(2)}`);

  // Calcular diferencias
  const calculatedBalanceArs = (cashBox.total_income_ars || 0) - (cashBox.total_expenses_ars || 0);
  const calculatedBalanceUsd = (cashBox.total_income_usd || 0) - (cashBox.total_expenses_usd || 0);

  console.log(`\n💡 Balance calculado (Income - Expenses):`);
  console.log(`   ARS: $${calculatedBalanceArs.toFixed(2)}`);
  console.log(`   USD: $${calculatedBalanceUsd.toFixed(2)}`);

  // Verificar discrepancias
  const discrepancyArs = Math.abs(calculatedBalanceArs - (cashBox.current_balance_ars || 0));
  const discrepancyUsd = Math.abs(calculatedBalanceUsd - (cashBox.current_balance_usd || 0));

  if (discrepancyArs > 0.01 || discrepancyUsd > 0.01) {
    console.log(`\n⚠️  DISCREPANCIA DETECTADA:`);
    if (discrepancyArs > 0.01) {
      const hiddenExpensesArs = (cashBox.total_income_ars || 0) - (cashBox.current_balance_ars || 0);
      console.log(`   ARS:`);
      console.log(`      Balance registrado: $${(cashBox.current_balance_ars || 0).toFixed(2)}`);
      console.log(`      Balance calculado: $${calculatedBalanceArs.toFixed(2)}`);
      console.log(`      Diferencia: $${discrepancyArs.toFixed(2)}`);
      console.log(`      Gastos ocultos (no registrados en total_expenses): $${hiddenExpensesArs.toFixed(2)}`);
    }
    if (discrepancyUsd > 0.01) {
      const hiddenExpensesUsd = (cashBox.total_income_usd || 0) - (cashBox.current_balance_usd || 0);
      console.log(`   USD:`);
      console.log(`      Balance registrado: $${(cashBox.current_balance_usd || 0).toFixed(2)}`);
      console.log(`      Balance calculado: $${calculatedBalanceUsd.toFixed(2)}`);
      console.log(`      Diferencia: $${discrepancyUsd.toFixed(2)}`);
      console.log(`      Gastos ocultos (no registrados en total_expenses): $${hiddenExpensesUsd.toFixed(2)}`);
    }

    console.log(`\n🔧 ¿Corregir la discrepancia? (actualizará total_expenses para que coincida con la realidad)`);
    console.log(`   Esto hará que: Balance = Income - Expenses`);

    // Calcular los valores corregidos
    const correctedExpensesArs = (cashBox.total_income_ars || 0) - (cashBox.current_balance_ars || 0);
    const correctedExpensesUsd = (cashBox.total_income_usd || 0) - (cashBox.current_balance_usd || 0);

    console.log(`\n   Valores a actualizar:`);
    console.log(`      total_expenses_ars: ${cashBox.total_expenses_ars || 0} → ${correctedExpensesArs.toFixed(2)}`);
    console.log(`      total_expenses_usd: ${cashBox.total_expenses_usd || 0} → ${correctedExpensesUsd.toFixed(2)}`);

    // Actualizar
    const { error: updateError } = await supabase
      .from('project_cash_box')
      .update({
        total_expenses_ars: correctedExpensesArs,
        total_expenses_usd: correctedExpensesUsd,
        updated_at: new Date().toISOString()
      })
      .eq('id', cashBox.id);

    if (updateError) {
      console.error('\n❌ Error al actualizar:', updateError);
    } else {
      console.log('\n✅ Valores corregidos exitosamente');
    }
  } else {
    console.log('\n✅ Los valores son consistentes');
  }

  // Verificar movimientos de caja
  console.log(`\n📋 Verificando movimientos de caja...`);
  const { data: movements, error: movementsError } = await supabase
    .from('cash_movements')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!movementsError && movements) {
    console.log(`   Total de movimientos: ${movements.length}`);
    for (const m of movements.slice(0, 5)) {
      console.log(`   - ${m.movement_type}: $${m.amount} (${m.description})`);
    }
  }
}

checkCashBoxState()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
