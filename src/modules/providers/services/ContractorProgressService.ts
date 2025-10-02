import { BaseService, ServiceResponse } from '@/core/services/BaseService';
import { supabase } from '@/config/supabase';
import type { Database } from '@/types/database.types';

type ContractorProgress = Database['public']['Tables']['contractor_progress']['Row'];
type ContractorProgressInsert = Database['public']['Tables']['contractor_progress']['Insert'];
type ContractorProgressUpdate = Database['public']['Tables']['contractor_progress']['Update'];

export interface ProgressTimeline {
  date: string;
  percentage: number;
  title: string | null;
  is_milestone: boolean;
}

export interface ProgressStats {
  current_percentage: number;
  total_updates: number;
  milestones_completed: number;
  total_photos: number;
  total_documents: number;
  last_update_date: string | null;
  average_monthly_progress: number;
}

/**
 * Service para gestionar el progreso y avances de contractors
 * Maneja actualizaciones de progreso, fotos y documentación
 */
export class ContractorProgressService extends BaseService<'contractor_progress'> {
  constructor() {
    super('contractor_progress');
  }

  /**
   * Obtiene todos los registros de progreso de un contractor
   */
  async getByProjectContractorId(projectContractorId: string): Promise<ServiceResponse<ContractorProgress[]>> {
    try {
      const { data, error } = await supabase
        .from('contractor_progress')
        .select('*')
        .eq('project_contractor_id', projectContractorId)
        .order('progress_date', { ascending: false });

      if (error) throw error;

      return {
        data: data as ContractorProgress[],
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
   * Obtiene solo los hitos (milestones)
   */
  async getMilestones(projectContractorId: string): Promise<ServiceResponse<ContractorProgress[]>> {
    try {
      const { data, error } = await supabase
        .from('contractor_progress')
        .select('*')
        .eq('project_contractor_id', projectContractorId)
        .eq('is_milestone', true)
        .order('progress_date', { ascending: false });

      if (error) throw error;

      return {
        data: data as ContractorProgress[],
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
   * Obtiene la línea de tiempo de progreso
   */
  async getTimeline(projectContractorId: string): Promise<ServiceResponse<ProgressTimeline[]>> {
    try {
      const { data, error } = await supabase
        .from('contractor_progress')
        .select('progress_date, percentage_complete, title, is_milestone')
        .eq('project_contractor_id', projectContractorId)
        .order('progress_date', { ascending: true });

      if (error) throw error;

      const timeline: ProgressTimeline[] = (data || []).map(item => ({
        date: item.progress_date,
        percentage: item.percentage_complete,
        title: item.title,
        is_milestone: item.is_milestone,
      }));

      return {
        data: timeline,
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
   * Crea un nuevo registro de progreso
   */
  async create(progress: ContractorProgressInsert): Promise<ServiceResponse<ContractorProgress>> {
    try {
      // Validar que el porcentaje esté en el rango válido
      if (progress.percentage_complete < 0 || progress.percentage_complete > 100) {
        throw new Error('El porcentaje debe estar entre 0 y 100');
      }

      const { data, error } = await supabase
        .from('contractor_progress')
        .insert(progress)
        .select()
        .single();

      if (error) throw error;

      return {
        data: data as ContractorProgress,
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
   * Actualiza un registro de progreso
   */
  async update(id: string, updates: ContractorProgressUpdate): Promise<ServiceResponse<ContractorProgress>> {
    try {
      // Validar que el porcentaje esté en el rango válido si se está actualizando
      if (updates.percentage_complete !== undefined) {
        if (updates.percentage_complete < 0 || updates.percentage_complete > 100) {
          throw new Error('El porcentaje debe estar entre 0 y 100');
        }
      }

      const { data, error } = await supabase
        .from('contractor_progress')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: data as ContractorProgress,
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
   * Elimina un registro de progreso
   */
  async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('contractor_progress')
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
   * Marca un registro de progreso como hito
   */
  async markAsMilestone(id: string, isMilestone: boolean = true): Promise<ServiceResponse<ContractorProgress>> {
    return this.update(id, { is_milestone: isMilestone });
  }

  /**
   * Agrega fotos a un registro de progreso
   */
  async addPhotos(id: string, photoUrls: string[]): Promise<ServiceResponse<ContractorProgress>> {
    try {
      // Obtener el registro actual
      const { data: current, error: fetchError } = await supabase
        .from('contractor_progress')
        .select('photos')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const currentPhotos = (current.photos as string[]) || [];
      const updatedPhotos = [...currentPhotos, ...photoUrls];

      return this.update(id, { photos: updatedPhotos as any });
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Agrega documentos a un registro de progreso
   */
  async addDocuments(id: string, documentUrls: string[]): Promise<ServiceResponse<ContractorProgress>> {
    try {
      // Obtener el registro actual
      const { data: current, error: fetchError } = await supabase
        .from('contractor_progress')
        .select('documents')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const currentDocuments = (current.documents as string[]) || [];
      const updatedDocuments = [...currentDocuments, ...documentUrls];

      return this.update(id, { documents: updatedDocuments as any });
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  /**
   * Obtiene estadísticas de progreso
   */
  async getStats(projectContractorId: string): Promise<ServiceResponse<ProgressStats>> {
    try {
      const { data, error } = await supabase
        .from('contractor_progress')
        .select('*')
        .eq('project_contractor_id', projectContractorId)
        .order('progress_date', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          data: {
            current_percentage: 0,
            total_updates: 0,
            milestones_completed: 0,
            total_photos: 0,
            total_documents: 0,
            last_update_date: null,
            average_monthly_progress: 0,
          },
          error: null,
        };
      }

      const latestProgress = data[data.length - 1];
      const currentPercentage = latestProgress.percentage_complete;
      const totalUpdates = data.length;
      const milestonesCompleted = data.filter(p => p.is_milestone).length;

      let totalPhotos = 0;
      let totalDocuments = 0;
      data.forEach(progress => {
        const photos = (progress.photos as string[]) || [];
        const documents = (progress.documents as string[]) || [];
        totalPhotos += photos.length;
        totalDocuments += documents.length;
      });

      const lastUpdateDate = latestProgress.progress_date;

      // Calcular progreso promedio mensual
      let averageMonthlyProgress = 0;
      if (data.length > 1) {
        const firstDate = new Date(data[0].progress_date);
        const lastDate = new Date(lastUpdateDate);
        const monthsDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

        if (monthsDiff > 0) {
          const progressDiff = currentPercentage - data[0].percentage_complete;
          averageMonthlyProgress = progressDiff / monthsDiff;
        }
      }

      return {
        data: {
          current_percentage: currentPercentage,
          total_updates: totalUpdates,
          milestones_completed: milestonesCompleted,
          total_photos: totalPhotos,
          total_documents: totalDocuments,
          last_update_date: lastUpdateDate,
          average_monthly_progress: Math.round(averageMonthlyProgress * 100) / 100,
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
   * Obtiene registros de progreso en un rango de fechas
   */
  async getByDateRange(
    projectContractorId: string,
    startDate: string,
    endDate: string
  ): Promise<ServiceResponse<ContractorProgress[]>> {
    try {
      const { data, error } = await supabase
        .from('contractor_progress')
        .select('*')
        .eq('project_contractor_id', projectContractorId)
        .gte('progress_date', startDate)
        .lte('progress_date', endDate)
        .order('progress_date', { ascending: true });

      if (error) throw error;

      return {
        data: data as ContractorProgress[],
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
   * Obtiene el último registro de progreso
   */
  async getLatest(projectContractorId: string): Promise<ServiceResponse<ContractorProgress>> {
    try {
      const { data, error } = await supabase
        .from('contractor_progress')
        .select('*')
        .eq('project_contractor_id', projectContractorId)
        .order('progress_date', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return {
        data: data as ContractorProgress,
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
export const contractorProgressService = new ContractorProgressService();