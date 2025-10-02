import { supabase as _supabase } from '@/config/supabase';

// Type cast to bypass database type restrictions for tables not in schema
const supabase = _supabase as any;

// Currency types
export type Currency = 'ARS' | 'USD';
export type ExchangeRateSource = 'blue' | 'oficial' | 'mep' | 'ccl';

export interface MasterCashData {
  id: string;
  balance: number; // Legacy field, kept for backward compatibility
  balance_ars: number; // Balance in Argentine Pesos
  balance_usd: number; // Balance in US Dollars
  last_movement_at: string | null;
  total_income?: number;
  total_fees_available?: number;
  total_fees_collected?: number;
  pending_collections?: number;
}

export interface CashMovement {
  id: string;
  movement_type: string;
  amount: number;
  currency: Currency; // Currency of the movement
  exchange_rate: number; // Exchange rate at time of movement (1 for non-conversion movements)
  description: string;
  created_at: string;
  project?: {
    name: string;
    code: string;
  };
  source_type?: string;
  destination_type?: string;
}

export interface CurrencyConversion {
  id: string;
  from_currency: Currency;
  from_amount: number;
  to_currency: Currency;
  to_amount: number;
  exchange_rate: number;
  exchange_rate_source: ExchangeRateSource;
  outbound_movement_id: string;
  inbound_movement_id: string;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface FeeCollectionParams {
  amount: number;
  currency: Currency; // Currency of the fee collection
  reason: string;
  projectId?: string;
  notes?: string;
}

export interface CurrencyConversionParams {
  from_currency: Currency;
  amount: number;
  to_currency: Currency;
  exchange_rate_source: ExchangeRateSource;
  notes?: string;
}

class MasterCashService {
  /**
   * Get master cash box data with calculated metrics
   * Now includes separate balances for ARS and USD
   */
  async getMasterCashData(): Promise<MasterCashData | null> {
    try {
      // Get master cash box with multi-currency support
      const { data: masterCash, error: cashError } = await supabase
        .from('master_cash')
        .select('*')
        .single();

      if (cashError || !masterCash) {
        console.error('Error fetching master cash:', cashError);
        return null;
      }

      // Ensure balance_ars and balance_usd exist (for backward compatibility)
      if (masterCash.balance_ars === undefined) {
        masterCash.balance_ars = masterCash.balance || 0;
      }
      if (masterCash.balance_usd === undefined) {
        masterCash.balance_usd = 0;
      }

      // Calculate total income from projects (excluding duplications)
      const { data: movements } = await supabase
        .from('cash_movements')
        .select('amount, movement_type')
        .eq('destination_type', 'master')
        .in('movement_type', ['project_income', 'master_duplication']);

      const totalIncome = movements?.reduce((sum: number, m: any) => {
        // Only count real income, not duplications
        if (m.movement_type === 'master_duplication') {
          return sum + m.amount;
        }
        return sum;
      }, 0) || 0;

      // Calculate fees collected to admin cash
      const { data: feeMovements } = await supabase
        .from('cash_movements')
        .select('amount')
        .eq('movement_type', 'fee_collection')
        .eq('source_type', 'master');

      const totalFeesCollected = feeMovements?.reduce((sum: number, m: any) => sum + m.amount, 0) || 0;

      // Calculate available fees (could be a percentage of balance)
      // For now, let's assume 20% of current balance is available as fees
      const totalFeesAvailable = masterCash.balance * 0.20;

      // For now, set pending collections to 0 since we don't have administrator_fees table yet
      const pendingCollections = 0;

      return {
        ...masterCash,
        total_income: totalIncome,
        total_fees_available: totalFeesAvailable,
        total_fees_collected: totalFeesCollected,
        pending_collections: pendingCollections,
      };
    } catch (error) {
      console.error('Error in getMasterCashData:', error);
      return null;
    }
  }

  /**
   * Get recent movements for master cash
   */
  async getRecentMovements(limit: number = 50): Promise<CashMovement[]> {
    try {
      const { data, error } = await supabase
        .from('cash_movements')
        .select(`
          *,
          project:projects(name, code)
        `)
        .or('destination_type.eq.master,source_type.eq.master')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching movements:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecentMovements:', error);
      return [];
    }
  }

  /**
   * Collect fees from master cash to admin cash
   * Now supports multi-currency (ARS and USD)
   */
  async collectFees(params: FeeCollectionParams): Promise<boolean> {
    try {
      const { amount, currency, reason, projectId, notes } = params;

      // Get master and admin cash boxes
      const { data: masterCash } = await supabase
        .from('master_cash')
        .select('*')
        .single();

      const { data: adminCash } = await supabase
        .from('admin_cash')
        .select('*')
        .single();

      if (!masterCash || !adminCash) {
        console.error('Cash boxes not found');
        return false;
      }

      // Check if master cash has sufficient balance in the specified currency
      const currentBalance = currency === 'ARS' ?
        (masterCash.balance_ars || masterCash.balance) :
        (masterCash.balance_usd || 0);

      if (currentBalance < amount) {
        console.error(`Insufficient balance in master cash (${currency}): ${currentBalance} < ${amount}`);
        return false;
      }

      // Get or create the "Honorarios Profesionales" category for income
      let categoryId: string | null = null;
      const { data: incomeCategory } = await supabase
        .from('income_expense_categories')
        .select('id')
        .eq('name', 'Honorarios Profesionales')
        .eq('type', 'income')
        .eq('is_active', true)
        .single();

      if (incomeCategory) {
        categoryId = incomeCategory.id;
      } else {
        // Create the category if it doesn't exist
        const { data: newCategory } = await supabase
          .from('income_expense_categories')
          .insert({
            name: 'Honorarios Profesionales',
            type: 'income',
            description: 'Ingresos por honorarios profesionales cobrados desde Caja Maestra',
            is_active: true
          })
          .select('id')
          .single();
        
        if (newCategory) {
          categoryId = newCategory.id;
        }
      }

      // Create fee collection record
      const { data: feeCollection, error: feeError } = await supabase
        .from('fee_collections')
        .insert({
          project_id: params.projectId || null,
          amount_collected: params.amount,
          collection_reason: params.reason,
          notes: params.notes,
        })
        .select()
        .single();

      if (feeError || !feeCollection) {
        console.error('Error creating fee collection:', feeError);
        return false;
      }

      // Create cash movement (for cash flow tracking) with currency support
      const { error: movementError } = await supabase
        .from('cash_movements')
        .insert({
          movement_type: 'fee_collection',
          source_type: 'master',
          source_id: masterCash.id,
          destination_type: 'admin',
          destination_id: adminCash.id,
          amount,
          currency,
          exchange_rate: 1, // No conversion for fee collections
          description: `Cobro de honorarios ${currency} - ${reason}`,
          fee_collection_id: feeCollection.id,
          project_id: projectId || null,
        });

      if (movementError) {
        console.error('Error creating cash movement:', movementError);
        return false;
      }

      // IMPORTANT: Create financial transaction for income tracking
      // This is what makes the fee collection appear in financial reports
      const { error: transactionError } = await (supabase as any)
        .from('financial_transactions')
        .insert({
          transaction_type: 'income',
          amount,
          currency, // Now uses the currency from params
          category_id: categoryId,
          project_id: projectId || null,
          description: `Cobro de honorarios ${currency} - ${reason}${notes ? ` - ${notes}` : ''}`,
          payment_method: 'transfer',
          reference_number: `FEE-${feeCollection.id}`,
          transaction_date: new Date().toISOString().split('T')[0],
          status: 'completed',
          cash_type: 'admin'
        });

      if (transactionError) {
        console.error('Error creating financial transaction:', transactionError);
        return false;
      }

      // Update balances - now handles multi-currency
      const masterBalanceUpdates: any = {
        last_movement_at: new Date().toISOString(),
      };

      // Update the correct currency balance
      if (currency === 'ARS') {
        masterBalanceUpdates.balance_ars = (masterCash.balance_ars || masterCash.balance) - amount;
        masterBalanceUpdates.balance = masterBalanceUpdates.balance_ars; // Keep legacy field in sync
      } else {
        masterBalanceUpdates.balance_usd = (masterCash.balance_usd || 0) - amount;
      }

      const { error: masterUpdateError } = await supabase
        .from('master_cash')
        .update(masterBalanceUpdates)
        .eq('id', masterCash.id);

      const { error: adminUpdateError } = await supabase
        .from('admin_cash')
        .update({
          balance: adminCash.balance + params.amount,
          total_collected: adminCash.total_collected + params.amount,
          last_movement_at: new Date().toISOString(),
        })
        .eq('id', adminCash.id);

      if (masterUpdateError || adminUpdateError) {
        console.error('Error updating balances:', masterUpdateError, adminUpdateError);
        return false;
      }

      console.log(`✅ Fees collected: ${params.amount} - ${params.reason}`);
      console.log(`✅ Financial transaction created for income tracking`);
      return true;
    } catch (error) {
      console.error('Error in collectFees:', error);
      return false;
    }
  }

  /**
   * Get financial summary for dashboard
   * Now includes separate balances for ARS and USD
   */
  async getFinancialSummary(): Promise<{
    masterBalance: number; // Legacy field (ARS)
    masterBalanceArs: number;
    masterBalanceUsd: number;
    adminBalance: number;
    totalProjectsBalance: number;
    totalSystemBalance: number; // Legacy field (ARS only)
    totalSystemBalanceArs: number;
    totalSystemBalanceUsd: number;
  }> {
    try {
      // Get all cash box balances with multi-currency support
      const { data: masterCash } = await supabase
        .from('master_cash')
        .select('balance, balance_ars, balance_usd')
        .single();

      const { data: adminCash } = await supabase
        .from('admin_cash')
        .select('balance')
        .single();

      const { data: projectCashes } = await supabase
        .from('project_cash')
        .select('balance');

      const totalProjectsBalance = projectCashes?.reduce((sum: number, p: any) => sum + p.balance, 0) || 0;

      const masterBalanceArs = masterCash?.balance_ars || masterCash?.balance || 0;
      const masterBalanceUsd = masterCash?.balance_usd || 0;

      // IMPORTANT: Total system balance is ONLY Master Cash
      // Master Cash is the financiera's cash that mirrors project cashes
      // but can have additional funds from other sources
      // Project Cashes are NOT added (would be counting twice)
      // Admin Cash is PRIVATE (architect's fees) and NOT included
      return {
        masterBalance: masterBalanceArs, // Legacy field for backward compatibility
        masterBalanceArs,
        masterBalanceUsd,
        adminBalance: adminCash?.balance || 0,  // Private - not included in system total
        totalProjectsBalance,  // For reference only, not added to total
        totalSystemBalance: masterBalanceArs,  // Legacy field - ONLY ARS
        totalSystemBalanceArs: masterBalanceArs,
        totalSystemBalanceUsd: masterBalanceUsd,
      };
    } catch (error) {
      console.error('Error in getFinancialSummary:', error);
      return {
        masterBalance: 0,
        masterBalanceArs: 0,
        masterBalanceUsd: 0,
        adminBalance: 0,
        totalProjectsBalance: 0,
        totalSystemBalance: 0,
        totalSystemBalanceArs: 0,
        totalSystemBalanceUsd: 0,
      };
    }
  }

  /**
   * Get monthly statistics
   */
  async getMonthlyStats(): Promise<{
    monthlyIncome: number;
    monthlyFees: number;
    monthlyProjects: number;
  }> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Get monthly income
      const { data: incomeMovements } = await supabase
        .from('cash_movements')
        .select('amount')
        .eq('movement_type', 'master_duplication')
        .gte('created_at', startOfMonth.toISOString());

      const monthlyIncome = incomeMovements?.reduce((sum: number, m: any) => sum + m.amount, 0) || 0;

      // Get monthly fees collected
      const { data: feeMovements } = await supabase
        .from('cash_movements')
        .select('amount')
        .eq('movement_type', 'fee_collection')
        .gte('created_at', startOfMonth.toISOString());

      const monthlyFees = feeMovements?.reduce((sum: number, m: any) => sum + m.amount, 0) || 0;

      // Get monthly projects count
      const { count: monthlyProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      return {
        monthlyIncome,
        monthlyFees,
        monthlyProjects: monthlyProjects || 0,
      };
    } catch (error) {
      console.error('Error in getMonthlyStats:', error);
      return {
        monthlyIncome: 0,
        monthlyFees: 0,
        monthlyProjects: 0,
      };
    }
  }

  /**
   * Get master cash balance breakdown by project
   * Shows which projects contributed money to master cash
   */
  async getMasterCashByProject(): Promise<{
    total_master_balance: number;
    by_project: Array<{
      project_id: string;
      project_name: string;
      project_code: string;
      contributed_amount: number;
      installments_count: number;
      last_payment_date: string | null;
    }>;
  }> {
    try {
      // Get current master cash balance
      const { data: masterCash } = await supabase
        .from('master_cash')
        .select('balance')
        .single();

      // Get all movements that brought money INTO master cash, grouped by project
      const { data: movements } = await supabase
        .from('cash_movements')
        .select(`
          project_id,
          amount,
          installment_id,
          created_at,
          project:projects(id, name, code)
        `)
        .eq('movement_type', 'master_duplication')
        .eq('destination_type', 'master')
        .not('project_id', 'is', null)
        .order('created_at', { ascending: false });

      if (!movements || movements.length === 0) {
        return {
          total_master_balance: masterCash?.balance || 0,
          by_project: [],
        };
      }

      // Group by project and calculate totals
      const projectMap = new Map<string, {
        project_id: string;
        project_name: string;
        project_code: string;
        contributed_amount: number;
        installments_count: number;
        last_payment_date: string | null;
      }>();

      movements.forEach((movement: any) => {
        if (!movement.project || !movement.project_id) return;

        const projectId = movement.project_id;
        const existing = projectMap.get(projectId);

        if (existing) {
          existing.contributed_amount += movement.amount;
          existing.installments_count += 1;
          // Update last payment date if this one is more recent
          if (movement.created_at > (existing.last_payment_date || '')) {
            existing.last_payment_date = movement.created_at;
          }
        } else {
          projectMap.set(projectId, {
            project_id: projectId,
            project_name: movement.project.name,
            project_code: movement.project.code || 'N/A',
            contributed_amount: movement.amount,
            installments_count: 1,
            last_payment_date: movement.created_at,
          });
        }
      });

      // Convert map to array and sort by contributed amount (descending)
      const byProject = Array.from(projectMap.values())
        .sort((a, b) => b.contributed_amount - a.contributed_amount);

      return {
        total_master_balance: masterCash?.balance || 0,
        by_project: byProject,
      };
    } catch (error) {
      console.error('Error in getMasterCashByProject:', error);
      return {
        total_master_balance: 0,
        by_project: [],
      };
    }
  }
}

export const masterCashService = new MasterCashService();