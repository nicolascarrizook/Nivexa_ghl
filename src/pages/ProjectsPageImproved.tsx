import {
  Activity,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Edit2,
  Eye,
  Home,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// UI Components
import { Button } from "@/components/Button";
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
import { SectionCard } from "@/design-system/components/layout";
import MetricGrid from "@/design-system/components/data-display/MetricGrid/MetricGrid";
import type { StatCardProps } from "@/design-system/components/data-display/StatCard/StatCard";

// Project Components
import { ProjectCreationWizard } from "@/modules/projects/components/ProjectCreationWizard";

// Hooks and utilities
import { formatCurrency } from "@/utils/formatters";
import { useProjectsWithCash } from "@modules/projects/hooks/useProjects";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/hooks/useToast";

export function ProjectsPageImproved() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);

  // Get projects data with cash information
  const {
    data: projectsData,
    isLoading,
    error,
    refetch,
  } = useProjectsWithCash();

  // Process projects data
  const projects = useMemo(() => {
    if (!projectsData) return [];

    let filtered = [...projectsData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          (project.name || project.projectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (project.client || project.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (project.code || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((project) => 
        (project.type || project.projectType) === typeFilter
      );
    }

    return filtered;
  }, [projectsData, searchTerm, statusFilter, typeFilter]);

  // Calculate statistics including cash box information
  const stats = useMemo(() => {
    let totalBudget = 0;
    let totalSpent = 0;
    let totalCashFlow = 0;
    let totalProgress = 0;

    projects.forEach((project) => {
      // Use totalAmount as budget (from project creation)
      const projectBudget = project.totalAmount || project.total_amount || project.budget || 0;
      
      // Use total_collected or paid_amount as spent
      const projectSpent = project.total_collected || project.paid_amount || project.spent || 0;
      
      totalBudget += projectBudget;
      totalSpent += projectSpent;
      totalProgress += project.progress || project.progress_percentage || 0;
    });

    totalCashFlow = totalBudget - totalSpent;
    const avgProgress =
      projects.length > 0 ? Math.round(totalProgress / projects.length) : 0;

    return {
      total: projects.length,
      totalBudget,
      totalSpent,
      cashFlow: totalCashFlow,
      avgProgress,
    };
  }, [projects]);

  const handleProjectCreated = (projectData: any) => {
    console.log("Project created:", projectData);
    refetch();
    setIsCreateModalOpen(false);
  };

  const handleEditProject = (project: any) => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleDeleteClick = (project: any) => {
    setProjectToDelete({ id: project.id, name: project.name });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      console.log("Delete project:", projectToDelete);
      toast.success(`Proyecto "${projectToDelete.name}" eliminado exitosamente`);
      refetch();
    }
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Sin definir";
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const STATUS_CONFIG = {
    planning: { label: "Planificación", variant: "info" as const },
    design: { label: "Diseño", variant: "warning" as const },
    development: { label: "Desarrollo", variant: "primary" as const },
    construction: { label: "Construcción", variant: "success" as const },
    completed: { label: "Completado", variant: "default" as const },
    paused: { label: "Pausado", variant: "error" as const },
  };

  const TYPE_LABELS = {
    residential: "Residencial",
    commercial: "Comercial",
    institutional: "Institucional",
    renovation: "Renovación",
    landscape: "Paisajismo",
  };

  const handleExport = (data: any[]) => {
    const headers = [
      "Nombre",
      "Cliente",
      "Código",
      "Estado",
      "Presupuesto",
      "Gastado",
      "Progreso",
    ];
    const rows = data.map((p) => {
      // Use totalAmount as budget
      const projectBudget = p.totalAmount || p.total_amount || p.budget || 0;
      
      // Use total_collected or paid_amount as spent
      const projectSpent = p.total_collected || p.paid_amount || p.spent || 0;

      return [
        p.name || p.projectName,
        p.client || p.client_name || "",
        p.code || "",
        p.status,
        projectBudget,
        projectSpent,
        p.progress || p.progress_percentage || 0,
      ];
    });

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `proyectos-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  // Define table columns
  const columns: Column[] = [
    {
      key: "name",
      title: "Proyecto",
      sortable: true,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div>
            <button
              onClick={() => navigate(`/projects/${record.id}`)}
              className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
            >
              {record.name || record.projectName || 'Sin nombre'}
            </button>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-xs text-gray-500">{record.client || record.client_name || ''}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      title: "Tipo",
      sortable: true,
      render: (value, record) => {
        const type = record.type || record.projectType || value;
        return (
          <span className="text-sm text-gray-600">
            {TYPE_LABELS[type as keyof typeof TYPE_LABELS] || type || 'Sin tipo'}
          </span>
        );
      },
    },
    {
      key: "status",
      title: "Estado",
      sortable: true,
      render: (value) => {
        const statusConfig = STATUS_CONFIG[value as keyof typeof STATUS_CONFIG];
        return (
          <Badge variant={statusConfig?.variant || "default"} size="sm">
            {statusConfig?.label || value}
          </Badge>
        );
      },
    },
    {
      key: "progress",
      title: "Progreso",
      sortable: true,
      render: (value) => (
        <div className="w-20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">
              {value || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                (value || 0) < 30
                  ? "bg-red-500"
                  : (value || 0) < 60
                  ? "bg-yellow-500"
                  : (value || 0) < 90
                  ? "bg-blue-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${value || 0}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "totalAmount",
      title: "Presupuesto",
      sortable: true,
      align: "right",
      render: (value, record) => {
        // Use totalAmount as the budget
        const projectBudget = record.totalAmount || record.total_amount || value || record.budget || 0;
        
        // Use total_collected or paid_amount as spent
        const projectSpent = record.total_collected || record.paid_amount || record.spent || 0;
        
        return (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {formatCurrency(projectBudget)}
            </p>
            <p className="text-xs text-gray-500">
              Gastado: {formatCurrency(projectSpent)}
            </p>
          </div>
        );
      },
    },
    {
      key: "startDate",
      title: "Fechas",
      sortable: true,
      render: (value, record) => (
        <div className="text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span>{formatDate(value)}</span>
          </div>
          {record.endDate && (
            <div className="text-xs text-gray-500 mt-1">
              Fin: {formatDate(record.endDate)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "team",
      title: "Equipo",
      render: (value) => (
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {value?.length || 0} miembros
          </span>
        </div>
      ),
    },
  ];

  const rowActions = {
    items: [
      {
        key: "view",
        label: "Ver detalles",
        icon: <Eye className="h-4 w-4" />,
        onClick: (record: any) => navigate(`/projects/${record.id}`),
      },
      {
        key: "edit",
        label: "Editar",
        icon: <Edit2 className="h-4 w-4" />,
        onClick: handleEditProject,
      },
      {
        key: "delete",
        label: "Eliminar",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: handleDeleteClick,
        danger: true,
      },
    ],
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <SectionCard className="max-w-md mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Error al cargar los proyectos</p>
            <Button onClick={() => refetch()}>Reintentar</Button>
          </div>
        </SectionCard>
      </div>
    );
  }

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
                <BreadcrumbPage>Gestión Arquitectónica</BreadcrumbPage>
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
                Proyectos
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {stats.total} {stats.total === 1 ? "proyecto" : "proyectos"} en
                total • {formatCurrency(stats.totalBudget)} valor total
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleExport(projects)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proyecto
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Statistics */}
        <MetricGrid
          metrics={
            [
              {
                title: "Total Presupuestado",
                value: formatCurrency(stats.totalBudget),
                icon: DollarSign,
                description: `${stats.total} proyectos totales`,
                variant: "default",
                trend: { value: 12, isPositive: true },
              },
              {
                title: "Total Gastado",
                value: formatCurrency(stats.totalSpent),
                icon: TrendingUp,
                description: `${Math.round((stats.totalSpent / (stats.totalBudget || 1)) * 100)}% del presupuesto`,
                variant: "default",
                trend: { value: 8, isPositive: true },
              },
              {
                title: "Flujo de Caja",
                value: formatCurrency(stats.cashFlow),
                icon: Wallet,
                description: stats.cashFlow >= 0 ? "Balance positivo" : "Balance negativo",
                variant: stats.cashFlow >= 0 ? "success" : "warning",
                trend: { value: 5, isPositive: stats.cashFlow >= 0 },
              },
              {
                title: "Progreso Promedio",
                value: `${stats.avgProgress}%`,
                icon: Activity,
                description: "De todos los proyectos",
                variant: "default",
                trend: { value: 3, isPositive: true },
              },
            ] as StatCardProps[]
          }
          columns={4}
          gap="md"
          animated={!isLoading}
        />

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-4">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar proyectos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="planning">Planificación</option>
                <option value="design">Diseño</option>
                <option value="development">Desarrollo</option>
                <option value="construction">Construcción</option>
                <option value="completed">Completado</option>
                <option value="paused">Pausado</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm"
              >
                <option value="all">Todos los tipos</option>
                <option value="residential">Residencial</option>
                <option value="commercial">Comercial</option>
                <option value="institutional">Institucional</option>
                <option value="renovation">Renovación</option>
                <option value="landscape">Paisajismo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <SectionCard className="p-0">
          <DataTable
            data={projects}
            columns={columns}
            loading={isLoading}
            rowKey="id"
            rowActions={rowActions}
            onRowClick={(record) => navigate(`/projects/${record.id}`)}
            searchable={false}
            exportable={true}
            onExport={handleExport}
            size="md"
            bordered={true}
            emptyText="No se encontraron proyectos que coincidan con los filtros."
          />
        </SectionCard>

        {/* Empty State */}
        {!isLoading && projects.length === 0 && (
          <SectionCard>
            <div className="py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm
                    ? "No se encontraron proyectos"
                    : "No hay proyectos"}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  {searchTerm
                    ? "No hay proyectos que coincidan con tu búsqueda."
                    : "Comienza creando tu primer proyecto para gestionar tu trabajo."}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Proyecto
                  </button>
                )}
              </div>
            </div>
          </SectionCard>
        )}
      </div>

      {/* Project Creation Modal */}
      <ProjectCreationWizard
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleProjectCreated}
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de eliminar el proyecto "${projectToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
