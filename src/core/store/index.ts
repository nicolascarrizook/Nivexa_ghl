import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { User, Session } from '@supabase/supabase-js';

// Auth slice
interface AuthSlice {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

// UI slice
interface UISlice {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// App slice
interface AppSlice {
  currentWorkspace: string | null;
  isOnline: boolean;
  lastSync: Date | null;
  setCurrentWorkspace: (workspace: string | null) => void;
  setOnlineStatus: (status: boolean) => void;
  updateLastSync: () => void;
}

// Notification type
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Combined store type
export interface AppStore extends AuthSlice, UISlice, AppSlice {}

// Create the store with all slices
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((set) => ({
        // Auth State
        user: null,
        session: null,
        isLoading: true,
        isAuthenticated: false,
        
        setUser: (user) =>
          set((state) => {
            state.user = user;
            state.isAuthenticated = !!user;
          }),
          
        setSession: (session) =>
          set((state) => {
            state.session = session;
            state.isAuthenticated = !!session;
            if (session?.user) {
              state.user = session.user;
            }
          }),
          
        setLoading: (loading) =>
          set((state) => {
            state.isLoading = loading;
          }),
          
        clearAuth: () =>
          set((state) => {
            state.user = null;
            state.session = null;
            state.isAuthenticated = false;
            state.isLoading = false;
          }),

        // UI State
        sidebarOpen: true,
        theme: 'light',
        notifications: [],
        
        toggleSidebar: () =>
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          }),
          
        setTheme: (theme) =>
          set((state) => {
            state.theme = theme;
            // Apply theme to document
            document.documentElement.classList.toggle('dark', theme === 'dark');
          }),
          
        addNotification: (notification) =>
          set((state) => {
            state.notifications.push(notification);
            
            // Auto-remove after duration
            if (notification.duration !== 0) {
              setTimeout(() => {
                useAppStore.getState().removeNotification(notification.id);
              }, notification.duration || 5000);
            }
          }),
          
        removeNotification: (id) =>
          set((state) => {
            const index = state.notifications.findIndex((n) => n.id === id);
            if (index > -1) {
              state.notifications.splice(index, 1);
            }
          }),
          
        clearNotifications: () =>
          set((state) => {
            state.notifications = [];
          }),

        // App State
        currentWorkspace: null,
        isOnline: navigator.onLine,
        lastSync: null,
        
        setCurrentWorkspace: (workspace) =>
          set((state) => {
            state.currentWorkspace = workspace;
          }),
          
        setOnlineStatus: (status) =>
          set((state) => {
            state.isOnline = status;
          }),
          
        updateLastSync: () =>
          set((state) => {
            state.lastSync = new Date();
          }),
      })),
      {
        name: 'nivexa-storage',
        partialize: (state) => ({
          // Only persist these fields
          user: state.user,
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          currentWorkspace: state.currentWorkspace,
        }),
      }
    ),
    {
      name: 'Nivexa Store',
    }
  )
);

// Selectors for better performance
export const useAuth = () => useAppStore((state) => ({
  user: state.user,
  session: state.session,
  isLoading: state.isLoading,
  isAuthenticated: state.isAuthenticated,
  setUser: state.setUser,
  setSession: state.setSession,
  setLoading: state.setLoading,
  clearAuth: state.clearAuth,
}));

export const useUI = () => useAppStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  theme: state.theme,
  notifications: state.notifications,
  toggleSidebar: state.toggleSidebar,
  setTheme: state.setTheme,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}));

export const useApp = () => useAppStore((state) => ({
  currentWorkspace: state.currentWorkspace,
  isOnline: state.isOnline,
  lastSync: state.lastSync,
  setCurrentWorkspace: state.setCurrentWorkspace,
  setOnlineStatus: state.setOnlineStatus,
  updateLastSync: state.updateLastSync,
}));

// Helper function to create notifications
export const notify = {
  success: (title: string, message?: string) => {
    useAppStore.getState().addNotification({
      id: crypto.randomUUID(),
      type: 'success',
      title,
      message,
    });
  },
  error: (title: string, message?: string) => {
    useAppStore.getState().addNotification({
      id: crypto.randomUUID(),
      type: 'error',
      title,
      message,
      duration: 0, // Don't auto-dismiss errors
    });
  },
  warning: (title: string, message?: string) => {
    useAppStore.getState().addNotification({
      id: crypto.randomUUID(),
      type: 'warning',
      title,
      message,
    });
  },
  info: (title: string, message?: string) => {
    useAppStore.getState().addNotification({
      id: crypto.randomUUID(),
      type: 'info',
      title,
      message,
    });
  },
};