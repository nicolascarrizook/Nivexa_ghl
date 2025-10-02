import { supabase } from '../config/supabase-node';
import * as fs from 'fs';
import * as path from 'path';

async function applyMigration() {
  const migrationPath = path.join(__dirname, '../../supabase/migrations/20240930_increase_numeric_precision.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('Applying migration: increase_numeric_precision');
  console.log('SQL:', sql);

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  console.log('Migration applied successfully!');
  console.log('Data:', data);
}

applyMigration();