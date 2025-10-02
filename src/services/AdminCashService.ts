import { supabase as _supabase } from '@/config/supabase';

// Type cast to bypass database type restrictions for tables not in schema
const supabase = _supabase as any;

export interface AdminCashData {
  id: string;
  balance: number;
  total_collected: number;
  last_movement_at: string | null;
  pending_withdrawals?: number;
  available_for_withdrawal?: number;
}

export interface AdminMovement {
  id: string;
  movement_type: string;
  amount: number;
  description: string;
  created_at: string;
  project?: {
    name: string;
    code: string;
  };
  fee_collection?: {
    collection_reason: string;
    notes?: string;
  };
}

export interface WithdrawalParams {
  amount: number;
  method: 'transfer' | 'cash' | 'check';
  account?: string;
  notes?: string;
}

class AdminCashService {
  /**
   * Get admin cash box data
   */
  async getAdminCashData(): Promise<AdminCashData | null> {
    try {
      const { data: adminCash, error } = await supabase
        .from('admin_cash')
        .select('*')
        .single();

      if (error || !adminCash) {
        console.error('Error fetching admin cash:', error);
        return null;
      }

      // Calculate available for withdrawal (balance minus any pending withdrawals)
      const availableForWithdrawal = adminCash.balance;

      return {
        ...adminCash,
        available_for_withdrawal: availableForWithdrawal,
        pending_withdrawals: 0, // For future implementation
      };
    } catch (error) {
      console.error('Error in getAdminCashData:', error);
      return null;
    }
  }

  /**
   * Get recent movements for admin cash
   */
  async getRecentMovements(limit: number = 50): Promise<AdminMovement[]> {
    try {
      const { data, error } = await supabase
        .from('cash_movements')
        .select(`
          *,
          project:projects(name, code),
          fee_collection:fee_collections(collection_reason, notes)
        `)
        .or('destination_type.eq.admin,source_type.eq.admin')
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
   * Withdraw funds from admin cash
   */
  async withdrawFunds(params: WithdrawalParams): Promise<boolean> {
    try {
      // Get admin cash box
      const { data: adminCash } = await supabase
        .from('admin_cash')
        .select('*')
        .single();

      if (!adminCash) {
        console.error('Admin cash box not found');
        return false;
      }

      // Check sufficient balance
      if (adminCash.balance < params.amount) {
        console.error('Insufficient balance in admin cash');
        return false;
      }

      // Create withdrawal movement
      const { error: movementError } = await supabase
        .from('cash_movements')
        .insert({
          movement_type: 'admin_withdrawal',
          source_type: 'admin',
          source_id: adminCash.id,
          destination_type: 'external',
          amount: params.amount,
          description: `Retiro de honorarios - ${params.method}`,
          notes: params.notes,
        });

      if (movementError) {
        console.error('Error creating withdrawal movement:', movementError);
        return false;
      }

      // Update admin cash balance
      const { error: updateError } = await supabase
        .from('admin_cash')
        .update({
          balance: adminCash.balance - params.amount,
          last_movement_at: new Date().toISOString(),
        })
        .eq('id', adminCash.id);

      if (updateError) {
        console.error('Error updating admin cash balance:', updateError);
        return false;
      }

      console.log(`✅ Withdrawal successful: ${params.amount} via ${params.method}`);
      return true;
    } catch (error) {
      console.error('Error in withdrawFunds:', error);
      return false;
    }
  }

  /**
   * Get monthly statistics for admin cash
   */
  async getMonthlyStats(): Promise<{
    monthlyCollections: number;
    monthlyWithdrawals: number;
    averageFeeAmount: number;
    totalProjects: number;
  }> {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Get monthly fee collections
      const { data: collections } = await supabase
        .from('cash_movements')
        .select('amount')
        .eq('movement_type', 'fee_collection')
        .eq('destination_type', 'admin')
        .gte('created_at', startOfMonth.toISOString());

      const monthlyCollections = collections?.reduce((sum, c) => sum + c.amount, 0) || 0;

      // Get monthly withdrawals
      const { data: withdrawals } = await supabase
        .from('cash_movements')
        .select('amount')
        .eq('movement_type', 'admin_withdrawal')
        .gte('created_at', startOfMonth.toISOString());

      const monthlyWithdrawals = withdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0;

      // Calculate average fee amount
      const averageFeeAmount = collections && collections.length > 0 
        ? monthlyCollections / collections.length 
        : 0;

      // Get total projects with fees collected this month
      const { data: projectsWithFees } = await supabase
        .from('cash_movements')
        .select('project_id')
        .eq('movement_type', 'fee_collection')
        .gte('created_at', startOfMonth.toISOString())
        .not('project_id', 'is', null);

      const uniqueProjects = new Set(projectsWithFees?.map(p => p.project_id));
      const totalProjects = uniqueProjects.size;

      return {
        monthlyCollections,
        monthlyWithdrawals,
        averageFeeAmount,
        totalProjects,
      };
    } catch (error) {
      console.error('Error in getMonthlyStats:', error);
      return {
        monthlyCollections: 0,
        monthlyWithdrawals: 0,
        averageFeeAmount: 0,
        totalProjects: 0,
      };
    }
  }

  /**
   * Get fee collection history grouped by project
   */
  async getFeesByProject(): Promise<Array<{
    project_id: string;
    project_name: string;
    total_fees: number;
    collection_count: number;
  }>> {
    try {
      const { data: feeMovements, error } = await supabase
        .from('cash_movements')
        .select(`
          amount,
          project:projects(id, name, code)
        `)
        .eq('movement_type', 'fee_collection')
        .not('project_id', 'is', null);

      if (error) {
        console.error('Error fetching fees by project:', error);
        return [];
      }

      // Group by project
      const projectMap = new Map<string, {
        project_name: string;
        total_fees: number;
        collection_count: number;
      }>();

      feeMovements?.forEach(movement => {
        if (movement.project) {
          const projectId = movement.project.id;
          const existing = projectMap.get(projectId) || {
            project_name: movement.project.name,
            total_fees: 0,
            collection_count: 0,
          };
          
          existing.total_fees += movement.amount;
          existing.collection_count += 1;
          
          projectMap.set(projectId, existing);
        }
      });

      return Array.from(projectMap.entries()).map(([project_id, data]) => ({
        project_id,
        ...data,
      }));
    } catch (error) {
      console.error('Error in getFeesByProject:', error);
      return [];
    }
  }
}

export const adminCashService = new AdminCashService();