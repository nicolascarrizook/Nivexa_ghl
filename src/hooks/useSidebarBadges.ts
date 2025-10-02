import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';

interface SidebarBadges {
  projects: number;
  tasks: number;
  notifications: number;
  invoices: number;
}

/**
 * Custom hook to fetch dynamic badge counts for sidebar navigation
 * Returns real-time counts from Supabase for various entities
 */
export function useSidebarBadges(): SidebarBadges {
  // Projects count - active and in_progress projects
  const { data: projectsCount = 0 } = useQuery({
    queryKey: ['sidebar-projects-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .in('status', ['active', 'in_progress']);

      if (error) {
        console.error('Error fetching projects count:', error);
        return 0;
      }

      return count || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Tasks count - pending tasks
  // TODO: Implement when tasks table is available
  const { data: tasksCount = 0 } = useQuery({
    queryKey: ['sidebar-tasks-count'],
    queryFn: async () => {
      // Placeholder - will implement when tasks table exists
      return 0;
    },
    enabled: false, // Disable until tasks feature is implemented
  });

  // Notifications count - unread notifications
  // TODO: Implement when notifications table is available
  const { data: notificationsCount = 0 } = useQuery({
    queryKey: ['sidebar-notifications-count'],
    queryFn: async () => {
      // Placeholder - will implement when notifications table exists
      return 0;
    },
    enabled: false, // Disable until notifications feature is implemented
  });

  // Invoices count - pending invoices
  // TODO: Implement when invoices table is available
  const { data: invoicesCount = 0 } = useQuery({
    queryKey: ['sidebar-invoices-count'],
    queryFn: async () => {
      // Placeholder - will implement when invoices table exists
      return 0;
    },
    enabled: false, // Disable until invoices feature is implemented
  });

  return {
    projects: projectsCount,
    tasks: tasksCount,
    notifications: notificationsCount,
    invoices: invoicesCount,
  };
}
