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

async function checkPayments() {
  console.log('📊 Checking payment status for all projects...\n');

  // Get all projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
    return;
  }

  for (const project of projects || []) {
    console.log(`\n📁 Project: "${project.name}"`);
    console.log(`   Total Amount: $${project.total_amount}`);
    console.log(`   Down Payment: $${project.down_payment_amount || 0}`);
    
    // Get installments for this project
    const { data: installments, error: installmentsError } = await supabase
      .from('installments')
      .select('*')
      .eq('project_id', project.id)
      .order('installment_number', { ascending: true });

    if (installmentsError) {
      console.error(`   Error fetching installments:`, installmentsError);
      continue;
    }

    if (!installments || installments.length === 0) {
      console.log(`   ⚠️ No installments found`);
      continue;
    }

    // Calculate totals
    const totalPaid = installments.reduce((sum, i) => sum + (i.paid_amount || 0), 0);
    const totalPending = installments
      .filter(i => i.status === 'pending' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.amount, 0);

    console.log(`   📊 Payment Summary:`);
    console.log(`      • Total Paid: $${totalPaid}`);
    console.log(`      • Total Pending: $${totalPending}`);
    console.log(`      • Progress: ${project.total_amount > 0 ? Math.round((totalPaid / project.total_amount) * 100) : 0}%`);
    
    // Show first few installments
    console.log(`   📋 Installments (showing first 5):`);
    installments.slice(0, 5).forEach(i => {
      const status = i.status === 'paid' ? '✅' : i.status === 'partial' ? '⚠️' : '⏳';
      console.log(`      ${status} #${i.installment_number}: $${i.amount} - Paid: $${i.paid_amount || 0} (${i.status})`);
    });
    
    if (installments.length > 5) {
      console.log(`      ... and ${installments.length - 5} more installments`);
    }

    // Check project cash box
    const { data: cashBox } = await supabase
      .from('project_cash')
      .select('*')
      .eq('project_id', project.id)
      .single();

    if (cashBox) {
      console.log(`   💰 Cash Box:`);
      console.log(`      • Balance: $${cashBox.balance}`);
      console.log(`      • Total Received: $${cashBox.total_received}`);
    }
  }

  console.log('\n✅ Done checking payments');
}

checkPayments()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });