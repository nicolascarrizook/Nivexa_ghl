import { BaseService } from '@core/services/BaseService';
import type { Tables } from '@config/supabase';

// Type definitions
type Pipeline = Tables<'pipelines'>;

export interface PipelineStep {
  id: string;
  name: string;
  type: 'agent' | 'condition' | 'transform' | 'action';
  config: Record<string, any>;
  nextSteps?: string[];
}

export interface PipelineFilters {
  workspaceId?: string;
  status?: 'active' | 'paused' | 'failed';
  hasSchedule?: boolean;
}

export interface PipelineExecution {
  id: string;
  pipelineId: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed';
  results?: any;
  error?: string;
}

/**
 * Service layer for Pipeline operations
 */
export class PipelineService extends BaseService<'pipelines'> {
  constructor() {
    super('pipelines');
  }

  /**
   * Get pipelines for a specific workspace
   */
  async getWorkspacePipelines(workspaceId: string, filters?: PipelineFilters) {
    return this.getAll({
      filters: {
        workspace_id: workspaceId,
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: 'updated_at',
      orderDirection: 'desc',
    });
  }

  /**
   * Get active pipelines
   */
  async getActivePipelines(workspaceId: string) {
    return this.getAll({
      filters: {
        workspace_id: workspaceId,
        status: 'active',
      },
    });
  }

  /**
   * Get scheduled pipelines
   */
  async getScheduledPipelines(workspaceId: string) {
    const response = await this.getAll({
      filters: {
        workspace_id: workspaceId,
      },
    });
    
    if (!response.data) return { data: [], error: response.error };
    
    // Filter pipelines that have a schedule
    const scheduled = response.data.filter(p => p.schedule !== null);
    
    return {
      data: scheduled,
      error: null,
    };
  }

  /**
   * Update pipeline steps
   */
  async updateSteps(id: string, steps: PipelineStep[]) {
    return this.update(id, {
      steps: steps as any,
    });
  }

  /**
   * Add a step to pipeline
   */
  async addStep(id: string, step: PipelineStep) {
    const pipeline = await this.getById(id);
    
    if (!pipeline.data) {
      throw new Error('Pipeline not found');
    }
    
    const currentSteps = (pipeline.data.steps as PipelineStep[]) || [];
    
    return this.update(id, {
      steps: [...currentSteps, step] as any,
    });
  }

  /**
   * Remove a step from pipeline
   */
  async removeStep(id: string, stepId: string) {
    const pipeline = await this.getById(id);
    
    if (!pipeline.data) {
      throw new Error('Pipeline not found');
    }
    
    const currentSteps = (pipeline.data.steps as PipelineStep[]) || [];
    const filteredSteps = currentSteps.filter(s => s.id !== stepId);
    
    return this.update(id, {
      steps: filteredSteps as any,
    });
  }

  /**
   * Update pipeline schedule
   */
  async updateSchedule(id: string, schedule: string | null) {
    return this.update(id, {
      schedule,
    });
  }

  /**
   * Activate a pipeline
   */
  async activate(id: string) {
    return this.update(id, {
      status: 'active',
    });
  }

  /**
   * Pause a pipeline
   */
  async pause(id: string) {
    return this.update(id, {
      status: 'paused',
    });
  }

  /**
   * Mark pipeline as failed
   */
  async markFailed(id: string, error?: string) {
    return this.update(id, {
      status: 'failed',
      last_run: new Date().toISOString(),
    });
  }

  /**
   * Execute pipeline (placeholder for actual execution logic)
   */
  async executePipeline(id: string, input?: any): Promise<PipelineExecution> {
    const pipeline = await this.getById(id);
    
    if (!pipeline.data) {
      throw new Error('Pipeline not found');
    }
    
    if (pipeline.data.status !== 'active') {
      throw new Error('Pipeline is not active');
    }
    
    // Update last run time
    await this.update(id, {
      last_run: new Date().toISOString(),
    });
    
    // This would integrate with your actual pipeline execution service
    // For now, return a mock execution result
    return {
      id: crypto.randomUUID(),
      pipelineId: id,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      status: 'completed',
      results: {
        message: `Pipeline ${pipeline.data.name} executed successfully`,
        input,
      },
    };
  }

  /**
   * Clone a pipeline
   */
  async clonePipeline(pipelineId: string, workspaceId: string, newName: string) {
    const original = await this.getById(pipelineId);
    
    if (!original.data) {
      throw new Error('Pipeline not found');
    }
    
    return this.create({
      workspace_id: workspaceId,
      name: newName,
      description: `Cloned from: ${original.data.name}`,
      steps: original.data.steps,
      schedule: null, // Don't copy schedule for cloned pipelines
      status: 'paused', // Start cloned pipelines as paused
    });
  }

  /**
   * Validate pipeline steps
   */
  validatePipeline(steps: PipelineStep[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for empty pipeline
    if (steps.length === 0) {
      errors.push('Pipeline must have at least one step');
    }
    
    // Check for duplicate step IDs
    const stepIds = steps.map(s => s.id);
    const uniqueIds = new Set(stepIds);
    if (stepIds.length !== uniqueIds.size) {
      errors.push('Pipeline contains duplicate step IDs');
    }
    
    // Check for invalid next steps
    steps.forEach(step => {
      if (step.nextSteps) {
        step.nextSteps.forEach(nextId => {
          if (!stepIds.includes(nextId)) {
            errors.push(`Step ${step.id} references non-existent next step: ${nextId}`);
          }
        });
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get pipeline execution history (mock implementation)
   */
  async getExecutionHistory(pipelineId: string, limit: number = 10): Promise<PipelineExecution[]> {
    // This would fetch from an executions table in a real implementation
    // For now, return mock data
    return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
      id: crypto.randomUUID(),
      pipelineId,
      startTime: new Date(Date.now() - i * 86400000).toISOString(),
      endTime: new Date(Date.now() - i * 86400000 + 3600000).toISOString(),
      status: i === 0 ? 'completed' : i === 1 ? 'failed' : 'completed' as any,
      results: i === 1 ? undefined : { success: true },
      error: i === 1 ? 'Connection timeout' : undefined,
    }));
  }
}