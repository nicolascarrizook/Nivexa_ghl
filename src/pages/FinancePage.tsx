import { Badge } from "@/design-system/components/data-display/Badge/Badge";
import DataTable, {
  type Column,
} from "@/design-system/components/data-display/DataTable/DataTable";
import MetricGrid from "@/design-system/components/data-display/MetricGrid/MetricGrid";
import type { StatCardProps } from "@/design-system/components/data-display/StatCard/StatCard";
import { SectionCard } from "@/design-system/components/layout";
import { administratorFeeService } from "@/services/AdministratorFeeService";
import { newCashBoxService } from "@/services/cash/NewCashBoxService";
import type { Currency } from "@/services/CurrencyService";
import { formatCurrency } from "@/utils/formatters";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Home,
  PiggyBank,
  Plus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface FinancialSummary {
  masterBalance: number;
  adminBalance: number;
  totalProjectsBalance: number;
  totalSystemBalance: number;
  pendingFeesCount: number;
  pendingFeesTotal: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  onClick: () => void;
  variant?: "default" | "primary" | "success" | "warning";
}

export function FinancePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    masterBalance: 0,
    adminBalance: 0,
    totalProjectsBalance: 0,
    totalSystemBalance: 0,
    pendingFeesCount: 0,
    pendingFeesTotal: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
  });
  const [recentMovements, setRecentMovements] = useState<any[]>([]);

  useEffect(() => {
    loadFinancialSummary();
  }, []);

  const loadFinancialSummary = async () => {
    setLoading(true);
    try {
      // Get cash box data
      const summary = await newCashBoxService.getDashboardSummary();

      // Get pending fees
      const pendingFees = await administratorFeeService.getPendingAdminFees();
      const pendingTotal = pendingFees.reduce(
        (sum, fee) => sum + (fee.amount || 0),
        0
      );

      // Get master cash for movements
      const masterCash = await newCashBoxService.getMasterCash();
      let movements: any[] = [];
      if (masterCash) {
        const movs = await newCashBoxService.getCashMovements(
          "master",
          masterCash.id,
          10
        );
        movements = movs || [];
      }

      // Calculate monthly stats
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlyMovements = movements.filter(
        (m) => new Date(m.created_at) >= startOfMonth
      );

      const monthlyIncome = monthlyMovements
        .filter(
          (m) =>
            m.movement_type === "project_income" ||
            m.movement_type === "project_payment"
        )
        .reduce((sum, m) => sum + m.amount, 0);

      const monthlyExpenses = monthlyMovements
        .filter((m) => m.movement_type === "operational_expense")
        .reduce((sum, m) => sum + Math.abs(m.amount), 0);

      setFinancialSummary({
        masterBalance: summary.masterBalance,
        adminBalance: summary.adminBalance,
        totalProjectsBalance: summary.projectsTotal,
        totalSystemBalance: summary.masterBalance,
        pendingFeesCount: pendingFees.length,
        pendingFeesTotal: pendingTotal,
        monthlyIncome,
        monthlyExpenses,
      });

      setRecentMovements(movements.slice(0, 5));
    } catch (error) {
      console.error("Error loading financial summary:", error);
    } finally {
      setLoading(false);
    }
  };

  const currency: Currency = "ARS";

  const quickActions: QuickAction[] = [
    {
      id: "collect-fees",
      label: "Cobrar Honorarios",
      icon: <PiggyBank className="h-5 w-5" />,
      description: "Transferir honorarios a caja admin",
      onClick: () => navigate("/finance/master-cash"),
      variant: "primary",
    },
    {
      id: "view-movements",
      label: "Ver Movimientos",
      icon: <TrendingUp className="h-5 w-5" />,
      description: "Historial completo de transacciones",
      onClick: () => navigate("/finance/master-cash"),
      variant: "default",
    },
    {
      id: "generate-report",
      label: "Generar Reporte",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "Reportes financieros detallados",
      onClick: () => navigate("/finance/reports"),
      variant: "default",
    },
    {
      id: "register-expense",
      label: "Registrar Gasto",
      icon: <ArrowDownRight className="h-5 w-5" />,
      description: "Nuevo gasto operativo",
      onClick: () => navigate("/finance/expenses"),
      variant: "default",
    },
  ];

  const cashBoxColumns: Column<any>[] = [
    {
      key: "name",
      title: "Caja",
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            {value === "Caja Maestra" ? (
              <Wallet className="h-4 w-4 text-gray-600" />
            ) : (
              <PiggyBank className="h-4 w-4 text-gray-600" />
            )}
          </div>
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      key: "balance",
      title: "Balance",
      align: "right",
      render: (value: number) => (
        <span className="text-lg font-semibold text-gray-900">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: "status",
      title: "Estado",
      render: () => (
        <Badge variant="success" size="sm">
          Activa
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Acciones",
      align: "right",
      render: (_: any, record: any) => (
        <button
          onClick={() => navigate(record.path)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          Ver detalles
          <ChevronRight className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const cashBoxData = [
    {
      id: "master",
      name: "Caja Maestra",
      balance: financialSummary.masterBalance,
      path: "/finance/master-cash",
    },
    {
      id: "admin",
      name: "Caja Administrativa",
      balance: financialSummary.adminBalance,
      path: "/finance/admin-cash",
    },
  ];

  const movementColumns: Column<any>[] = [
    {
      key: "created_at",
      title: "Fecha",
      width: 120,
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "movement_type",
      title: "Tipo",
      render: (value: string) => {
        const getLabel = () => {
          switch (value) {
            case "project_income":
            case "project_payment":
              return "Ingreso";
            case "fee_collection":
            case "admin_fee_collection":
              return "Honorarios";
            case "operational_expense":
              return "Gasto";
            default:
              return "Movimiento";
          }
        };

        const getVariant = (): "default" | "success" | "warning" | "error" => {
          switch (value) {
            case "project_income":
            case "project_payment":
              return "success";
            case "fee_collection":
            case "admin_fee_collection":
              return "warning";
            case "operational_expense":
              return "error";
            default:
              return "default";
          }
        };

        return (
          <Badge variant={getVariant()} size="sm">
            {getLabel()}
          </Badge>
        );
      },
    },
    {
      key: "amount",
      title: "Monto",
      align: "right",
      render: (value: number, record: any) => {
        const isIncome =
          record.movement_type === "project_income" ||
          record.movement_type === "project_payment";
        return (
          <span
            className={`font-medium ${
              isIncome ? "text-green-600" : "text-red-600"
            }`}
          >
            {isIncome ? "+" : "-"} {formatCurrency(Math.abs(value))}
          </span>
        );
      },
    },
    {
      key: "description",
      title: "Descripción",
      render: (value: string) => (
        <span className="text-sm text-gray-700 truncate max-w-xs">{value}</span>
      ),
    },
  ];

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
                <BreadcrumbPage>Centro Financiero</BreadcrumbPage>
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
                Centro Financiero
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestión integral del sistema financiero
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadFinancialSummary}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </button>
              <button
                onClick={() => navigate("/finance/movements/new")}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Movimiento
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Financial Metrics Cards */}
        <div className="mb-8">
          <MetricGrid
            metrics={
              [
                {
                  title: 'Balance Total',
                  value: formatCurrency(financialSummary.totalSystemBalance),
                  icon: DollarSign,
                  description: 'Sistema',
                  variant: 'default',
                },
                {
                  title: 'Ingresos del Mes',
                  value: `+${formatCurrency(financialSummary.monthlyIncome)}`,
                  icon: TrendingUp,
                  description: 'Mes',
                  variant: 'success',
                },
                {
                  title: 'Gastos del Mes',
                  value: `-${formatCurrency(financialSummary.monthlyExpenses)}`,
                  icon: TrendingDown,
                  description: 'Mes',
                  variant: 'error',
                },
                {
                  title: 'Honorarios Pendientes',
                  value: formatCurrency(financialSummary.pendingFeesTotal),
                  icon: Clock,
                  description: `${financialSummary.pendingFeesCount} pendientes`,
                  variant: 'warning',
                },
              ] as StatCardProps[]
            }
            columns={4}
            gap="md"
            animated={!loading}
            loading={loading}
          />
        </div>

        {/* Cash Boxes Section */}
        <SectionCard className="mb-6 p-0">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-gray-600" />
              <div>
                <h3 className="text-base font-medium text-gray-900">
                  Cajas del Sistema
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Gestión de cajas financiera y administrativa
                </p>
              </div>
            </div>
          </div>
          <DataTable
            data={cashBoxData}
            columns={cashBoxColumns}
            rowKey="id"
            loading={loading}
            emptyText="No hay cajas configuradas"
            size="md"
            striped={false}
            bordered={false}
          />
        </SectionCard>

        {/* Quick Actions Grid */}
        <SectionCard className="mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-gray-600" />
              <h3 className="text-base font-medium text-gray-900">
                Acciones Rápidas
              </h3>
            </div>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3">{action.icon}</div>
                    <span className="text-sm font-medium text-gray-900 mb-1">
                      {action.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {action.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Movements */}
          <SectionCard className="p-0">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <h3 className="text-base font-medium text-gray-900">
                    Movimientos Recientes
                  </h3>
                </div>
                <button
                  onClick={() => navigate("/finance/master-cash")}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Ver todos →
                </button>
              </div>
            </div>
            {loading ? (
              <div className="px-6 py-6 text-center text-gray-500">
                Cargando movimientos...
              </div>
            ) : recentMovements.length > 0 ? (
              <DataTable
                data={recentMovements}
                columns={movementColumns}
                rowKey="id"
                loading={false}
                emptyText="No hay movimientos recientes"
                size="sm"
                striped={false}
                bordered={false}
              />
            ) : (
              <div className="px-6 py-6 text-center text-gray-500">
                No hay movimientos recientes
              </div>
            )}
          </SectionCard>

          {/* System Flow Info */}
          <SectionCard>
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <ArrowUpRight className="h-5 w-5 text-gray-600" />
                <h3 className="text-base font-medium text-gray-900">
                  Flujo del Sistema
                </h3>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Pago de Cliente
                    </p>
                    <p className="text-sm text-gray-500">
                      Ingresa a caja del proyecto y se refleja en Caja Maestra
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Gestión Centralizada
                    </p>
                    <p className="text-sm text-gray-500">
                      Control financiero desde la Caja Maestra
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PiggyBank className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Cobro de Honorarios
                    </p>
                    <p className="text-sm text-gray-500">
                      Transferencia de Caja Maestra a Caja Admin
                    </p>
                  </div>
                </div>

                {financialSummary.pendingFeesCount > 0 && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Tienes honorarios pendientes
                      </span>
                    </div>
                    <button
                      onClick={() => navigate("/finance/master-cash")}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                      Ir a cobrar →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
