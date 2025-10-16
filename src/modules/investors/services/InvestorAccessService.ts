import { supabase } from '@/config/supabase';
import type { Database } from '@/types/database.types';
import { investorService } from './InvestorService';

type InvestorAccessToken = Database['public']['Tables']['investor_access_tokens']['Row'];
type Investor = Database['public']['Tables']['investors']['Row'];

class InvestorAccessService {
  private tableName = 'investor_access_tokens' as const;

  /**
   * Generate a unique access token for an investor
   * @param investorId - The investor ID
   * @param expiresInDays - Optional: number of days until token expires (null = never expires)
   * @returns The generated token string
   */
  async generateAccessToken(
    investorId: string,
    expiresInDays?: number | null
  ): Promise<string> {
    try {
      // Generate cryptographically secure random token
      const token = this.generateSecureToken();

      // Calculate expiration date if provided
      let expiresAt: string | null = null;
      if (expiresInDays !== null && expiresInDays !== undefined) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + expiresInDays);
        expiresAt = expirationDate.toISOString();
      }

      // Insert token into database
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          investor_id: investorId,
          token: token,
          expires_at: expiresAt,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating access token:', error);
        throw error;
      }

      console.log('✅ Access token generated for investor:', investorId);
      return data.token;
    } catch (error) {
      console.error('InvestorAccessService: Error generating token', error);
      throw error;
    }
  }

  /**
   * Validate an access token and return investor data if valid
   * Updates last_accessed_at timestamp
   */
  async validateToken(token: string): Promise<Investor | null> {
    try {
      // Find token with investor data
      const { data: tokenData, error: tokenError } = await supabase
        .from(this.tableName)
        .select(`
          *,
          investor:investors(*)
        `)
        .eq('token', token)
        .eq('is_active', true)
        .maybeSingle();

      if (tokenError) {
        console.error('Error validating token:', tokenError);
        throw tokenError;
      }

      if (!tokenData) {
        console.log('⚠️ Invalid or inactive token:', token.substring(0, 10) + '...');
        return null;
      }

      // Check if token has expired
      if (tokenData.expires_at) {
        const expirationDate = new Date(tokenData.expires_at);
        const now = new Date();

        if (now > expirationDate) {
          console.log('⚠️ Token has expired:', token.substring(0, 10) + '...');
          return null;
        }
      }

      // Update last accessed timestamp
      await supabase
        .from(this.tableName)
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', tokenData.id);

      console.log('✅ Token validated successfully for investor:', tokenData.investor_id);
      return tokenData.investor as unknown as Investor;
    } catch (error) {
      console.error('InvestorAccessService: Error validating token', error);
      throw error;
    }
  }

  /**
   * Revoke an access token (set is_active to false)
   */
  async revokeToken(tokenId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ is_active: false })
        .eq('id', tokenId);

      if (error) {
        console.error('Error revoking token:', error);
        throw error;
      }

      console.log('✅ Token revoked:', tokenId);
      return true;
    } catch (error) {
      console.error('InvestorAccessService: Error revoking token', error);
      throw error;
    }
  }

  /**
   * Get all tokens for an investor
   */
  async getTokensByInvestor(investorId: string): Promise<InvestorAccessToken[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('investor_id', investorId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tokens:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('InvestorAccessService: Error fetching tokens', error);
      throw error;
    }
  }

  /**
   * Refresh a token (revoke old one and generate new one)
   */
  async refreshToken(oldToken: string): Promise<string | null> {
    try {
      // Validate and get investor from old token
      const investor = await this.validateToken(oldToken);

      if (!investor) {
        console.log('⚠️ Cannot refresh invalid token');
        return null;
      }

      // Get the old token record to maintain same expiration settings
      const { data: oldTokenData } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('token', oldToken)
        .single();

      // Calculate days until expiration if applicable
      let expiresInDays: number | null = null;
      if (oldTokenData?.expires_at) {
        const expiration = new Date(oldTokenData.expires_at);
        const now = new Date();
        const daysRemaining = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        expiresInDays = Math.max(daysRemaining, 1); // At least 1 day
      }

      // Revoke old token
      if (oldTokenData) {
        await this.revokeToken(oldTokenData.id);
      }

      // Generate new token
      const newToken = await this.generateAccessToken(investor.id, expiresInDays);

      console.log('✅ Token refreshed for investor:', investor.id);
      return newToken;
    } catch (error) {
      console.error('InvestorAccessService: Error refreshing token', error);
      throw error;
    }
  }

  /**
   * Generate a cryptographically secure random token
   * @returns A 64-character hex string
   */
  private generateSecureToken(): string {
    // Generate 32 random bytes and convert to hex (64 characters)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate magic link URL for an investor
   * @param token - The access token
   * @param baseUrl - Optional: base URL of the application (defaults to window.location.origin)
   * @returns Full magic link URL
   */
  generateMagicLinkUrl(token: string, baseUrl?: string): string {
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    return `${base}/investor/${token}`;
  }

  /**
   * Copy magic link to clipboard (browser only)
   */
  async copyMagicLinkToClipboard(token: string, baseUrl?: string): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !navigator.clipboard) {
        throw new Error('Clipboard API not available');
      }

      const url = this.generateMagicLinkUrl(token, baseUrl);
      await navigator.clipboard.writeText(url);

      console.log('✅ Magic link copied to clipboard');
      return true;
    } catch (error) {
      console.error('InvestorAccessService: Error copying to clipboard', error);
      throw error;
    }
  }
}

export const investorAccessService = new InvestorAccessService();
export default investorAccessService;
