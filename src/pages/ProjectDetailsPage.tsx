import {
  Activity,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Edit2,
  Eye,
  FileText,
  FolderOpen,
  HardHat,
  Home,
  Mail,
  Phone,
  Plus,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// UI Components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Column } from "@/design-system/components/data-display";
import { Badge, DataTable } from "@/design-system/components/data-display";
import MetricGrid from "@/design-system/components/data-display/MetricGrid/MetricGrid";
import type { StatCardProps } from "@/design-system/components/data-display/StatCard/StatCard";
import { SectionCard } from "@/design-system/components/layout";

// Utilities and Services
import { StreamlinedPaymentModal, ProjectDetailsSkeleton } from "@/modules/projects/components";
import type {
  Installment,
  ProjectWithDetails,
} from "@/modules/projects/services/ProjectService";
import { projectService } from "@/modules/projects/services/ProjectService";
import type { Currency } from "@/services/CurrencyService";
import { formatCurrency, formatDate } from "@/utils/formatters";

// Providers/Contractors Components
import { toast } from "@/hooks/useToast";
import {
  AssignContractorModal,
  ContractorsTable,
  ManagePaymentsModal,
  ManageWorkModal,
} from "@/modules/providers/components";
import { useProjectContractors, useProjectExpenses } from "@/modules/providers/hooks";
import { ProjectCashFlowCard } from "@/modules/finance/components";

// Investors Components
import { InvestorsSection } from "@/modules/investors/components";

interface ProjectExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  contractor_name?: string;
  payment_type?: string;
  currency: 'ARS' | 'USD';
}

interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  status: "active" | "inactive";
}

// Mock data removed - now using real data from useProjectExpenses hook

// TODO: Implement real documents management system
// const mockDocuments removed - feature pending implementation

// TODO: Implement real team management system
// const mockTeamMembers removed - feature pending implementation

export function ProjectDetailsPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "payments" | "expenses" | "documents" | "team" | "contractors" | "investors"
  >("overview");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedContractorId, setSelectedContractorId] = useState<
    string | null
  >(null);
  const [selectedContractorName, setSelectedContractorName] =
    useState<string>("");
  const [showAssignContractorModal, setShowAssignContractorModal] =
    useState(false);
  const [showManagePaymentsModal, setShowManagePaymentsModal] = useState(false);
  const [showManageWorkModal, setShowManageWorkModal] = useState(false);

  // Load contractors for this project
  const {
    contractors,
    loading: contractorsLoading,
    stats: contractorStats,
    refetch: refetchContractors,
    deleteContractor,
  } = useProjectContractors(projectId || "");

  // Load expenses (contractor payments) for this project
  const {
    expenses,
    loading: expensesLoading,
    refetch: refetchExpenses,
  } = useProjectExpenses(projectId || "");

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const projectData = await projectService.getProjectWithInstallments(
        projectId
      );

      if (projectData) {
        setProject(projectData);
      } else {
        navigate("/projects");
      }
    } catch (error) {
      console.error("Error loading project:", error);
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  // Project status configuration - unified with design tokens semantics
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { label: "Activo", variant: "success" as const };
      case "completed":
        return { label: "Completado", variant: "default" as const };
      case "paused":
      case "on_hold":
        return { label: "Pausado", variant: "warning" as const };
      case "cancelled":
        return { label: "Cancelado", variant: "error" as const };
      case "draft":
        return { label: "Borrador", variant: "default" as const };
      default:
        return { label: status, variant: "default" as const };
    }
  };

  // Payment/Installment status configuration - unified with design tokens semantics
  const getInstallmentStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return { label: "Pagado", variant: "success" as const };
      case "pending":
        return { label: "Pendiente", variant: "warning" as const };
      case "overdue":
        return { label: "Vencido", variant: "error" as const };
      case "cancelled":
        return { label: "Cancelado", variant: "default" as const };
      default:
        return { label: status, variant: "default" as const };
    }
  };

  // Expense status configuration - unified with design tokens semantics
  const getExpenseStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return { label: "Pagado", variant: "success" as const };
      case "pending":
        return { label: "Pendiente", variant: "warning" as const };
      case "overdue":
        return { label: "Vencido", variant: "error" as const };
      case "cancelled":
        return { label: "Cancelado", variant: "default" as const };
      default:
        return { label: status, variant: "default" as const };
    }
  };

  const handleEditProject = () => {
    navigate(`/projects/${projectId}/edit`);
  };

  const handleDeleteProject = () => {
    if (confirm(`¿Estás seguro de eliminar el proyecto "${project?.name}"?`)) {
      console.log("Delete project:", project);
      navigate("/projects");
    }
  };

  const handleNewPayment = () => {
    setShowPaymentModal(true);
  };

  const handleViewInstallment = (installment: Installment) => {
    // Open payment modal for this installment
    setShowPaymentModal(true);
    // You may want to set a specific installment to pay here
  };

  const handlePayInstallment = (installment: Installment) => {
    // Open payment modal for this specific installment
    setShowPaymentModal(true);
    // You may want to set a specific installment to pay here
  };

  // Get currency from project
  const currency = (project?.currency as Currency) || 'ARS';

  // Define installments table columns
  const installmentColumns: Column[] = [
    {
      key: "installment_number",
      title: "Cuota",
      sortable: true,
      render: (value, record: Installment) => (
        <div className="flex items-center space-x-3">
          <div>
            <span className="text-sm font-medium text-gray-900">
              {value === 0 ? "Anticipo" : `Cuota #${value}`}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      title: "Monto",
      sortable: true,
      align: "right",
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">
          {formatCurrency(value || 0, currency)}
        </span>
      ),
    },
    {
      key: "due_date",
      title: "Fecha Vencimiento",
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span>{formatDate(value)}</span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Estado",
      sortable: true,
      render: (value) => {
        const statusConfig = getInstallmentStatusConfig(value);
        return (
          <Badge variant={statusConfig.variant} size="sm">
            {statusConfig.label}
          </Badge>
        );
      },
    },
    {
      key: "paid_amount",
      title: "Pagado",
      sortable: true,
      align: "right",
      render: (value) => (
        <span className="text-sm text-gray-600">
          {formatCurrency(value || 0, currency)}
        </span>
      ),
    },
  ];

  // Define expenses table columns
  const expenseColumns: Column[] = [
    {
      key: "description",
      title: "Descripción",
      sortable: true,
      render: (_, record: ProjectExpense) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {record.description}
            </p>
            <p className="text-xs text-gray-500">
              {record.contractor_name && `${record.contractor_name} • `}
              {record.category}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      title: "Monto",
      sortable: true,
      align: "right",
      render: (value, record: ProjectExpense) => (
        <span className="text-sm font-medium text-gray-900">
          {formatCurrency(value, record.currency)}
        </span>
      ),
    },
    {
      key: "date",
      title: "Fecha",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      ),
    },
    {
      key: "status",
      title: "Estado",
      sortable: true,
      render: (value) => {
        const statusConfig = getExpenseStatusConfig(value);
        return (
          <Badge variant={statusConfig.variant} size="sm">
            {statusConfig.label}
          </Badge>
        );
      },
    },
  ];

  // Define documents table columns
  const documentColumns: Column[] = [
    {
      key: "name",
      title: "Documento",
      sortable: true,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
            <FileText className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{record.name}</p>
            <p className="text-xs text-gray-500">{record.type}</p>
          </div>
        </div>
      ),
    },
    {
      key: "size",
      title: "Tamaño",
      sortable: true,
      render: (value) => <span className="text-sm text-gray-600">{value}</span>,
    },
    {
      key: "date",
      title: "Fecha",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      ),
    },
  ];

  // Define team table columns
  const teamColumns: Column[] = [
    {
      key: "name",
      title: "Miembro",
      sortable: true,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{record.name}</p>
            <p className="text-xs text-gray-500">{record.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      title: "Email",
      sortable: true,
      render: (value) => <span className="text-sm text-gray-600">{value}</span>,
    },
    {
      key: "phone",
      title: "Teléfono",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">{value || "-"}</span>
      ),
    },
    {
      key: "status",
      title: "Estado",
      sortable: true,
      render: (value) => (
        <Badge variant={value === "active" ? "primary" : "error"} size="sm">
          {value === "active" ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
  ];

  const installmentRowActions = {
    items: [
      {
        key: "pay",
        label: "Pagar",
        icon: <CreditCard className="h-4 w-4" />,
        onClick: handlePayInstallment,
      },
      {
        key: "view",
        label: "Ver detalles",
        icon: <Eye className="h-4 w-4" />,
        onClick: handleViewInstallment,
      },
    ],
  };

  const documentRowActions = {
    items: [
      {
        key: "download",
        label: "Descargar",
        icon: <Download className="h-4 w-4" />,
        onClick: (record: any) => console.log("Download document:", record),
      },
      {
        key: "delete",
        label: "Eliminar",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: (record: any) => {
          if (
            confirm(`¿Estás seguro de eliminar el documento "${record.name}"?`)
          ) {
            console.log("Delete document:", record);
          }
        },
        danger: true,
      },
    ],
  };

  if (loading) {
    return <ProjectDetailsSkeleton />;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Proyecto no encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            El proyecto que estás buscando no existe o ha sido eliminado.
          </p>
          <button
            onClick={() => navigate("/projects")}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all inline-flex items-center text-sm"
          >
            Volver a Proyectos
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(project.status);
  const pendingAmount = project.total_amount - (project.paid_amount || 0);

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
                  <Link to="/projects">Proyectos</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{project.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Project Icon */}
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {project.name}
                  </h1>
                  <Badge variant={statusConfig.variant} size="md">
                    {statusConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {project.client_name}
                  </span>
                  <span>#{project.code}</span>
                  {project.start_date && (
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(project.start_date)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleNewPayment}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Nuevo Pago
              </button>
              <button
                onClick={handleEditProject}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar Proyecto
              </button>
              <button
                onClick={handleDeleteProject}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Proyecto
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-3 space-y-6">
            {/* Project Information Card */}
            <SectionCard>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Información del Proyecto
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Cliente
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {project.client_name}
                        </p>
                      </div>
                    </div>
                    {project.client_email && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Mail className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Email
                          </p>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {project.client_email}
                          </p>
                        </div>
                      </div>
                    )}
                    {project.client_phone && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Phone className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Teléfono
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {project.client_phone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-5">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Tipo de Proyecto
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {project.project_type === "residential"
                            ? "Residencial"
                            : project.project_type === "commercial"
                            ? "Comercial"
                            : project.project_type === "renovation"
                            ? "Renovación"
                            : "Otro"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Fecha de Inicio
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {project.start_date
                            ? formatDate(project.start_date)
                            : "Sin definir"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Código de Proyecto
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          #{project.code}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Stats Cards */}
            <MetricGrid
              metrics={
                [
                  {
                    title: `Presupuesto Total (${currency})`,
                    value: formatCurrency(project.total_amount, currency),
                    icon: DollarSign,
                    description: "Valor total del proyecto",
                    variant: "default",
                    trend: { value: 0, isPositive: true },
                  },
                  {
                    title: "Caja Proyecto ARS",
                    value: formatCurrency(project.project_cash_box?.current_balance_ars || 0, 'ARS'),
                    icon: DollarSign,
                    description: `Ingresos: ${formatCurrency(project.project_cash_box?.total_income_ars || 0, 'ARS')} | Gastos: ${formatCurrency(project.project_cash_box?.total_expenses_ars || 0, 'ARS')}`,
                    variant: (project.project_cash_box?.current_balance_ars || 0) < 0 ? "error" : "default",
                  },
                  {
                    title: "Caja Proyecto USD",
                    value: formatCurrency(project.project_cash_box?.current_balance_usd || 0, 'USD'),
                    icon: DollarSign,
                    description: `Ingresos: ${formatCurrency(project.project_cash_box?.total_income_usd || 0, 'USD')} | Gastos: ${formatCurrency(project.project_cash_box?.total_expenses_usd || 0, 'USD')}`,
                    variant: (project.project_cash_box?.current_balance_usd || 0) < 0 ? "error" : "default",
                  },
                  {
                    title: `Pagado (${currency})`,
                    value: formatCurrency(project.paid_amount || 0, currency),
                    icon: CheckCircle,
                    description: `${Math.round(
                      ((project.paid_amount || 0) / project.total_amount) * 100
                    )}% del total`,
                    variant: "success",
                    trend: {
                      value: Math.round(
                        ((project.paid_amount || 0) / project.total_amount) *
                          100
                      ),
                      isPositive: true,
                    },
                  },
                  {
                    title: `Pendiente (${currency})`,
                    value: formatCurrency(pendingAmount, currency),
                    icon: Clock,
                    description: "Por cobrar",
                    variant: pendingAmount > 0 ? "warning" : "success",
                    trend: {
                      value: Math.round(
                        (pendingAmount / project.total_amount) * 100
                      ),
                      isPositive: false,
                    },
                  },
                  {
                    title: "Progreso",
                    value: `${project.progress_percentage || 0}%`,
                    icon: Activity,
                    description: "Avance del proyecto",
                    variant: "default",
                    trend: {
                      value: project.progress_percentage || 0,
                      isPositive: true,
                    },
                  },
                ] as StatCardProps[]
              }
              columns={3}
              gap="md"
              animated={!loading}
            />

            {/* Tabs */}
            <SectionCard className="p-0">
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex">
                  {[
                    { key: "overview", label: "Resumen", icon: Home, count: null },
                    { key: "payments", label: "Pagos", icon: CreditCard, count: project.installments?.length || 0 },
                    { key: "investors", label: "Inversionistas", icon: Users, count: null },
                    { key: "contractors", label: "Proveedores", icon: HardHat, count: contractors?.length || 0 },
                    { key: "expenses", label: "Gastos", icon: DollarSign, count: expenses?.length || 0 },
                    { key: "documents", label: "Documentos", icon: FileText, count: null },
                    { key: "team", label: "Equipo", icon: Users, count: null },
                  ].map(({ key, label, icon: Icon, count }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key as any)}
                      className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === key
                          ? "border-gray-900 text-gray-900"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                      {count !== null && count > 0 && (
                        <Badge
                          variant={activeTab === key ? "primary" : "default"}
                          size="sm"
                          className="ml-1.5"
                        >
                          {count}
                        </Badge>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {activeTab === "overview" && (
                <div className="p-6 mb-6 mt-6">
                  <div className="space-y-6">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Progreso del Proyecto
                        </span>
                        <span className="text-sm text-gray-500">
                          {project.progress_percentage || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${project.progress_percentage || 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Project Description */}
                    {project.description && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">
                          Descripción
                        </h3>
                        <p className="text-sm text-gray-600">
                          {project.description}
                        </p>
                      </div>
                    )}

                    {/* Key Dates */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-4">
                        Fechas Importantes
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Inicio</p>
                            <p className="text-sm font-medium text-gray-900">
                              {project.start_date
                                ? formatDate(project.start_date)
                                : "Sin definir"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">
                              Fin Estimado
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {project.estimated_end_date
                                ? formatDate(project.estimated_end_date)
                                : "Sin definir"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cash Flow Explanation */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Sistema de Triple Caja
                      </h3>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        Cada proyecto tiene su propia <strong>Caja de Proyecto</strong> que rastrea todos los ingresos y gastos.
                        Cuando el proyecto recibe un pago, este se duplica automáticamente en la <strong>Caja Master</strong> del estudio.
                        Desde la Caja Master, el arquitecto puede decidir cuándo y cuánto cobrar de honorarios hacia su <strong>Caja Admin</strong> personal.
                      </p>
                    </div>

                    {/* Project Cash Flow - ARS */}
                    {project.project_cash_box && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-4">
                          Flujo de Caja del Proyecto
                        </h3>
                        <div className="space-y-4">
                          <ProjectCashFlowCard
                            currency="ARS"
                            totalIncome={project.project_cash_box.total_income_ars || 0}
                            totalExpenses={project.project_cash_box.total_expenses_ars || 0}
                            currentBalance={project.project_cash_box.current_balance_ars || 0}
                          />
                          <ProjectCashFlowCard
                            currency="USD"
                            totalIncome={project.project_cash_box.total_income_usd || 0}
                            totalExpenses={project.project_cash_box.total_expenses_usd || 0}
                            currentBalance={project.project_cash_box.current_balance_usd || 0}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "payments" && (
                <DataTable
                  data={project.installments || []}
                  columns={installmentColumns}
                  loading={false}
                  rowKey="id"
                  rowActions={installmentRowActions}
                  onRowClick={handleViewInstallment}
                  searchable={false}
                  exportable={false}
                  size="md"
                  bordered={false}
                  emptyText="No hay pagos programados para este proyecto."
                  pagination={false}
                />
              )}

              {activeTab === "contractors" && (
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Contractors List */}
                    {contractorsLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
                          >
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        ))}
                      </div>
                    ) : contractors.length === 0 ? (
                      <div className="text-center py-12">
                        <HardHat className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-sm text-gray-500">
                          No hay contractors asignados a este proyecto
                        </p>
                        <button
                          onClick={() => setShowAssignContractorModal(true)}
                          className="mt-4 inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Asignar Contractor
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Contractors Asignados
                          </h3>
                          <button
                            onClick={() => setShowAssignContractorModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Asignar Contractor
                          </button>
                        </div>

                        <ContractorsTable
                          contractors={contractors}
                          loading={contractorsLoading}
                          onEdit={(contractor) =>
                            console.log("Edit contractor", contractor)
                          }
                          onDelete={async (id) => {
                            const success = await deleteContractor(id);
                            if (success) {
                              toast.success(
                                "Contractor eliminado exitosamente"
                              );
                            } else {
                              toast.error("Error al eliminar el contractor");
                            }
                          }}
                          onManagePayments={(id) => {
                            const contractor = contractors.find(
                              (c) => c.id === id
                            );
                            setSelectedContractorId(id);
                            setSelectedContractorName(
                              contractor?.provider?.name || "Contractor"
                            );
                            setShowManagePaymentsModal(true);
                          }}
                          onManageWork={(id) => {
                            const contractor = contractors.find(
                              (c) => c.id === id
                            );
                            setSelectedContractorId(id);
                            setSelectedContractorName(
                              contractor?.provider?.name || "Contractor"
                            );
                            setShowManageWorkModal(true);
                          }}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "expenses" && (
                <DataTable
                  data={expenses}
                  columns={expenseColumns}
                  loading={expensesLoading}
                  rowKey="id"
                  searchable={true}
                  searchPlaceholder="Buscar gastos..."
                  exportable={true}
                  size="md"
                  bordered={false}
                  emptyText="No hay gastos registrados para este proyecto."
                  pagination={true}
                />
              )}

              {activeTab === "documents" && (
                <DataTable
                  data={[]}
                  columns={documentColumns}
                  loading={false}
                  rowKey="id"
                  rowActions={documentRowActions}
                  searchable={false}
                  exportable={false}
                  size="md"
                  bordered={false}
                  emptyText="La gestión de documentos estará disponible próximamente."
                  pagination={false}
                />
              )}

              {activeTab === "team" && (
                <DataTable
                  data={[]}
                  columns={teamColumns}
                  loading={false}
                  rowKey="id"
                  searchable={false}
                  exportable={false}
                  size="md"
                  bordered={false}
                  emptyText="La gestión de equipo estará disponible próximamente."
                  pagination={false}
                />
              )}

              {activeTab === "investors" && projectId && (
                <div className="p-6">
                  <InvestorsSection projectId={projectId} />
                </div>
              )}
            </SectionCard>
          </div>

          {/* Right Sidebar - Quick Actions */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Actions */}
              <SectionCard className="p-4 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Acciones Rápidas
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={handleNewPayment}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Confirmar Pago</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("documents")}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Subir Documento</span>
                  </button>
                  <button
                    onClick={handleEditProject}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Editar Proyecto</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <FileText className="h-4 w-4" />
                    <span>Generar Reporte</span>
                  </button>
                </div>
              </SectionCard>

              {/* Financial Summary */}
              <SectionCard className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Resumen Financiero
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Presupuesto Total
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(project.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Pagado</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(project.paid_amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Pendiente</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(pendingAmount)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Progreso</span>
                      <span className="text-sm font-medium text-gray-900">
                        {project.progress_percentage || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Recent Activity - TODO: Implement real activity tracking */}
              <SectionCard className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Actividad Reciente
                </h2>
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">
                    El registro de actividad estará disponible próximamente
                  </p>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>

      {/* Streamlined Payment Modal - Unified 3-step flow */}
      {project && (
        <StreamlinedPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          projectId={project.id}
          projectName={project.name}
          clientName={project.client_name}
          clientId={project.client_id}
          currency={project.currency as Currency}
          totalAmount={project.total_amount}
          onPaymentComplete={() => {
            setShowPaymentModal(false);
            loadProject();
          }}
        />
      )}

      {/* Assign Contractor Modal */}
      {projectId && (
        <>
          <AssignContractorModal
            isOpen={showAssignContractorModal}
            onClose={() => setShowAssignContractorModal(false)}
            projectId={projectId}
            onSuccess={() => {
              setShowAssignContractorModal(false);
              refetchContractors();
            }}
          />

          {selectedContractorId && (
            <>
              <ManagePaymentsModal
                isOpen={showManagePaymentsModal}
                onClose={() => {
                  setShowManagePaymentsModal(false);
                  refetchContractors();
                  loadProject(); // Refresh project cash boxes
                }}
                projectContractorId={selectedContractorId}
                contractorName={selectedContractorName}
                onPaymentChange={() => {
                  refetchContractors();
                  refetchExpenses(); // Refresh expenses list
                  loadProject(); // Refresh project cash boxes after payment
                }}
              />

              <ManageWorkModal
                isOpen={showManageWorkModal}
                onClose={() => {
                  setShowManageWorkModal(false);
                  refetchContractors();
                }}
                projectContractorId={selectedContractorId}
                contractorName={selectedContractorName}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
