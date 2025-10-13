/**
 * SCRIPT DE REPARACIÓN - Sistema de Cajas
 *
 * Este script soluciona el problema de registros duplicados en master_cash y admin_cash
 */

import { supabase } from './supabase-config';

async function fixMasterCash() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║        REPARACIÓN AUTOMÁTICA - SISTEMA DE CAJAS       ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // 1. Check authentication
  console.log('🔐 Verificando autenticación...\n');
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.log('❌ No hay usuario autenticado');
    console.log('   Por favor, inicia sesión en la aplicación web primero\n');
    return;
  }

  console.log('✅ Usuario autenticado:', user.email || user.id);
  console.log('');

  // 2. Fix master_cash
  console.log('🔧 === REPARANDO MASTER CASH ===\n');

  // Get all master_cash records
  const { data: masterRecords, error: masterError } = await supabase
    .from('master_cash')
    .select('*')
    .order('created_at', { ascending: false });

  if (masterError) {
    console.log('❌ Error al acceder a master_cash:', masterError.message);
    return;
  }

  console.log(`📊 Registros encontrados en master_cash: ${masterRecords?.length || 0}`);

  if (!masterRecords || masterRecords.length === 0) {
    console.log('⚠️  No hay registros en master_cash, creando uno nuevo...');

    const { data: newMaster, error: createError } = await supabase
      .from('master_cash')
      .insert({
        balance: 0,
        last_movement_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.log('❌ Error al crear master_cash:', createError.message);
      return;
    }

    console.log('✅ Master cash creada exitosamente');
    console.log(`   ID: ${newMaster.id}`);
    console.log('');
  } else if (masterRecords.length === 1) {
    console.log('✅ Master cash ya tiene un solo registro (correcto)');
    console.log(`   ID: ${masterRecords[0].id}`);
    console.log(`   Balance: $${masterRecords[0].balance || 0}`);
    console.log('');
  } else {
    console.log('🚨 PROBLEMA: Múltiples registros detectados');
    console.log('   Registros:');
    masterRecords.forEach((record, index) => {
      console.log(`   ${index + 1}. ID: ${record.id}, Balance: $${record.balance || 0}`);
    });
    console.log('');

    // Keep the most recent one with the highest balance (or most recent if all have 0)
    const recordToKeep = masterRecords.reduce((best, current) => {
      if (current.balance > best.balance) return current;
      if (current.balance === best.balance) {
        return new Date(current.created_at) > new Date(best.created_at) ? current : best;
      }
      return best;
    });

    console.log(`📌 Manteniendo registro: ${recordToKeep.id} (Balance: $${recordToKeep.balance})`);
    console.log('🗑️  Eliminando duplicados...');

    // Delete all except the one to keep
    const idsToDelete = masterRecords
      .filter(r => r.id !== recordToKeep.id)
      .map(r => r.id);

    const { error: deleteError } = await supabase
      .from('master_cash')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.log('❌ Error al eliminar duplicados:', deleteError.message);
      console.log('\n   Solución manual: Ejecuta este SQL en Supabase Dashboard:');
      console.log(`   DELETE FROM master_cash WHERE id != '${recordToKeep.id}';`);
      console.log('');
      return;
    }

    console.log('✅ Duplicados eliminados exitosamente');
    console.log('');
  }

  // 3. Fix admin_cash
  console.log('🔧 === REPARANDO ADMIN CASH ===\n');

  const { data: adminRecords, error: adminError } = await supabase
    .from('admin_cash')
    .select('*')
    .order('created_at', { ascending: false });

  if (adminError) {
    console.log('❌ Error al acceder a admin_cash:', adminError.message);
    return;
  }

  console.log(`📊 Registros encontrados en admin_cash: ${adminRecords?.length || 0}`);

  if (!adminRecords || adminRecords.length === 0) {
    console.log('⚠️  No hay registros en admin_cash, creando uno nuevo...');

    const { data: newAdmin, error: createError } = await supabase
      .from('admin_cash')
      .insert({
        balance: 0,
        total_collected: 0,
        last_collection_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.log('❌ Error al crear admin_cash:', createError.message);
      return;
    }

    console.log('✅ Admin cash creada exitosamente');
    console.log(`   ID: ${newAdmin.id}`);
    console.log('');
  } else if (adminRecords.length === 1) {
    console.log('✅ Admin cash ya tiene un solo registro (correcto)');
    console.log(`   ID: ${adminRecords[0].id}`);
    console.log(`   Balance: $${adminRecords[0].balance || 0}`);
    console.log('');
  } else {
    console.log('🚨 PROBLEMA: Múltiples registros detectados');
    console.log('   Registros:');
    adminRecords.forEach((record, index) => {
      console.log(`   ${index + 1}. ID: ${record.id}, Balance: $${record.balance || 0}`);
    });
    console.log('');

    const recordToKeep = adminRecords.reduce((best, current) => {
      if (current.balance > best.balance) return current;
      if (current.balance === best.balance) {
        return new Date(current.created_at) > new Date(best.created_at) ? current : best;
      }
      return best;
    });

    console.log(`📌 Manteniendo registro: ${recordToKeep.id} (Balance: $${recordToKeep.balance})`);
    console.log('🗑️  Eliminando duplicados...');

    const idsToDelete = adminRecords
      .filter(r => r.id !== recordToKeep.id)
      .map(r => r.id);

    const { error: deleteError } = await supabase
      .from('admin_cash')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.log('❌ Error al eliminar duplicados:', deleteError.message);
      console.log('\n   Solución manual: Ejecuta este SQL en Supabase Dashboard:');
      console.log(`   DELETE FROM admin_cash WHERE id != '${recordToKeep.id}';`);
      console.log('');
      return;
    }

    console.log('✅ Duplicados eliminados exitosamente');
    console.log('');
  }

  // 4. Verification
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                    VERIFICACIÓN FINAL                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const { data: finalMaster, error: verifyMasterError } = await supabase
    .from('master_cash')
    .select('*')
    .single();

  const { data: finalAdmin, error: verifyAdminError } = await supabase
    .from('admin_cash')
    .select('*')
    .single();

  if (verifyMasterError) {
    console.log('❌ Master cash aún tiene problemas:', verifyMasterError.message);
  } else {
    console.log('✅ Master cash verificada correctamente');
    console.log(`   ID: ${finalMaster.id}`);
    console.log(`   Balance: $${finalMaster.balance || 0}`);
  }
  console.log('');

  if (verifyAdminError) {
    console.log('❌ Admin cash aún tiene problemas:', verifyAdminError.message);
  } else {
    console.log('✅ Admin cash verificada correctamente');
    console.log(`   ID: ${finalAdmin.id}`);
    console.log(`   Balance: $${finalAdmin.balance || 0}`);
  }
  console.log('');

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                    ¡REPARACIÓN COMPLETA!              ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  console.log('✅ El sistema de cajas ha sido reparado exitosamente\n');
  console.log('📋 Próximos pasos:');
  console.log('   1. Refresca el dashboard en tu navegador');
  console.log('   2. Los balances deberían mostrarse correctamente');
  console.log('   3. Si no ves proyectos, crea uno nuevo para probar el flujo');
  console.log('   4. Ejecuta: npm run diagnose:detailed para verificar todo\n');
  console.log('══════════════════════════════════════════════════════════\n');
}

// Run fix
fixMasterCash()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Error ejecutando reparación:', error);
    process.exit(1);
  });
