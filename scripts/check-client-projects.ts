import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY deben estar definidas en .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkClientProjects() {
  console.log('🔍 Verificando proyectos en la base de datos...\n');

  // 1. Get all clients
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (clientsError) {
    console.error('❌ Error obteniendo clientes:', clientsError);
    return;
  }

  console.log(`📋 Total de clientes: ${clients?.length || 0}\n`);

  // 2. For each client, get their projects
  for (const client of clients || []) {
    console.log(`\n👤 Cliente: ${client.name}`);
    console.log(`   ID: ${client.id}`);
    console.log(`   Email: ${client.email || 'N/A'}`);

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('   ❌ Error obteniendo proyectos:', projectsError);
      continue;
    }

    console.log(`   📊 Total proyectos: ${projects?.length || 0}`);

    if (projects && projects.length > 0) {
      for (const project of projects) {
        console.log(`\n      🏗️  Proyecto: ${project.name}`);
        console.log(`         - ID: ${project.id}`);
        console.log(`         - Código: ${project.code}`);
        console.log(`         - Estado: ${project.status}`);
        console.log(`         - Cliente ID: ${project.client_id}`);
        console.log(`         - Monto total: $${project.total_amount || 0}`);
        console.log(`         - Moneda: ${project.currency || 'N/A'}`);
        console.log(`         - Cuotas: ${project.installments_count || 0}`);
        console.log(`         - Creado: ${project.created_at}`);

        // Check if project has cash box
        const { data: cashBox, error: cashBoxError } = await supabase
          .from('project_cash_box')
          .select('*')
          .eq('project_id', project.id)
          .single();

        if (cashBoxError) {
          console.log(`         ⚠️  Cash box: NO ENCONTRADO (${cashBoxError.message})`);
        } else {
          console.log(`         ✅ Cash box: OK`);
          console.log(`            - Balance ARS: $${cashBox.current_balance_ars || 0}`);
          console.log(`            - Balance USD: $${cashBox.current_balance_usd || 0}`);
        }

        // Check installments
        const { data: installments, error: installmentsError } = await supabase
          .from('installments')
          .select('*')
          .eq('project_id', project.id)
          .order('installment_number');

        if (installmentsError) {
          console.log(`         ⚠️  Cuotas: ERROR (${installmentsError.message})`);
        } else {
          console.log(`         📅 Cuotas: ${installments?.length || 0} encontradas`);
        }
      }
    }
    console.log('   ' + '─'.repeat(60));
  }

  // 3. Check for projects without client_id
  console.log('\n\n🔍 Buscando proyectos sin client_id...\n');
  const { data: orphanProjects, error: orphanError } = await supabase
    .from('projects')
    .select('*')
    .is('client_id', null);

  if (orphanError) {
    console.error('❌ Error buscando proyectos huérfanos:', orphanError);
  } else {
    console.log(`📊 Proyectos sin client_id: ${orphanProjects?.length || 0}`);
    if (orphanProjects && orphanProjects.length > 0) {
      for (const project of orphanProjects) {
        console.log(`\n   🏗️  ${project.name} (${project.code})`);
        console.log(`      - ID: ${project.id}`);
        console.log(`      - Estado: ${project.status}`);
        console.log(`      - Cliente nombre: ${project.client_name || 'N/A'}`);
        console.log(`      - Monto: $${project.total_amount || 0}`);
      }
    }
  }

  // 4. Get all projects
  console.log('\n\n📊 RESUMEN GENERAL\n');
  const { data: allProjects, error: allProjectsError } = await supabase
    .from('projects')
    .select('*');

  if (allProjectsError) {
    console.error('❌ Error obteniendo todos los proyectos:', allProjectsError);
  } else {
    console.log(`Total proyectos en BD: ${allProjects?.length || 0}`);
    console.log(`Con client_id: ${allProjects?.filter(p => p.client_id).length || 0}`);
    console.log(`Sin client_id: ${allProjects?.filter(p => !p.client_id).length || 0}`);
    console.log(`Estado 'active': ${allProjects?.filter(p => p.status === 'active').length || 0}`);
    console.log(`Estado 'draft': ${allProjects?.filter(p => p.status === 'draft').length || 0}`);
    console.log(`Estado 'completed': ${allProjects?.filter(p => p.status === 'completed').length || 0}`);
  }
}

checkClientProjects().catch(console.error);
