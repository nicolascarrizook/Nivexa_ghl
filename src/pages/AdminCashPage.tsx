import { supabase } from "@/config/supabase";
import { Badge } from "@/design-system/components/data-display/Badge/Badge";
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
import type { Currency } from "@/services/CurrencyService";
import { currencyService } from "@/services/CurrencyService";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  FileText,
  Home,
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
  const [pendingFees, setPendingFees] = useState<AdministratorFee[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [movementFilter, setMovementFilter] = useState<string>("all");
  const [monthlyStats, setMonthlyStats] = useState({
    monthlyCollected: 0,
    monthlyExpenses: 0,
    totalPending: 0,
  });

  const currency: Currency = "ARS";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get admin cash data
      const adminCashData = await newCashBoxService.getAdminCash();
      setAdminCash(adminCashData);

      // Get admin cash movements if admin cash exists
      let movementsData: CashMovement[] = [];
      if (adminCashData) {
        movementsData = await newCashBoxService.getCashMovements(
          "admin",
          adminCashData.id,
          50
        );

        // Calculate balance_after for each movement
        // Movements come in descending order (newest first)
        // So we work backwards from current balance
        let runningBalance = adminCashData.balance;
        const movementsWithBalance = movementsData.map((movement, index) => {
          const balanceAfter = runningBalance;

          // For next iteration (going backwards in time), reverse the transaction
          if (movement.destination_id === adminCashData.id) {
            // Money came into admin cash, so subtract it to get previous balance
            runningBalance -= movement.amount;
          } else if (movement.source_id === adminCashData.id) {
            // Money went out of admin cash, so add it back to get previous balance
            runningBalance += movement.amount;
          }

          return {
            ...movement,
            balance_after: balanceAfter
          };
        });

        setMovements(movementsWithBalance);
      }

      // Get all administrator fees
      const [pendingFeesData, collectedFeesData] = await Promise.all([
        administratorFeeService.getPendingAdminFees(),
        // Get collected fees for this month
        supabase
          .from("administrator_fees")
          .select(
            `
            *,
            projects!inner(
              code,
              name,
              client_name
            )
          `
          )
          .eq("status", "collected")
          .gte(
            "collected_at",
            new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ).toISOString()
          )
          .order("collected_at", { ascending: false }),
      ]);

      setPendingFees(pendingFeesData);
      setCollectedFees(collectedFeesData.data || []);

      // Get projects for reference
      const { data: projectsData } = await supabase
        .from("projects")
        .select("id, name, code, client_name")
        .order("name");

      setProjects(projectsData || []);

      // Calculate monthly stats
      const currentMonth = new Date();
      const startOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
      );

      const monthMovements =
        movementsData?.filter((m) => new Date(m.created_at) >= startOfMonth) ||
        [];

      const monthlyCollected =
        collectedFeesData.data?.reduce(
          (sum, fee) => sum + (fee.collected_amount || 0),
          0
        ) || 0;
      const monthlyExpenses = monthMovements
        .filter((m) => m.movement_type === "operational_expense")
        .reduce((sum, m) => sum + (m.amount || 0), 0);
      const totalPending = pendingFeesData.reduce(
        (sum, fee) => sum + (fee.amount || 0),
        0
      );

      console.log('Admin Cash Debug:', {
        pendingFeesCount: pendingFeesData.length,
        pendingFeesData: pendingFeesData.map(f => ({ id: f.id, amount: f.amount })),
        totalPending
      });

      setMonthlyStats({
        monthlyCollected,
        monthlyExpenses,
        totalPending,
      });
    } catch (error) {
      console.error("Error loading admin cash data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "transfer":
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
      case "transfer":
        return "Transferencia de Honorarios";
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
      case "transfer":
        return (
          <Badge variant="success" size="sm" className="text-xs px-2 py-0.5">
            Ingreso
          </Badge>
        );
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
      render: (value: string) => (
        <span className="text-xs text-gray-900">{value}</span>
      ),
    },
    {
      key: "amount",
      title: "Monto",
      align: "right" as const,
      render: (value: number, record: CashMovement) => {
        // Money coming INTO admin cash is positive
        const isPositive = record.destination_id === adminCash?.id;
        return (
          <span
            className={`text-xs font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : "-"}
            {currencyService.formatCurrency(value, "ARS")}
          </span>
        );
      },
    },
    {
      key: "balance_after",
      title: "Saldo",
      align: "right" as const,
      render: (value: number) => (
        <span className="text-xs font-medium text-gray-900">
          {currencyService.formatCurrency(value, "ARS")}
        </span>
      ),
    },
  ];

  // Prepare data for collected fees table
  const collectedFeesColumns = [
    {
      key: "collected_at",
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
      key: "fee_percentage",
      title: "%",
      render: (value: number) => (
        <span className="text-xs text-gray-900">{value}%</span>
      ),
    },
    {
      key: "collected_amount",
      title: "Monto",
      align: "right" as const,
      render: (value: number) => (
        <span className="text-xs font-medium text-green-600">
          {currencyService.formatCurrency(value, "ARS")}
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
                Gestión de honorarios personales y gastos administrativos
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
                    title: 'Saldo Actual',
                    value: currencyService.formatCurrency(adminCash?.balance || 0, currency),
                    icon: Wallet,
                    description: 'Caja Admin',
                    variant: 'success',
                  },
                  {
                    title: 'Cobrado en el Mes',
                    value: currencyService.formatCurrency(monthlyStats.monthlyCollected, currency),
                    icon: TrendingUp,
                    description: `${collectedFees.length} cobros`,
                    variant: 'info',
                  },
                  {
                    title: 'Gastos del Mes',
                    value: currencyService.formatCurrency(monthlyStats.monthlyExpenses, currency),
                    icon: TrendingDown,
                    description: 'Gastos operativos',
                    variant: 'warning',
                  },
                  {
                    title: 'Total Cobrado',
                    value: currencyService.formatCurrency(adminCash?.total_collected || 0, currency),
                    icon: PiggyBank,
                    description: 'Histórico',
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

        {/* Pending Fees Section */}
        {pendingFees.length > 0 && (
          <SectionCard className="mb-6 p-0">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium text-gray-900">
                    Honorarios Pendientes de Cobro
                  </h3>
                  <Badge variant="warning" size="sm">
                    {pendingFees.length}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {pendingFees.length} honorarios disponibles en Caja Maestra
              </p>
            </div>
            <div className="px-6 py-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Hay {pendingFees.length} honorarios pendientes por un
                      total de{" "}
                      {currencyService.formatCurrency(
                        monthlyStats.totalPending,
                        currency
                      )}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Estos honorarios deben ser cobrados desde la Caja
                      Maestra para transferirse aquí.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/finance/master-cash")}
                    className="ml-auto px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Ir a Caja Maestra
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

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
                {collectedFees.length} honorarios cobrados por{" "}
                {currencyService.formatCurrency(
                  monthlyStats.monthlyCollected,
                  currency
                )}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/finance/master-cash")}
                className="flex items-center justify-between p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-gray-900 rounded-lg mr-3">
                    <PiggyBank className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Cobrar Honorarios
                    </p>
                    <p className="text-xs text-gray-600">
                      Desde Caja Maestra
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
                  <option value="transfer">
                    Transferencias de Honorarios
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
    </div>
  );
}
