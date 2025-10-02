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

async function cleanTestData() {
  console.log('🧹 Cleaning all test data...\n');
  
  const tables = [
    'installments',
    'cash_movements',
    'project_cash',
    'projects',
    'clients',
  ];
  
  let totalDeleted = 0;
  
  for (const table of tables) {
    console.log(`Cleaning ${table}...`);
    
    // Get count before deletion
    const { count: beforeCount } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    // Delete all records
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Trick to delete all
    
    if (error) {
      console.log(`  ⚠️ Error: ${error.message}`);
    } else {
      console.log(`  ✅ Deleted ${beforeCount || 0} records`);
      totalDeleted += (beforeCount || 0);
    }
  }
  
  // Reset cash boxes
  console.log('\n💰 Resetting cash boxes...');
  
  // Reset master cash
  const { error: masterError } = await supabase
    .from('master_cash')
    .update({ 
      balance: 0,
      total_income: 0,
      total_expenses: 0
    })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (!masterError) {
    console.log('  ✅ Reset master cash box');
  }
  
  // Reset admin cash
  const { error: adminError } = await supabase
    .from('admin_cash')
    .update({ 
      balance: 0,
      total_income: 0,
      total_expenses: 0
    })
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (!adminError) {
    console.log('  ✅ Reset admin cash box');
  }
  
  console.log('\n🎉 Cleanup complete!');
  console.log(`   Total records deleted: ${totalDeleted}`);
  console.log('   Database is now clean and ready for testing');
}

cleanTestData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });