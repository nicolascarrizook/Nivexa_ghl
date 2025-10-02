import { BaseService } from '@core/services/BaseService';
import type { Tables } from '@config/supabase';

// Type definitions
type AIAgent = Tables<'ai_agents'>;

export interface AIAgentFilters {
  workspaceId?: string;
  status?: 'active' | 'inactive' | 'training';
  type?: string;
}

export interface AIAgentConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: string[];
  [key: string]: any;
}

export interface AIAgentMetrics {
  totalExecutions?: number;
  successRate?: number;
  averageResponseTime?: number;
  lastExecutionTime?: string;
  errorCount?: number;
  [key: string]: any;
}

/**
 * Service layer for AI Agent operations
 */
export class AIAgentService extends BaseService<'ai_agents'> {
  constructor() {
    super('ai_agents');
  }

  /**
   * Get agents for a specific workspace
   */
  async getWorkspaceAgents(workspaceId: string, filters?: AIAgentFilters) {
    return this.getAll({
      filters: {
        workspace_id: workspaceId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.type && { type: filters.type }),
      },
      orderBy: 'created_at',
      orderDirection: 'desc',
    });
  }

  /**
   * Get active agents for a workspace
   */
  async getActiveAgents(workspaceId: string) {
    return this.getAll({
      filters: {
        workspace_id: workspaceId,
        status: 'active',
      },
    });
  }

  /**
   * Update agent configuration
   */
  async updateConfig(id: string, config: AIAgentConfig) {
    const agent = await this.getById(id);
    
    if (!agent.data) {
      throw new Error('Agent not found');
    }
    
    return this.update(id, {
      config: {
        ...(agent.data.config as AIAgentConfig),
        ...config,
      },
    });
  }

  /**
   * Update agent metrics
   */
  async updateMetrics(id: string, metrics: Partial<AIAgentMetrics>) {
    const agent = await this.getById(id);
    
    if (!agent.data) {
      throw new Error('Agent not found');
    }
    
    const currentMetrics = agent.data.metrics as AIAgentMetrics || {};
    
    return this.update(id, {
      metrics: {
        ...currentMetrics,
        ...metrics,
        lastExecutionTime: new Date().toISOString(),
      },
    });
  }

  /**
   * Activate an agent
   */
  async activate(id: string) {
    return this.update(id, {
      status: 'active',
    });
  }

  /**
   * Deactivate an agent
   */
  async deactivate(id: string) {
    return this.update(id, {
      status: 'inactive',
    });
  }

  /**
   * Start training an agent
   */
  async startTraining(id: string) {
    return this.update(id, {
      status: 'training',
    });
  }

  /**
   * Clone an agent
   */
  async cloneAgent(agentId: string, workspaceId: string, newName: string) {
    const original = await this.getById(agentId);
    
    if (!original.data) {
      throw new Error('Agent not found');
    }
    
    return this.create({
      workspace_id: workspaceId,
      name: newName,
      type: original.data.type,
      config: original.data.config,
      status: 'inactive', // Start cloned agents as inactive
    });
  }

  /**
   * Get agents by type
   */
  async getAgentsByType(workspaceId: string, type: string) {
    return this.getAll({
      filters: {
        workspace_id: workspaceId,
        type,
      },
    });
  }

  /**
   * Execute agent (placeholder for actual execution logic)
   */
  async executeAgent(id: string, input: any) {
    // This would integrate with your actual AI execution service
    // For now, we'll just update metrics
    
    const agent = await this.getById(id);
    
    if (!agent.data) {
      throw new Error('Agent not found');
    }
    
    if (agent.data.status !== 'active') {
      throw new Error('Agent is not active');
    }
    
    // Update execution metrics
    const metrics = agent.data.metrics as AIAgentMetrics || {};
    await this.updateMetrics(id, {
      totalExecutions: (metrics.totalExecutions || 0) + 1,
    });
    
    // Return mock response
    return {
      success: true,
      response: `Agent ${agent.data.name} executed successfully`,
      executionTime: Date.now(),
    };
  }

  /**
   * Batch update agent statuses
   */
  async batchUpdateStatus(
    agentIds: string[],
    status: 'active' | 'inactive'
  ) {
    const updates = await Promise.all(
      agentIds.map(id => this.update(id, { status }))
    );
    
    return updates.filter(u => u.data !== null);
  }
}