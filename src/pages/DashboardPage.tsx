import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Briefcase,
  DollarSign,
  Home,
  RefreshCw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// UI Components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import MetricGrid from "@/design-system/components/data-display/MetricGrid/MetricGrid";
import type { StatCardProps } from "@/design-system/components/data-display/StatCard/StatCard";
import ChartCard from "@/design-system/components/data-display/ChartCard/ChartCard";
import ActivityFeed, { type ActivityItem } from "@/design-system/components/data-display/ActivityFeed/ActivityFeed";

// Hooks and utilities
import { formatCurrency } from "@/utils/formatters";
import {
  useDashboardCharts,
  useDashboardMetrics,
} from "@/modules/dashboard/hooks/useDashboardData";
import { supabase } from "@/config/supabase";


export function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">(
    "month"
  );
  const {
    data: metrics,
    isLoading: metricsLoading,
    refetch: refetchMetrics,
  } = useDashboardMetrics();
  const { data: charts, isLoading: chartsLoading } = useDashboardCharts();

  // Get recent movements for activity feed
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchRecentMovements = async () => {
      const { data } = await supabase
        .from("cash_movements")
        .select(
          `
          *,
          projects:project_id(name)
        `
        )
        .not("movement_type", "eq", "master_duplication")
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        // Transform movements into activity items
        const activityItems: ActivityItem[] = data.map((movement) => {
          const isIncome = movement.amount > 0;
          const movementTypeLabels: Record<string, string> = {
            'project_income': 'Ingreso de proyecto',
            'master_income': 'Ingreso maestro',
            'master_duplication': 'Duplicación maestra',
            'fee_collection': 'Cobro de honorarios',
            'expense': 'Gasto',
            'transfer': 'Transferencia',
            'adjustment': 'Ajuste',
            'down_payment': 'Anticipo',
            'currency_exchange': 'Cambio de moneda',
          };

          return {
            id: movement.id,
            type: isIncome ? 'payment' : 'deal',
            title: movementTypeLabels[movement.movement_type] || movement.movement_type,
            description: movement.description || 'Sin descripción',
            user: {
              name: movement.projects?.name || 'Sistema',
              initials: (movement.projects?.name?.substring(0, 2) || 'SY').toUpperCase(),
            },
            timestamp: new Date(movement.created_at),
            status: isIncome ? 'completed' : 'pending',
            metadata: {
              amount: Math.abs(movement.amount),
              client: movement.projects?.name,
            },
          };
        });

        setActivities(activityItems);
      }
    };

    fetchRecentMovements();
  }, [metrics]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center">
                    <Home className="h-4 w-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Nivexa Studio</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard Ejecutivo</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </p>
            </div>
            <button
              onClick={() => refetchMetrics()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Key Metrics */}
        <MetricGrid
          metrics={[
            {
              title: 'Caja Maestra',
              value: formatCurrency(metrics?.masterBalanceArs || 0),
              icon: Wallet,
              description: `Honorarios disponibles: ${formatCurrency((metrics?.masterBalanceArs || 0) * 0.2)}`,
              variant: 'default',
              trend: { value: 15, isPositive: true },
            },
            {
              title: 'Total Proyectos',
              value: formatCurrency(metrics?.projectsTotalArs || 0),
              icon: Briefcase,
              description: `${metrics?.activeProjects || 0} proyectos activos`,
              variant: 'default',
              trend: { value: 8, isPositive: true },
            },
            {
              title: 'Flujo Mensual',
              value: formatCurrency((metrics?.monthlyIncome || 0) - (metrics?.monthlyExpenses || 0)),
              icon: TrendingUp,
              description: `Ingresos menos gastos del mes`,
              variant: (metrics?.monthlyIncome || 0) - (metrics?.monthlyExpenses || 0) >= 0 ? 'success' : 'warning',
              trend: { value: 3, isPositive: false },
            },
            {
              title: 'Balance USD',
              value: `USD ${(metrics?.masterBalanceUsd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              icon: DollarSign,
              description: `≈ ${formatCurrency((metrics?.masterBalanceUsd || 0) * 1000)}`,
              variant: 'default',
              trend: { value: 12, isPositive: true },
            },
          ] as StatCardProps[]}
          columns={4}
          gap="md"
          animated={!metricsLoading}
        />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cash Flow Chart */}
          <ChartCard
            title="Flujo de Caja"
            description="Evolución mensual"
            data={charts?.cashFlowData || []}
            chartType="area"
            loading={chartsLoading}
            config={{
              xAxisKey: 'month',
              series: [
                {
                  key: 'income',
                  name: 'Ingresos',
                  color: '#6B7280',
                },
                {
                  key: 'expenses',
                  name: 'Gastos',
                  color: '#D1D5DB',
                },
              ],
              showLegend: true,
              showGrid: false,
              showTooltip: true,
              height: 250,
            }}
            highlightValue={{
              label: 'balance',
              value: formatCurrency((metrics?.monthlyIncome || 0) - (metrics?.monthlyExpenses || 0)),
            }}
            variant={(metrics?.monthlyIncome || 0) - (metrics?.monthlyExpenses || 0) >= 0 ? 'success' : 'warning'}
          />

          {/* Project Distribution */}
          <ChartCard
            title="Distribución"
            description="Por estado"
            data={charts?.projectDistribution || []}
            chartType="donut"
            loading={chartsLoading}
            config={{
              xAxisKey: 'name',
              series: [
                {
                  key: 'value',
                  name: 'Valor',
                  color: '#6B7280',
                },
              ],
              showLegend: true,
              showGrid: false,
              showTooltip: true,
              height: 250,
            }}
            highlightValue={{
              label: 'total',
              value: formatCurrency(
                charts?.projectDistribution?.reduce(
                  (sum, item) => sum + item.value,
                  0
                ) || 0
              ),
            }}
          />

          {/* Income Trend Chart */}
          <ChartCard
            title="Tendencia de Ingresos"
            description="Últimos 12 meses"
            data={charts?.incomeData || []}
            chartType="line"
            loading={chartsLoading}
            config={{
              xAxisKey: 'month',
              series: [
                {
                  key: 'income',
                  name: 'Ingresos',
                  color: '#6B7280',
                },
              ],
              showLegend: false,
              showGrid: true,
              showTooltip: true,
              height: 250,
            }}
            highlightValue={{
              label: 'promedio',
              value: formatCurrency(
                (charts?.incomeData?.reduce((sum, item) => sum + item.income, 0) || 0) / (charts?.incomeData?.length || 1)
              ),
            }}
            variant="default"
          />

          {/* Top Projects Chart */}
          <ChartCard
            title="Top 5 Proyectos"
            description="Por monto total"
            data={charts?.topProjects || []}
            chartType="bar"
            loading={chartsLoading}
            config={{
              xAxisKey: 'name',
              series: [
                {
                  key: 'total_amount',
                  name: 'Monto',
                  color: '#6B7280',
                },
              ],
              showLegend: false,
              showGrid: true,
              showTooltip: true,
              height: 250,
            }}
            variant="default"
          />
        </div>

        {/* Recent Activity */}
        <ActivityFeed
          activities={activities}
          size="md"
          showAvatars={true}
          showRelativeTime={true}
          maxHeight="600px"
          loading={!activities.length && metricsLoading}
          emptyText="No hay movimientos recientes registrados"
          onRefresh={() => window.location.reload()}
        />
      </div>
    </div>
  );
}
