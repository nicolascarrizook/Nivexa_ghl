import { BaseService, type QueryFilters } from '@core/services/BaseService';
import type { Tables } from '@config/supabase';

// Type definitions
type Workspace = Tables<'workspaces'>;

// Custom interfaces for Workspace module
export interface WorkspaceWithStats extends Workspace {
  agentCount?: number;
  pipelineCount?: number;
  lastActivity?: string;
}

export interface WorkspaceFilters extends QueryFilters {
  userId?: string;
  isActive?: boolean;
  searchName?: string;
}

/**
 * Service layer for Workspace operations
 * Extends BaseService with workspace-specific business logic
 */
export class WorkspaceService extends BaseService<'workspaces'> {
  constructor() {
    super('workspaces');
  }

  /**
   * Get workspaces for a specific user
   */
  async getUserWorkspaces(userId: string, filters?: WorkspaceFilters) {
    return this.getAll({
      ...filters,
      filters: {
        ...filters?.filters,
        user_id: userId,
        is_active: filters?.isActive ?? true,
      },
    });
  }

  /**
   * Get workspace with statistics
   */
  async getWorkspaceWithStats(id: string): Promise<WorkspaceWithStats | null> {
    try {
      const response = await this.getById(id);
      
      if (!response.data) return null;
      
      // In a real app, you would fetch these counts from the database
      // For now, we'll return mock stats
      const workspaceWithStats: WorkspaceWithStats = {
        ...response.data,
        agentCount: 0,
        pipelineCount: 0,
        lastActivity: new Date().toISOString(),
      };
      
      return workspaceWithStats;
    } catch (error) {
      console.error('Error fetching workspace with stats:', error);
      return null;
    }
  }

  /**
   * Clone a workspace
   */
  async cloneWorkspace(
    workspaceId: string,
    newName: string,
    userId: string
  ) {
    try {
      // Get original workspace
      const original = await this.getById(workspaceId);
      
      if (!original.data) {
        throw new Error('Workspace not found');
      }
      
      // Create new workspace with cloned settings
      const cloned = await this.create({
        name: newName,
        description: `Cloned from: ${original.data.name}`,
        user_id: userId,
        settings: original.data.settings,
        is_active: true,
      });
      
      return cloned;
    } catch (error) {
      console.error('Error cloning workspace:', error);
      throw error;
    }
  }

  /**
   * Archive a workspace (soft delete)
   */
  async archiveWorkspace(id: string) {
    return this.update(id, {
      is_active: false,
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Restore an archived workspace
   */
  async restoreWorkspace(id: string) {
    return this.update(id, {
      is_active: true,
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Update workspace settings
   */
  async updateSettings(id: string, settings: Record<string, any>) {
    const workspace = await this.getById(id);
    
    if (!workspace.data) {
      throw new Error('Workspace not found');
    }
    
    return this.update(id, {
      settings: {
        ...(workspace.data.settings as Record<string, any>),
        ...settings,
      },
    });
  }

  /**
   * Search workspaces by name
   */
  async searchByName(userId: string, searchTerm: string) {
    return this.getAll({
      filters: {
        user_id: userId,
      },
      search: {
        column: 'name',
        value: searchTerm,
      },
    });
  }

  /**
   * Check if user has access to workspace
   */
  async hasAccess(userId: string, workspaceId: string): Promise<boolean> {
    const workspace = await this.getById(workspaceId);
    return workspace.data?.user_id === userId;
  }

  /**
   * Get recent workspaces
   */
  async getRecentWorkspaces(userId: string, limit: number = 5) {
    return this.getAll({
      filters: {
        user_id: userId,
        is_active: true,
      },
      orderBy: 'updated_at',
      orderDirection: 'desc',
      limit,
    });
  }
}