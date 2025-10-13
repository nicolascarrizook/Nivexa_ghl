/**
 * INTEGRATION TEST - Cash Flow System
 *
 * Este test verifica el flujo completo de caja:
 * 1. Creación de proyecto con anticipo
 * 2. Registro en cajas (project_cash y master_cash)
 * 3. Movimientos de caja registrados
 * 4. Balances correctos en todas las cajas
 *
 * IMPORTANTE: Este test requiere una base de datos real de Supabase
 * NO ejecutar en producción
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '@/config/supabase';
import { newCashBoxService } from '@/services/cash/NewCashBoxService';

describe('Cash Flow Integration Test', () => {
  let testProjectId: string;
  let testProjectCashId: string;

  beforeAll(async () => {
    console.log('\n🧪 === INICIO DEL TEST DE INTEGRACIÓN ===\n');
  });

  afterAll(async () => {
    // Cleanup - eliminar datos de prueba
    if (testProjectId) {
      console.log('\n🧹 Limpiando datos de prueba...');

      // Eliminar movimientos
      await supabase
        .from('cash_movements')
        .delete()
        .eq('project_id', testProjectId);

      // Eliminar installments
      await supabase
        .from('installments')
        .delete()
        .eq('project_id', testProjectId);

      // Eliminar payments
      await supabase
        .from('payments')
        .delete()
        .eq('project_id', testProjectId);

      // Eliminar project_cash
      await supabase
        .from('project_cash')
        .delete()
        .eq('project_id', testProjectId);

      // Eliminar proyecto
      await supabase
        .from('projects')
        .delete()
        .eq('id', testProjectId);

      console.log('✅ Datos de prueba eliminados\n');
    }

    console.log('🏁 === FIN DEL TEST DE INTEGRACIÓN ===\n');
  });

  it('1. Debe verificar que existen las tablas necesarias', async () => {
    console.log('\n📋 Verificando estructura de tablas...');

    // Verificar master_cash
    const { data: masterCash, error: masterError } = await supabase
      .from('master_cash')
      .select('id, balance')
      .limit(1);

    if (masterError) {
      console.error('❌ Error al acceder a master_cash:', masterError);
      throw new Error(`master_cash no existe o no es accesible: ${masterError.message}`);
    }

    console.log('✅ Tabla master_cash existe');

    // Verificar project_cash
    const { data: projectCash, error: projectError } = await supabase
      .from('project_cash')
      .select('id')
      .limit(1);

    if (projectError) {
      console.error('❌ Error al acceder a project_cash:', projectError);
      throw new Error(`project_cash no existe o no es accesible: ${projectError.message}`);
    }

    console.log('✅ Tabla project_cash existe');

    // Verificar cash_movements
    const { data: movements, error: movementsError } = await supabase
      .from('cash_movements')
      .select('id')
      .limit(1);

    if (movementsError) {
      console.error('❌ Error al acceder a cash_movements:', movementsError);
      throw new Error(`cash_movements no existe o no es accesible: ${movementsError.message}`);
    }

    console.log('✅ Tabla cash_movements existe\n');

    expect(masterError).toBeNull();
    expect(projectError).toBeNull();
    expect(movementsError).toBeNull();
  });

  it('2. Debe obtener o crear master_cash', async () => {
    console.log('\n💰 Verificando master_cash...');

    const masterCash = await newCashBoxService.getMasterCash();

    console.log('Master Cash:', {
      id: masterCash?.id,
      balance: masterCash?.balance,
    });

    expect(masterCash).toBeTruthy();
    expect(masterCash?.id).toBeTruthy();
    console.log('✅ Master cash encontrada\n');
  });

  it('3. Debe crear un proyecto de prueba con anticipo', async () => {
    console.log('\n🏗️  Creando proyecto de prueba...');

    const downPaymentAmount = 3899.7;
    const totalAmount = 10000;

    // Crear proyecto
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        code: `PRY-TEST-${Date.now()}`,
        name: 'Test Project - Cash Flow',
        client_name: 'Test Client',
        total_amount: totalAmount,
        down_payment_amount: downPaymentAmount,
        installments_count: 12,
        project_type: 'residential',
        status: 'active',
        currency: 'ARS',
      })
      .select()
      .single();

    if (projectError) {
      console.error('❌ Error al crear proyecto:', projectError);
      throw projectError;
    }

    testProjectId = project.id;
    console.log('✅ Proyecto creado:', {
      id: project.id,
      code: project.code,
      downPayment: downPaymentAmount,
    });

    // Crear project_cash
    const { data: projectCash, error: cashError } = await supabase
      .from('project_cash')
      .insert({
        project_id: testProjectId,
        balance: 0,
        total_received: 0,
      })
      .select()
      .single();

    if (cashError) {
      console.error('❌ Error al crear project_cash:', cashError);
      throw cashError;
    }

    testProjectCashId = projectCash.id;
    console.log('✅ Project cash creada:', {
      id: projectCash.id,
      balance: projectCash.balance,
    });

    // Crear installment para anticipo
    const { data: installment, error: installmentError } = await supabase
      .from('installments')
      .insert({
        project_id: testProjectId,
        installment_number: 0, // Anticipo
        amount: downPaymentAmount,
        due_date: new Date().toISOString().split('T')[0],
        status: 'pending',
        paid_amount: 0,
        late_fee_applied: 0,
      })
      .select()
      .single();

    if (installmentError) {
      console.error('❌ Error al crear installment:', installmentError);
      throw installmentError;
    }

    console.log('✅ Installment de anticipo creada:', {
      id: installment.id,
      amount: installment.amount,
    });

    console.log('\n');

    expect(project).toBeTruthy();
    expect(projectCash).toBeTruthy();
    expect(installment).toBeTruthy();
  });

  it('4. Debe procesar el pago del anticipo a las cajas', async () => {
    console.log('\n💸 Procesando pago de anticipo...');

    const downPaymentAmount = 3899.7;

    // Obtener installment del anticipo
    const { data: installment } = await supabase
      .from('installments')
      .select('*')
      .eq('project_id', testProjectId)
      .eq('installment_number', 0)
      .single();

    if (!installment) {
      throw new Error('Installment de anticipo no encontrado');
    }

    // Procesar pago usando el servicio
    await newCashBoxService.processProjectPayment({
      projectId: testProjectId,
      amount: downPaymentAmount,
      description: `Anticipo - Test Project`,
      installmentId: installment.id,
    });

    console.log('✅ Pago procesado\n');

    // Marcar installment como pagada
    await supabase
      .from('installments')
      .update({
        status: 'paid',
        paid_amount: downPaymentAmount,
        paid_date: new Date().toISOString(),
      })
      .eq('id', installment.id);

    console.log('✅ Installment marcada como pagada\n');
  });

  it('5. Debe verificar que project_cash tiene el balance correcto', async () => {
    console.log('\n🔍 Verificando balance de project_cash...');

    const { data: projectCash, error } = await supabase
      .from('project_cash')
      .select('*')
      .eq('project_id', testProjectId)
      .single();

    console.log('Project Cash:', {
      id: projectCash?.id,
      balance: projectCash?.balance,
      total_received: projectCash?.total_received,
    });

    expect(error).toBeNull();
    expect(projectCash).toBeTruthy();
    expect(projectCash?.balance).toBeGreaterThan(0);
    expect(projectCash?.balance).toBe(3899.7);
    console.log('✅ Balance de project_cash correcto\n');
  });

  it('6. Debe verificar que master_cash tiene el balance correcto', async () => {
    console.log('\n🔍 Verificando balance de master_cash...');

    const masterCash = await newCashBoxService.getMasterCash();

    console.log('Master Cash:', {
      id: masterCash?.id,
      balance: masterCash?.balance,
    });

    expect(masterCash).toBeTruthy();
    expect(masterCash?.balance).toBeGreaterThan(0);
    expect(masterCash?.balance).toBeGreaterThanOrEqual(3899.7);
    console.log('✅ Balance de master_cash correcto\n');
  });

  it('7. Debe verificar que se crearon los movimientos de caja', async () => {
    console.log('\n🔍 Verificando movimientos de caja...');

    const { data: movements, error } = await supabase
      .from('cash_movements')
      .select('*')
      .eq('project_id', testProjectId)
      .order('created_at', { ascending: true });

    console.log(`📊 Total de movimientos: ${movements?.length || 0}`);

    movements?.forEach((mov, index) => {
      console.log(`\nMovimiento ${index + 1}:`, {
        type: mov.movement_type,
        amount: mov.amount,
        source: `${mov.source_type} (${mov.source_id?.substring(0, 8)})`,
        destination: `${mov.destination_type} (${mov.destination_id?.substring(0, 8)})`,
        description: mov.description,
      });
    });

    expect(error).toBeNull();
    expect(movements).toBeTruthy();
    expect(movements?.length).toBeGreaterThan(0);

    // Debe haber al menos 2 movimientos:
    // 1. project_income (external -> project)
    // 2. master_duplication (project -> master)
    const hasProjectIncome = movements?.some(m => m.movement_type === 'project_income');
    const hasMasterDuplication = movements?.some(m => m.movement_type === 'master_duplication');

    console.log('\n✅ Tipos de movimientos encontrados:', {
      project_income: hasProjectIncome,
      master_duplication: hasMasterDuplication,
    });

    expect(hasProjectIncome).toBe(true);
    expect(hasMasterDuplication).toBe(true);
    console.log('\n✅ Movimientos de caja correctos\n');
  });

  it('8. Debe verificar que admin_cash está en cero (sin cobros de honorarios)', async () => {
    console.log('\n🔍 Verificando admin_cash...');

    const adminCash = await newCashBoxService.getAdminCash();

    console.log('Admin Cash:', {
      id: adminCash?.id,
      balance: adminCash?.balance,
      total_collected: adminCash?.total_collected,
    });

    expect(adminCash).toBeTruthy();
    // Admin cash debe estar en cero porque no se han cobrado honorarios aún
    expect(adminCash?.balance).toBe(0);
    expect(adminCash?.total_collected).toBe(0);
    console.log('✅ Admin cash en cero (correcto - sin cobros)\n');
  });

  it('9. Resumen final del sistema de cajas', async () => {
    console.log('\n📊 === RESUMEN FINAL ===');

    const summary = await newCashBoxService.getDashboardSummary();

    console.log('\n💰 Balances finales:');
    console.log('  - Master Cash:', summary.masterBalance);
    console.log('  - Admin Cash:', summary.adminBalance);
    console.log('  - Projects Total:', summary.projectsTotal);
    console.log('  - Projects Count:', summary.projectsCount);

    console.log('\n✅ Sistema funcionando correctamente si:');
    console.log('  ✓ Master Cash > 0 (debe reflejar el anticipo)');
    console.log('  ✓ Admin Cash = 0 (sin cobros de honorarios)');
    console.log('  ✓ Projects Total = anticipo del proyecto\n');

    expect(summary.masterBalance).toBeGreaterThan(0);
    expect(summary.adminBalance).toBe(0);
    expect(summary.projectsTotal).toBeGreaterThan(0);
  });
});
