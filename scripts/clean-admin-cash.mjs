import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0a294ZnN3b2ZjZ2VibXVvZXlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY3MTY3MCwiZXhwIjoyMDc0MjQ3NjcwfQ.2RxAkJUQdLRtvIz0dKpSaQtxtYHWPCxkCGYbvdXaMZQ';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanAdminCash() {
  console.log('🧹 Limpiando Admin Cash...\n');

  try {
    // Obtener estado actual
    const { data: before } = await supabase
      .from('admin_cash')
      .select('*')
      .single();

    console.log('📊 Estado ANTES de la limpieza:');
    console.log(`   Balance: $${before?.balance || 0}`);
    console.log(`   Balance ARS: $${before?.balance_ars || 0}`);
    console.log(`   Balance USD: $${before?.balance_usd || 0}`);
    console.log(`   Total Cobrado: $${before?.total_collected || 0}\n`);

    // Resetear Admin Cash
    const { error } = await supabase
      .from('admin_cash')
      .update({
        balance: 0,
        balance_ars: 0,
        balance_usd: 0,
        total_collected: 0,
        last_movement_at: null,
        updated_at: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }

    // Verificar
    const { data: after } = await supabase
      .from('admin_cash')
      .select('*')
      .single();

    console.log('✅ Admin Cash limpiada exitosamente!\n');
    console.log('📊 Estado DESPUÉS de la limpieza:');
    console.log(`   Balance: $${after?.balance || 0}`);
    console.log(`   Balance ARS: $${after?.balance_ars || 0}`);
    console.log(`   Balance USD: $${after?.balance_usd || 0}`);
    console.log(`   Total Cobrado: $${after?.total_collected || 0}\n`);

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
    process.exit(1);
  }
}

cleanAdminCash();
