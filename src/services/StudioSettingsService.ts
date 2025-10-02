import { supabase as _supabase } from '@/config/supabase';

// Type cast to bypass database type restrictions for tables not in schema
const supabase = _supabase as any;

export interface StudioSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: 'string' | 'number' | 'boolean' | 'json' | 'percentage';
  display_name: string;
  description: string | null;
  category: string;
  is_editable: boolean;
  validation_rules: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SettingValidationRules {
  min?: number;
  max?: number;
  decimals?: number;
  maxLength?: number;
  required?: boolean;
  options?: string[];
  pattern?: string;
}

export interface UpdateSettingData {
  value: any;
  display_name?: string;
  description?: string;
}

export class StudioSettingsService {
  /**
   * Get a specific setting by key
   */
  async getSetting(key: string): Promise<any> {
    try {
      // Try to use the stored procedure first
      const { data, error } = await supabase
        .rpc('get_studio_setting', { setting_key_param: key });

      if (error) {
        // If the procedure doesn't exist, fall back to direct table query
        if (error.code === 'PGRST202') {
          console.log('Using fallback direct table query for setting:', key);
          const { data: directData, error: directError } = await supabase
            .from('studio_settings')
            .select('setting_value')
            .eq('setting_key', key)
            .eq('is_editable', true)
            .single();

          if (directError) {
            console.error('Error fetching studio setting directly:', directError);
            return null;
          }

          return directData?.setting_value;
        }
        
        console.error('Error fetching studio setting:', error);
        return null;
      }

      // Parse JSON value if it exists
      return data;
    } catch (error) {
      console.error('Error in getSetting:', error);
      return null;
    }
  }

  /**
   * Get all settings or settings by category
   */
  async getSettings(category?: string): Promise<StudioSetting[]> {
    try {
      let query = supabase
        .from('studio_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('display_name', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching studio settings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSettings:', error);
      return [];
    }
  }

  /**
   * Update a setting value
   */
  async updateSetting(key: string, value: any): Promise<boolean> {
    try {
      // Validate the value before updating
      const isValid = await this.validateSettingValue(key, value);
      if (!isValid) {
        console.error('Invalid setting value:', { key, value });
        return false;
      }

      // Try to use the stored procedure first
      const { data, error } = await supabase
        .rpc('update_studio_setting', {
          setting_key_param: key,
          new_value: JSON.stringify(value)
        });

      if (error) {
        // If the procedure doesn't exist, fall back to direct table update
        if (error.code === 'PGRST202') {
          console.log('Using fallback direct table update for setting:', key);
          const { error: directError } = await supabase
            .from('studio_settings')
            .update({
              setting_value: value,
              updated_at: new Date().toISOString()
            })
            .eq('setting_key', key)
            .eq('is_editable', true);

          if (directError) {
            console.error('Error updating studio setting directly:', directError);
            return false;
          }

          return true;
        }

        console.error('Error updating studio setting:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error in updateSetting:', error);
      return false;
    }
  }

  /**
   * Validate a setting value against its rules
   */
  async validateSettingValue(key: string, value: any): Promise<boolean> {
    try {
      const { data: setting, error } = await supabase
        .from('studio_settings')
        .select('setting_type, validation_rules')
        .eq('setting_key', key)
        .single();

      if (error || !setting) {
        console.error('Setting not found for validation:', key);
        return false;
      }

      const rules: SettingValidationRules = setting.validation_rules || {};
      const type = setting.setting_type;

      // Type validation
      switch (type) {
        case 'string':
          if (typeof value !== 'string') return false;
          if (rules.maxLength && value.length > rules.maxLength) return false;
          if (rules.pattern && !new RegExp(rules.pattern).test(value)) return false;
          if (rules.options && !rules.options.includes(value)) return false;
          break;

        case 'number':
        case 'percentage':
          const numValue = Number(value);
          if (isNaN(numValue)) return false;
          if (rules.min !== undefined && numValue < rules.min) return false;
          if (rules.max !== undefined && numValue > rules.max) return false;
          break;

        case 'boolean':
          if (typeof value !== 'boolean') return false;
          break;

        case 'json':
          // Already handled by JSON parsing in the database
          break;
      }

      // Required validation
      if (rules.required && (value === null || value === undefined || value === '')) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating setting value:', error);
      return false;
    }
  }

  /**
   * Get admin fee percentage (most commonly used setting)
   */
  async getAdminFeePercentage(): Promise<number> {
    const value = await this.getSetting('admin_fee_percentage');
    return value ? Number(value) : 15; // Default fallback
  }

  /**
   * Update admin fee percentage with validation
   */
  async updateAdminFeePercentage(percentage: number): Promise<boolean> {
    if (percentage < 0 || percentage > 100) {
      console.error('Admin fee percentage must be between 0 and 100');
      return false;
    }

    return await this.updateSetting('admin_fee_percentage', percentage);
  }

  /**
   * Get studio name
   */
  async getStudioName(): Promise<string> {
    const value = await this.getSetting('studio_name');
    return value ? String(value).replace(/"/g, '') : 'Estudio de Arquitectura';
  }

  /**
   * Get default currency
   */
  async getDefaultCurrency(): Promise<string> {
    const value = await this.getSetting('default_currency');
    return value ? String(value).replace(/"/g, '') : 'ARS';
  }

  /**
   * Get late fee grace days
   */
  async getLateFeGraceDays(): Promise<number> {
    const value = await this.getSetting('late_fee_grace_days');
    return value ? Number(value) : 5;
  }

  /**
   * Get project code prefix
   */
  async getProjectCodePrefix(): Promise<string> {
    const value = await this.getSetting('project_code_prefix');
    return value ? String(value).replace(/"/g, '') : 'PRY';
  }

  /**
   * Initialize default settings if they don't exist
   */
  async initializeDefaultSettings(): Promise<void> {
    try {
      const { data: existingSettings } = await supabase
        .from('studio_settings')
        .select('setting_key')
        .limit(1);

      // If we have settings, don't initialize again
      if (existingSettings && existingSettings.length > 0) {
        return;
      }

      console.log('Initializing default studio settings...');

      // The default settings are already inserted via migration
      // This method is here for future use if needed
      
    } catch (error) {
      console.error('Error initializing default settings:', error);
    }
  }

  /**
   * Get settings by category with formatted values
   */
  async getSettingsByCategory(category: string): Promise<Array<StudioSetting & { formattedValue: any }>> {
    const settings = await this.getSettings(category);
    
    return settings.map(setting => ({
      ...setting,
      formattedValue: this.formatSettingValue(setting)
    }));
  }

  /**
   * Format setting value for display in UI
   */
  private formatSettingValue(setting: StudioSetting): any {
    try {
      const value = setting.setting_value;

      switch (setting.setting_type) {
        case 'string':
          return typeof value === 'string' ? value.replace(/"/g, '') : value;
        case 'number':
        case 'percentage':
          return Number(value);
        case 'boolean':
          return Boolean(value);
        case 'json':
          return value;
        default:
          return value;
      }
    } catch (error) {
      console.error('Error formatting setting value:', error);
      return setting.setting_value;
    }
  }

  /**
   * Bulk update multiple settings
   */
  async updateMultipleSettings(updates: Record<string, any>): Promise<{ success: string[], failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const [key, value] of Object.entries(updates)) {
      const updated = await this.updateSetting(key, value);
      if (updated) {
        success.push(key);
      } else {
        failed.push(key);
      }
    }

    return { success, failed };
  }
}

// Export singleton instance
export const studioSettingsService = new StudioSettingsService();