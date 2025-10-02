import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AuthService, type SignUpData, type SignInData } from '@core/services/AuthService';
import type { User, Session } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Create auth service instance
const authService = new AuthService();

// Auth store for global state management
interface AuthStore {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ isLoading: loading }),
      reset: () => set({ user: null, session: null, isLoading: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // Only persist user
    }
  )
);

// Query keys
const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

/**
 * Main authentication hook
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const { user, session, isLoading, setUser, setSession, setLoading, reset } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const [currentUser, currentSession] = await Promise.all([
          authService.getCurrentUser(),
          authService.getSession(),
        ]);
        
        setUser(currentUser);
        setSession(currentSession);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        reset();
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initAuth();
    }

    // Subscribe to auth changes
    const { data: authListener } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (event === 'SIGNED_IN') {
          setSession(session);
          setUser(session?.user || null);
          queryClient.invalidateQueries();
        } else if (event === 'SIGNED_OUT') {
          reset();
          queryClient.clear();
        } else if (event === 'TOKEN_REFRESHED') {
          setSession(session);
        } else if (event === 'USER_UPDATED') {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [isInitialized, queryClient, reset, setLoading, setSession, setUser]);

  // Sign up mutation
  const signUp = useMutation({
    mutationFn: (data: SignUpData) => authService.signUp(data),
    onSuccess: (response) => {
      if (response.data) {
        setUser(response.data);
      }
    },
  });

  // Sign in mutation
  const signIn = useMutation({
    mutationFn: (data: SignInData) => authService.signIn(data),
    onSuccess: async (response) => {
      if (response.data) {
        setSession(response.data);
        setUser(response.data.user);
        await queryClient.invalidateQueries();
      }
    },
  });

  // Sign out mutation
  const signOut = useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      reset();
      queryClient.clear();
    },
  });

  // OAuth sign in mutation
  const signInWithProvider = useMutation({
    mutationFn: (provider: 'google' | 'github' | 'gitlab' | 'bitbucket') =>
      authService.signInWithProvider(provider),
  });

  // Password reset mutation
  const resetPassword = useMutation({
    mutationFn: (email: string) => authService.resetPassword(email),
  });

  // Update password mutation
  const updatePassword = useMutation({
    mutationFn: (newPassword: string) => authService.updatePassword(newPassword),
    onSuccess: (response) => {
      if (response.data) {
        setUser(response.data);
      }
    },
  });

  // Update user metadata mutation
  const updateUserMetadata = useMutation({
    mutationFn: (metadata: Record<string, any>) =>
      authService.updateUserMetadata(metadata),
    onSuccess: (response) => {
      if (response.data) {
        setUser(response.data);
      }
    },
  });

  // Refresh session mutation
  const refreshSession = useMutation({
    mutationFn: () => authService.refreshSession(),
    onSuccess: (response) => {
      if (response.data) {
        setSession(response.data);
      }
    },
  });

  return {
    // State
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    
    // Mutations
    signUp,
    signIn,
    signOut,
    signInWithProvider,
    resetPassword,
    updatePassword,
    updateUserMetadata,
    refreshSession,
    
    // Utilities
    getToken: async () => authService.getToken(),
  };
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get current session
 */
export function useSession() {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: () => authService.getSession(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to check authentication status
 */
export function useIsAuthenticated() {
  const { data: session } = useSession();
  return !!session;
}

/**
 * Hook for protected routes
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  
  return {
    isAuthenticated,
    isLoading,
    canAccess: isAuthenticated && !isLoading,
  };
}