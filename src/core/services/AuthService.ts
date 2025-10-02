import { supabase } from '@config/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { analytics } from './AnalyticsService';
import { clearUserContext } from './SentryService';

export interface AuthResponse<T = any> {
  data: T | null;
  error: AuthError | null;
}

export interface SignUpData {
  email: string;
  password: string;
  metadata?: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    [key: string]: any;
  };
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Service layer for authentication operations
 * Handles all auth-related business logic
 */
export class AuthService {
  /**
   * Sign up a new user
   */
  async signUp(data: SignUpData): Promise<AuthResponse<User>> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: data.metadata,
        },
      });

      if (error) {
        throw error;
      }

      return {
        data: authData.user,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(data: SignInData): Promise<AuthResponse<Session>> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      return {
        data: authData.session,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithProvider(
    provider: 'google' | 'github' | 'gitlab' | 'bitbucket'
  ): Promise<AuthResponse<boolean>> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Track OAuth sign in attempt
      analytics.track('login_attempt', {
        method: provider
      });

      return {
        data: true,
        error: null,
      };
    } catch (error) {
      return {
        data: false,
        error: error as AuthError,
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResponse<boolean>> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      // Track sign out event
      analytics.track('logout');
      analytics.reset();
      clearUserContext();

      return {
        data: true,
        error: null,
      };
    } catch (error) {
      return {
        data: false,
        error: error as AuthError,
      };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      return null;
    }
  }

  /**
   * Reset password request
   */
  async resetPassword(email: string): Promise<AuthResponse<boolean>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      return {
        data: true,
        error: null,
      };
    } catch (error) {
      return {
        data: false,
        error: error as AuthError,
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<AuthResponse<User>> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return {
        data: data.user,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Update user metadata
   */
  async updateUserMetadata(metadata: Record<string, any>): Promise<AuthResponse<User>> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: metadata,
      });

      if (error) throw error;

      return {
        data: data.user,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<AuthResponse<Session>> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) throw error;

      return {
        data: data.session,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(
    email: string,
    token: string,
    type: 'signup' | 'recovery' | 'email_change'
  ): Promise<AuthResponse<Session>> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      });

      if (error) throw error;

      return {
        data: data.session,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }

  /**
   * Get auth token
   */
  async getToken(): Promise<string | null> {
    const session = await this.getSession();
    return session?.access_token || null;
  }
}