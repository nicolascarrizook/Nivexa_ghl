/**
 * CashFlowHealthDashboard - Vista consolidada de salud financiera de proyectos
 *
 * Proporciona visibilidad inmediata del estado cash flow de todos los proyectos activos,
 * permitiendo identificar rápidamente cuáles requieren atención.
 */

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { COLORS, getCashFlowHealth, HEALTH_THRESHOLDS } from '../constants/design-tokens';
import { currencyService } from '@/services/CurrencyService';
import type { Currency } from '@/services/CurrencyService';
import { cn } from '@/lib/utils';
import Skeleton from './SkeletonLoader';

export interface ProjectHealthData {
  id: string;
  code: string;
  name: string;
  client_name: string;
  currency: Currency;

  // Financial metrics
  total_income_ars: number;
  total_income_usd: number;
  current_balance_ars: number;
  current_balance_usd: number;
  total_expenses_ars: number;
  total_expenses_usd: number;
  total_amount: number;

  // Calculated metrics
  collection_progress: number;
  cash_flow_ratio: number;
  health_status: keyof typeof COLORS.health;

  // Time-based
  start_date: string;
  estimated_end_date?: string;
  days_running: number;
}

interface CashFlowHealthDashboardProps {
  projects: ProjectHealthData[];
  isLoading?: boolean;
}

type SortField = 'health' | 'name' | 'balance' | 'ratio';
type SortOrder = 'asc' | 'desc';
type HealthFilter = 'all' | keyof typeof COLORS.health;

export function CashFlowHealthDashboard({
  projects,
  isLoading = false
}: CashFlowHealthDashboardProps) {
  const [sortField, setSortField] = useState<SortField>('health');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('all');
  const [currencyFilter, setCurrencyFilter] = useState<'all' | Currency>('all');

  // Calculate health statistics
  const healthStats = useMemo(() => {
    const stats = {
      optimal: 0,
      healthy: 0,
      attention: 0,
      critical: 0,
      deficit: 0,
    };

    projects.forEach((project) => {
      const status = project.health_status;
      if (status in stats) {
        stats[status]++;
      }
    });

    return stats;
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Apply health filter
    if (healthFilter !== 'all') {
      filtered = filtered.filter((p) => p.health_status === healthFilter);
    }

    // Apply currency filter
    if (currencyFilter !== 'all') {
      filtered = filtered.filter((p) => p.currency === currencyFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'health':
          const healthOrder = { deficit: 0, critical: 1, attention: 2, healthy: 3, optimal: 4 };
          comparison = (healthOrder[a.health_status] || 0) - (healthOrder[b.health_status] || 0);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'balance':
          const balanceA = a.currency === 'USD' ? a.current_balance_usd : a.current_balance_ars;
          const balanceB = b.currency === 'USD' ? b.current_balance_usd : b.current_balance_ars;
          comparison = balanceA - balanceB;
          break;
        case 'ratio':
          comparison = a.cash_flow_ratio - b.cash_flow_ratio;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [projects, healthFilter, currencyFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Health Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 rounded-lg border-2 border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-2">
                <Skeleton width="60%" height={16} />
                <Skeleton variant="circular" width={24} height={24} />
              </div>
              <div className="flex items-baseline space-x-2">
                <Skeleton width={40} height={32} />
                <Skeleton width="30%" height={14} />
              </div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton width={80} height={32} />
            <Skeleton width={80} height={32} />
            <Skeleton width={80} height={32} />
          </div>
          <Skeleton width={150} height={20} />
        </div>

        {/* Project Cards Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg border-2 border-gray-200 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Skeleton variant="circular" width={32} height={32} />
                    <div>
                      <Skeleton width={120} height={20} className="mb-1" />
                      <Skeleton width={200} height={16} />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j}>
                        <Skeleton width="80%" height={12} className="mb-1" />
                        <Skeleton width="60%" height={20} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Skeleton width={80} height={24} />
                  <Skeleton width={100} height={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Health Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <HealthStatCard
          label="Óptimo"
          count={healthStats.optimal}
          total={projects.length}
          healthStatus="optimal"
          isActive={healthFilter === 'optimal'}
          onClick={() => setHealthFilter(healthFilter === 'optimal' ? 'all' : 'optimal')}
        />
        <HealthStatCard
          label="Saludable"
          count={healthStats.healthy}
          total={projects.length}
          healthStatus="healthy"
          isActive={healthFilter === 'healthy'}
          onClick={() => setHealthFilter(healthFilter === 'healthy' ? 'all' : 'healthy')}
        />
        <HealthStatCard
          label="Atención"
          count={healthStats.attention}
          total={projects.length}
          healthStatus="attention"
          isActive={healthFilter === 'attention'}
          onClick={() => setHealthFilter(healthFilter === 'attention' ? 'all' : 'attention')}
        />
        <HealthStatCard
          label="Crítico"
          count={healthStats.critical}
          total={projects.length}
          healthStatus="critical"
          isActive={healthFilter === 'critical'}
          onClick={() => setHealthFilter(healthFilter === 'critical' ? 'all' : 'critical')}
        />
        <HealthStatCard
          label="Déficit"
          count={healthStats.deficit}
          total={projects.length}
          healthStatus="deficit"
          isActive={healthFilter === 'deficit'}
          onClick={() => setHealthFilter(healthFilter === 'deficit' ? 'all' : 'deficit')}
        />
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrencyFilter('all')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              currencyFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Todas
          </button>
          <button
            onClick={() => setCurrencyFilter('ARS')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              currencyFilter === 'ARS'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            ARS
          </button>
          <button
            onClick={() => setCurrencyFilter('USD')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              currencyFilter === 'USD'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            USD
          </button>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Filter className="h-4 w-4" />
          <span>
            Mostrando {filteredProjects.length} de {projects.length} proyectos
          </span>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {filteredProjects.map((project, index) => (
          <ProjectHealthCard
            key={project.id}
            project={project}
            index={index}
          />
        ))}

        {filteredProjects.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay proyectos que coincidan con los filtros seleccionados
          </div>
        )}
      </div>
    </div>
  );
}

// Health Stat Card Component
interface HealthStatCardProps {
  label: string;
  count: number;
  total: number;
  healthStatus: keyof typeof COLORS.health;
  isActive: boolean;
  onClick: () => void;
}

function HealthStatCard({
  label,
  count,
  total,
  healthStatus,
  isActive,
  onClick
}: HealthStatCardProps) {
  const config = COLORS.health[healthStatus];
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'p-4 rounded-lg border-2 transition-all text-left',
        isActive
          ? 'border-gray-900 bg-gray-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span
          className="text-2xl"
          style={{ color: config.color }}
        >
          {config.icon}
        </span>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-gray-900">{count}</span>
        <span className="text-sm text-gray-500">({percentage.toFixed(0)}%)</span>
      </div>
    </motion.button>
  );
}

// Project Health Card Component
interface ProjectHealthCardProps {
  project: ProjectHealthData;
  index: number;
}

function ProjectHealthCard({ project, index }: ProjectHealthCardProps) {
  const healthConfig = COLORS.health[project.health_status];
  const balance = project.currency === 'USD'
    ? project.current_balance_usd
    : project.current_balance_ars;
  const totalIncome = project.currency === 'USD'
    ? project.total_income_usd
    : project.total_income_ars;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'p-4 rounded-lg border-2 transition-all hover:shadow-md',
        healthConfig.background,
        `border-${healthConfig.color.substring(1)}`
      )}
      style={{ borderColor: healthConfig.color }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span
              className="text-2xl"
              style={{ color: healthConfig.color }}
            >
              {healthConfig.icon}
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">{project.code}</h3>
              <p className="text-sm text-gray-600">{project.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Balance Actual</div>
              <div className="font-semibold text-gray-900">
                {currencyService.formatCurrency(balance, project.currency)}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Ingresos Totales</div>
              <div className="font-semibold text-gray-900">
                {currencyService.formatCurrency(totalIncome, project.currency)}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Ratio Cash Flow</div>
              <div className="font-semibold text-gray-900">
                {(project.cash_flow_ratio * 100).toFixed(1)}%
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 mb-1">Avance Cobranza</div>
              <div className="font-semibold text-gray-900">
                {project.collection_progress.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <div className={cn('px-3 py-1 rounded-full text-xs font-medium', healthConfig.text, healthConfig.background)}>
            {project.health_status.toUpperCase()}
          </div>
          {project.days_running && (
            <div className="text-xs text-gray-500">
              {project.days_running} días activo
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
