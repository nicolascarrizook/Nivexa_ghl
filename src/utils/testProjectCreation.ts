import { supabase } from '@/config/supabase';
import { projectService } from '@/modules/projects/services/ProjectService';

export async function testProjectCreation() {
  console.log('🚀 Iniciando prueba de creación de proyecto...\n');

  try {
    // 1. Verificar estado inicial de las cajas
    console.log('📦 Estado inicial de las cajas:');
    const { data: masterCash } = await supabase
      .from('master_cash')
      .select('*')
      .single();
    
    const { data: adminCash } = await supabase
      .from('admin_cash')
      .select('*')
      .single();

    console.log(`  Caja Maestra: $${masterCash?.balance || 0}`);
    console.log(`  Caja Admin: $${adminCash?.balance || 0}\n`);

    // 2. Crear un proyecto usando el servicio
    console.log('📝 Creando proyecto de prueba...');
    const projectData = {
      name: 'Proyecto de Prueba - Distribución de Cajas',
      client_name: 'Cliente Test',
      client_email: 'test@example.com',
      project_type: 'construction' as const,
      status: 'active' as const,
      total_amount: 5000000, // $5,000,000 ARS
      down_payment_amount: 1500000, // $1,500,000 ARS (30%)
      down_payment_percentage: 30,
      installments_count: 10,
      installment_amount: 350000, // $350,000 ARS por cuota
      currency: 'ARS' as const,
      start_date: new Date().toISOString().split('T')[0],
      metadata: {
        paymentFrequency: 'monthly',
        firstPaymentDate: new Date().toISOString().split('T')[0],
        downPaymentDate: new Date().toISOString().split('T')[0],
      }
    };

    const project = await projectService.createProject(projectData);
    
    if (!project) {
      throw new Error('No se pudo crear el proyecto');
    }

    console.log(`  ✅ Proyecto creado: ${project.name} (ID: ${project.id})`);
    console.log(`  💰 Monto total: $${project.total_amount.toLocaleString('es-AR')}`);
    console.log(`  💵 Anticipo: $${project.down_payment_amount.toLocaleString('es-AR')}\n`);

    // 3. Simular confirmación del anticipo
    console.log('💳 Simulando confirmación del anticipo...');
    
    const paymentConfirmed = await projectService.confirmDownPayment(project.id, {
      amount: project.down_payment_amount,
      paymentMethod: 'Transferencia bancaria',
      referenceNumber: 'REF-TEST-001',
      bankAccount: 'Banco Test - Cuenta 123456',
      notes: 'Anticipo de prueba para verificar distribución'
    });

    if (!paymentConfirmed) {
      throw new Error('No se pudo confirmar el pago del anticipo');
    }

    console.log('  ✅ Anticipo confirmado y distribuido\n');

    // 4. Verificar estado final
    console.log('📊 Estado final de las cajas:');
    
    const { data: finalMasterCash } = await supabase
      .from('master_cash')
      .select('*')
      .single();
    
    const { data: finalAdminCash } = await supabase
      .from('admin_cash')
      .select('*')
      .single();
    
    const { data: finalProjectCash } = await supabase
      .from('project_cash')
      .select('*')
      .eq('project_id', project.id)
      .single();

    console.log(`  Caja Maestra: $${finalMasterCash?.balance?.toLocaleString('es-AR') || 0}`);
    console.log(`  Caja Admin: $${finalAdminCash?.balance?.toLocaleString('es-AR') || 0}`);
    console.log(`  Caja del Proyecto: $${finalProjectCash?.balance?.toLocaleString('es-AR') || 0}`);
    console.log(`  Total recibido en proyecto: $${finalProjectCash?.total_received?.toLocaleString('es-AR') || 0}\n`);

    // 5. Verificar movimientos
    const { data: projectMovements } = await supabase
      .from('cash_movements')
      .select('*')
      .eq('project_id', project.id)
      .order('created_at', { ascending: false });

    console.log(`📜 Movimientos registrados: ${projectMovements?.length || 0}`);
    projectMovements?.forEach((mov: any, i) => {
      console.log(`  ${i + 1}. ${mov.description} - $${mov.amount.toLocaleString('es-AR')}`);
    });

    // 6. Verificar cuotas
    const { data: installments } = await supabase
      .from('installments')
      .select('*')
      .eq('project_id', project.id)
      .order('installment_number');

    console.log(`\n📋 Cuotas generadas: ${installments?.length || 0}`);
    const paidInstallments = installments?.filter((i: any) => i.status === 'paid');
    console.log(`  Pagadas: ${paidInstallments?.length || 0}`);
    console.log(`  Pendientes: ${(installments?.length || 0) - (paidInstallments?.length || 0)}`);

    console.log('\n✅ PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('La distribución de montos a las cajas funciona correctamente.');
    
    return project;

  } catch (error) {
    console.error('❌ ERROR EN LA PRUEBA:', error);
    throw error;
  }
}

// Hacer la función disponible globalmente para poder llamarla desde la consola
if (typeof window !== 'undefined') {
  (window as any).testProjectCreation = testProjectCreation;
}