import { supabase } from '../config/supabase';

export async function applySettingsMigration() {
  console.log('🚀 Checking if studio_settings table exists...');
  
  try {
    // Try to query the studio_settings table
    const { data, error } = await supabase
      .from('studio_settings')
      .select('id')
      .limit(1);
    
    if (error && error.code === 'PGRST106') {
      // Table doesn't exist, we need to create it
      console.log('❌ Table studio_settings does not exist');
      console.log('📋 Please create the table manually using the SQL in: supabase/migrations/002_studio_settings.sql');
      console.log('💡 You can run this SQL in your Supabase dashboard SQL editor');
      return false;
    } else if (error) {
      console.error('❌ Error checking table:', error);
      return false;
    } else {
      console.log('✅ Table studio_settings exists');
      
      // Check if we have settings
      const { data: allSettings } = await supabase
        .from('studio_settings')
        .select('*');
      
      console.log(`📊 Found ${allSettings?.length || 0} settings in the table`);
      
      if (allSettings && allSettings.length > 0) {
        console.log('Settings found:');
        allSettings.forEach(setting => {
          console.log(`  - ${setting.display_name}: ${setting.setting_value}`);
        });
      }
      
      return true;
    }
  } catch (error) {
    console.error('❌ Migration check failed:', error);
    return false;
  }
}

// Auto-run when imported
applySettingsMigration().then(success => {
  if (success) {
    console.log('🎉 Migration check completed successfully!');
  } else {
    console.log('⚠️  Migration needs to be applied manually');
  }
});