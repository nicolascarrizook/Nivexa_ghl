import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studioSettingsService, type StudioSetting } from '@/services/StudioSettingsService';

export const useStudioSettings = (category?: string) => {
  return useQuery({
    queryKey: ['studio-settings', category],
    queryFn: () => studioSettingsService.getSettingsByCategory(category || ''),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useStudioSetting = (key: string) => {
  return useQuery({
    queryKey: ['studio-setting', key],
    queryFn: () => studioSettingsService.getSetting(key),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateStudioSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) =>
      studioSettingsService.updateSetting(key, value),
    onSuccess: (success, { key }) => {
      if (success) {
        // Invalidate all related queries
        queryClient.invalidateQueries({ queryKey: ['studio-settings'] });
        queryClient.invalidateQueries({ queryKey: ['studio-setting', key] });
      }
    },
  });
};

export const useUpdateMultipleStudioSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Record<string, any>) =>
      studioSettingsService.updateMultipleSettings(updates),
    onSuccess: () => {
      // Invalidate all settings queries
      queryClient.invalidateQueries({ queryKey: ['studio-settings'] });
    },
  });
};

export const useAdminFeePercentage = () => {
  return useQuery({
    queryKey: ['admin-fee-percentage'],
    queryFn: () => studioSettingsService.getAdminFeePercentage(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateAdminFeePercentage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (percentage: number) =>
      studioSettingsService.updateAdminFeePercentage(percentage),
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['admin-fee-percentage'] });
        queryClient.invalidateQueries({ queryKey: ['studio-settings'] });
        queryClient.invalidateQueries({ queryKey: ['studio-setting', 'admin_fee_percentage'] });
      }
    },
  });
};