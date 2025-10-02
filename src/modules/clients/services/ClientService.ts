import { supabase } from '@/config/supabase';
import type { Database } from '@/types/database.types';

type Client = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export interface ClientSearchResult {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  tax_id: string | null;
  address: string | null;
  city: string | null;
  projects_count?: number;
}

class ClientService {
  /**
   * Search clients by name, email, phone or tax_id
   * Uses trigram search for fuzzy matching on the name field
   */
  async searchClients(query: string, limit = 10): Promise<ClientSearchResult[]> {
    try {
      // Clean and prepare the search query
      const searchTerm = query.trim().toLowerCase();
      
      if (searchTerm.length < 2) {
        return [];
      }

      // Use Supabase's full text search with trigram matching
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          email,
          phone,
          tax_id,
          address,
          city
        `)
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,tax_id.ilike.%${searchTerm}%`)
        .order('name')
        .limit(limit);

      if (error) {
        console.error('Error searching clients:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('ClientService: Error searching clients', error);
      throw error;
    }
  }

  /**
   * Get a single client by ID
   */
  async getClient(clientId: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching client:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('ClientService: Error fetching client', error);
      throw error;
    }
  }

  /**
   * Get all clients for the current architect
   */
  async getAllClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching all clients:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('ClientService: Error fetching all clients', error);
      throw error;
    }
  }

  /**
   * Create a new client
   */
  async createClient(client: Omit<ClientInsert, 'id' | 'architect_id' | 'created_at' | 'updated_at'>): Promise<Client> {
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...client,
          architect_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('ClientService: Error creating client', error);
      throw error;
    }
  }

  /**
   * Update an existing client
   */
  async updateClient(clientId: string, updates: ClientUpdate): Promise<Client> {
    try {
      // Remove id and architect_id from updates to prevent changing them
      const { id, architect_id, ...safeUpdates } = updates;

      const { data, error } = await supabase
        .from('clients')
        .update(safeUpdates)
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('ClientService: Error updating client', error);
      throw error;
    }
  }

  /**
   * Delete a client
   */
  async deleteClient(clientId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('Error deleting client:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('ClientService: Error deleting client', error);
      throw error;
    }
  }

  /**
   * Check if a client with the given email already exists
   */
  async clientExistsByEmail(email: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('email', email);

      if (error) {
        console.error('Error checking client existence:', error);
        throw error;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('ClientService: Error checking client existence', error);
      throw error;
    }
  }

  /**
   * Check if a client with the given tax ID already exists
   */
  async clientExistsByTaxId(taxId: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('tax_id', taxId);

      if (error) {
        console.error('Error checking client existence by tax ID:', error);
        throw error;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('ClientService: Error checking client existence by tax ID', error);
      throw error;
    }
  }
}

export const clientService = new ClientService();