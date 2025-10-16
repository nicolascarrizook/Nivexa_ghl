import { supabase } from "@/config/supabase";
import { Badge } from "@/design-system/components/data-display/Badge/Badge";
import { AdminExpenseModal } from "@/modules/finance/components/AdminExpenseModal";
import { CurrencyConversionModal } from "@/modules/finance/components/CurrencyConversionModal";
import DataTable from "@/design-system/components/data-display/DataTable/DataTable";
import MetricGrid from "@/design-system/components/data-display/MetricGrid/MetricGrid";
import type { StatCardProps } from "@/design-system/components/data-display/StatCard/StatCard";
import { SectionCard } from "@/design-system/components/layout";
import type { AdministratorFee } from "@/services/AdministratorFeeService";
import { administratorFeeService } from "@/services/AdministratorFeeService";
import type {
  AdminCash,
  CashMovement,
} from "@/services/cash/NewCashBoxService";
import { newCashBoxService } from "@/services/cash/NewCashBoxService";
import { currencyService } from "@/services/CurrencyService";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  FileText,
  Home,
  Info,
  MinusCircle,
  PiggyBank,
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

export function AdminCashPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [adminCash, setAdminCash] = useState<AdminCash | null>(null);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [collectedFees, setCollectedFees] = useState<AdministratorFee[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [movementFilter, setMovementFilter] = useState<string>("all");
  const [monthlyStats, setMonthlyStats] = useState({
    monthlyCollectedARS: 0,
    monthlyCollectedUSD: 0,
    monthlyExpensesARS: 0,
    monthlyExpensesUSD: 0,
  });
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get admin cash data
      const adminCashData = await newCashBoxService.getAdminCash();
      setAdminCash(adminCashData);

      // Calculate start of month for filtering
      const currentMonth = new Date();
      const startOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
      );

      // Get admin cash movements if admin cash exists
      let movementsData: CashMovement[] = [];
      if (adminCashData) {
        movementsData = await newCashBoxService.getCashMovements(
          "admin",
          adminCashData.id,
          50
        );

        setMovements(movementsData);
      }

      // Get collected fees for this month from cash_movements
      const monthlyFeeMovements = movementsData?.filter(
        (m) =>
          m.movement_type === "fee_collection" &&
          new Date(m.created_at) >= startOfMonth
      ) || [];

      setCollectedFees(monthlyFeeMovements as any);

      // Get projects for reference
      const { data: projectsData } = await supabase
        .from("projects")
        .select("id, name, code, client_name")
        .order("name");

      setProjects(projectsData || []);

      const monthMovements =
        movementsData?.filter((m) => new Date(m.created_at) >= startOfMonth) ||
        [];

      // Calculate monthly collected fees by currency from cash_movements
      const monthlyCollectedARS = monthMovements
        .filter((m) => m.movement_type === "fee_collection" && m.metadata?.currency === 'ARS')
        .reduce((sum, m) => sum + (m.amount || 0), 0);

      const monthlyCollectedUSD = monthMovements
        .filter((m) => m.movement_type === "fee_collection" && m.metadata?.currency === 'USD')
        .reduce((sum, m) => sum + (m.amount || 0), 0);

      // Calculate monthly expenses by currency (includes both operational and admin expenses)
      const monthlyExpensesARS = monthMovements
        .filter((m) => (m.movement_type === "expense" || m.movement_type === "operational_expense") && m.metadata?.currency === 'ARS')
        .reduce((sum, m) => sum + (m.amount || 0), 0);

      const monthlyExpensesUSD = monthMovements
        .filter((m) => (m.movement_type === "expense" || m.movement_type === "operational_expense") && m.metadata?.currency === 'USD')
        .reduce((sum, m) => sum + (m.amount || 0), 0);

      setMonthlyStats({
        monthlyCollectedARS,
        monthlyCollectedUSD,
        monthlyExpensesARS,
        monthlyExpensesUSD,
      });
    } catch (error) {
      console.error("Error loading admin cash data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "admin_fee_collection":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "operational_expense":
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case "salary_payment":
        return <ArrowDownRight className="h-4 w-4 text-blue-600" />;
      case "tax_payment":
        return <ArrowDownRight className="h-4 w-4 text-purple-600" />;
      case "adjustment":
        return <RefreshCw className="h-4 w-4 text-gray-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case "admin_fee_collection":
        return "Cobro de Honorarios";
      case "operational_expense":
        return "Gasto Operativo";
      case "salary_payment":
        return "Pago de Salario";
      case "tax_payment":
        return "Pago de Impuestos";
      case "adjustment":
        return "Ajuste";
      default:
        return "Movimiento";
    }
  };

  const getMovementTypeBadge = (type: string) => {
    switch (type) {
      case "fee_collection":
      case "admin_fee_collection":
        return (
          <Badge variant="success" size="sm" className="text-xs px-2 py-0.5">
            Honorario
          </Badge>
        );
      case "expense":
      case "operational_expense":
        return (
          <Badge variant="error" size="sm" className="text-xs px-2 py-0.5">
            Gasto
          </Badge>
        );
      case "salary_payment":
        return (
          <Badge variant="info" size="sm" className="text-xs px-2 py-0.5">
            Salario
          </Badge>
        );
      case "tax_payment":
        return (
          <Badge variant="warning" size="sm" className="text-xs px-2 py-0.5">
            Impuestos
          </Badge>
        );
      case "adjustment":
        return (
          <Badge variant="default" size="sm" className="text-xs px-2 py-0.5">
            Ajuste
          </Badge>
        );
      default:
        return (
          <Badge variant="default" size="sm" className="text-xs px-2 py-0.5">
            Otro
          </Badge>
        );
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, { label: string; icon: string }> = {
      personal: { label: 'Gastos Personales', icon: '👤' },
      rent: { label: 'Alquiler', icon: '🏠' },
      utilities: { label: 'Servicios', icon: '💡' },
      services: { label: 'Profesionales', icon: '🔧' },
      provider: { label: 'Proveedores', icon: '🤝' },
      other: { label: 'Otros', icon: '📝' },
    };
    return categories[category] || { label: category, icon: '📝' };
  };

  // Filter movements based on selected filter
  const filteredMovements = movements.filter((movement) => {
    if (movementFilter === "all") return true;
    return movement.movement_type === movementFilter;
  });

  // Prepare data for movements table
  const movementsColumns = [
    {
      key: "created_at",
      title: "Fecha",
      sortable: true,
      render: (value: string) => (
        <span className="text-xs text-gray-900">
          {new Date(value).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "movement_type",
      title: "Tipo",
      render: (value: string) => getMovementTypeBadge(value),
    },
    {
      key: "description",
      title: "Descripción",
      render: (value: string, record: CashMovement) => {
        const isExpense = record.movement_type === 'expense' && record.metadata?.expenseType === 'admin';
        const category = record.metadata?.category;

        if (isExpense && category) {
          const categoryInfo = getCategoryLabel(category);
          return (
            <div className="flex items-center space-x-2">
              <span className="text-base">{categoryInfo.icon}</span>
              <div>
                <div className="text-xs font-medium text-gray-900">{value}</div>
                <div className="text-xs text-gray-500">{categoryInfo.label}</div>
              </div>
            </div>
          );
        }

        return <span className="text-xs text-gray-900">{value}</span>;
      },
    },
    {
      key: "amount",
      title: "Monto",
      align: "right" as const,
      render: (value: number, record: CashMovement) => {
        const currency = record.metadata?.currency || 'ARS';
        const isPositive = record.destination_id === adminCash?.id;
        return (
          <span
            className={`text-xs font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : "-"}
            {currencyService.formatCurrency(value, currency)}
          </span>
        );
      },
    },
  ];

  // Prepare data for collected fees table
  const collectedFeesColumns = [
    {
      key: "created_at",
      title: "Fecha",
      sortable: true,
      render: (value: string) => (
        <span className="text-xs text-gray-900">
          {new Date(value).toLocaleDateString("es-AR")}
        </span>
      ),
    },
    {
      key: "project_id",
      title: "Proyecto",
      render: (value: string, record: any) => {
        const project = projects.find((p) => p.id === value);
        return (
          <span className="text-xs text-gray-900">
            {project ? `${project.code} - ${project.name}` : "N/A"}
          </span>
        );
      },
    },
    {
      key: "metadata",
      title: "%",
      render: (metadata: any) => (
        <span className="text-xs text-gray-900">
          {metadata?.percentage || 0}%
        </span>
      ),
    },
    {
      key: "metadata",
      title: "Moneda",
      render: (metadata: any) => (
        <span className="text-xs text-gray-900">{metadata?.currency || 'ARS'}</span>
      ),
    },
    {
      key: "amount",
      title: "Monto",
      align: "right" as const,
      render: (value: number, record: any) => (
        <span className="text-xs font-medium text-green-600">
          {currencyService.formatCurrency(value, record.metadata?.currency || 'ARS')}
        </span>
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
                <BreadcrumbLink asChild>
                  <Link to="/finance">Centro Financiero</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Caja Administrativa</BreadcrumbPage>
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
                Caja Administrativa
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Honorarios personales cobrados automáticamente al recibir pagos de proyectos
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/finance")}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </button>
              <button
                onClick={loadData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Info Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Cobro Automático de Honorarios
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Los honorarios se cobran automáticamente cada vez que un proyecto recibe un pago.
                El porcentaje configurado se transfiere desde la Caja Maestra hacia esta caja administrativa.
              </p>
            </div>
          </div>
        </div>

        {/* Balance Summary */}
        <SectionCard className="mb-6">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <Wallet className="h-5 w-5 text-gray-600" />
              <h3 className="text-base font-medium text-gray-900">
                Estado de la Caja Administrativa
              </h3>
            </div>
          </div>
          <div className="px-6 py-6">
            <MetricGrid
              metrics={
                [
                  {
                    title: 'Saldo Actual (ARS)',
                    value: currencyService.formatCurrency(adminCash?.balance_ars || 0, 'ARS'),
                    icon: Wallet,
                    description: 'Pesos',
                    variant: 'success',
                  },
                  {
                    title: 'Saldo Actual (USD)',
                    value: `U$S ${(adminCash?.balance_usd || 0).toFixed(2)}`,
                    icon: Wallet,
                    description: 'Dólares',
                    variant: 'success',
                  },
                  {
                    title: 'Cobrado en el Mes (ARS)',
                    value: currencyService.formatCurrency(monthlyStats.monthlyCollectedARS, 'ARS'),
                    icon: TrendingUp,
                    description: `${collectedFees.filter((f: any) => f.metadata?.currency === 'ARS').length} cobros`,
                    variant: 'info',
                  },
                  {
                    title: 'Cobrado en el Mes (USD)',
                    value: `U$S ${monthlyStats.monthlyCollectedUSD.toFixed(2)}`,
                    icon: TrendingUp,
                    description: `${collectedFees.filter((f: any) => f.metadata?.currency === 'USD').length} cobros`,
                    variant: 'info',
                  },
                  {
                    title: 'Gastos del Mes (ARS)',
                    value: currencyService.formatCurrency(monthlyStats.monthlyExpensesARS, 'ARS'),
                    icon: TrendingDown,
                    description: 'Gastos operativos',
                    variant: 'warning',
                  },
                  {
                    title: 'Gastos del Mes (USD)',
                    value: `U$S ${monthlyStats.monthlyExpensesUSD.toFixed(2)}`,
                    icon: TrendingDown,
                    description: 'Gastos operativos',
                    variant: 'warning',
                  },
                  {
                    title: 'Total Cobrado Histórico',
                    value: currencyService.formatCurrency(adminCash?.total_collected || 0, 'ARS'),
                    icon: PiggyBank,
                    description: 'Todos los honorarios',
                    variant: 'default',
                  },
                ] as StatCardProps[]
              }
              columns={4}
              gap="md"
              animated={!loading}
            />
          </div>
        </SectionCard>

        {/* Collected Fees Section */}
        {collectedFees.length > 0 && (
          <SectionCard className="mb-6 p-0">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium text-gray-900">
                    Honorarios Cobrados en el Mes
                  </h3>
                  <Badge variant="success" size="sm">
                    {collectedFees.length}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {collectedFees.length} honorarios cobrados automáticamente
              </p>
            </div>
            <div>
                <DataTable
                  data={collectedFees}
                  columns={collectedFeesColumns}
                  size="sm"
                  emptyText="No hay honorarios cobrados este mes"
                  striped={false}
                  bordered={false}
                />
              </div>
          </SectionCard>
        )}

        {/* Quick Actions */}
        <SectionCard className="mb-6 p-0">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-gray-600" />
              <h3 className="text-base font-medium text-gray-900">
                Acciones Rápidas
              </h3>
            </div>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border-2 border-red-200"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg mr-3">
                    <MinusCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Registrar Gasto
                    </p>
                    <p className="text-xs text-gray-600">
                      Gastos administrativos
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>

              <button
                onClick={() => setIsConversionModalOpen(true)}
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border-2 border-blue-200"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Convertir Divisas
                    </p>
                    <p className="text-xs text-gray-600">
                      Pesos ⇄ Dólares
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>

              <button
                onClick={() => navigate("/finance/reports")}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Generar Reporte
                    </p>
                    <p className="text-xs text-gray-600">
                      Estado administrativo
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>

              <button
                onClick={() => navigate("/finance")}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Volver a Finanzas
                    </p>
                    <p className="text-xs text-gray-600">Panel principal</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </SectionCard>

        {/* Recent Movements */}
        <SectionCard className="p-0">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-gray-600" />
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    Movimientos Recientes
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Últimos {movements.length} movimientos de la caja administrativa
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Filtrar:
                </label>
                <select
                  value={movementFilter}
                  onChange={(e) => setMovementFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-400"
                >
                  <option value="all">Todos los movimientos</option>
                  <option value="admin_fee_collection">
                    Cobros de Honorarios
                  </option>
                  <option value="operational_expense">
                    Gastos Operativos
                  </option>
                  <option value="salary_payment">Pagos de Salarios</option>
                  <option value="tax_payment">Pagos de Impuestos</option>
                  <option value="adjustment">Ajustes</option>
                </select>
              </div>
            </div>
          </div>
          <div>
              <DataTable
                data={filteredMovements}
                columns={movementsColumns}
                searchable
                searchPlaceholder="Buscar en movimientos..."
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                }}
                size="sm"
                striped={false}
                bordered={false}
                emptyText="No hay movimientos registrados"
                loading={loading}
              />
            </div>
        </SectionCard>
      </div>

      {/* Admin Expense Modal */}
      <AdminExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={() => {
          loadData();
          setIsExpenseModalOpen(false);
        }}
        availableBalanceARS={adminCash?.balance_ars || 0}
        availableBalanceUSD={adminCash?.balance_usd || 0}
      />

      {/* Currency Conversion Modal */}
      <CurrencyConversionModal
        isOpen={isConversionModalOpen}
        onClose={() => setIsConversionModalOpen(false)}
        onSuccess={() => {
          loadData();
          setIsConversionModalOpen(false);
        }}
        availableBalanceARS={adminCash?.balance_ars || 0}
        availableBalanceUSD={adminCash?.balance_usd || 0}
      />
    </div>
  );
}
