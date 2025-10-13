/**
 * SCRIPT DE DIAGNÓSTICO - Sistema de Cajas
 *
 * Este script verifica el estado actual del sistema de cajas y reporta problemas
 *
 * Uso:
 * npm run dev -- --diagnostic
 * o
 * npx tsx src/scripts/diagnose-cash-system.ts
 */

import { supabase } from './supabase-config';

interface DiagnosticResult {
  status: 'ok' | 'warning' | 'error';
  message: string;
  data?: any;
}

async function diagnoseMasterCash(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  console.log('\n🔍 === DIAGNÓSTICO: MASTER CASH ===\n');

  // Verificar tabla master_cash
  const { data: masterCash, error: masterError } = await supabase
    .from('master_cash')
    .select('*')
    .limit(1)
    .single();

  if (masterError) {
    results.push({
      status: 'error',
      message: `❌ Error al acceder a master_cash: ${masterError.message}`,
    });
  } else if (!masterCash) {
    results.push({
      status: 'warning',
      message: '⚠️  Master cash no existe - debe crearse',
    });
  } else {
    results.push({
      status: 'ok',
      message: '✅ Master cash existe',
      data: {
        id: masterCash.id,
        balance: masterCash.balance,
        last_movement_at: masterCash.last_movement_at,
      },
    });
    console.log('Master Cash:', masterCash);
  }

  // Verificar master_cash_box (tabla nueva)
  const { data: masterCashBox, error: masterBoxError } = await supabase
    .from('master_cash_box')
    .select('*')
    .limit(1);

  if (!masterBoxError && masterCashBox && masterCashBox.length > 0) {
    results.push({
      status: 'warning',
      message: '⚠️  Existe tabla master_cash_box (sistema dual detectado)',
      data: masterCashBox[0],
    });
    console.log('Master Cash Box:', masterCashBox[0]);
  }

  return results;
}

async function diagnoseProjectCash(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  console.log('\n🔍 === DIAGNÓSTICO: PROJECT CASH ===\n');

  // Obtener todos los proyectos
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, code, name, total_amount, down_payment_amount')
    .order('created_at', { ascending: false })
    .limit(10);

  if (projectsError) {
    results.push({
      status: 'error',
      message: `❌ Error al obtener proyectos: ${projectsError.message}`,
    });
    return results;
  }

  console.log(`📊 Total de proyectos: ${projects?.length || 0}\n`);

  for (const project of projects || []) {
    console.log(`\n--- Proyecto: ${project.code} ---`);
    console.log(`Nombre: ${project.name}`);
    console.log(`Anticipo: $${project.down_payment_amount || 0}`);

    // Verificar project_cash
    const { data: projectCash, error: cashError } = await supabase
      .from('project_cash')
      .select('*')
      .eq('project_id', project.id)
      .single();

    if (cashError) {
      results.push({
        status: 'error',
        message: `❌ Project ${project.code}: Sin caja asociada`,
        data: { projectId: project.id, error: cashError.message },
      });
      console.log(`❌ Sin project_cash`);
    } else {
      console.log(`Balance: $${projectCash.balance || 0}`);
      console.log(`Total recibido: $${projectCash.total_received || 0}`);

      if (project.down_payment_amount > 0 && projectCash.balance === 0) {
        results.push({
          status: 'warning',
          message: `⚠️  Project ${project.code}: Anticipo de $${project.down_payment_amount} pero balance en $0`,
          data: { projectId: project.id, downPayment: project.down_payment_amount },
        });
      } else if (projectCash.balance > 0) {
        results.push({
          status: 'ok',
          message: `✅ Project ${project.code}: Balance correcto ($${projectCash.balance})`,
        });
      }
    }

    // Verificar installments
    const { data: installments, error: installmentsError } = await supabase
      .from('installments')
      .select('*')
      .eq('project_id', project.id)
      .eq('installment_number', 0); // Anticipo

    if (!installmentsError && installments && installments.length > 0) {
      const downPayment = installments[0];
      console.log(`Installment anticipo: ${downPayment.status}, pagado: $${downPayment.paid_amount || 0}`);

      if (downPayment.status === 'paid' && projectCash && projectCash.balance === 0) {
        results.push({
          status: 'error',
          message: `❌ Project ${project.code}: Installment marcada como pagada pero balance en $0`,
          data: { projectId: project.id, installmentId: downPayment.id },
        });
      }
    }

    // Verificar movimientos de caja
    const { data: movements, error: movementsError } = await supabase
      .from('cash_movements')
      .select('*')
      .eq('project_id', project.id);

    if (!movementsError) {
      console.log(`Movimientos de caja: ${movements?.length || 0}`);
      if (projectCash && projectCash.balance > 0 && (!movements || movements.length === 0)) {
        results.push({
          status: 'warning',
          message: `⚠️  Project ${project.code}: Tiene balance pero sin movimientos registrados`,
          data: { projectId: project.id, balance: projectCash.balance },
        });
      }
    }
  }

  return results;
}

async function diagnoseCashMovements(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  console.log('\n🔍 === DIAGNÓSTICO: MOVIMIENTOS DE CAJA ===\n');

  // Obtener todos los movimientos recientes
  const { data: movements, error: movementsError } = await supabase
    .from('cash_movements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (movementsError) {
    results.push({
      status: 'error',
      message: `❌ Error al obtener movimientos: ${movementsError.message}`,
    });
    return results;
  }

  console.log(`📊 Total de movimientos (últimos 20): ${movements?.length || 0}\n`);

  // Agrupar por tipo
  const byType: Record<string, number> = {};
  movements?.forEach(mov => {
    byType[mov.movement_type] = (byType[mov.movement_type] || 0) + 1;
  });

  console.log('Movimientos por tipo:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });

  if (!movements || movements.length === 0) {
    results.push({
      status: 'warning',
      message: '⚠️  No hay movimientos de caja registrados',
    });
  } else {
    results.push({
      status: 'ok',
      message: `✅ ${movements.length} movimientos encontrados`,
    });
  }

  return results;
}

async function diagnoseAdminCash(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  console.log('\n🔍 === DIAGNÓSTICO: ADMIN CASH ===\n');

  const { data: adminCash, error: adminError } = await supabase
    .from('admin_cash')
    .select('*')
    .limit(1)
    .single();

  if (adminError) {
    if (adminError.code === 'PGRST116') {
      results.push({
        status: 'warning',
        message: '⚠️  Admin cash no existe - debe crearse',
      });
    } else {
      results.push({
        status: 'error',
        message: `❌ Error al acceder a admin_cash: ${adminError.message}`,
      });
    }
  } else {
    results.push({
      status: 'ok',
      message: '✅ Admin cash existe',
      data: {
        id: adminCash.id,
        balance: adminCash.balance,
        total_collected: adminCash.total_collected,
      },
    });
    console.log('Admin Cash:', adminCash);
  }

  return results;
}

async function runDiagnostics() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║        DIAGNÓSTICO DEL SISTEMA DE CAJAS               ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  const allResults: DiagnosticResult[] = [];

  // Ejecutar diagnósticos
  allResults.push(...(await diagnoseMasterCash()));
  allResults.push(...(await diagnoseProjectCash()));
  allResults.push(...(await diagnoseCashMovements()));
  allResults.push(...(await diagnoseAdminCash()));

  // Resumen
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                    RESUMEN                             ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const errors = allResults.filter(r => r.status === 'error');
  const warnings = allResults.filter(r => r.status === 'warning');
  const ok = allResults.filter(r => r.status === 'ok');

  console.log(`✅ Correcto: ${ok.length}`);
  console.log(`⚠️  Advertencias: ${warnings.length}`);
  console.log(`❌ Errores: ${errors.length}\n`);

  if (errors.length > 0) {
    console.log('🚨 ERRORES CRÍTICOS:');
    errors.forEach(e => console.log(`  ${e.message}`));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  ADVERTENCIAS:');
    warnings.forEach(w => console.log(`  ${w.message}`));
    console.log('');
  }

  // Recomendaciones
  console.log('💡 RECOMENDACIONES:\n');

  if (errors.some(e => e.message.includes('project_cash'))) {
    console.log('  1. Verificar que cada proyecto tenga su caja asociada');
    console.log('     SQL: SELECT p.id, p.code, pc.id as cash_id');
    console.log('          FROM projects p');
    console.log('          LEFT JOIN project_cash pc ON p.id = pc.project_id');
    console.log('          WHERE pc.id IS NULL;\n');
  }

  if (warnings.some(w => w.message.includes('balance en $0'))) {
    console.log('  2. Verificar el flujo de procesamiento de pagos');
    console.log('     - Revisar newCashBoxService.processProjectPayment()');
    console.log('     - Verificar que se crean los movimientos correctos\n');
  }

  if (allResults.some(r => r.message.includes('movimientos registrados'))) {
    console.log('  3. Verificar que los pagos llaman a processProjectPayment()');
    console.log('     - El anticipo debe procesarse automáticamente');
    console.log('     - Las cuotas deben procesarse al marcarlas como pagadas\n');
  }

  console.log('\n');
  console.log('═'.repeat(58));
  console.log('  Para ejecutar tests de integración:');
  console.log('  npm test src/tests/integration/cash-flow.integration.test.ts');
  console.log('═'.repeat(58));
  console.log('\n');
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runDiagnostics()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('\n❌ Error ejecutando diagnóstico:', error);
      process.exit(1);
    });
}

export { runDiagnostics };
