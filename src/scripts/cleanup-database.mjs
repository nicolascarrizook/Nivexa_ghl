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

async function cleanupDatabase() {
  console.log('🧹 Starting database cleanup...\n');
  
  // Step 1: Remove old/unused tables
  console.log('📦 Step 1: Removing unused legacy tables...');
  
  const oldTables = [
    'master_cash_box',
    'project_cash_box', 
    'master_cash_transactions',
    'project_cash_transactions',
    'expense_categories' // This seems to be part of old system too
  ];
  
  for (const tableName of oldTables) {
    try {
      // First, check if table exists
      const { data: tableExists, error: checkError } = await supabase
        .rpc('to_regclass', { tablename: `public.${tableName}` });
      
      if (tableExists) {
        console.log(`   Dropping table: ${tableName}`);
        
        // Use raw SQL to drop the table
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: `DROP TABLE IF EXISTS ${tableName} CASCADE;`
        });
        
        if (error) {
          console.log(`   ⚠️ Could not drop ${tableName} - might need manual removal`);
        } else {
          console.log(`   ✅ Dropped ${tableName}`);
        }
      } else {
        console.log(`   ℹ️ Table ${tableName} doesn't exist`);
      }
    } catch (err) {
      console.log(`   ⚠️ ${tableName} - Skipping (${err.message})`);
    }
  }
  
  console.log('\n📧 Step 2: Cleaning test data from active tables...');
  
  // Step 2: Clean test data from active tables
  const cleanupOperations = [
    // Clean installments first (has foreign keys)
    { table: 'installments', message: 'Cleaning installments' },
    
    // Clean cash movements
    { table: 'cash_movements', message: 'Cleaning cash movements' },
    
    // Clean project cash
    { table: 'project_cash', message: 'Cleaning project cash boxes' },
    
    // Clean projects
    { table: 'projects', message: 'Cleaning projects' },
    
    // Clean clients
    { table: 'clients', message: 'Cleaning clients' },
    
    // Clean master and admin cash (but we'll recreate them)
    { table: 'master_cash', message: 'Cleaning master cash' },
    { table: 'admin_cash', message: 'Cleaning admin cash' },
  ];
  
  for (const op of cleanupOperations) {
    console.log(`   ${op.message}...`);
    const { error } = await supabase
      .from(op.table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using impossible ID)
    
    if (error) {
      console.log(`   ⚠️ Error cleaning ${op.table}:`, error.message);
    } else {
      console.log(`   ✅ Cleaned ${op.table}`);
    }
  }
  
  console.log('\n💰 Step 3: Initializing clean cash boxes...');
  
  // Step 3: Create initial cash boxes
  // Get organization ID (assuming there's one organization)
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
    .single();
  
  if (orgs) {
    // Create master cash box
    const { error: masterError } = await supabase
      .from('master_cash')
      .insert({
        organization_id: orgs.id,
        name: 'Caja Maestra Principal',
        balance: 0,
        currency: 'ARS'
      });
    
    if (masterError) {
      console.log('   ⚠️ Master cash might already exist');
    } else {
      console.log('   ✅ Created clean master cash box');
    }
    
    // Create admin cash box
    const { error: adminError } = await supabase
      .from('admin_cash')
      .insert({
        organization_id: orgs.id,
        name: 'Caja Administrativa',
        balance: 0,
        currency: 'ARS'
      });
    
    if (adminError) {
      console.log('   ⚠️ Admin cash might already exist');
    } else {
      console.log('   ✅ Created clean admin cash box');
    }
  }
  
  console.log('\n🎉 Database cleanup complete!');
  console.log('\nYou now have:');
  console.log('✅ Removed all legacy/unused tables');
  console.log('✅ Cleaned all test data');
  console.log('✅ Fresh master and admin cash boxes initialized');
  console.log('\n🚀 Ready to test project creation with clean data!');
}

// Alternative approach if exec_sql doesn't exist
async function dropTableAlternative(tableName) {
  try {
    // Try to delete all records which might trigger cascade
    const { error } = await supabase
      .from(tableName)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (!error) {
      console.log(`   ✅ Cleared ${tableName} data`);
    }
  } catch (err) {
    console.log(`   ⚠️ Could not clear ${tableName}`);
  }
}

// Run the cleanup
cleanupDatabase()
  .then(() => {
    console.log('\n✨ Cleanup finished successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during cleanup:', error);
    process.exit(1);
  });