import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/config/supabase';
import { startOfMonth, endOfMonth, subMonths, format, subDays, startOfDay, endOfDay } from 'date-fns';

export interface DashboardMetrics {
  masterBalanceArs: number;
  masterBalanceUsd: number;
  projectsCount: number;
  projectsTotalArs: number;
  projectsTotalUsd: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  activeProjects: number;
  completedProjects: number;
  pendingPayments: number;
  adminBalanceArs: number;
  adminBalanceUsd: number;
}

export interface ChartData {
  cashFlowData: Array<{
    date: string;
    income: number;
    expenses: number;
    balance: number;
  }>;
  projectDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  monthlyTrend: Array<{
    date: string;
    projects: number;
    revenue: number;
  }>;
  incomeData: Array<{
    month: string;
    income: number;
  }>;
  topProjects: Array<{
    name: string;
    total_amount: number;
  }>;
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      // Get organization ID (asumiendo que el user.id es el org_id por ahora)
      const organizationId = user.id;

      // Get master cash box from new system (only one exists)
      const { data: masterCash } = await supabase
        .from('master_cash')
        .select('*')
        .single();

      // Get admin cash box from new system (only one exists)
      const { data: adminCash } = await supabase
        .from('admin_cash')
        .select('*')
        .single();

      // Get all project cash boxes from new system
      const { data: projectCashBoxes } = await supabase
        .from('project_cash_box')
        .select('*');

      const projectsTotalArs = projectCashBoxes?.reduce((sum, box) =>
        sum + (box.current_balance_ars || 0), 0) || 0;
      const projectsTotalUsd = projectCashBoxes?.reduce((sum, box) =>
        sum + (box.current_balance_usd || 0), 0) || 0;

      // Get projects data (exclude soft-deleted)
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      const activeProjects = projects?.filter(p => p.status === 'active').length || 0;
      const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;

      // Get monthly cash movements from new system
      const startDate = startOfMonth(new Date());
      const endDate = endOfMonth(new Date());

      const { data: movements } = await supabase
        .from('cash_movements')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const monthlyIncome = movements
        ?.filter(m => m.amount > 0 && m.movement_type !== 'master_duplication')
        .reduce((sum, m) => sum + m.amount, 0) || 0;

      const monthlyExpenses = movements
        ?.filter(m => m.amount < 0)
        .reduce((sum, m) => sum + Math.abs(m.amount), 0) || 0;

      // Count pending installments (using installments table)
      const { count: pendingPayments } = await supabase
        .from('installments')
        .select('*', { count: 'exact' })
        .in('status', ['pending', 'overdue']);

      return {
        masterBalanceArs: masterCash?.balance || 0,
        masterBalanceUsd: 0, // No USD support in current schema
        adminBalanceArs: adminCash?.balance || 0,
        adminBalanceUsd: 0, // No USD support in current schema
        projectsCount: projectCashBoxes?.length || 0,
        projectsTotalArs,
        projectsTotalUsd,
        monthlyIncome,
        monthlyExpenses,
        activeProjects,
        completedProjects,
        pendingPayments: pendingPayments || 0,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useDashboardCharts() {
  return useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: async (): Promise<ChartData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      // Get real cash flow data from movements for last 30 days - OPTIMIZED WITH SQL AGGREGATION
      const thirtyDaysAgo = subDays(new Date(), 29);

      // Single query to get all movements for last 30 days
      const { data: allMovements } = await supabase
        .from('cash_movements')
        .select('created_at, amount')
        .gte('created_at', startOfDay(thirtyDaysAgo).toISOString())
        .lte('created_at', endOfDay(new Date()).toISOString())
        .order('created_at', { ascending: true });

      // Get master cash starting balance
      const { data: masterCash } = await supabase
        .from('master_cash')
        .select('balance')
        .single();

      let runningBalance = masterCash?.balance || 0;

      // Group movements by day in memory (fast)
      const movementsByDay = new Map<string, { income: number; expenses: number }>();

      allMovements?.forEach(movement => {
        const dayKey = format(new Date(movement.created_at), 'yyyy-MM-dd');
        if (!movementsByDay.has(dayKey)) {
          movementsByDay.set(dayKey, { income: 0, expenses: 0 });
        }
        const dayData = movementsByDay.get(dayKey)!;
        if (movement.amount > 0) {
          dayData.income += movement.amount;
        } else {
          dayData.expenses += Math.abs(movement.amount);
        }
      });

      // Build cash flow data for all 30 days
      const cashFlowData = [];
      for (let i = 29; i >= 0; i--) {
        const currentDate = subDays(new Date(), i);
        const dayKey = format(currentDate, 'yyyy-MM-dd');
        const dayData = movementsByDay.get(dayKey) || { income: 0, expenses: 0 };

        runningBalance = runningBalance + dayData.income - dayData.expenses;

        cashFlowData.push({
          date: dayKey,
          income: dayData.income,
          expenses: dayData.expenses,
          balance: runningBalance,
        });
      }

      // Get real project distribution by status
      const { data: projects } = await supabase
        .from('projects')
        .select('id, status, total_amount');

      // Get all installments to calculate collected amounts
      const { data: installments } = await supabase
        .from('installments')
        .select('project_id, paid_amount');

      // Calculate collected amounts per project
      const collectedByProject = installments?.reduce((acc, inst) => {
        if (!acc[inst.project_id]) acc[inst.project_id] = 0;
        acc[inst.project_id] += inst.paid_amount || 0;
        return acc;
      }, {} as Record<string, number>) || {};

      // Group projects by status with real amounts
      const statusGroups = projects?.reduce((acc, project) => {
        const status = project.status || 'draft';
        if (!acc[status]) {
          acc[status] = { total: 0, collected: 0 };
        }
        acc[status].total += project.total_amount || 0;
        acc[status].collected += collectedByProject[project.id] || 0;
        return acc;
      }, {} as Record<string, { total: number; collected: number }>) || {};

      // Map to chart format with Spanish labels
      const statusColors: Record<string, string> = {
        active: '#374151',
        completed: '#6B7280',
        on_hold: '#9CA3AF',
        draft: '#D1D5DB',
        cancelled: '#E5E7EB'
      };

      const statusLabels: Record<string, string> = {
        active: 'Activos',
        completed: 'Completados',
        on_hold: 'En Pausa',
        draft: 'Borrador',
        cancelled: 'Cancelados'
      };

      const projectDistribution = Object.entries(statusGroups).map(([status, data]) => ({
        name: statusLabels[status] || status,
        value: data.collected > 0 ? data.collected : data.total,
        color: statusColors[status] || '#6B7280'
      })).filter(item => item.value > 0);

      // Get real monthly trend data from last 12 months - OPTIMIZED WITH SQL AGGREGATION
      const twelveMonthsAgo = startOfMonth(subMonths(new Date(), 11));

      // Single query for all projects in last 12 months
      const { data: allProjects } = await supabase
        .from('projects')
        .select('created_at')
        .gte('created_at', twelveMonthsAgo.toISOString());

      // Single query for all income movements in last 12 months
      const { data: allIncomeMovements } = await supabase
        .from('cash_movements')
        .select('created_at, amount')
        .gte('created_at', twelveMonthsAgo.toISOString())
        .gt('amount', 0);

      // Group by month in memory (fast)
      const projectsByMonth = new Map<string, number>();
      const revenueByMonth = new Map<string, number>();

      allProjects?.forEach(project => {
        const monthKey = format(startOfMonth(new Date(project.created_at)), 'yyyy-MM-dd');
        projectsByMonth.set(monthKey, (projectsByMonth.get(monthKey) || 0) + 1);
      });

      allIncomeMovements?.forEach(movement => {
        const monthKey = format(startOfMonth(new Date(movement.created_at)), 'yyyy-MM-dd');
        revenueByMonth.set(monthKey, (revenueByMonth.get(monthKey) || 0) + movement.amount);
      });

      // Build monthly trend data for all 12 months
      const monthlyTrend = [];
      for (let i = 11; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthKey = format(monthStart, 'yyyy-MM-dd');

        monthlyTrend.push({
          date: monthKey,
          projects: projectsByMonth.get(monthKey) || 0,
          revenue: revenueByMonth.get(monthKey) || 0,
        });
      }

      // Generate income data for line chart from monthly revenue
      const incomeData = Array.from(revenueByMonth.entries()).map(([month, income]) => ({
        month,
        income,
      })).sort((a, b) => a.month.localeCompare(b.month));

      // Fill in missing months with 0 income
      const completeIncomeData = [];
      for (let i = 11; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthKey = format(monthStart, 'yyyy-MM-dd');
        completeIncomeData.push({
          month: monthKey,
          income: revenueByMonth.get(monthKey) || 0,
        });
      }

      // Get real top projects - simplified for bar chart
      const { data: topProjectsData } = await supabase
        .from('projects')
        .select('name, total_amount')
        .in('status', ['active', 'completed'])
        .order('total_amount', { ascending: false })
        .limit(5);

      const topProjects = topProjectsData?.map(project => ({
        name: project.name || 'Sin nombre',
        total_amount: project.total_amount || 0,
      })) || [];

      return {
        cashFlowData,
        projectDistribution: projectDistribution.length > 0 ? projectDistribution : [
          { name: 'Sin proyectos', value: 0, color: '#6B7280' }
        ],
        monthlyTrend,
        incomeData: completeIncomeData,
        topProjects: topProjects.length > 0 ? topProjects : [],
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });
}