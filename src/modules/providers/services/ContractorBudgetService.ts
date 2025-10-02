import { BaseService, ServiceResponse } from '@/core/services/BaseService';
import { supabase } from '@/config/supabase';
import type { Database } from '@/types/database.types';

type ContractorBudget = Database['public']['Tables']['contractor_budgets']['Row'];
type ContractorBudgetInsert = Database['public']['Tables']['contractor_budgets']['Insert'];
type ContractorBudgetUpdate = Database['public']['Tables']['contractor_budgets']['Update'];

export interface BudgetSummary {
  total_items: number;
  subtotal_by_category: Record<string, number>;
  grand_total: number;
}

/**
 * Service para gestionar presupuestos detallados de contractors
 * Maneja ítems de presupuesto con cálculos automáticos
 */
export class ContractorBudgetService extends BaseService<'contractor_budgets'> {
  constructor() {
    super('contractor_budgets');
  }

  /**
   * Obtiene todos los ítems de presupuesto de un contractor
   */
  async getByProjectContractorId(projectContractorId: string): Promise<ServiceResponse<ContractorBudget[]>> {
    try {
      const { data, error } = await supabase
        .from('contractor_budgets')
        .select('*')
        .eq('project_contractor_id', projectContractorId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      return {
        data: data as ContractorBudget[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Obtiene ítems de presupuesto agrupados por categoría
   */
  async getByCategory(
    projectContractorId: string,
    category: 'materials' | 'labor' | 'equipment' | 'services' | 'other'
  ): Promise<ServiceResponse<ContractorBudget[]>> {
    try {
      const { data, error } = await supabase
        .from('contractor_budgets')
        .select('*')
        .eq('project_contractor_id', projectContractorId)
        .eq('category', category)
        .order('order_index', { ascending: true });

      if (error) throw error;

      return {
        data: data as ContractorBudget[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Crea un nuevo ítem de presupuesto
   */
  async create(budgetItem: ContractorBudgetInsert): Promise<ServiceResponse<ContractorBudget>> {
    try {
      // Obtener el último order_index para este contractor
      const { data: lastItem } = await supabase
        .from('contractor_budgets')
        .select('order_index')
        .eq('project_contractor_id', budgetItem.project_contractor_id)
        .order('order_index', { ascending: false })
        .limit(1)
        .maybeSingle();

      const newOrderIndex = lastItem ? (lastItem.order_index || 0) + 1 : 0;

      const { data, error } = await supabase
        .from('contractor_budgets')
        .insert({
          ...budgetItem,
          order_index: newOrderIndex,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: data as ContractorBudget,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Actualiza un ítem de presupuesto
   */
  async update(id: string, updates: ContractorBudgetUpdate): Promise<ServiceResponse<ContractorBudget>> {
    try {
      const { data, error } = await supabase
        .from('contractor_budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: data as ContractorBudget,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Elimina un ítem de presupuesto
   */
  async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('contractor_budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        data: true,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Reordena los ítems de presupuesto
   */
  async reorder(items: { id: string; order_index: number }[]): Promise<ServiceResponse<boolean>> {
    try {
      const updates = items.map(item =>
        supabase
          .from('contractor_budgets')
          .update({ order_index: item.order_index })
          .eq('id', item.id)
      );

      await Promise.all(updates);

      return {
        data: true,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Obtiene un resumen del presupuesto
   */
  async getSummary(projectContractorId: string): Promise<ServiceResponse<BudgetSummary>> {
    try {
      const { data, error } = await supabase
        .from('contractor_budgets')
        .select('category, total_amount')
        .eq('project_contractor_id', projectContractorId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          data: {
            total_items: 0,
            subtotal_by_category: {},
            grand_total: 0,
          },
          error: null,
        };
      }

      const subtotalByCategory: Record<string, number> = {};
      let grandTotal = 0;

      data.forEach(item => {
        const category = item.category;
        const amount = item.total_amount || 0;

        subtotalByCategory[category] = (subtotalByCategory[category] || 0) + amount;
        grandTotal += amount;
      });

      return {
        data: {
          total_items: data.length,
          subtotal_by_category: subtotalByCategory,
          grand_total: grandTotal,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Duplica un ítem de presupuesto
   */
  async duplicate(id: string): Promise<ServiceResponse<ContractorBudget>> {
    try {
      // Obtener el ítem original
      const { data: original, error: fetchError } = await supabase
        .from('contractor_budgets')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Crear una copia sin el ID
      const { id: _, created_at, updated_at, ...itemData } = original;

      // Insertar la copia
      const { data, error } = await supabase
        .from('contractor_budgets')
        .insert({
          ...itemData,
          description: `${itemData.description} (copia)`,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: data as ContractorBudget,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Importa múltiples ítems de presupuesto
   */
  async bulkImport(
    projectContractorId: string,
    items: Omit<ContractorBudgetInsert, 'project_contractor_id'>[]
  ): Promise<ServiceResponse<ContractorBudget[]>> {
    try {
      const itemsWithContractor = items.map((item, index) => ({
        ...item,
        project_contractor_id: projectContractorId,
        order_index: index,
      }));

      const { data, error } = await supabase
        .from('contractor_budgets')
        .insert(itemsWithContractor)
        .select();

      if (error) throw error;

      return {
        data: data as ContractorBudget[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }
}

// Singleton instance
export const contractorBudgetService = new ContractorBudgetService();