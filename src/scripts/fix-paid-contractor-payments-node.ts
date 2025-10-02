/**
 * Script para corregir pagos a contratistas que ya fueron marcados como "paid"
 * pero que nunca descontaron el dinero de las cajas del proyecto
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jtkoxfswofcgebmuoeyi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0a294ZnN3b2ZjZ2VibXVvZXlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NzE2NzAsImV4cCI6MjA3NDI0NzY3MH0.3SJLCZX0SToaULHHOlDDgFWeMxCucDOziYrBc3-uyFM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PaidPayment {
  id: string;
  amount: number;
  project_contractor_id: string;
  paid_at: string;
  notes: string | null;
  project_id?: string;
}

async function findPaidPaymentsWithoutCashMovement() {
  console.log('🔍 Buscando pagos marcados como "paid" sin movimiento de caja...\n');

  // Obtener todos los pagos marcados como "paid"
  const { data: paidPayments, error: paymentsError } = await supabase
    .from('contractor_payments')
    .select(`
      id,
      amount,
      project_contractor_id,
      paid_at,
      notes
    `)
    .eq('status', 'paid')
    .order('paid_at', { ascending: false });

  if (paymentsError) {
    console.error('❌ Error al obtener pagos:', paymentsError);
    return [];
  }

  if (!paidPayments || paidPayments.length === 0) {
    console.log('ℹ️  No se encontraron pagos marcados como "paid"');
    return [];
  }

  console.log(`📊 Encontrados ${paidPayments.length} pagos marcados como "paid"\n`);

  // Verificar cuáles NO tienen movimiento de caja asociado
  const paymentsWithoutMovement: PaidPayment[] = [];

  for (const payment of paidPayments) {
    const { data: movements } = await supabase
      .from('cash_movements')
      .select('id, metadata')
      .or(`metadata->>contractor_payment_id.eq.${payment.id},description.ilike.%${payment.id}%`);

    if (!movements || movements.length === 0) {
      // Obtener el project_id
      const { data: contractor } = await supabase
        .from('project_contractors')
        .select('project_id')
        .eq('id', payment.project_contractor_id)
        .single();

      paymentsWithoutMovement.push({
        ...payment,
        project_id: contractor?.project_id
      });
    }
  }

  console.log(`⚠️  Encontrados ${paymentsWithoutMovement.length} pagos SIN movimiento de caja\n`);

  return paymentsWithoutMovement;
}

async function processProjectExpense(params: {
  projectId: string;
  amount: number;
  description: string;
  contractorPaymentId?: string;
  currency?: string;
}) {
  // Get project cash
  const { data: projectCash, error: projectCashError } = await supabase
    .from('project_cash')
    .select('*')
    .eq('project_id', params.projectId)
    .single();

  if (projectCashError || !projectCash) {
    throw new Error('Project cash not found');
  }

  // Verificar que hay fondos suficientes
  if (projectCash.balance < params.amount) {
    throw new Error(`Fondos insuficientes. Balance: ${projectCash.balance}, Requerido: ${params.amount}`);
  }

  // Get master cash
  const { data: masterCash, error: masterCashError } = await supabase
    .from('master_cash')
    .select('*')
    .single();

  if (masterCashError || !masterCash) {
    throw new Error('Master cash not found');
  }

  // Create movement
  const movement = {
    movement_type: 'project_expense',
    source_type: 'project',
    source_id: projectCash.id,
    destination_type: 'external',
    destination_id: null,
    amount: params.amount,
    description: params.description,
    project_id: params.projectId,
    metadata: params.contractorPaymentId ? {
      contractor_payment_id: params.contractorPaymentId,
      currency: params.currency || 'ARS'
    } : null,
  };

  const { error: movementError } = await supabase
    .from('cash_movements')
    .insert(movement);

  if (movementError) {
    throw movementError;
  }

  // Update balances
  await Promise.all([
    supabase
      .from('project_cash')
      .update({
        balance: projectCash.balance - params.amount,
        last_movement_at: new Date().toISOString()
      })
      .eq('id', projectCash.id),

    supabase
      .from('master_cash')
      .update({
        balance: masterCash.balance - params.amount,
        last_movement_at: new Date().toISOString()
      })
      .eq('id', masterCash.id)
  ]);
}

async function fixPayment(payment: PaidPayment) {
  if (!payment.project_id) {
    console.log(`❌ Pago ${payment.id}: No se encontró project_id`);
    return false;
  }

  try {
    console.log(`💰 Procesando pago ${payment.id}:`);
    console.log(`   Monto: $${payment.amount}`);
    console.log(`   Proyecto: ${payment.project_id}`);
    console.log(`   Descripción: ${payment.notes || 'Sin descripción'}`);

    await processProjectExpense({
      projectId: payment.project_id,
      amount: payment.amount,
      description: `Corrección: Pago a proveedor - ${payment.notes || 'Sin descripción'}`,
      contractorPaymentId: payment.id,
      currency: 'ARS'
    });

    console.log(`   ✅ Descuento aplicado correctamente\n`);
    return true;
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  CORRECCIÓN DE PAGOS A CONTRATISTAS');
  console.log('═══════════════════════════════════════════════════════════\n');

  const paymentsToFix = await findPaidPaymentsWithoutCashMovement();

  if (paymentsToFix.length === 0) {
    console.log('✅ No hay pagos que corregir. Todos los pagos tienen movimiento de caja.\n');
    return;
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  APLICANDO CORRECCIONES');
  console.log('═══════════════════════════════════════════════════════════\n');

  let successCount = 0;
  let errorCount = 0;

  for (const payment of paymentsToFix) {
    const success = await fixPayment(payment);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  RESUMEN');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Total de pagos procesados: ${paymentsToFix.length}`);
  console.log(`✅ Corregidos exitosamente: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

// Ejecutar el script
main().catch(console.error);
