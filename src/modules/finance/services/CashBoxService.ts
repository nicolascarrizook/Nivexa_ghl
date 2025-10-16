import { supabase } from '@/config/supabase';
import type { Tables, InsertTables } from '@/config/supabase';
import { isValidCurrencyAmount, sanitizeCurrencyAmount, getCurrencyOverflowError } from '@/utils/validation';

export type MasterCash = Tables<'master_cash'>;
export type AdminCash = Tables<'admin_cash'>;
export type ProjectCash = Tables<'project_cash'>;
export type CashMovement = Tables<'cash_movements'>;
export type InsertCashMovement = InsertTables<'cash_movements'>;
export type FeeCollection = Tables<'fee_collections'>;
export type InsertFeeCollection = InsertTables<'fee_collections'>;

// New types for the correct tables
interface MasterCashBox {
  id: string;
  organization_id: string;
  current_balance_ars: number;
  current_balance_usd: number;
  total_income_ars: number;
  total_income_usd: number;
}

interface ProjectCashBox {
  id: string;
  project_id: string;
  current_balance_ars: number;
  current_balance_usd: number;
  total_received_ars: number;
  total_received_usd: number;
}

export class CashBoxService {
  /**
   * Get master cash box (from new table)
   */
  async getMasterCash(): Promise<any> {
    // Get current user to find organization
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get from master_cash_box table
    const { data, error } = await supabase
      .from('master_cash_box')
      .select('*')
      .eq('organization_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching master cash box:', error);
      if (error.code === 'PGRST116') {
        // No data found, return default structure
        return {
          id: null,
          balance: 0,
          balance_ars: 0,
          balance_usd: 0,
          total_collected: 0
        };
      }
      return null;
    }

    // Transform to match old structure for compatibility
    return {
      id: data.id,
      balance: data.current_balance_ars || 0,  // Use ARS as default balance
      balance_ars: data.current_balance_ars || 0,
      balance_usd: data.current_balance_usd || 0,
      total_collected: data.total_income_ars || 0
    };
  }

  /**
   * Get admin cash box
   */
  async getAdminCash(): Promise<AdminCash | null> {
    const { data, error } = await supabase
      .from('admin_cash')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching admin cash:', error);
      // Return null if not found
      if (error.code === 'PGRST116') {
        return null;
      }
      return null;
    }
    return data;
  }

  /**
   * Get project cash box (from new table)
   */
  async getProjectCash(projectId: string): Promise<ProjectCash | null> {
    const { data, error } = await supabase
      .from('project_cash_box')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      console.error('Error fetching project cash box:', error);
      return null;
    }
    
    // Transform to match old structure
    return {
      id: data.id,
      project_id: data.project_id,
      balance: data.current_balance_ars || 0,
      balance_ars: data.current_balance_ars || 0,
      balance_usd: data.current_balance_usd || 0,
      total_received: data.total_received_ars || 0,
      total_received_ars: data.total_received_ars || 0,
      total_received_usd: data.total_received_usd || 0,
      last_movement_at: data.last_transaction_at,
      created_at: data.created_at,
      updated_at: data.updated_at
    } as any;
  }

  /**
   * Get all cash boxes summary
   */
  async getAllCashBoxes(): Promise<{
    master: any;
    admin: any;
    projects: any[];
  }> {
    const [master, admin, projectsResult] = await Promise.all([
      this.getMasterCash(),
      this.getAdminCash(),
      supabase.from('project_cash_box').select('*').order('created_at', { ascending: false }),
    ]);

    // Transform project boxes to match old structure
    const projects = (projectsResult.data || []).map(p => ({
      id: p.id,
      project_id: p.project_id,
      balance: p.current_balance_ars || 0,
      balance_ars: p.current_balance_ars || 0,
      balance_usd: p.current_balance_usd || 0,
      total_received: p.total_received_ars || 0,
      total_received_ars: p.total_received_ars || 0,
      total_received_usd: p.total_received_usd || 0,
      last_movement_at: p.last_transaction_at,
      created_at: p.created_at,
      updated_at: p.updated_at
    }));

    const result = {
      master,
      admin,
      projects,
    };
    
    // Debug log to see what's being returned
    console.log('📊 CashBoxService.getAllCashBoxes() returning:', {
      masterBalance: master?.balance || 0,
      masterBalanceARS: master?.balance_ars || 0,
      masterBalanceUSD: master?.balance_usd || 0,
      adminBalance: admin?.balance || 0,
      projectsCount: result.projects.length,
      projectsTotal: result.projects.reduce((sum, p) => sum + p.balance, 0),
    });

    return result;
  }

  /**
   * Record project income with automatic duplication to master cash
   */
  async recordProjectIncome(
    projectId: string,
    amount: number,
    description: string,
    installmentId?: string
  ): Promise<void> {
    // Validate amount
    if (!isValidCurrencyAmount(amount)) {
      throw new Error(getCurrencyOverflowError(amount));
    }
    
    // Sanitize amount
    const sanitizedAmount = sanitizeCurrencyAmount(amount);
    
    // Get project cash box
    const projectCash = await this.getProjectCash(projectId);
    if (!projectCash) throw new Error('Project cash box not found');

    // Get master cash box - create if doesn't exist
    let masterCash = await this.getMasterCash();
    if (!masterCash || !masterCash.id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: newMasterCash, error: createError } = await supabase
        .from('master_cash_box')
        .insert({
          organization_id: user.id,
          name: 'Caja Maestra Principal',
          current_balance_ars: 0,
          current_balance_usd: 0,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create master cash box: ${createError.message}`);
      }

      masterCash = {
        id: newMasterCash.id,
        balance: 0,
        balance_ars: 0,
        balance_usd: 0,
        total_collected: 0,
      };
    }
    
    // Check if new balances would exceed limits
    const newProjectBalance = projectCash.balance + sanitizedAmount;
    const newMasterBalance = masterCash.balance + sanitizedAmount;
    
    if (!isValidCurrencyAmount(newProjectBalance)) {
      throw new Error(`New project balance would exceed limit: ${getCurrencyOverflowError(newProjectBalance)}`);
    }
    
    if (!isValidCurrencyAmount(newMasterBalance)) {
      throw new Error(`New master balance would exceed limit: ${getCurrencyOverflowError(newMasterBalance)}`);
    }

    // Start transaction-like operations
    const movements: InsertCashMovement[] = [];

    // 1. Movement from external to project cash
    movements.push({
      movement_type: 'project_income',
      source_type: 'external',
      source_id: null,
      destination_type: 'project',
      destination_id: projectCash.id,
      amount: sanitizedAmount,
      description,
      project_id: projectId,
      installment_id: installmentId || null,
    });

    // 2. Automatic duplication to master cash
    movements.push({
      movement_type: 'master_duplication',
      source_type: 'external',
      source_id: null,
      destination_type: 'master',
      destination_id: masterCash.id,
      amount: sanitizedAmount,
      description: `Duplicación automática: ${description}`,
      project_id: projectId,
      installment_id: installmentId || null,
    });

    // Insert movements
    const { error: movementError } = await supabase
      .from('cash_movements')
      .insert(movements);

    if (movementError) throw movementError;

    // Update cash boxes balances
    const updates = [
      // Update project cash
      supabase
        .from('project_cash')
        .update({
          balance: newProjectBalance,
          total_received: projectCash.total_received + sanitizedAmount,
          last_movement_at: new Date().toISOString(),
        })
        .eq('id', projectCash.id),
      
      // Update master cash
      supabase
        .from('master_cash')
        .update({
          balance: newMasterBalance,
          last_movement_at: new Date().toISOString(),
        })
        .eq('id', masterCash.id),
    ];

    const results = await Promise.all(updates);
    results.forEach(({ error }) => {
      if (error) throw error;
    });
  }

  /**
   * Register investor contribution (cash investment)
   * IMPORTANT: This ONLY affects project_cash_box, NOT master_cash
   * Investor contributions are capital, not client payments, so no duplication or fees
   */
  async registerInvestorContribution(data: {
    projectId: string;
    investorId: string;
    amount: number;
    currency: 'ARS' | 'USD';
    notes?: string;
  }): Promise<void> {
    // Validate amount
    if (!isValidCurrencyAmount(data.amount)) {
      throw new Error(getCurrencyOverflowError(data.amount));
    }

    // Sanitize amount
    const sanitizedAmount = sanitizeCurrencyAmount(data.amount);

    // Get project cash box
    const { data: projectCash, error: projectCashError } = await supabase
      .from('project_cash_box')
      .select('*')
      .eq('project_id', data.projectId)
      .single();

    if (projectCashError || !projectCash) {
      throw new Error('Project cash box not found');
    }

    // Calculate new balance based on currency
    const isArs = data.currency === 'ARS';
    const currentBalance = isArs ? projectCash.current_balance_ars : projectCash.current_balance_usd;
    const newBalance = currentBalance + sanitizedAmount;

    // Validate new balance doesn't exceed limits
    if (!isValidCurrencyAmount(newBalance)) {
      throw new Error(`New project balance would exceed limit: ${getCurrencyOverflowError(newBalance)}`);
    }

    // Create cash movement record
    const movement: InsertCashMovement = {
      movement_type: 'investor_contribution',
      source_type: 'investor_contribution',
      source_id: data.investorId,
      destination_type: 'project_cash_box',
      destination_id: projectCash.id,
      amount: sanitizedAmount,
      currency: data.currency,
      description: data.notes || `Inversión de capital - ${data.currency}`,
      project_id: data.projectId,
    };

    // Insert movement
    const { error: movementError } = await supabase
      .from('cash_movements')
      .insert(movement);

    if (movementError) {
      console.error('Error inserting cash movement:', movementError);
      throw movementError;
    }

    // Update project cash box balance
    const updates = isArs
      ? {
          current_balance_ars: newBalance,
          total_income_ars: (projectCash.total_income_ars || 0) + sanitizedAmount,
        }
      : {
          current_balance_usd: newBalance,
          total_income_usd: (projectCash.total_income_usd || 0) + sanitizedAmount,
        };

    const { error: updateError } = await supabase
      .from('project_cash_box')
      .update(updates)
      .eq('id', projectCash.id);

    if (updateError) {
      console.error('Error updating project cash box:', updateError);
      throw updateError;
    }

    console.log(
      `✅ Investor contribution registered: ${data.currency} ${sanitizedAmount} to project ${data.projectId}`
    );
  }

  /**
   * Collect fees from master to admin cash
   */
  async collectFees(
    amount: number,
    reason: string,
    projectId?: string,
    projectIncomeBase?: number,
    percentageApplied?: number
  ): Promise<FeeCollection> {
    // Validate amount
    if (!isValidCurrencyAmount(amount)) {
      throw new Error(getCurrencyOverflowError(amount));
    }
    
    // Sanitize amount
    const sanitizedAmount = sanitizeCurrencyAmount(amount);
    
    // Get cash boxes
    let [masterCash, adminCash] = await Promise.all([
      this.getMasterCash(),
      this.getAdminCash(),
    ]);

    // Create master cash if it doesn't exist
    if (!masterCash || !masterCash.id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: newMasterCash, error: createError } = await supabase
        .from('master_cash_box')
        .insert({
          organization_id: user.id,
          name: 'Caja Maestra Principal',
          current_balance_ars: 0,
          current_balance_usd: 0,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create master cash box: ${createError.message}`);
      }

      masterCash = {
        id: newMasterCash.id,
        balance: 0,
        balance_ars: 0,
        balance_usd: 0,
        total_collected: 0,
      };
    }

    if (!adminCash) {
      throw new Error('Admin cash box not found');
    }

    if (masterCash.balance < sanitizedAmount) {
      throw new Error('Insufficient balance in master cash');
    }
    
    // Check if new balances would exceed limits
    const newAdminBalance = adminCash.balance + sanitizedAmount;
    
    if (!isValidCurrencyAmount(newAdminBalance)) {
      throw new Error(`New admin balance would exceed limit: ${getCurrencyOverflowError(newAdminBalance)}`);
    }

    // Create movement
    const { data: movement, error: movementError } = await supabase
      .from('cash_movements')
      .insert({
        movement_type: 'fee_collection',
        source_type: 'master',
        source_id: masterCash.id,
        destination_type: 'admin',
        destination_id: adminCash.id,
        amount,
        description: `Cobro de honorarios: ${reason}`,
        project_id: projectId || null,
      } as InsertCashMovement)
      .select()
      .single();

    if (movementError) throw movementError;

    // Create fee collection record
    const { data: feeCollection, error: feeError } = await supabase
      .from('fee_collections')
      .insert({
        project_id: projectId || null,
        amount_collected: amount,
        collection_reason: reason,
        project_income_base: projectIncomeBase || null,
        percentage_applied: percentageApplied || null,
        movement_id: movement.id,
      } as InsertFeeCollection)
      .select()
      .single();

    if (feeError) throw feeError;

    // Update balances
    const updates = [
      // Decrease master cash
      supabase
        .from('master_cash')
        .update({
          balance: masterCash.balance - amount,
          last_movement_at: new Date().toISOString(),
        })
        .eq('id', masterCash.id),
      
      // Increase admin cash
      supabase
        .from('admin_cash')
        .update({
          balance: adminCash.balance + amount,
          total_collected: adminCash.total_collected + amount,
          last_movement_at: new Date().toISOString(),
        })
        .eq('id', adminCash.id),
    ];

    const results = await Promise.all(updates);
    results.forEach(({ error }) => {
      if (error) throw error;
    });

    return feeCollection;
  }

  /**
   * Get available fees to collect for a project
   */
  async getAvailableFeesToCollect(projectId: string): Promise<number> {
    // Get project cash
    const projectCash = await this.getProjectCash(projectId);
    if (!projectCash) return 0;

    // Get total fees already collected for this project
    const { data: feeCollections } = await supabase
      .from('fee_collections')
      .select('amount_collected')
      .eq('project_id', projectId);

    const totalCollected = feeCollections?.reduce((sum, fc) => sum + fc.amount_collected, 0) || 0;

    // Available to collect = total received - fees already collected
    return Math.max(0, projectCash.total_received - totalCollected);
  }

  /**
   * Record an expense from any cash box
   */
  async recordExpense(
    sourceType: 'master' | 'admin' | 'project',
    sourceId: string,
    amount: number,
    description: string,
    projectId?: string
  ): Promise<void> {
    // Get source cash box
    let currentBalance = 0;
    
    if (sourceType === 'master') {
      const cash = await this.getMasterCash();
      if (!cash) throw new Error('Master cash not found');
      currentBalance = cash.balance;
    } else if (sourceType === 'admin') {
      const cash = await this.getAdminCash();
      if (!cash) throw new Error('Admin cash not found');
      currentBalance = cash.balance;
    } else if (sourceType === 'project') {
      const { data } = await supabase
        .from('project_cash')
        .select('balance')
        .eq('id', sourceId)
        .single();
      if (!data) throw new Error('Project cash not found');
      currentBalance = data.balance;
    }

    if (currentBalance < amount) {
      throw new Error(`Insufficient balance in ${sourceType} cash`);
    }

    // Create movement
    const { error: movementError } = await supabase
      .from('cash_movements')
      .insert({
        movement_type: 'expense',
        source_type: sourceType,
        source_id: sourceId,
        destination_type: 'external',
        destination_id: null,
        amount,
        description,
        project_id: projectId || null,
      } as InsertCashMovement);

    if (movementError) throw movementError;

    // Update balance
    const table = sourceType === 'master' ? 'master_cash' 
                : sourceType === 'admin' ? 'admin_cash' 
                : 'project_cash';
    
    const { error: updateError } = await supabase
      .from(table)
      .update({
        balance: currentBalance - amount,
        last_movement_at: new Date().toISOString(),
      })
      .eq('id', sourceId);

    if (updateError) throw updateError;
  }

  /**
   * Record a provider payment - deducts from both project and master cash boxes
   * @param projectId Project ID
   * @param amount Payment amount
   * @param currency Currency (ARS or USD)
   * @param description Payment description (provider name, work details, etc.)
   * @param contractorPaymentId Optional contractor_payment ID for linking
   * @returns The created cash movement ID
   */
  async recordProviderPayment(
    projectId: string,
    amount: number,
    currency: 'ARS' | 'USD',
    description: string,
    contractorPaymentId?: string
  ): Promise<string> {
    // Validate amount
    if (!isValidCurrencyAmount(amount)) {
      throw new Error(getCurrencyOverflowError(amount));
    }

    const sanitizedAmount = sanitizeCurrencyAmount(amount);

    // Get both cash boxes
    const [projectCash, masterCash] = await Promise.all([
      this.getProjectCash(projectId),
      this.getMasterCash(),
    ]);

    if (!projectCash) {
      throw new Error('Project cash box not found');
    }

    // If master cash doesn't exist, create it automatically
    if (!masterCash || !masterCash.id) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if organizations table exists and get/create organization
      let orgId = user.id; // Use user.id as organization_id by default

      // Try to create master_cash_box
      const { data: newMasterCash, error: createError } = await supabase
        .from('master_cash_box')
        .insert({
          organization_id: orgId,
          name: 'Caja Maestra Principal',
          current_balance_ars: 0,
          current_balance_usd: 0,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create master cash box: ${createError.message}`);
      }

      // Update masterCash with the newly created one
      masterCash = {
        id: newMasterCash.id,
        balance: 0,
        balance_ars: 0,
        balance_usd: 0,
        total_collected: 0,
      };
    }

    // Check if project has sufficient funds in the correct currency
    const projectBalance = currency === 'USD'
      ? (projectCash.balance_usd || 0)
      : (projectCash.balance_ars || 0);

    if (projectBalance < sanitizedAmount) {
      throw new Error(
        `Insufficient funds in project ${currency} cash box. ` +
        `Available: ${currency} ${projectBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}, ` +
        `Required: ${currency} ${sanitizedAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
      );
    }

    // Check if master has sufficient funds
    const masterBalance = currency === 'USD'
      ? (masterCash.balance_usd || 0)
      : (masterCash.balance_ars || 0);

    if (masterBalance < sanitizedAmount) {
      throw new Error(
        `Insufficient funds in master ${currency} cash box. ` +
        `Available: ${currency} ${masterBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}, ` +
        `Required: ${currency} ${sanitizedAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
      );
    }

    // Calculate new balances
    const newProjectBalance = projectBalance - sanitizedAmount;
    const newMasterBalance = masterBalance - sanitizedAmount;

    // Validate new balances won't overflow
    if (!isValidCurrencyAmount(newProjectBalance)) {
      throw new Error(`New project balance calculation error: ${getCurrencyOverflowError(newProjectBalance)}`);
    }
    if (!isValidCurrencyAmount(newMasterBalance)) {
      throw new Error(`New master balance calculation error: ${getCurrencyOverflowError(newMasterBalance)}`);
    }

    // Create expense movement from project cash to external (provider)
    const movementData: InsertCashMovement = {
      movement_type: 'expense',
      source_type: 'project',
      source_id: projectCash.id,
      destination_type: 'external',
      destination_id: null,
      amount: sanitizedAmount,
      description: `${description} (${currency})`,
      project_id: projectId,
      metadata: {
        currency,
        contractor_payment_id: contractorPaymentId,
      },
    };

    const { data: movement, error: movementError } = await supabase
      .from('cash_movements')
      .insert(movementData)
      .select()
      .single();

    if (movementError) throw movementError;
    if (!movement) throw new Error('Failed to create cash movement');

    // Create mirrored expense movement from master cash
    const masterMovementData: InsertCashMovement = {
      movement_type: 'expense',
      source_type: 'master',
      source_id: masterCash.id,
      destination_type: 'external',
      destination_id: null,
      amount: sanitizedAmount,
      description: `Reflejo: ${description} (${currency})`,
      project_id: projectId,
      metadata: {
        currency,
        contractor_payment_id: contractorPaymentId,
        mirrored_from_project: true,
      },
    };

    const { error: masterMovementError } = await supabase
      .from('cash_movements')
      .insert(masterMovementData);

    if (masterMovementError) throw masterMovementError;

    // Update project cash box balance
    const projectUpdateField = currency === 'USD'
      ? { current_balance_usd: newProjectBalance }
      : { current_balance_ars: newProjectBalance };

    const { error: projectUpdateError } = await supabase
      .from('project_cash_box')
      .update({
        ...projectUpdateField,
        last_movement_at: new Date().toISOString(),
      })
      .eq('id', projectCash.id);

    if (projectUpdateError) throw projectUpdateError;

    // Update master cash box balance
    const masterUpdateField = currency === 'USD'
      ? { current_balance_usd: newMasterBalance }
      : { current_balance_ars: newMasterBalance };

    const { error: masterUpdateError } = await supabase
      .from('master_cash_box')
      .update({
        ...masterUpdateField,
        last_movement_at: new Date().toISOString(),
      })
      .eq('id', masterCash.id);

    if (masterUpdateError) throw masterUpdateError;

    return movement.id;
  }

  /**
   * Get cash movements with pagination
   */
  async getCashMovements(
    page: number = 1,
    pageSize: number = 20,
    filters?: {
      projectId?: string;
      movementType?: CashMovement['movement_type'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ data: CashMovement[]; count: number }> {
    let query = supabase
      .from('cash_movements')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId);
    }
    if (filters?.movementType) {
      query = query.eq('movement_type', filters.movementType);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  }

  /**
   * Get fee collections history
   */
  async getFeeCollections(
    page: number = 1,
    pageSize: number = 20,
    projectId?: string
  ): Promise<{ data: FeeCollection[]; count: number }> {
    let query = supabase
      .from('fee_collections')
      .select('*', { count: 'exact' });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    query = query
      .order('collected_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data || [], count: count || 0 };
  }
}

// Export singleton instance
export const cashBoxService = new CashBoxService();