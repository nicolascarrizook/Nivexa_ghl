import { supabase } from '../config/supabase';

async function generateMissingInstallments() {
  console.log('🔍 Checking for projects without installments...');

  // Get all projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*');

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
    return;
  }

  console.log(`Found ${projects?.length || 0} projects`);

  for (const project of projects || []) {
    // Check if project has installments
    const { data: installments, error: installmentsError } = await supabase
      .from('installments')
      .select('id')
      .eq('project_id', project.id);

    if (installmentsError) {
      console.error(`Error checking installments for project ${project.name}:`, installmentsError);
      continue;
    }

    if (!installments || installments.length === 0) {
      console.log(`⚠️ Project "${project.name}" (${project.id}) has no installments`);
      
      // Generate installments for this project
      const installmentsToCreate = [];
      
      // Create down payment installment if there's a down payment
      if (project.down_payment_amount && project.down_payment_amount > 0) {
        installmentsToCreate.push({
          project_id: project.id,
          installment_number: 0,
          amount: project.down_payment_amount,
          due_date: project.start_date || new Date().toISOString().split('T')[0],
          status: 'pending',
          paid_amount: 0,
          late_fee_applied: 0,
        });
      }

      // Calculate remaining amount after down payment
      const remainingAmount = project.total_amount - (project.down_payment_amount || 0);
      const installmentAmount = project.installments_count > 0 
        ? remainingAmount / project.installments_count 
        : remainingAmount;

      // Generate regular installments
      const startDate = new Date(project.start_date || new Date());
      for (let i = 1; i <= (project.installments_count || 1); i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        installmentsToCreate.push({
          project_id: project.id,
          installment_number: i,
          amount: installmentAmount,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'pending',
          paid_amount: 0,
          late_fee_applied: 0,
        });
      }

      // Insert installments
      const { error: insertError } = await supabase
        .from('installments')
        .insert(installmentsToCreate);

      if (insertError) {
        console.error(`Error creating installments for project ${project.name}:`, insertError);
      } else {
        console.log(`✅ Created ${installmentsToCreate.length} installments for project "${project.name}"`);
      }
    } else {
      console.log(`✓ Project "${project.name}" has ${installments.length} installments`);
    }
  }

  console.log('✅ Done checking installments');
}

// Run the script
generateMissingInstallments().catch(console.error);