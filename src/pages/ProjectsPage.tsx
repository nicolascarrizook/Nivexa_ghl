import {
  Briefcase,
  CheckCircle,
  Clock,
  Download,
  Grid3X3,
  Home,
  List,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
import { EmptyState } from "@/design-system/components/feedback";
import { SectionCard } from "@/design-system/components/layout";

// Project Components
import { ProjectCreationWizard } from "@/modules/projects/components/ProjectCreationWizard";
import { ProjectList } from "@/modules/projects/components/ProjectList";
import { ProjectsTable } from "@/modules/projects/components/ProjectsTable";

// Hooks and utilities
import { formatCurrency } from "@/utils/formatters";
import { useProjects } from "@modules/projects/hooks/useProjects";

// Filter Bar Component
function FilterBar({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  viewMode,
  onViewModeChange,
}: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
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
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all text-sm"
          >
            <option value="all">Todos los tipos</option>
            <option value="residential">Residencial</option>
            <option value="commercial">Comercial</option>
            <option value="institutional">Institucional</option>
            <option value="renovation">Renovación</option>
            <option value="landscape">Paisajismo</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 ml-auto bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Vista de cuadrícula"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Vista de lista"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Get projects data
  const { data: projectsData, isLoading, error, refetch } = useProjects();

  // Process projects data
  const projects = useMemo(() => {
    if (!projectsData) return [];

    let filtered = [...projectsData];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.client?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((project) => project.type === typeFilter);
    }

    return filtered;
  }, [projectsData, searchTerm, statusFilter, typeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = projects.length;
    const totalValue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const active = projects.filter((p) =>
      ["planning", "design", "development", "construction"].includes(p.status)
    ).length;
    const completed = projects.filter((p) => p.status === "completed").length;

    return {
      total,
      totalValue,
      active,
      completed,
    };
  }, [projects]);

  const handleProjectCreated = (projectData: any) => {
    console.log("Project created:", projectData);
    // Here you would typically make an API call to create the project
    refetch(); // Refresh the projects list
    setIsCreateModalOpen(false);
  };

  const handleEditProject = (project: any) => {
    navigate(`/projects/${project.id}/edit`);
  };

  const handleDeleteProject = (project: any) => {
    if (confirm(`¿Estás seguro de eliminar el proyecto "${project.name}"?`)) {
      console.log("Delete project:", project);
      // Here you would typically make an API call to delete the project
      refetch();
    }
  };

  const handleExport = () => {
    console.log("Export projects");
    // Implement export functionality
  };

  if (error) {
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
                  <BreadcrumbPage>Proyectos</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="p-6">
          <SectionCard className="p-8">
            <div className="text-center py-12">
              <p className="text-gray-600">Error al cargar los proyectos</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-gray-900 text-white rounded-md mt-4 hover:bg-gray-800"
              >
                Reintentar
              </button>
            </div>
          </SectionCard>
        </div>
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
                <BreadcrumbPage>Proyectos</BreadcrumbPage>
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
                Gestiona todos tus proyectos en un solo lugar
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800"
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
                title: "Total Proyectos",
                value: stats.total.toString(),
                icon: Briefcase,
                description: `${stats.active} activos`,
                variant: "default",
                trend: { value: 5, isPositive: true },
              },
              {
                title: "Valor Total",
                value: formatCurrency(stats.totalValue),
                icon: TrendingUp,
                description: "Suma de todos los proyectos",
                variant: "default",
                trend: { value: 12, isPositive: true },
              },
              {
                title: "Completados",
                value: stats.completed.toString(),
                icon: CheckCircle,
                description: `${Math.round(
                  (stats.completed / (stats.total || 1)) * 100
                )}% del total`,
                variant: "success",
                trend: { value: 8, isPositive: true },
              },
              {
                title: "En Progreso",
                value: stats.active.toString(),
                icon: Clock,
                description: "Proyectos activos",
                variant: "default",
                trend: { value: 3, isPositive: false },
              },
            ] as StatCardProps[]
          }
          columns={4}
          gap="md"
          animated={!isLoading}
        />

        {/* Filter Bar */}
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Projects List/Grid */}
        {viewMode === "grid" ? (
          <ProjectList
            projects={projects}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            loading={isLoading}
          />
        ) : (
          <SectionCard>
            <ProjectsTable
              projects={projects}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              loading={isLoading}
            />
          </SectionCard>
        )}

        {/* Empty State */}
        {!isLoading && projects.length === 0 && searchTerm && (
          <EmptyState
            variant="no-search-results"
            title="No se encontraron proyectos"
            description="No hay proyectos que coincidan con tu búsqueda. Intenta con otros términos."
          />
        )}

        {!isLoading && projects.length === 0 && !searchTerm && (
          <EmptyState
            variant="no-projects"
            title="No hay proyectos"
            description="Comienza creando tu primer proyecto para gestionar tu trabajo."
            actions={{
              primary: {
                label: "Crear Proyecto",
                icon: <Plus className="h-4 w-4" />,
                onClick: () => setIsCreateModalOpen(true),
              },
            }}
          />
        )}

        {/* Project Creation Modal */}
        <ProjectCreationWizard
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleProjectCreated}
        />
      </div>
    </div>
  );
}
