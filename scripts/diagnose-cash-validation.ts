/**
 * Script de Diagnóstico - Validación de Fondos en Pagos a Contractors
 *
 * Este script verifica que el sistema valide correctamente los fondos
 * antes de permitir pagos a proveedores.
 *
 * Ejecutar con: npm run diagnose:validation
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database.types';

// Cargar variables de entorno desde .env
config();

// Configuración de Supabase desde variables de entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

interface DiagnosticResult {
  section: string;
  status: 'OK' | 'WARNING' | 'ERROR';
  message: string;
  data?: any;
}

const results: DiagnosticResult[] = [];

async function checkProjectCashBoxes() {
  console.log('\n📊 Verificando cajas de proyectos...\n');

  const { data: cashBoxes, error } = await supabase
    .from('project_cash_box')
    .select(`
      id,
      current_balance_ars,
      current_balance_usd,
      total_income_ars,
      total_income_usd,
      total_expenses_ars,
      total_expenses_usd,
      project:project_id (
        name,
        code
      )
    `)
    .eq('is_active', true)
    .limit(10);

  if (error) {
    results.push({
      section: 'Cajas de Proyectos',
      status: 'ERROR',
      message: `Error al consultar cajas: ${error.message}`,
    });
    return;
  }

  console.log(`✅ Encontradas ${cashBoxes?.length || 0} cajas activas\n`);

  cashBoxes?.forEach((box) => {
    const project = box.project as any;
    console.log(`Proyecto: ${project?.name || 'Sin nombre'} (${project?.code || 'N/A'})`);
    console.log(`  💵 ARS: $${box.current_balance_ars?.toFixed(2) || '0.00'}`);
    console.log(`  💵 USD: $${box.current_balance_usd?.toFixed(2) || '0.00'}`);
    console.log(`  📥 Ingresos: $${box.total_income_ars?.toFixed(2)} ARS / $${box.total_income_usd?.toFixed(2)} USD`);
    console.log(`  📤 Gastos: $${box.total_expenses_ars?.toFixed(2)} ARS / $${box.total_expenses_usd?.toFixed(2)} USD`);
    console.log('');
  });

  results.push({
    section: 'Cajas de Proyectos',
    status: 'OK',
    message: `${cashBoxes?.length || 0} cajas activas encontradas`,
    data: cashBoxes,
  });
}

async function checkPendingPaymentsWithFunds() {
  console.log('\n🔍 Verificando pagos pendientes vs fondos disponibles...\n');

  const { data: payments, error } = await supabase
    .from('contractor_payments')
    .select(`
      id,
      amount,
      currency,
      status,
      notes,
      project_contractor:project_contractor_id (
        id,
        project_id,
        contractor:contractor_id (
          name
        ),
        project:project_id (
          name,
          code,
          project_cash_box (
            current_balance_ars,
            current_balance_usd
          )
        )
      )
    `)
    .eq('status', 'pending')
    .limit(20);

  if (error) {
    results.push({
      section: 'Pagos Pendientes',
      status: 'ERROR',
      message: `Error al consultar pagos: ${error.message}`,
    });
    return;
  }

  if (!payments || payments.length === 0) {
    console.log('✅ No hay pagos pendientes\n');
    results.push({
      section: 'Pagos Pendientes',
      status: 'OK',
      message: 'No hay pagos pendientes',
    });
    return;
  }

  console.log(`Encontrados ${payments.length} pagos pendientes\n`);

  let insufficientFunds = 0;
  let sufficientFunds = 0;

  for (const payment of payments) {
    const pc = payment.project_contractor as any;
    const project = pc?.project as any;
    const contractor = pc?.contractor as any;
    const cashBox = project?.project_cash_box?.[0];

    if (!cashBox) {
      console.log(`⚠️ Pago ${payment.id}: Sin caja del proyecto`);
      continue;
    }

    const balanceArs = cashBox.current_balance_ars || 0;
    const balanceUsd = cashBox.current_balance_usd || 0;
    const hasFunds = payment.currency === 'USD'
      ? balanceUsd >= payment.amount
      : balanceArs >= payment.amount;

    const status = hasFunds ? '✅' : '❌';
    const fundStatus = hasFunds ? 'Fondos suficientes' : 'FONDOS INSUFICIENTES';

    console.log(`${status} Pago ID: ${payment.id}`);
    console.log(`   Proyecto: ${project?.name} (${project?.code})`);
    console.log(`   Proveedor: ${contractor?.name}`);
    console.log(`   Monto: $${payment.amount.toFixed(2)} ${payment.currency}`);
    console.log(`   Balance disponible: $${payment.currency === 'USD' ? balanceUsd.toFixed(2) : balanceArs.toFixed(2)} ${payment.currency}`);
    console.log(`   Estado: ${fundStatus}`);

    if (!hasFunds) {
      const deficit = payment.amount - (payment.currency === 'USD' ? balanceUsd : balanceArs);
      console.log(`   ⚠️ Déficit: $${deficit.toFixed(2)} ${payment.currency}`);
      insufficientFunds++;
    } else {
      sufficientFunds++;
    }

    console.log('');
  }

  if (insufficientFunds > 0) {
    results.push({
      section: 'Pagos Pendientes',
      status: 'WARNING',
      message: `⚠️ ${insufficientFunds} pagos pendientes NO tienen fondos suficientes`,
      data: { insufficientFunds, sufficientFunds, total: payments.length },
    });
  } else {
    results.push({
      section: 'Pagos Pendientes',
      status: 'OK',
      message: `✅ Todos los pagos pendientes (${sufficientFunds}) tienen fondos suficientes`,
    });
  }
}

async function checkCriticalCases() {
  console.log('\n⚠️ Buscando casos críticos (balance cero + pagos pendientes)...\n');

  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      code,
      project_cash_box (
        current_balance_ars,
        current_balance_usd
      ),
      project_contractors (
        id,
        contractor_payments (
          id,
          amount,
          currency,
          status
        )
      )
    `);

  if (error) {
    results.push({
      section: 'Casos Críticos',
      status: 'ERROR',
      message: `Error al buscar casos críticos: ${error.message}`,
    });
    return;
  }

  const criticalProjects = projects?.filter((p) => {
    const cashBox = (p.project_cash_box as any)?.[0];
    const contractors = (p.project_contractors as any) || [];

    if (!cashBox) return false;

    const hasZeroBalance = cashBox.current_balance_ars === 0 && cashBox.current_balance_usd === 0;
    const hasPendingPayments = contractors.some((pc: any) =>
      pc.contractor_payments?.some((cp: any) => cp.status === 'pending')
    );

    return hasZeroBalance && hasPendingPayments;
  });

  if (criticalProjects && criticalProjects.length > 0) {
    console.log(`🚨 Encontrados ${criticalProjects.length} proyectos críticos:\n`);

    criticalProjects.forEach((project) => {
      const contractors = (project.project_contractors as any) || [];
      const pendingPayments = contractors.flatMap((pc: any) =>
        (pc.contractor_payments || []).filter((cp: any) => cp.status === 'pending')
      );
      const totalPending = pendingPayments.reduce((sum: number, cp: any) => sum + cp.amount, 0);

      console.log(`🚨 ${project.name} (${project.code})`);
      console.log(`   Balance: $0.00 ARS / $0.00 USD`);
      console.log(`   Pagos pendientes: ${pendingPayments.length}`);
      console.log(`   Total a pagar: $${totalPending.toFixed(2)}`);
      console.log('');
    });

    results.push({
      section: 'Casos Críticos',
      status: 'ERROR',
      message: `🚨 ${criticalProjects.length} proyectos con balance CERO pero con pagos pendientes`,
      data: criticalProjects,
    });
  } else {
    console.log('✅ No se encontraron casos críticos\n');
    results.push({
      section: 'Casos Críticos',
      status: 'OK',
      message: 'No hay proyectos con balance cero y pagos pendientes',
    });
  }
}

async function checkRecentPaymentMovements() {
  console.log('\n📋 Verificando movimientos recientes de pagos a contractors...\n');

  const { data: movements, error } = await supabase
    .from('cash_movements')
    .select(`
      id,
      movement_type,
      amount,
      currency,
      description,
      created_at,
      contractor_payments (
        id,
        status
      )
    `)
    .eq('movement_type', 'project_expense')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    results.push({
      section: 'Movimientos Recientes',
      status: 'ERROR',
      message: `Error al consultar movimientos: ${error.message}`,
    });
    return;
  }

  if (!movements || movements.length === 0) {
    console.log('ℹ️ No hay movimientos recientes de pagos a contractors\n');
    results.push({
      section: 'Movimientos Recientes',
      status: 'OK',
      message: 'No hay movimientos recientes',
    });
    return;
  }

  console.log(`Últimos ${movements.length} movimientos:\n`);

  movements.forEach((mov) => {
    const payment = (mov.contractor_payments as any)?.[0];
    console.log(`• ${new Date(mov.created_at).toLocaleString('es-AR')}`);
    console.log(`  Monto: $${mov.amount?.toFixed(2)} ${mov.currency}`);
    console.log(`  Descripción: ${mov.description}`);
    if (payment) {
      console.log(`  Pago ID: ${payment.id} (${payment.status})`);
    }
    console.log('');
  });

  results.push({
    section: 'Movimientos Recientes',
    status: 'OK',
    message: `${movements.length} movimientos de pago registrados`,
  });
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('RESUMEN DEL DIAGNÓSTICO');
  console.log('='.repeat(60) + '\n');

  const errors = results.filter(r => r.status === 'ERROR');
  const warnings = results.filter(r => r.status === 'WARNING');
  const ok = results.filter(r => r.status === 'OK');

  console.log(`✅ OK: ${ok.length}`);
  console.log(`⚠️ ADVERTENCIAS: ${warnings.length}`);
  console.log(`❌ ERRORES: ${errors.length}\n`);

  if (errors.length > 0) {
    console.log('ERRORES ENCONTRADOS:');
    errors.forEach(e => {
      console.log(`  ❌ ${e.section}: ${e.message}`);
    });
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('ADVERTENCIAS:');
    warnings.forEach(w => {
      console.log(`  ⚠️ ${w.section}: ${w.message}`);
    });
    console.log('');
  }

  console.log('VERIFICACIÓN DE SEGURIDAD:');
  const hasCriticalIssues = errors.some(e => e.section === 'Casos Críticos');
  const hasInsufficientFunds = warnings.some(w => w.section === 'Pagos Pendientes');

  if (hasCriticalIssues) {
    console.log('  🚨 SE ENCONTRARON PROYECTOS CON BALANCE CERO Y PAGOS PENDIENTES');
    console.log('  🚨 RIESGO ALTO: El sistema podría permitir pagos sin fondos');
    console.log('  📝 Acción requerida: Revisar el fix implementado en useContractorPayments.ts');
  } else if (hasInsufficientFunds) {
    console.log('  ⚠️ Hay pagos pendientes sin fondos suficientes');
    console.log('  ✅ El sistema DEBERÍA bloquear estos pagos al intentar marcarlos como pagados');
    console.log('  📝 Recomendación: Probar marcar uno de estos pagos en el UI');
  } else {
    console.log('  ✅ No se detectaron problemas de seguridad');
    console.log('  ✅ Todos los pagos pendientes tienen fondos suficientes');
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

async function main() {
  console.log('\n🔍 INICIANDO DIAGNÓSTICO DE VALIDACIÓN DE FONDOS\n');
  console.log('Este script verifica que el sistema valide correctamente');
  console.log('los fondos disponibles antes de permitir pagos a contractors.\n');

  try {
    await checkProjectCashBoxes();
    await checkPendingPaymentsWithFunds();
    await checkCriticalCases();
    await checkRecentPaymentMovements();
    await printSummary();
  } catch (error) {
    console.error('\n❌ Error durante el diagnóstico:', error);
    process.exit(1);
  }
}

main();
