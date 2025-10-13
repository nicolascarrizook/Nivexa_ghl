/**
 * SCRIPT DE DIAGNÓSTICO DETALLADO - Sistema de Cajas
 *
 * Diagnóstico avanzado para problemas críticos del sistema de cajas
 */

import { supabase } from './supabase-config';

async function diagnoseInDetail() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║        DIAGNÓSTICO DETALLADO - SISTEMA DE CAJAS       ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // 1. Check authentication
  console.log('🔐 === AUTENTICACIÓN ===\n');
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.log('❌ No hay usuario autenticado');
    console.log('   Error:', authError?.message);
    console.log('\n   Para conectarse:');
    console.log('   1. Abre la aplicación en el navegador');
    console.log('   2. Inicia sesión');
    console.log('   3. Ejecuta este script nuevamente\n');
    return;
  }

  console.log('✅ Usuario autenticado:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email || 'N/A'}`);
  console.log('');

  // 2. Check master_cash issues
  console.log('🔍 === MASTER CASH - ANÁLISIS DETALLADO ===\n');

  // Get ALL records (not single)
  const { data: masterCashRecords, error: masterError } = await supabase
    .from('master_cash')
    .select('*');

  console.log(`📊 Total de registros en master_cash: ${masterCashRecords?.length || 0}`);

  if (masterError) {
    console.log(`❌ Error al acceder a master_cash: ${masterError.message}`);
  } else if (!masterCashRecords || masterCashRecords.length === 0) {
    console.log('⚠️  No existen registros en master_cash');
    console.log('   Esto es crítico - debe haber exactamente 1 registro\n');
  } else if (masterCashRecords.length > 1) {
    console.log('🚨 PROBLEMA CRÍTICO: Múltiples registros en master_cash\n');
    console.log('   Debería haber exactamente 1 registro, pero hay', masterCashRecords.length);
    console.log('\n   Registros encontrados:');
    masterCashRecords.forEach((record, index) => {
      console.log(`   ${index + 1}. ID: ${record.id}, Balance: ${record.balance || 0}`);
    });
    console.log('\n   SOLUCIÓN: Eliminar registros duplicados, dejando solo uno\n');
  } else {
    console.log('✅ Un solo registro en master_cash (correcto)');
    console.log(`   ID: ${masterCashRecords[0].id}`);
    console.log(`   Balance: ${masterCashRecords[0].balance || 0}`);
    console.log('');
  }

  // 3. Check admin_cash
  console.log('🔍 === ADMIN CASH - ANÁLISIS ===\n');

  const { data: adminCashRecords, error: adminError } = await supabase
    .from('admin_cash')
    .select('*');

  console.log(`📊 Total de registros en admin_cash: ${adminCashRecords?.length || 0}`);

  if (adminError) {
    console.log(`❌ Error al acceder a admin_cash: ${adminError.message}`);
  } else if (!adminCashRecords || adminCashRecords.length === 0) {
    console.log('⚠️  No existen registros en admin_cash - debe crearse uno\n');
  } else if (adminCashRecords.length > 1) {
    console.log('🚨 PROBLEMA: Múltiples registros en admin_cash\n');
  } else {
    console.log('✅ Admin cash existe');
    console.log(`   ID: ${adminCashRecords[0].id}`);
    console.log(`   Balance: ${adminCashRecords[0].balance || 0}`);
    console.log('');
  }

  // 4. Check projects
  console.log('🔍 === PROYECTOS - ANÁLISIS ===\n');

  const { data: projects, error: projectsError, count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (projectsError) {
    console.log(`❌ Error al acceder a proyectos: ${projectsError.message}`);
  } else {
    console.log(`📊 Total de proyectos: ${projectCount || 0}`);

    if (projects && projects.length > 0) {
      console.log('\n   Proyectos encontrados:');
      projects.forEach((project, index) => {
        console.log(`   ${index + 1}. ${project.code} - ${project.name}`);
        console.log(`      Total: $${project.total_amount || 0}`);
        console.log(`      Anticipo: $${project.down_payment_amount || 0}`);
        console.log(`      Estado: ${project.status}`);
      });
    } else {
      console.log('   No hay proyectos en la base de datos');
    }
    console.log('');
  }

  // 5. Check project_cash
  console.log('🔍 === PROJECT CASH - ANÁLISIS ===\n');

  const { data: projectCash, error: projectCashError, count: projectCashCount } = await supabase
    .from('project_cash')
    .select('*', { count: 'exact' });

  console.log(`📊 Total de cajas de proyecto: ${projectCashCount || 0}`);

  if (projectCashError) {
    console.log(`❌ Error al acceder a project_cash: ${projectCashError.message}`);
  } else if (projectCash && projectCash.length > 0) {
    console.log('\n   Cajas de proyecto:');
    projectCash.forEach((cash, index) => {
      console.log(`   ${index + 1}. Project ID: ${cash.project_id}`);
      console.log(`      Balance: $${cash.balance || 0}`);
      console.log(`      Total recibido: $${cash.total_received || 0}`);
    });
  }
  console.log('');

  // 6. Check cash_movements
  console.log('🔍 === MOVIMIENTOS DE CAJA - ANÁLISIS ===\n');

  const { data: movements, error: movementsError, count: movementCount } = await supabase
    .from('cash_movements')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(10);

  console.log(`📊 Total de movimientos: ${movementCount || 0}`);

  if (movementsError) {
    console.log(`❌ Error al acceder a movimientos: ${movementsError.message}`);
  } else if (movements && movements.length > 0) {
    console.log('\n   Últimos movimientos:');
    movements.forEach((mov, index) => {
      console.log(`   ${index + 1}. ${mov.movement_type} - $${mov.amount}`);
      console.log(`      Fecha: ${new Date(mov.created_at).toLocaleString()}`);
      console.log(`      Descripción: ${mov.description || 'N/A'}`);
    });
  } else {
    console.log('   No hay movimientos registrados');
  }
  console.log('');

  // 7. Check installments
  console.log('🔍 === INSTALLMENTS - ANÁLISIS ===\n');

  const { data: installments, error: installmentsError, count: installmentCount } = await supabase
    .from('installments')
    .select('*', { count: 'exact' });

  console.log(`📊 Total de installments: ${installmentCount || 0}`);

  if (installmentsError) {
    console.log(`❌ Error al acceder a installments: ${installmentsError.message}`);
  } else if (installments && installments.length > 0) {
    const paid = installments.filter(i => i.status === 'paid').length;
    const pending = installments.filter(i => i.status === 'pending').length;
    console.log(`   Pagadas: ${paid}`);
    console.log(`   Pendientes: ${pending}`);
  }
  console.log('');

  // 8. Summary and recommendations
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                    RESUMEN Y SOLUCIONES               ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  if (masterCashRecords && masterCashRecords.length > 1) {
    console.log('🔧 ACCIÓN REQUERIDA: Limpiar registros duplicados en master_cash');
    console.log('   Ejecuta este SQL en Supabase:');
    console.log('   ```sql');
    console.log('   -- Ver registros duplicados');
    console.log('   SELECT * FROM master_cash;');
    console.log('');
    console.log('   -- Eliminar duplicados (mantén el más reciente)');
    console.log('   DELETE FROM master_cash');
    console.log('   WHERE id NOT IN (');
    console.log('     SELECT id FROM master_cash');
    console.log('     ORDER BY created_at DESC');
    console.log('     LIMIT 1');
    console.log('   );');
    console.log('   ```\n');
  }

  if (!projects || projects.length === 0) {
    console.log('💡 No hay proyectos en la base de datos');
    console.log('   Esto explica por qué no hay movimientos ni balances');
    console.log('   Crea un proyecto con anticipo para probar el flujo\n');
  }

  if (projects && projects.length > 0 && (!movements || movements.length === 0)) {
    console.log('🚨 PROBLEMA CRÍTICO: Hay proyectos pero no hay movimientos');
    console.log('   El método processProjectPayment() no se está ejecutando');
    console.log('   Verifica ProjectService.createProject() línea 184\n');
  }

  console.log('══════════════════════════════════════════════════════════\n');
}

// Run diagnostic
diagnoseInDetail()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Error ejecutando diagnóstico:', error);
    process.exit(1);
  });
