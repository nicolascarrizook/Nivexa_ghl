import { supabase as _supabase } from '@/config/supabase';

// Type cast to bypass database type restrictions for tables not in schema
const supabase = _supabase as any;
import type { Currency } from './CurrencyService';
import { studioSettingsService } from './StudioSettingsService';

export interface AdministratorFee {
  id: string;
  project_id: string;
  installment_id?: string | null; // Links fee to specific installment/payment
  fee_percentage: number;
  amount: number; // The actual column name in DB
  currency: Currency;
  status: 'pending' | 'collected' | 'cancelled';
  collected_at: string | null;
  collected_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminCashBox {
  id: string;
  balance: number;
  currency: Currency;
  last_movement_at: string | null;
  created_at: string;
  updated_at: string;
}

export class AdministratorFeeService {
  private readonly DEFAULT_FEE_PERCENTAGE = 15; // 15% default admin fee (fallback only)

  /**
   * Get the configured admin fee percentage (global setting)
   */
  async getAdminFeePercentage(): Promise<number> {
    try {
      const configuredPercentage = await studioSettingsService.getAdminFeePercentage();
      return configuredPercentage || this.DEFAULT_FEE_PERCENTAGE;
    } catch (error) {
      console.error('Error getting admin fee percentage from settings:', error);
      return this.DEFAULT_FEE_PERCENTAGE;
    }
  }

  /**
   * Get administrative fee percentage for a specific project
   * First checks project-specific configuration, then falls back to global setting
   */
  async getProjectAdminFeePercentage(projectId: string): Promise<number> {
    // Check project-specific configuration
    const { data: project } = await supabase
      .from('projects')
      .select('admin_fee_percentage, admin_fee_type')
      .eq('id', projectId)
      .single();
    
    // If project has 'none' type, return 0
    if (project?.admin_fee_type === 'none') return 0;
    
    // If project has specific percentage, use it
    if (project?.admin_fee_percentage !== null && project?.admin_fee_percentage !== undefined) {
      return project.admin_fee_percentage;
    }
    
    // Otherwise, fall back to global setting
    return this.getAdminFeePercentage();
  }

  /**
   * Calculate administrator fee for a project
   */
  async calculateAdminFee(projectIncome: number, feePercentage?: number): Promise<number> {
    let percentage = feePercentage;
    
    if (!percentage) {
      percentage = await this.getAdminFeePercentage();
    }
    
    return (projectIncome * percentage) / 100;
  }

  /**
   * Create administrator fee record for a project payment
   */
  async createAdminFee(
    projectId: string,
    paymentAmount: number,
    currency: Currency = 'ARS',
    feePercentage?: number,
    installmentId?: string
  ): Promise<AdministratorFee | null> {
    const percentage = feePercentage || await this.getAdminFeePercentage();
    const feeAmount = await this.calculateAdminFee(paymentAmount, percentage);

    // Check if fee already exists for this installment (only if installment tracking is available)
    if (installmentId) {
      try {
        const { data: existingFee } = await supabase
          .from('administrator_fees')
          .select('id')
          .eq('project_id', projectId)
          .eq('installment_id', installmentId)
          .single();
        
        if (existingFee) {
          console.log('Administrator fee already exists for this installment');
          return null;
        }
      } catch (error: any) {
        // If installment_id column doesn't exist yet, continue without checking
        if (error.code !== 'PGRST116' && !error.message?.includes('column')) {
          console.error('Error checking existing fee:', error);
        }
      }
    }

    // Prepare insert data, only include installment_id if provided
    const insertData: any = {
      project_id: projectId,
      fee_percentage: percentage,
      amount: feeAmount, // Use amount column as it exists in DB
      currency: currency,
      status: 'pending',
      collected_amount: 0,
      notes: installmentId ? `Fee for payment/installment ${installmentId}` : null
    };

    // Only add installment_id if provided (in case column doesn't exist yet)
    if (installmentId) {
      insertData.installment_id = installmentId;
    }

    const { data, error } = await supabase
      .from('administrator_fees')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating administrator fee:', error);
      return null;
    }

    return data;
  }

  /**
   * Get administrator fee for a project
   */
  async getProjectAdminFee(projectId: string): Promise<AdministratorFee | null> {
    const { data, error } = await supabase
      .from('administrator_fees')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      console.error('Error fetching administrator fee:', error);
      return null;
    }

    return data;
  }

  /**
   * Get all pending administrator fees
   */
  async getPendingAdminFees(): Promise<AdministratorFee[]> {
    const { data, error } = await supabase
      .from('administrator_fees')
      .select(`
        *,
        projects!inner(
          code,
          name,
          client_name
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending admin fees:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get total pending fees by currency
   */
  async getTotalPendingFees(currency: Currency = 'ARS'): Promise<number> {
    const { data, error } = await supabase
      .from('administrator_fees')
      .select('amount')
      .eq('status', 'pending')
      .eq('currency', currency);

    if (error) {
      console.error('Error calculating total pending fees:', error);
      return 0;
    }

    return (data || []).reduce((total, fee) => total + (fee.amount || 0), 0);
  }

  /**
   * Get or create admin cash box for currency
   */
  async getAdminCashBox(currency: Currency = 'ARS'): Promise<AdminCashBox | null> {
    // The new cash system doesn't use currency field - there's only one admin cash box
    // Currency parameter is kept for compatibility but not used
    
    // First try to get existing cash box
    const { data: existing, error: fetchError } = await supabase
      .from('admin_cash')
      .select('*')
      .single();

    if (existing) {
      return existing;
    }

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching admin cash box:', fetchError);
      return null;
    }

    // Create new admin cash box if it doesn't exist
    const { data: newCashBox, error: createError } = await supabase
      .from('admin_cash')
      .insert({
        balance: 0,
        total_collected: 0,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating admin cash box:', createError);
      return null;
    }

    return newCashBox;
  }

  /**
   * Collect administrator fee from master cash to admin cash
   */
  async collectAdminFee(feeId: string): Promise<boolean> {
    try {
      // Get the fee details
      const { data: fee, error: feeError } = await supabase
        .from('administrator_fees')
        .select('*')
        .eq('id', feeId)
        .eq('status', 'pending')
        .single();

      if (feeError || !fee) {
        console.error('Administrator fee not found or already collected');
        return false;
      }

      // Get master cash box (only one exists, no currency field)
      const { data: masterCash, error: masterError } = await supabase
        .from('master_cash')
        .select('*')
        .single();

      if (masterError || !masterCash) {
        console.error('Master cash box not found');
        return false;
      }

      // Get fee amount and currency
      const feeAmount = fee.amount || 0;
      const feeCurrency = fee.currency || 'ARS';

      // Check if master cash has sufficient balance for the currency
      const masterBalance = feeCurrency === 'USD'
        ? (masterCash.balance_usd || 0)
        : (masterCash.balance_ars || 0);

      if (masterBalance < feeAmount) {
        console.error(`Insufficient balance in master cash (${feeCurrency}) for fee collection. Balance: ${masterBalance}, Required: ${feeAmount}`);
        return false;
      }

      // Get or create admin cash box (single box, no currency differentiation)
      const adminCash = await this.getAdminCashBox();
      if (!adminCash) {
        console.error('Could not get admin cash box');
        return false;
      }

      // Create cash movement record
      const { error: movementError } = await supabase
        .from('cash_movements')
        .insert({
          movement_type: 'fee_collection',
          source_type: 'master',
          source_id: masterCash.id,
          destination_type: 'admin',
          destination_id: adminCash.id,
          amount: feeAmount,
          description: `Cobro de honorarios administrativos - Proyecto ${fee.project_id}`,
          project_id: fee.project_id,
          metadata: { currency: feeCurrency }, // Store currency in metadata
        });

      if (movementError) {
        console.error('Error creating cash movement:', movementError);
        return false;
      }

      // Update cash box balances based on currency
      const updatePromises = [];

      if (feeCurrency === 'USD') {
        // Update USD balances
        updatePromises.push(
          // Reduce master cash balance (USD)
          supabase
            .from('master_cash')
            .update({
              balance_usd: (masterCash.balance_usd || 0) - feeAmount,
              balance: (masterCash.balance || 0) - feeAmount, // Keep legacy field in sync
              last_movement_at: new Date().toISOString(),
            })
            .eq('id', masterCash.id),

          // Increase admin cash balance (USD)
          supabase
            .from('admin_cash')
            .update({
              balance_usd: (adminCash.balance_usd || 0) + feeAmount,
              balance: (adminCash.balance || 0) + feeAmount, // Keep legacy field in sync
              total_collected: (adminCash.total_collected || 0) + feeAmount,
              last_movement_at: new Date().toISOString(),
            })
            .eq('id', adminCash.id)
        );
      } else {
        // Update ARS balances
        updatePromises.push(
          // Reduce master cash balance (ARS)
          supabase
            .from('master_cash')
            .update({
              balance_ars: (masterCash.balance_ars || 0) - feeAmount,
              balance: (masterCash.balance || 0) - feeAmount, // Keep legacy field in sync
              last_movement_at: new Date().toISOString(),
            })
            .eq('id', masterCash.id),

          // Increase admin cash balance (ARS)
          supabase
            .from('admin_cash')
            .update({
              balance_ars: (adminCash.balance_ars || 0) + feeAmount,
              balance: (adminCash.balance || 0) + feeAmount, // Keep legacy field in sync
              total_collected: (adminCash.total_collected || 0) + feeAmount,
              last_movement_at: new Date().toISOString(),
            })
            .eq('id', adminCash.id)
        );
      }

      // Mark fee as collected
      updatePromises.push(
        supabase
          .from('administrator_fees')
          .update({
            status: 'collected',
            collected_at: new Date().toISOString(),
            collected_amount: feeAmount,
          })
          .eq('id', feeId)
      );

      const results = await Promise.all(updatePromises);
      const hasErrors = results.some(result => result.error);

      if (hasErrors) {
        console.error('Error updating balances:', results.map(r => r.error).filter(Boolean));
        return false;
      }

      console.log(`✅ Administrator fee collected: ${feeAmount} ${fee.currency} for project ${fee.project_id}`);
      return true;
    } catch (error) {
      console.error('Error collecting administrator fee:', error);
      return false;
    }
  }

  /**
   * Cancel administrator fee (if project is cancelled)
   */
  async cancelAdminFee(feeId: string, reason?: string): Promise<boolean> {
    const { error } = await supabase
      .from('administrator_fees')
      .update({
        status: 'cancelled',
        notes: reason || 'Proyecto cancelado',
      })
      .eq('id', feeId)
      .eq('status', 'pending'); // Only cancel pending fees

    if (error) {
      console.error('Error cancelling administrator fee:', error);
      return false;
    }

    return true;
  }

  /**
   * Get admin cash balance for currency
   */
  async getAdminBalance(currency: Currency = 'ARS'): Promise<number> {
    const adminCash = await this.getAdminCashBox(currency);
    return adminCash?.balance || 0;
  }

  /**
   * Get admin fee statistics
   */
  async getAdminFeeStats(currency: Currency = 'ARS'): Promise<{
    totalPending: number;
    totalCollected: number;
    totalCancelled: number;
    pendingCount: number;
    collectedCount: number;
  }> {
    const { data, error } = await supabase
      .from('administrator_fees')
      .select('status, amount, collected_amount')
      .eq('currency', currency);

    if (error) {
      console.error('Error fetching admin fee stats:', error);
      return {
        totalPending: 0,
        totalCollected: 0,
        totalCancelled: 0,
        pendingCount: 0,
        collectedCount: 0,
      };
    }

    const stats = (data || []).reduce(
      (acc, fee) => {
        const feeAmount = fee.amount || 0;
        switch (fee.status) {
          case 'pending':
            acc.totalPending += feeAmount;
            acc.pendingCount++;
            break;
          case 'collected':
            acc.totalCollected += fee.collected_amount || feeAmount;
            acc.collectedCount++;
            break;
          case 'cancelled':
            acc.totalCancelled += feeAmount;
            break;
        }
        return acc;
      },
      {
        totalPending: 0,
        totalCollected: 0,
        totalCancelled: 0,
        pendingCount: 0,
        collectedCount: 0,
      }
    );

    return stats;
  }
}

// Export singleton instance
export const administratorFeeService = new AdministratorFeeService();