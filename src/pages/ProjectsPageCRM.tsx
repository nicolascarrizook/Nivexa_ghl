import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Building2,
  Download,
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3
} from 'lucide-react';

// Design System Components
import { 
  PageLayout, 
  MainContentArea, 
  Section,
  Divider,
  PageTitle, 
  BodyText, 
  MutedText,
  CardSkeleton,
  ProjectWizardModal,
  ProjectWizardContent
} from '@/components';

// TODO: Restore when CRM components are migrated to design-system
// import {
//   PageHeader,
//   ProjectGrid,
//   ProjectList,
//   SearchAndFilter,
//   StatusBadge,
//   NoDataEmptyState,
//   NoResultsEmptyState,
//   type Project
// } from '@/components/crm';

// Temporary type definition
interface Project {
  id: string;
  projectName: string;
  client_name: string;
  status: string;
  totalAmount: number;
  total_collected: number;
  [key: string]: any;
}

// Hooks and utilities
import { useProjects } from '@modules/projects/hooks/useProjects';
import { formatCurrency } from '@/utils/formatters';
import { useProjectWizardModal } from '@/hooks/useProjectWizardModal';
import { ProjectWizardProvider } from '@modules/projects/contexts/ProjectWizardContext';

type ViewMode = 'grid' | 'list';

export function ProjectsPageCRM() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: [] as string[],
    type: '',
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc' as 'asc' | 'desc'
  });
  
  // Modal state management
  const {
    isOpen: isWizardOpen,
    openModal: openWizard,
    closeModal: closeWizard,
    setHasUnsavedChanges,
    setIsAutoSaving
  } = useProjectWizardModal({
    onProjectCreated: (projectId) => {
      // Refresh projects list
      refetch();
      // Optionally navigate to the new project
      // navigate(`/projects/${projectId}`);
    },
    onCancel: () => {
      // Modal closed, could add analytics or cleanup here
      console.log('Project creation cancelled');
    }
  });
  
  const { data: projects, isLoading, error, refetch } = useProjects();

  // Transform projects to match new component interface
  const transformedProjects: Project[] = useMemo(() => {
    if (!projects) return [];
    
    return projects.map(p => ({
      id: p.id,
      projectName: p.projectName || '',
      client_name: p.client_name || '',
      status: p.status || 'draft',
      totalAmount: p.totalAmount || 0,
      total_collected: p.total_collected || 0,
      projectType: p.projectType || 'other',
      created_at: p.created_at || new Date().toISOString()
    }));
  }, [projects]);

  // Filter and sort logic
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = transformedProjects.filter((project) => {
      // Search filter
      const matchesSearch = !searchTerm || 
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client_name.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter (multi-select)
      const matchesStatus = filters.status.length === 0 || 
        filters.status.includes(project.status);

      // Type filter
      const matchesType = !filters.type || 
        filters.type === 'all' || 
        project.projectType === filters.type;

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort projects
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortConfig.key) {
        case 'name':
          aValue = a.projectName;
          bValue = b.projectName;
          break;
        case 'client':
          aValue = a.client_name;
          bValue = b.client_name;
          break;
        case 'amount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'date':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transformedProjects, searchTerm, filters, sortConfig]);

  // Stats calculation - minimalist approach
  const stats = useMemo(() => {
    if (!transformedProjects.length) {
      return {
        total: 0,
        active: 0,
        completed: 0,
        totalValue: 0,
        averageValue: 0,
        collectionRate: 0
      };
    }
    
    const active = transformedProjects.filter(p => p.status === 'active').length;
    const completed = transformedProjects.filter(p => p.status === 'completed').length;
    const totalValue = transformedProjects.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalCollected = transformedProjects.reduce((sum, p) => sum + p.total_collected, 0);
    
    return {
      total: transformedProjects.length,
      active,
      completed,
      totalValue,
      averageValue: totalValue / transformedProjects.length,
      collectionRate: totalValue > 0 ? (totalCollected / totalValue) * 100 : 0
    };
  }, [transformedProjects]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({ status: [], type: '' });
  };

  // Active filters count
  const activeFiltersCount = 
    (searchTerm ? 1 : 0) +
    (filters.status.length > 0 ? 1 : 0) +
    (filters.type ? 1 : 0);

  if (error) {
    return (
      <PageLayout background="gray">
        <MainContentArea>
          <Section background="white" border="around" spacing="xl">
            <div className="text-center max-w-sm mx-auto">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
              <PageTitle level={3} size="md" className="mb-1">Error al cargar proyectos</PageTitle>
              <BodyText size="sm" className="mb-4">No pudimos cargar los datos. Por favor, intenta nuevamente.</BodyText>
              <button 
                onClick={() => refetch()} 
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </Section>
        </MainContentArea>
      </PageLayout>
    );
  }

  return (
    <PageLayout background="gray">
      {/* Stats Section */}
      <Section background="white" border="bottom" spacing="md">
        <MainContentArea padding="sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-gray-400" />
                <MutedText size="xs" weight="medium" className="uppercase tracking-wider">Total</MutedText>
              </div>
              <PageTitle level={2} size="lg" className="text-gray-900">{stats.total}</PageTitle>
              <MutedText size="xs" className="mt-1">proyectos</MutedText>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <MutedText size="xs" weight="medium" className="uppercase tracking-wider">Activos</MutedText>
              </div>
              <PageTitle level={2} size="lg" className="text-gray-600">{stats.active}</PageTitle>
              <MutedText size="xs" className="mt-1">en progreso</MutedText>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <MutedText size="xs" weight="medium" className="uppercase tracking-wider">Valor Total</MutedText>
              </div>
              <PageTitle level={2} size="lg" className="text-gray-900">{formatCurrency(stats.totalValue)}</PageTitle>
              <MutedText size="xs" className="mt-1">cobrado {Math.round(stats.collectionRate)}%</MutedText>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-gray-400" />
                <MutedText size="xs" weight="medium" className="uppercase tracking-wider">Completados</MutedText>
              </div>
              <PageTitle level={2} size="lg" className="text-gray-600">{stats.completed}</PageTitle>
              <MutedText size="xs" className="mt-1">finalizados</MutedText>
            </div>
          </div>
        </MainContentArea>
      </Section>

      <MainContentArea>
        <Section spacing="none">
          {/* Page Header */}
          <PageHeader
            title="Proyectos"
            subtitle={`Gestión de proyectos y seguimiento financiero`}
            primaryAction={{
              label: 'Nuevo Proyecto',
              icon: Plus,
              onClick: openWizard
            }}
            secondaryActions={[
              {
                label: 'Exportar',
                icon: Download,
                onClick: () => console.log('Export projects'),
                variant: 'secondary'
              }
            ]}
          />

        {/* Search and Filters - Ultra Minimalist */}
        <div className="mt-6 mb-8">
          <SearchAndFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar proyectos o clientes..."
            filters={[
              {
                key: 'status',
                label: 'Estado',
                type: 'multiselect',
                value: filters.status,
                options: [
                  { value: 'active', label: 'Activo', count: stats.active },
                  { value: 'completed', label: 'Completado', count: stats.completed },
                  { value: 'on_hold', label: 'En Pausa' },
                  { value: 'draft', label: 'Borrador' }
                ],
                placeholder: 'Filtrar por estado'
              },
              {
                key: 'type',
                label: 'Tipo',
                type: 'select',
                value: filters.type,
                options: [
                  { value: 'residential', label: 'Residencial' },
                  { value: 'commercial', label: 'Comercial' },
                  { value: 'construction', label: 'Construcción' },
                  { value: 'renovation', label: 'Renovación' },
                  { value: 'design', label: 'Diseño' }
                ],
                placeholder: 'Todos los tipos'
              }
            ]}
            onFiltersChange={setFilters}
            sortOptions={[
              { key: 'name', label: 'Nombre' },
              { key: 'client', label: 'Cliente' },
              { key: 'amount', label: 'Valor' },
              { key: 'status', label: 'Estado' },
              { key: 'date', label: 'Fecha' }
            ]}
            currentSort={sortConfig}
            onSortChange={setSortConfig}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* View Mode Toggle - Minimalist */}
        <div className="flex justify-end mb-6">
          <div className="inline-flex bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Lista
            </button>
          </div>
        </div>

          {/* Content Area */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <CardSkeleton key={i} variant="detailed" showHeader showActions />
              ))}
            </div>
        ) : filteredAndSortedProjects.length > 0 ? (
          viewMode === 'grid' ? (
            <ProjectGrid
              projects={filteredAndSortedProjects}
              onProjectClick={(project) => navigate(`/projects/${project.id}`)}
              variant="default"
            />
          ) : (
            <ProjectList
              projects={filteredAndSortedProjects}
              onProjectClick={(project) => navigate(`/projects/${project.id}`)}
            />
          )
          ) : transformedProjects.length === 0 ? (
            <Section background="white" border="around">
              <NoDataEmptyState
                icon={Building2}
                entityName="proyectos"
                onCreateNew={openWizard}
                createLabel="Crear Primer Proyecto"
                createIcon={Plus}
              />
            </Section>
          ) : (
            <Section background="white" border="around">
              <NoResultsEmptyState
                entityName="proyectos"
                searchTerm={searchTerm}
                onClearSearch={handleClearFilters}
                onCreateNew={openWizard}
              />
            </Section>
          )}
        </Section>
      </MainContentArea>

      {/* Project Creation Wizard Modal - Direct content without nesting */}
      <ProjectWizardProvider>
        {isWizardOpen && (
          <div className="fixed inset-0 bg-gray-50/90 backdrop-blur-sm z-50 transition-opacity duration-300">
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white border border-gray-200 rounded-lg w-[98vw] h-[95vh] flex flex-col transition-all duration-300 ease-out">
                {/* Close Button */}
                <button
                  onClick={closeWizard}
                  className="absolute top-6 right-6 z-10 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-300"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <ProjectWizardContent
                  onClose={closeWizard}
                  onFormDataChange={setHasUnsavedChanges}
                  onAutoSaveChange={setIsAutoSaving}
                  onProjectCreated={(projectId) => {
                    refetch();
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </ProjectWizardProvider>
    </PageLayout>
  );
}