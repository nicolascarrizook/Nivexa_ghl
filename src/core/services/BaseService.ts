import { supabase } from '@/config/supabase';
import type { Database } from '@/types/database.types';

// Generic type for table names
type TableName = keyof Database['public']['Tables'];

// Generic types for row data
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

// Common filter types
export interface QueryFilters {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
  search?: {
    column: string;
    value: string;
  };
}

// Response types
export interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Abstract base class for all service layers
 * Provides common CRUD operations with type safety
 */
export abstract class BaseService<T extends TableName> {
  protected tableName: T;
  
  constructor(tableName: T) {
    this.tableName = tableName;
  }

  /**
   * Get all records with optional filters
   */
  async getAll(filters?: QueryFilters): Promise<ServiceResponse<TableRow<T>[]>> {
    try {
      let query = (supabase as any).from(this.tableName).select('*', { count: 'exact' });
      
      // Apply filters
      if (filters) {
        if (filters.filters) {
          Object.entries(filters.filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              query = query.eq(key as any, value);
            }
          });
        }
        
        if (filters.search) {
          query = query.ilike(filters.search.column, `%${filters.search.value}%`);
        }
        
        if (filters.orderBy) {
          query = query.order(filters.orderBy, { 
            ascending: filters.orderDirection === 'asc' 
          });
        }
        
        if (filters.limit) {
          query = query.limit(filters.limit);
        }
        
        if (filters.offset) {
          query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return {
        data: (data as any) as TableRow<T>[],
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
   * Get paginated records
   */
  async getPaginated(
    page: number = 1,
    pageSize: number = 10,
    filters?: Omit<QueryFilters, 'limit' | 'offset'>
  ): Promise<ServiceResponse<PaginatedResponse<TableRow<T>>>> {
    try {
      const offset = (page - 1) * pageSize;
      
      // Get total count
      let countQuery = (supabase as any).from(this.tableName).select('*', { count: 'exact', head: true });
      
      if (filters?.filters) {
        Object.entries(filters.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            countQuery = countQuery.eq(key as any, value);
          }
        });
      }
      
      const { count } = await countQuery;
      
      // Get paginated data
      const response = await this.getAll({
        ...filters,
        limit: pageSize,
        offset,
      });
      
      if (response.error) throw response.error;
      
      return {
        data: {
          data: response.data || [],
          count: count || 0,
          page,
          pageSize,
          totalPages: Math.ceil((count || 0) / pageSize),
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
   * Get a single record by ID
   */
  async getById(id: string): Promise<ServiceResponse<TableRow<T>>> {
    try {
      const { data, error } = await (supabase as any)
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return {
        data: (data as any) as TableRow<T>,
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
   * Create a new record
   */
  async create(data: TableInsert<T>): Promise<ServiceResponse<TableRow<T>>> {
    try {
      const { data: created, error } = await (supabase as any)
        .from(this.tableName)
        .insert(data as any)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        data: created as TableRow<T>,
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
   * Create multiple records
   */
  async createMany(data: TableInsert<T>[]): Promise<ServiceResponse<TableRow<T>[]>> {
    try {
      const { data: created, error } = await (supabase as any)
        .from(this.tableName)
        .insert(data as any)
        .select();
      
      if (error) throw error;
      
      return {
        data: created as TableRow<T>[],
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
   * Update a record
   */
  async update(id: string, data: TableUpdate<T>): Promise<ServiceResponse<TableRow<T>>> {
    try {
      const { data: updated, error } = await (supabase as any)
        .from(this.tableName)
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        data: (updated as any) as TableRow<T>,
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
   * Delete a record (soft delete if supported)
   */
  async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id as any);
      
      if (error) throw error;
      
      return {
        data: true,
        error: null,
      };
    } catch (error) {
      return {
        data: false,
        error: error as Error,
      };
    }
  }

  /**
   * Delete multiple records
   */
  async deleteMany(ids: string[]): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .in('id', ids as any);
      
      if (error) throw error;
      
      return {
        data: true,
        error: null,
      };
    } catch (error) {
      return {
        data: false,
        error: error as Error,
      };
    }
  }

  /**
   * Check if a record exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const { count } = await supabase
        .from(this.tableName)
        .select('id', { count: 'exact', head: true })
        .eq('id', id as any);
      
      return (count || 0) > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Execute a raw query (for complex operations)
   */
  protected async executeRaw<R>(query: string, params?: unknown[]): Promise<ServiceResponse<R>> {
    try {
      const { data, error } = await (supabase as any).rpc(query, params as any);
      
      if (error) throw error;
      
      return {
        data: data as R,
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
   * Subscribe to real-time changes
   */
  subscribeToChanges(
    callback: (payload: any) => void,
    filter?: Record<string, string>
  ) {
    const channel = supabase
      .channel(`${this.tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: this.tableName,
          filter: filter ? Object.entries(filter).map(([k, v]) => `${k}=eq.${v}`).join(',') : undefined,
        },
        callback
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }
}