import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/config/supabase';
import { projectService } from '@/modules/projects/services/ProjectService';
import { newCashBoxService } from '@/services/cash/NewCashBoxService';
import type { ProjectFormData } from '@/modules/projects/types/project.types';

// Mock Supabase
vi.mock('@/config/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe('CashBoxService - Triple Cash Box System', () => {
  const mockProjectId = '123e4567-e89b-12d3-a456-426614174000';
  const mockMasterCashId = '223e4567-e89b-12d3-a456-426614174000';
  const mockProjectCashId = '323e4567-e89b-12d3-a456-426614174000';
  const mockAdminCashId = '423e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Project Creation with Down Payment', () => {
    it('should create project with cash box and register down payment to all boxes', async () => {
      const downPaymentAmount = 3899.7;

      const mockProjectFormData: ProjectFormData = {
        projectName: 'Test Project',
        clientName: 'Test Client',
        totalAmount: 10000,
        downPaymentAmount: downPaymentAmount,
        downPaymentPercentage: 38.997,
        installmentCount: 12,
        projectType: 'residential',
        currency: 'ARS',
        startDate: '2024-01-01',
      };

      // Mock project creation
      const mockProject = {
        id: mockProjectId,
        code: 'PRY-2024-001',
        name: 'Test Project',
        total_amount: 10000,
        down_payment_amount: downPaymentAmount,
        currency: 'ARS',
      };

      // Mock project cash box
      const mockProjectCash = {
        id: mockProjectCashId,
        project_id: mockProjectId,
        balance: 0,
        total_received: 0,
      };

      // Mock master cash box
      const mockMasterCash = {
        id: mockMasterCashId,
        balance: 0,
      };

      // Setup mocks
      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'projects') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockProject,
                  error: null,
                }),
              }),
            }),
            select: vi.fn().mockReturnValue({
              like: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: [],
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }

        if (table === 'project_cash') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: mockProjectCash,
              error: null,
            }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockProjectCash,
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: { ...mockProjectCash, balance: downPaymentAmount },
                error: null,
              }),
            }),
          };
        }

        if (table === 'master_cash') {
          return {
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockMasterCash,
                error: null,
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: { ...mockMasterCash, balance: downPaymentAmount },
                error: null,
              }),
            }),
          };
        }

        if (table === 'cash_movements') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          };
        }

        if (table === 'installments') {
          return {
            insert: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: {
                        id: 'installment-001',
                        project_id: mockProjectId,
                        installment_number: 0,
                        amount: downPaymentAmount,
                        status: 'pending',
                      },
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          };
        }

        return {
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      });

      // Create project (should auto-process down payment)
      const result = await projectService.createProject(mockProjectFormData as any);

      // Verify project was created
      expect(result).toBeTruthy();
      expect(result?.id).toBe(mockProjectId);

      // Verify cash movements were recorded (2 movements: project income + master duplication)
      const cashMovementsTable = (supabase.from as any)('cash_movements');
      expect(cashMovementsTable.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            movement_type: 'project_income',
            amount: downPaymentAmount,
            destination_type: 'project',
          }),
          expect.objectContaining({
            movement_type: 'master_duplication',
            amount: downPaymentAmount,
            destination_type: 'master',
          }),
        ])
      );
    });

    it('should show correct balance in master cash after down payment', async () => {
      const downPaymentAmount = 3899.7;

      // Mock master cash with balance after payment
      const mockMasterCash = {
        id: mockMasterCashId,
        balance: downPaymentAmount,
        balance_ars: downPaymentAmount,
        balance_usd: 0,
        total_collected: downPaymentAmount,
      };

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'master_cash') {
          return {
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockMasterCash,
                error: null,
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      });

      (supabase.auth.getUser as any).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const masterCash = await newCashBoxService.getMasterCash();

      expect(masterCash).toBeTruthy();
      expect(masterCash?.balance).toBe(downPaymentAmount);
    });

    it('should show correct balance in project cash after down payment', async () => {
      const downPaymentAmount = 3899.7;

      // Mock project cash with balance after payment
      const mockProjectCash = {
        id: mockProjectCashId,
        project_id: mockProjectId,
        balance: downPaymentAmount,
        balance_ars: downPaymentAmount,
        balance_usd: 0,
        total_received: downPaymentAmount,
      };

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'project_cash') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockProjectCash,
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      });

      const projectCash = await newCashBoxService.getProjectCash(mockProjectId);

      expect(projectCash).toBeTruthy();
      expect(projectCash?.balance).toBe(downPaymentAmount);
      expect(projectCash?.total_received).toBe(downPaymentAmount);
    });
  });

  describe('Cash Movement Tracking', () => {
    it('should track income movements correctly', async () => {
      const movements = [
        {
          id: 'mov-001',
          movement_type: 'project_income',
          source_type: 'external',
          source_id: null,
          destination_type: 'project',
          destination_id: mockProjectCashId,
          amount: 3899.7,
          description: 'Anticipo - Test Project',
          project_id: mockProjectId,
        },
        {
          id: 'mov-002',
          movement_type: 'master_duplication',
          source_type: 'external',
          source_id: null,
          destination_type: 'master',
          destination_id: mockMasterCashId,
          amount: 3899.7,
          description: 'Control financiero - Anticipo',
          project_id: mockProjectId,
        },
      ];

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'cash_movements') {
          return {
            select: vi.fn().mockReturnValue({
              or: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue({
                    data: movements,
                    error: null,
                  }),
                }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      const cashMovements = await newCashBoxService.getCashMovements(
        'master',
        mockMasterCashId,
        50
      );

      expect(cashMovements).toHaveLength(2);
      expect(cashMovements[0].movement_type).toBe('project_income');
      expect(cashMovements[0].amount).toBe(3899.7);
      expect(cashMovements[1].movement_type).toBe('master_duplication');
    });
  });

  describe('Admin Cash - Fee Collection', () => {
    it('should keep admin cash at zero until fees are manually collected', async () => {
      const mockAdminCash = {
        id: mockAdminCashId,
        balance: 0,
        total_collected: 0,
      };

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'admin_cash') {
          return {
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockAdminCash,
                error: null,
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      const adminCash = await newCashBoxService.getAdminCash();

      expect(adminCash).toBeTruthy();
      expect(adminCash?.balance).toBe(0);
      expect(adminCash?.total_collected).toBe(0);
    });
  });

  describe('Dashboard Summary', () => {
    it('should calculate correct dashboard summary with all cash boxes', async () => {
      const downPaymentAmount = 3899.7;

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'master_cash') {
          return {
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: mockMasterCashId,
                  balance: downPaymentAmount,
                },
                error: null,
              }),
            }),
          };
        }

        if (table === 'admin_cash') {
          return {
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: mockAdminCashId,
                  balance: 0,
                  total_collected: 0,
                },
                error: null,
              }),
            }),
          };
        }

        if (table === 'project_cash') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [
                {
                  id: mockProjectCashId,
                  project_id: mockProjectId,
                  balance: downPaymentAmount,
                },
              ],
              error: null,
            }),
          };
        }

        return {
          select: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      const summary = await newCashBoxService.getDashboardSummary();

      expect(summary.masterBalance).toBe(downPaymentAmount);
      expect(summary.adminBalance).toBe(0);
      expect(summary.projectsCount).toBe(1);
      expect(summary.projectsTotal).toBe(downPaymentAmount);
    });
  });
});
