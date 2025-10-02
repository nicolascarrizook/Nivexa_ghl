import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './AuthService';
import { supabase } from '../../config/supabase';
import { 
  createMockUser, 
  createMockSession, 
  createMockAuthError,
  createMockOAuthResponse 
} from '../../test/mocks';

// Mock Supabase
vi.mock('../../config/supabase', () => ({
  supabase: {
    auth: {
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
    }
  }
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should sign up a new user successfully', async () => {
      const mockUser = createMockUser({ id: '123', email: 'test@example.com' });
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      });

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'password123',
        metadata: { firstName: 'John' }
      });

      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { firstName: 'John' }
        }
      });
    });

    it('should handle sign up error', async () => {
      const mockError = createMockAuthError({ message: 'Email already exists' });
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      });

      const result = await authService.signUp({
        email: 'existing@example.com',
        password: 'password123'
      });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      const mockUser = createMockUser({ id: '123', email: 'test@example.com' });
      const mockSession = createMockSession({ 
        access_token: 'token123',
        user: mockUser
      });
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null
      });

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.data).toEqual(mockSession);
      expect(result.error).toBeNull();
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should handle sign in error', async () => {
      const mockError = createMockAuthError({ message: 'Invalid credentials' });
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null, user: null },
        error: mockError
      });

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signInWithProvider', () => {
    it('should sign in with OAuth provider successfully', async () => {
      const mockOAuthResponse = createMockOAuthResponse('google', 'https://provider.com');
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: mockOAuthResponse,
        error: null
      });

      const result = await authService.signInWithProvider('google');

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
    });

    it('should handle OAuth sign in error', async () => {
      const mockError = createMockAuthError({ message: 'Provider error' });
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { provider: 'github', url: null },
        error: mockError
      });

      const result = await authService.signInWithProvider('github');

      expect(result.data).toBe(false);
      expect(result.error).toEqual(mockError);
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null
      });

      const result = await authService.signOut();

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out error', async () => {
      const mockError = createMockAuthError({ message: 'Sign out error' });
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: mockError
      });

      const result = await authService.signOut();

      expect(result.data).toBe(false);
      expect(result.error).toEqual(mockError);
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser = createMockUser({ id: '123', email: 'test@example.com' });
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const user = await authService.getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(supabase.auth.getUser).toHaveBeenCalled();
    });

    it('should return null on error', async () => {
      const mockError = createMockAuthError({ message: 'Not authenticated' });
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: mockError
      });

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('getSession', () => {
    it('should get session successfully', async () => {
      const mockUser = createMockUser({ id: '123', email: 'test@example.com' });
      const mockSession = createMockSession({ 
        access_token: 'token123',
        user: mockUser
      });
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const session = await authService.getSession();

      expect(session).toEqual(mockSession);
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    it('should return null when no session', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      });

      const session = await authService.getSession();

      expect(session).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('should send reset password email successfully', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null
      });

      const result = await authService.resetPassword('test@example.com');

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: `${window.location.origin}/auth/reset-password`
        }
      );
    });

    it('should handle reset password error', async () => {
      const mockError = createMockAuthError({ message: 'Email not found' });
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: null,
        error: mockError
      });

      const result = await authService.resetPassword('notfound@example.com');

      expect(result.data).toBe(false);
      expect(result.error).toEqual(mockError);
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const mockUser = createMockUser({ id: '123', email: 'test@example.com' });
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await authService.updatePassword('newPassword123');

      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newPassword123'
      });
    });

    it('should handle password update error', async () => {
      const mockError = createMockAuthError({ message: 'Password too weak' });
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: null },
        error: mockError
      });

      const result = await authService.updatePassword('weak');

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('updateUserMetadata', () => {
    it('should update user metadata successfully', async () => {
      const mockUser = createMockUser({ 
        id: '123', 
        email: 'test@example.com',
        user_metadata: { firstName: 'John', lastName: 'Doe' }
      });
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const result = await authService.updateUserMetadata({ 
        firstName: 'John', 
        lastName: 'Doe' 
      });

      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: { firstName: 'John', lastName: 'Doe' }
      });
    });
  });

  describe('refreshSession', () => {
    it('should refresh session successfully', async () => {
      const mockUser = createMockUser({ id: '123', email: 'test@example.com' });
      const mockSession = createMockSession({ 
        access_token: 'newToken123',
        user: mockUser
      });
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null
      });

      const result = await authService.refreshSession();

      expect(result.data).toEqual(mockSession);
      expect(result.error).toBeNull();
      expect(supabase.auth.refreshSession).toHaveBeenCalled();
    });
  });

  describe('verifyOTP', () => {
    it('should verify OTP successfully', async () => {
      const mockUser = createMockUser({ id: '123', email: 'test@example.com' });
      const mockSession = createMockSession({ 
        access_token: 'token123',
        user: mockUser
      });
      vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null
      });

      const result = await authService.verifyOTP(
        'test@example.com',
        '123456',
        'signup'
      );

      expect(result.data).toEqual(mockSession);
      expect(result.error).toBeNull();
      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '123456',
        type: 'signup'
      });
    });

    it('should handle OTP verification error', async () => {
      const mockError = createMockAuthError({ message: 'Invalid OTP' });
      vi.mocked(supabase.auth.verifyOtp).mockResolvedValue({
        data: { session: null, user: null },
        error: mockError
      });

      const result = await authService.verifyOTP(
        'test@example.com',
        'wrongotp',
        'signup'
      );

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', () => {
      const mockCallback = vi.fn();
      const mockUnsubscribe = {
        data: {
          subscription: {
            id: 'test-subscription',
            callback: mockCallback,
            unsubscribe: vi.fn()
          }
        }
      };
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue(mockUnsubscribe);

      const unsubscribe = authService.onAuthStateChange(mockCallback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback);
      expect(unsubscribe).toEqual(mockUnsubscribe);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', async () => {
      const mockUser = createMockUser({ id: '123', email: 'test@example.com' });
      const mockSession = createMockSession({ 
        access_token: 'token123',
        user: mockUser
      });
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const isAuth = await authService.isAuthenticated();

      expect(isAuth).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      });

      const isAuth = await authService.isAuthenticated();

      expect(isAuth).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should get access token when authenticated', async () => {
      const mockUser = createMockUser({ id: '123', email: 'test@example.com' });
      const mockSession = createMockSession({ 
        access_token: 'token123',
        user: mockUser
      });
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const token = await authService.getToken();

      expect(token).toBe('token123');
    });

    it('should return null when not authenticated', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      });

      const token = await authService.getToken();

      expect(token).toBeNull();
    });
  });
});