/**
 * Script para diagnosticar y corregir gastos en project_cash_box
 *
 * Problema: Los pagos a proveedores ya registrados no se reflejan en total_expenses_usd/ars
 * Solución: Recalcular total_expenses basado en contractor_payments con status='paid'
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Intentar cargar .env.local primero, luego .env
dotenv.config({ path: join(__dirname, '../.env.local') });
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY no configuradas');
  console.error('   Verifica que exista el archivo .env.local con estas variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCashBoxExpenses() {
  console.log('🔍 Iniciando diagnóstico de gastos en project_cash_box...\n');

  try {
    // 1. Obtener todos los project_cash_box
    const { data: cashBoxes, error: cashBoxError } = await supabase
      .from('project_cash_box')
      .select(`
        *,
        project:project_id (
          name,
          code
        )
      `);

    if (cashBoxError) {
      console.error('❌ Error al obtener cajas de proyecto:', cashBoxError);
      return;
    }

    console.log(`📦 Encontradas ${cashBoxes?.length || 0} cajas de proyecto\n`);

    for (const cashBox of cashBoxes || []) {
      const projectInfo = cashBox.project as any;
      const projectName = projectInfo?.name || 'Sin nombre';
      const projectCode = projectInfo?.code || '';

      console.log(`\n📊 Proyecto: ${projectCode} - ${projectName}`);
      console.log(`   ID: ${cashBox.project_id}`);

      // 2. Obtener todos los project_contractors de este proyecto
      const { data: projectContractors, error: pcError } = await supabase
        .from('project_contractors')
        .select('id')
        .eq('project_id', cashBox.project_id);

      if (pcError) {
        console.error('   ❌ Error al obtener project_contractors:', pcError);
        continue;
      }

      console.log(`   👷 Contractors encontrados: ${projectContractors?.length || 0}`);

      if (!projectContractors || projectContractors.length === 0) {
        console.log('   ⚠️  Sin contractors asignados');

        // Verificar si hay pagos directos sin project_contractor
        const { data: orphanPayments, error: orphanError } = await supabase
          .from('contractor_payments')
          .select('id, amount, currency, status')
          .eq('status', 'paid')
          .is('project_contractor_id', null);

        if (!orphanError && orphanPayments && orphanPayments.length > 0) {
          console.log(`   ⚠️  Encontrados ${orphanPayments.length} pagos huérfanos (sin project_contractor_id)`);
        }

        continue;
      }

      const contractorIds = projectContractors.map(pc => pc.id);

      // 3. Calcular total de gastos pagados por moneda
      const { data: payments, error: paymentsError } = await supabase
        .from('contractor_payments')
        .select('amount, currency, status')
        .in('project_contractor_id', contractorIds)
        .eq('status', 'paid');

      if (paymentsError) {
        console.error('   ❌ Error al obtener pagos:', paymentsError);
        continue;
      }

      // Calcular totales por moneda
      let calculatedExpensesArs = 0;
      let calculatedExpensesUsd = 0;

      for (const payment of payments || []) {
        if (payment.currency === 'ARS') {
          calculatedExpensesArs += payment.amount;
        } else if (payment.currency === 'USD') {
          calculatedExpensesUsd += payment.amount;
        }
      }

      console.log(`\n   💰 Gastos calculados (de pagos reales):`);
      console.log(`      ARS: $${calculatedExpensesArs.toFixed(2)}`);
      console.log(`      USD: $${calculatedExpensesUsd.toFixed(2)}`);

      console.log(`\n   📋 Gastos registrados en DB:`);
      console.log(`      ARS: $${(cashBox.total_expenses_ars || 0).toFixed(2)}`);
      console.log(`      USD: $${(cashBox.total_expenses_usd || 0).toFixed(2)}`);

      // 4. Verificar discrepancias
      const discrepancyArs = Math.abs(calculatedExpensesArs - (cashBox.total_expenses_ars || 0));
      const discrepancyUsd = Math.abs(calculatedExpensesUsd - (cashBox.total_expenses_usd || 0));

      if (discrepancyArs > 0.01 || discrepancyUsd > 0.01) {
        console.log(`\n   ⚠️  DISCREPANCIA DETECTADA:`);
        if (discrepancyArs > 0.01) {
          console.log(`      ARS: Diferencia de $${discrepancyArs.toFixed(2)}`);
        }
        if (discrepancyUsd > 0.01) {
          console.log(`      USD: Diferencia de $${discrepancyUsd.toFixed(2)}`);
        }

        // 5. Corregir los valores
        console.log(`\n   🔧 Corrigiendo valores...`);

        const { error: updateError } = await supabase
          .from('project_cash_box')
          .update({
            total_expenses_ars: calculatedExpensesArs,
            total_expenses_usd: calculatedExpensesUsd,
            updated_at: new Date().toISOString()
          })
          .eq('id', cashBox.id);

        if (updateError) {
          console.error('   ❌ Error al actualizar:', updateError);
        } else {
          console.log('   ✅ Valores corregidos exitosamente');
        }
      } else {
        console.log('\n   ✅ Los gastos están correctos');
      }
    }

    console.log('\n\n🎉 Proceso completado');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
fixCashBoxExpenses()
  .then(() => {
    console.log('\n✅ Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });
