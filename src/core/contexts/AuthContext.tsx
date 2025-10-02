import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '@core/services/AuthService';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const authService = new AuthService();

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session from Supabase
    const getInitialSession = async () => {
      try {
        const currentSession = await authService.getSession();
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authService.signIn({ email, password });
    
    if (error) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
    
    if (data) {
      setSession(data);
      setUser(data.user);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await authService.signUp({
      email,
      password,
      metadata: {
        displayName: fullName,
        full_name: fullName,
      },
    });
    
    if (error) {
      throw new Error(error.message || 'Error al crear cuenta');
    }
    
    if (data) {
      // For sign up, we might not get a session immediately if email confirmation is required
      console.log('User created:', data);
    }
  };

  const signOut = async () => {
    const { error } = await authService.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
    setSession(null);
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}