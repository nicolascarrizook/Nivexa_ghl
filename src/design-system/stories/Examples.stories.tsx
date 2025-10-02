import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

// Import all components
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionCard } from '../components/layout/SectionCard';
import { QuickActions } from '../components/layout/QuickActions';
import StatCard from '../components/data-display/StatCard';
import DataTable from '../components/data-display/DataTable';
import MetricGrid from '../components/data-display/MetricGrid';
import ActivityFeed from '../components/data-display/ActivityFeed';
import { ClientCard } from '../components/business/ClientCard';
import { ProjectCard } from '../components/business/ProjectCard';
import { TaskList } from '../components/business/TaskList';
import { FilterBar } from '../components/inputs/FilterBar';
import { StatusIndicator } from '../components/feedback/StatusIndicator';
import { EmptyState } from '../components/feedback/EmptyState';

// Icons
import { Users, DollarSign, TrendingUp, Building2, Plus, Filter, Search } from 'lucide-react';

const meta = {
  title: 'Examples/Complete Dashboard',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const metrics = [
  {
    id: '1',
    title: 'Clientes Activos',
    value: '1,234',
    icon: Users,
    change: { value: 12.5, period: 'vs mes anterior' },
    trend: 'up' as const,
    variant: 'default' as const,
  },
  {
    id: '2',
    title: 'Ingresos Mensuales',
    value: '$4.5M',
    icon: DollarSign,
    change: { value: 8.2, period: 'vs mes anterior' },
    trend: 'up' as const,
    variant: 'success' as const,
  },
  {
    id: '3',
    title: 'Proyectos Activos',
    value: '47',
    icon: Building2,
    change: { value: -2.1, period: 'vs mes anterior' },
    trend: 'down' as const,
    variant: 'warning' as const,
  },
  {
    id: '4',
    title: 'Tasa de Conversión',
    value: '24.8%',
    icon: TrendingUp,
    change: { value: 5.3, period: 'vs mes anterior' },
    trend: 'up' as const,
    variant: 'info' as const,
  },
];

const activities = [
  {
    id: '1',
    type: 'contact' as const,
    title: 'Nuevo cliente agregado',
    description: 'Juan Pérez - Constructora ABC',
    user: { name: 'María García', avatar: 'MG' },
    timestamp: 'Hace 5 minutos',
    onClick: () => console.log('Ver cliente'),
  },
  {
    id: '2',
    type: 'deal' as const,
    title: 'Proyecto cerrado',
    description: 'Torre Residencial Norte - $2.5M',
    user: { name: 'Carlos López', avatar: 'CL' },
    timestamp: 'Hace 2 horas',
  },
  {
    id: '3',
    type: 'task' as const,
    title: 'Tarea completada',
    description: 'Revisión de planos - Proyecto Sur',
    user: { name: 'Ana Martínez', avatar: 'AM' },
    timestamp: 'Hace 4 horas',
  },
];

const tasks = [
  {
    id: '1',
    title: 'Revisar propuesta de diseño',
    description: 'Proyecto Torre Residencial Norte',
    priority: 'high' as const,
    status: 'pending' as const,
    assignee: { name: 'María García', avatar: 'MG' },
    dueDate: '2024-03-15',
    category: 'design' as const,
    comments: 3,
  },
  {
    id: '2',
    title: 'Aprobar presupuesto de materiales',
    description: 'Complejo Comercial Sur',
    priority: 'critical' as const,
    status: 'in_progress' as const,
    assignee: { name: 'Carlos López', avatar: 'CL' },
    dueDate: '2024-03-10',
    category: 'materials' as const,
    comments: 5,
  },
];

const projects = [
  {
    id: '1',
    name: 'Torre Residencial Norte',
    client: 'Constructora ABC',
    type: 'residential' as const,
    status: 'in_progress' as const,
    progress: 65,
    budget: { total: 2500000, spent: 1625000, currency: 'MXN' as const },
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    team: [
      { name: 'María García', role: 'Arquitecta', avatar: 'MG' },
      { name: 'Carlos López', role: 'Ingeniero', avatar: 'CL' },
    ],
  },
  {
    id: '2',
    name: 'Complejo Comercial Sur',
    client: 'Inversiones XYZ',
    type: 'commercial' as const,
    status: 'planning' as const,
    progress: 15,
    budget: { total: 5000000, spent: 750000, currency: 'MXN' as const },
    startDate: '2024-04-01',
    endDate: '2024-12-31',
    team: [
      { name: 'Ana Martínez', role: 'Directora', avatar: 'AM' },
    ],
  },
];

const clients = [
  {
    id: '1',
    name: 'Juan Pérez',
    company: 'Constructora ABC',
    email: 'juan@constructora-abc.com',
    phone: '+52 55 1234 5678',
    whatsapp: true,
    status: 'active' as const,
    totalProjects: 12,
    totalRevenue: 15500000,
    rfc: 'CABC123456789',
    lastContact: '2024-03-01',
    tags: ['Premium', 'Recurrente'],
  },
  {
    id: '2',
    name: 'María González',
    company: 'Inversiones XYZ',
    email: 'maria@inversiones-xyz.com',
    phone: '+52 55 9876 5432',
    whatsapp: false,
    status: 'prospect' as const,
    totalProjects: 0,
    totalRevenue: 0,
    rfc: 'IXYZ987654321',
    tags: ['Nuevo'],
  },
];

const tableColumns = [
  {
    key: 'client',
    header: 'Cliente',
    sortable: true,
  },
  {
    key: 'project',
    header: 'Proyecto',
    sortable: true,
  },
  {
    key: 'status',
    header: 'Estado',
    sortable: true,
  },
  {
    key: 'progress',
    header: 'Progreso',
  },
  {
    key: 'amount',
    header: 'Monto',
    sortable: true,
    align: 'right' as const,
  },
];

const tableData = [
  {
    id: '1',
    client: 'Constructora ABC',
    project: 'Torre Residencial Norte',
    status: 'En progreso',
    progress: '65%',
    amount: '$2,500,000',
  },
  {
    id: '2',
    client: 'Inversiones XYZ',
    project: 'Complejo Comercial Sur',
    status: 'Planificación',
    progress: '15%',
    amount: '$5,000,000',
  },
  {
    id: '3',
    client: 'Grupo Inmobiliario',
    project: 'Plaza Central',
    status: 'Completado',
    progress: '100%',
    amount: '$3,200,000',
  },
];

// Dashboard Component
function CompleteDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showDetails, setShowDetails] = useState(false);

  return (
    <DashboardLayout
      user={{
        name: 'Ana García',
        email: 'ana@nivexa.com',
        avatar: 'AG',
      }}
      notifications={[
        {
          id: '1',
          title: 'Nuevo cliente registrado',
          description: 'Juan Pérez se ha registrado',
          type: 'info',
          timestamp: 'Hace 5 minutos',
          unread: true,
        },
      ]}
    >
      <PageContainer
        title="Dashboard CRM"
        subtitle="Vista general del sistema"
        tabs={[
          { id: 'overview', label: 'General', count: 4 },
          { id: 'projects', label: 'Proyectos', count: 47 },
          { id: 'clients', label: 'Clientes', count: 1234 },
          { id: 'tasks', label: 'Tareas', count: 23 },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        actions={[
          {
            id: 'create',
            label: 'Nuevo Proyecto',
            icon: <Plus className="w-4 h-4" />,
            onClick: () => console.log('Crear proyecto'),
            variant: 'primary',
          },
        ]}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Grid */}
            <MetricGrid metrics={metrics} columns={4} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity Feed */}
              <div className="lg:col-span-2 space-y-6">
                <SectionCard
                  title="Proyectos Recientes"
                  description="Últimos proyectos actualizados"
                  action={{
                    label: 'Ver todos',
                    onClick: () => setActiveTab('projects'),
                  }}
                >
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <ProjectCard key={project.id} {...project} />
                    ))}
                  </div>
                </SectionCard>

                <SectionCard
                  title="Resumen de Actividades"
                  badge="12"
                  badgeVariant="info"
                >
                  <DataTable
                    data={tableData}
                    columns={tableColumns}
                    pageSize={5}
                  />
                </SectionCard>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <SectionCard title="Actividad Reciente">
                  <ActivityFeed activities={activities} />
                </SectionCard>

                <SectionCard
                  title="Tareas Pendientes"
                  badge="Urgente"
                  badgeVariant="error"
                >
                  <TaskList
                    tasks={tasks}
                    onTaskToggle={(id) => console.log('Toggle:', id)}
                    onTaskClick={(task) => console.log('Click:', task)}
                  />
                </SectionCard>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <FilterBar
              filters={[
                {
                  id: 'status',
                  type: 'select',
                  label: 'Estado',
                  options: [
                    { value: 'all', label: 'Todos' },
                    { value: 'in_progress', label: 'En progreso' },
                    { value: 'completed', label: 'Completados' },
                  ],
                },
                {
                  id: 'type',
                  type: 'select',
                  label: 'Tipo',
                  options: [
                    { value: 'all', label: 'Todos' },
                    { value: 'residential', label: 'Residencial' },
                    { value: 'commercial', label: 'Comercial' },
                  ],
                },
              ]}
              onChange={(filters) => console.log('Filtros:', filters)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-6">
            <FilterBar
              filters={[
                {
                  id: 'search',
                  type: 'text',
                  label: 'Buscar',
                  placeholder: 'Nombre o empresa...',
                },
                {
                  id: 'status',
                  type: 'select',
                  label: 'Estado',
                  options: [
                    { value: 'all', label: 'Todos' },
                    { value: 'active', label: 'Activos' },
                    { value: 'prospect', label: 'Prospectos' },
                  ],
                },
              ]}
              onChange={(filters) => console.log('Filtros:', filters)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <ClientCard 
                  key={client.id} 
                  {...client}
                  onCall={() => console.log('Llamar:', client.name)}
                  onEmail={() => console.log('Email:', client.name)}
                  onViewDetails={() => setShowDetails(true)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <SectionCard
            title="Lista de Tareas"
            description="Gestiona todas las tareas pendientes"
          >
            {tasks.length > 0 ? (
              <TaskList
                tasks={tasks}
                onTaskToggle={(id) => console.log('Toggle:', id)}
                onTaskClick={(task) => console.log('Click:', task)}
                searchable
                showFilters
                showStatistics
              />
            ) : (
              <EmptyState
                type="no-tasks"
                title="No hay tareas pendientes"
                description="¡Excelente! Has completado todas tus tareas"
                action={{
                  label: 'Crear nueva tarea',
                  onClick: () => console.log('Crear tarea'),
                }}
              />
            )}
          </SectionCard>
        )}
      </PageContainer>

      <QuickActions
        actions={[
          {
            id: 'create-project',
            label: 'Nuevo Proyecto',
            icon: <Building2 className="w-5 h-5" />,
            onClick: () => console.log('Nuevo proyecto'),
            shortcut: 'Cmd+P',
          },
          {
            id: 'add-client',
            label: 'Agregar Cliente',
            icon: <Users className="w-5 h-5" />,
            onClick: () => console.log('Agregar cliente'),
            shortcut: 'Cmd+C',
          },
        ]}
        primaryAction={{
          icon: <Plus className="w-6 h-6" />,
          label: 'Crear',
          onClick: () => console.log('Acción principal'),
        }}
      />
    </DashboardLayout>
  );
}

export const Default: Story = {
  render: () => <CompleteDashboard />,
};