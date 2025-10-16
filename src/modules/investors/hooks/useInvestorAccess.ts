import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { investorAccessService } from '../services/InvestorAccessService';

// Query key factory
const accessKeys = {
  all: ['investorAccess'] as const,
  validate: (token: string) => [...accessKeys.all, 'validate', token] as const,
  tokens: (investorId: string) => [...accessKeys.all, 'tokens', investorId] as const,
};

/**
 * Hook to validate an access token and get investor data
 * Used in the investor portal to authenticate via magic link
 */
export function useValidateAccessToken(token: string) {
  return useQuery({
    queryKey: accessKeys.validate(token),
    queryFn: async () => {
      try {
        const investor = await investorAccessService.validateToken(token);

        if (!investor) {
          throw new Error('Token inválido o expirado');
        }

        return investor;
      } catch (error) {
        console.error('Error validating access token:', error);
        throw error;
      }
    },
    enabled: !!token && token.length > 0,
    retry: false, // Don't retry invalid tokens
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get all tokens for an investor
 */
export function useInvestorTokens(investorId: string) {
  return useQuery({
    queryKey: accessKeys.tokens(investorId),
    queryFn: async () => {
      try {
        return await investorAccessService.getTokensByInvestor(investorId);
      } catch (error) {
        console.error('Error fetching investor tokens:', error);
        throw error;
      }
    },
    enabled: !!investorId,
  });
}

/**
 * Hook to generate a new access token for an investor
 */
export function useGenerateAccessToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      investorId,
      expiresInDays,
    }: {
      investorId: string;
      expiresInDays?: number | null;
    }) => {
      try {
        return await investorAccessService.generateAccessToken(investorId, expiresInDays);
      } catch (error) {
        console.error('Error generating access token:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: accessKeys.tokens(variables.investorId),
      });
    },
  });
}

/**
 * Hook to revoke an access token
 */
export function useRevokeAccessToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tokenId: string) => {
      try {
        return await investorAccessService.revokeToken(tokenId);
      } catch (error) {
        console.error('Error revoking access token:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: accessKeys.all,
      });
    },
  });
}

/**
 * Hook to refresh an access token (revoke old, generate new)
 */
export function useRefreshAccessToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (oldToken: string) => {
      try {
        const newToken = await investorAccessService.refreshToken(oldToken);

        if (!newToken) {
          throw new Error('No se pudo refrescar el token');
        }

        return newToken;
      } catch (error) {
        console.error('Error refreshing access token:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: accessKeys.all,
      });
    },
  });
}

/**
 * Hook to copy magic link to clipboard
 * Returns a function to copy the link
 */
export function useCopyMagicLink() {
  return useMutation({
    mutationFn: async ({ token, baseUrl }: { token: string; baseUrl?: string }) => {
      try {
        await investorAccessService.copyMagicLinkToClipboard(token, baseUrl);
        return true;
      } catch (error) {
        console.error('Error copying magic link:', error);
        throw error;
      }
    },
  });
}

/**
 * Helper hook to generate magic link URL without copying
 */
export function useGenerateMagicLinkUrl(token: string, baseUrl?: string): string {
  return investorAccessService.generateMagicLinkUrl(token, baseUrl);
}

// Export query keys for external use
export { accessKeys };
