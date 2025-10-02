import { vi } from 'vitest';
import type { User, Session, AuthError, Provider } from '@supabase/supabase-js';

// Mock User type
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: '123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
  confirmation_sent_at: '2023-01-01T00:00:00.000Z',
  confirmed_at: '2023-01-01T00:00:00.000Z',
  email_confirmed_at: '2023-01-01T00:00:00.000Z',
  last_sign_in_at: '2023-01-01T00:00:00.000Z',
  role: 'authenticated',
  ...overrides
});

// Mock Session type  
export const createMockSession = (overrides: Partial<Session> = {}): Session => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: createMockUser(),
  ...overrides
});

// Mock AuthError type
export const createMockAuthError = (overrides: Partial<AuthError> = {}): AuthError => {
  const error = new Error('Mock error message') as AuthError;
  error.message = overrides.message || 'Mock error message';
  error.code = overrides.code || 'mock_error_code';
  error.status = overrides.status || 400;
  error.name = 'AuthError';
  return error;
};

// Mock OAuth response
export const createMockOAuthResponse = (provider: Provider, url?: string) => ({
  provider,
  url: url || `https://provider.com/auth/${provider}`
});

// Complete mock of Supabase auth
export const mockSupabaseAuth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
  getUser: vi.fn(),
  getSession: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  refreshSession: vi.fn(),
  verifyOtp: vi.fn(),
  onAuthStateChange: vi.fn()
};

export const mockSupabase = {
  auth: mockSupabaseAuth
};