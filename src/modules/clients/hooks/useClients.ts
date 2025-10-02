import { useState, useCallback, useEffect } from 'react';
import { clientService } from '../services/ClientService';
import type { Database } from '@/types/database.types';
import { toast } from '@/hooks/useToast';

type Client = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Omit<Database['public']['Tables']['clients']['Insert'], 'id' | 'architect_id' | 'created_at' | 'updated_at'>;

interface UseClientsOptions {
  autoLoad?: boolean;
}

export function useClients(options: UseClientsOptions = {}) {
  const { autoLoad = false } = options;

  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Load all clients
  const loadClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await clientService.getAllClients();
      setClients(data);
      setError(null);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Error al cargar los clientes');
      toast.error('Error al cargar los clientes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new client
  const createClient = useCallback(async (clientData: ClientInsert): Promise<Client | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const newClient = await clientService.createClient(clientData);
      
      // Add to local state
      setClients(prev => [...prev, newClient]);
      
      toast.success('Cliente creado exitosamente');
      return newClient;
    } catch (err) {
      console.error('Error creating client:', err);
      setError('Error al crear el cliente');
      toast.error('Error al crear el cliente');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an existing client
  const updateClient = useCallback(async (clientId: string, updates: Partial<Client>): Promise<Client | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedClient = await clientService.updateClient(clientId, updates);
      
      // Update local state
      setClients(prev => prev.map(client => 
        client.id === clientId ? updatedClient : client
      ));
      
      // Update selected client if it's the same
      if (selectedClient?.id === clientId) {
        setSelectedClient(updatedClient);
      }
      
      toast.success('Cliente actualizado exitosamente');
      return updatedClient;
    } catch (err) {
      console.error('Error updating client:', err);
      setError('Error al actualizar el cliente');
      toast.error('Error al actualizar el cliente');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [selectedClient]);

  // Delete a client
  const deleteClient = useCallback(async (clientId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await clientService.deleteClient(clientId);
      
      // Remove from local state
      setClients(prev => prev.filter(client => client.id !== clientId));
      
      // Clear selected client if it was deleted
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
      
      toast.success('Cliente eliminado exitosamente');
      return true;
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Error al eliminar el cliente');
      toast.error('Error al eliminar el cliente');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedClient]);

  // Get a single client by ID
  const getClient = useCallback(async (clientId: string): Promise<Client | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const client = await clientService.getClient(clientId);
      
      if (client) {
        setSelectedClient(client);
        
        // Add to local clients if not already there
        setClients(prev => {
          const exists = prev.some(c => c.id === clientId);
          if (!exists) {
            return [...prev, client];
          }
          return prev;
        });
      }
      
      return client;
    } catch (err) {
      console.error('Error fetching client:', err);
      setError('Error al cargar el cliente');
      toast.error('Error al cargar el cliente');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Select a client
  const selectClient = useCallback((client: Client | null) => {
    setSelectedClient(client);
  }, []);

  // Clear selected client
  const clearSelectedClient = useCallback(() => {
    setSelectedClient(null);
  }, []);

  // Check if email exists
  const checkEmailExists = useCallback(async (email: string): Promise<boolean> => {
    try {
      return await clientService.clientExistsByEmail(email);
    } catch (err) {
      console.error('Error checking email existence:', err);
      return false;
    }
  }, []);

  // Check if tax ID exists
  const checkTaxIdExists = useCallback(async (taxId: string): Promise<boolean> => {
    try {
      return await clientService.clientExistsByTaxId(taxId);
    } catch (err) {
      console.error('Error checking tax ID existence:', err);
      return false;
    }
  }, []);

  // Auto-load clients if requested
  useEffect(() => {
    if (autoLoad) {
      loadClients();
    }
  }, [autoLoad, loadClients]);

  return {
    // State
    clients,
    selectedClient,
    isLoading,
    error,
    
    // Actions
    loadClients,
    createClient,
    updateClient,
    deleteClient,
    getClient,
    selectClient,
    clearSelectedClient,
    checkEmailExists,
    checkTaxIdExists,
    
    // Computed
    hasClients: clients.length > 0,
    clientCount: clients.length,
  };
}