import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0a294ZnN3b2ZjZ2VibXVvZXlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY3MTY3MCwiZXhwIjoyMDc0MjQ3NjcwfQ.2RxAkJUQdLRtvIz0dKpSaQtxtYHWPCxkCGYbvdXaMZQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function simulatePayments() {
  console.log('💰 Simulating some payments for demonstration...\n');

  // Get all projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
    return;
  }

  // Process first 3 projects to simulate different payment scenarios
  for (let i = 0; i < Math.min(3, projects.length); i++) {
    const project = projects[i];
    console.log(`\n📁 Processing: "${project.name}"`);
    
    // Get installments for this project
    const { data: installments, error: installmentsError } = await supabase
      .from('installments')
      .select('*')
      .eq('project_id', project.id)
      .order('installment_number', { ascending: true });

    if (!installments || installments.length === 0) continue;

    if (i === 0) {
      // First project: Mark down payment as paid
      const downPayment = installments.find(inst => inst.installment_number === 0);
      if (downPayment) {
        const { error } = await supabase
          .from('installments')
          .update({
            status: 'paid',
            paid_amount: downPayment.amount,
            paid_date: new Date().toISOString()
          })
          .eq('id', downPayment.id);

        if (error) {
          console.error(`   ❌ Error updating down payment:`, error);
        } else {
          console.log(`   ✅ Marked down payment as paid: $${downPayment.amount}`);
        }
      } else {
        console.log(`   ⚠️ No down payment found`);
      }
    } else if (i === 1) {
      // Second project: Mark down payment and first 2 installments as paid
      const toPay = installments.slice(0, 3);
      for (const installment of toPay) {
        const { error } = await supabase
          .from('installments')
          .update({
            status: 'paid',
            paid_amount: installment.amount,
            paid_date: new Date().toISOString()
          })
          .eq('id', installment.id);

        if (!error) {
          console.log(`   ✅ Marked installment #${installment.installment_number} as paid: $${installment.amount}`);
        }
      }
    } else if (i === 2) {
      // Third project: Mark down payment and partial payment on first installment
      const downPayment = installments.find(inst => inst.installment_number === 0);
      if (downPayment) {
        await supabase
          .from('installments')
          .update({
            status: 'paid',
            paid_amount: downPayment.amount,
            paid_at: new Date().toISOString()
          })
          .eq('id', downPayment.id);
        console.log(`   ✅ Marked down payment as paid: $${downPayment.amount}`);
      }

      const firstInstallment = installments.find(inst => inst.installment_number === 1);
      if (firstInstallment) {
        const partialAmount = firstInstallment.amount * 0.5;
        await supabase
          .from('installments')
          .update({
            status: 'partial',
            paid_amount: partialAmount,
            paid_date: new Date().toISOString()
          })
          .eq('id', firstInstallment.id);
        console.log(`   ⚠️ Marked installment #1 as partially paid: $${partialAmount} of $${firstInstallment.amount}`);
      }
    }

    // Update project cash box to reflect payments
    const { data: updatedInstallments } = await supabase
      .from('installments')
      .select('paid_amount')
      .eq('project_id', project.id);

    const totalPaid = updatedInstallments?.reduce((sum, i) => sum + (i.paid_amount || 0), 0) || 0;

    await supabase
      .from('project_cash')
      .update({
        balance: totalPaid,
        total_received: totalPaid,
        last_movement_at: new Date().toISOString()
      })
      .eq('project_id', project.id);

    console.log(`   💰 Updated cash box balance: $${totalPaid}`);
  }

  console.log('\n✅ Done simulating payments');
  console.log('\n🔄 Refresh the Projects page to see the updated payment amounts!');
}

simulatePayments()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });