import type { Meta, StoryObj } from '@storybook/react';
import ProjectCard from './ProjectCard';

const meta: Meta<typeof ProjectCard> = {
  title: 'Design System/Business/ProjectCard',
  component: ProjectCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Tarjeta de proyecto para mostrar información detallada del progreso, presupuesto, equipo y cronograma en el CRM de construcción.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['en-curso', 'completado', 'pausado', 'cancelado', 'planificacion'],
      description: 'Estado actual del proyecto',
    },
    priority: {
      control: 'select',
      options: ['baja', 'media', 'alta', 'critica'],
      description: 'Prioridad del proyecto',
    },
    type: {
      control: 'select',
      options: ['residencial', 'comercial', 'industrial', 'infraestructura'],
      description: 'Tipo de proyecto',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño del card',
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carga',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProjectCard>;

const baseProject = {
  id: 'proj-1',
  name: 'Residencial Los Pinos',
  description: 'Desarrollo habitacional de 50 casas en fraccionamiento premium con amenidades completas.',
  client: {
    id: 'client-1',
    name: 'Constructora Del Valle',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
  },
  status: 'en-curso' as const,
  progress: 65,
  budget: {
    total: 25000000,
    spent: 16250000,
    remaining: 8750000,
    currency: 'MXN' as const,
  },
  timeline: {
    startDate: '2024-01-15',
    endDate: '2024-08-30',
    estimatedDuration: 228,
  },
  location: {
    address: 'Fraccionamiento Los Pinos',
    city: 'Guadalajara',
    state: 'Jalisco',
  },
  type: 'residencial' as const,
  priority: 'alta' as const,
  team: [
    {
      id: 'team-1',
      name: 'Carlos Mendoza',
      role: 'Project Manager',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: 'team-2',
      name: 'Ana García',
      role: 'Arquitecta',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: 'team-3',
      name: 'Roberto López',
      role: 'Ingeniero Civil',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: 'team-4',
      name: 'María Torres',
      role: 'Supervisora de Obra',
    },
    {
      id: 'team-5',
      name: 'Luis Hernández',
      role: 'Maestro de Obra',
    },
  ],
  lastUpdate: '2024-01-10',
  alerts: [
    {
      type: 'cronograma' as const,
      message: 'Retraso en entrega de materiales',
      severity: 'warning' as const,
    },
  ],
};

export const Default: Story = {
  args: {
    ...baseProject,
    onViewDetails: (id) => console.log('Ver detalles del proyecto:', id),
    onEditProject: (id) => console.log('Editar proyecto:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onManageTeam: (id) => console.log('Gestionar equipo:', id),
  },
};

export const ProyectoCompletado: Story = {
  args: {
    ...baseProject,
    id: 'proj-2',
    name: 'Torre Corporativa Centro',
    description: 'Edificio de oficinas de 20 pisos con estacionamiento subterráneo y amenidades.',
    status: 'completado',
    progress: 100,
    budget: {
      total: 58000000,
      spent: 56500000,
      remaining: 1500000,
      currency: 'MXN',
    },
    timeline: {
      startDate: '2023-03-01',
      endDate: '2023-12-15',
      estimatedDuration: 289,
      actualDuration: 295,
    },
    type: 'comercial',
    priority: 'critica',
    alerts: [],
    lastUpdate: '2023-12-20',
    onViewDetails: (id) => console.log('Ver detalles del proyecto:', id),
    onEditProject: (id) => console.log('Editar proyecto:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onManageTeam: (id) => console.log('Gestionar equipo:', id),
  },
};

export const ProyectoPausado: Story = {
  args: {
    ...baseProject,
    id: 'proj-3',
    name: 'Planta Industrial Norte',
    description: 'Construcción de nave industrial para manufactura con oficinas administrativas.',
    status: 'pausado',
    progress: 35,
    budget: {
      total: 12000000,
      spent: 4200000,
      remaining: 7800000,
      currency: 'MXN',
    },
    type: 'industrial',
    priority: 'media',
    alerts: [
      {
        type: 'presupuesto',
        message: 'Incremento en costos de materiales',
        severity: 'warning',
      },
      {
        type: 'cronograma',
        message: 'Proyecto pausado por permisos pendientes',
        severity: 'error',
      },
    ],
    onViewDetails: (id) => console.log('Ver detalles del proyecto:', id),
    onEditProject: (id) => console.log('Editar proyecto:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onManageTeam: (id) => console.log('Gestionar equipo:', id),
  },
};

export const ProyectoEnPlanificacion: Story = {
  args: {
    ...baseProject,
    id: 'proj-4',
    name: 'Puente Vehicular Sur',
    description: 'Construcción de puente vehicular de 4 carriles con ciclovía incluida.',
    status: 'planificacion',
    progress: 0,
    budget: {
      total: 35000000,
      spent: 850000,
      remaining: 34150000,
      currency: 'MXN',
    },
    timeline: {
      startDate: '2024-04-01',
      endDate: '2025-06-30',
      estimatedDuration: 456,
    },
    type: 'infraestructura',
    priority: 'alta',
    team: [
      {
        id: 'team-6',
        name: 'Ing. Patricia Ruiz',
        role: 'Directora de Proyecto',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      },
      {
        id: 'team-7',
        name: 'Arq. Fernando Castro',
        role: 'Diseño Estructural',
      },
    ],
    alerts: [],
    onViewDetails: (id) => console.log('Ver detalles del proyecto:', id),
    onEditProject: (id) => console.log('Editar proyecto:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onManageTeam: (id) => console.log('Gestionar equipo:', id),
  },
};

export const ProyectoConAlertas: Story = {
  args: {
    ...baseProject,
    id: 'proj-5',
    name: 'Centro Comercial Oeste',
    description: 'Centro comercial de 3 niveles con tienda ancla y 120 locales comerciales.',
    status: 'en-curso',
    progress: 45,
    budget: {
      total: 42000000,
      spent: 41000000,
      remaining: 1000000,
      currency: 'MXN',
    },
    timeline: {
      startDate: '2023-09-01',
      endDate: '2024-02-28',
      estimatedDuration: 181,
    },
    type: 'comercial',
    priority: 'critica',
    alerts: [
      {
        type: 'presupuesto',
        message: 'Presupuesto casi agotado',
        severity: 'error',
      },
      {
        type: 'cronograma',
        message: 'Posible retraso por clima',
        severity: 'warning',
      },
      {
        type: 'seguridad',
        message: 'Incidente menor reportado',
        severity: 'warning',
      },
    ],
    onViewDetails: (id) => console.log('Ver detalles del proyecto:', id),
    onEditProject: (id) => console.log('Editar proyecto:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onManageTeam: (id) => console.log('Gestionar equipo:', id),
  },
};

export const ProyectoSinEquipo: Story = {
  args: {
    ...baseProject,
    id: 'proj-6',
    name: 'Casa Unifamiliar Premium',
    description: 'Casa de lujo de 300m² con jardín, piscina y acabados premium.',
    client: {
      id: 'client-2',
      name: 'María González',
    },
    status: 'planificacion',
    progress: 5,
    budget: {
      total: 3500000,
      spent: 175000,
      remaining: 3325000,
      currency: 'MXN',
    },
    type: 'residencial',
    priority: 'baja',
    team: [],
    alerts: [],
    onViewDetails: (id) => console.log('Ver detalles del proyecto:', id),
    onEditProject: (id) => console.log('Editar proyecto:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onManageTeam: (id) => console.log('Gestionar equipo:', id),
  },
};

export const TamañoPequeño: Story = {
  args: {
    ...baseProject,
    size: 'sm',
    onViewDetails: (id) => console.log('Ver detalles del proyecto:', id),
    onEditProject: (id) => console.log('Editar proyecto:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onManageTeam: (id) => console.log('Gestionar equipo:', id),
  },
};

export const TamañoGrande: Story = {
  args: {
    ...baseProject,
    size: 'lg',
    onViewDetails: (id) => console.log('Ver detalles del proyecto:', id),
    onEditProject: (id) => console.log('Editar proyecto:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onManageTeam: (id) => console.log('Gestionar equipo:', id),
  },
};

export const EstadoCarga: Story = {
  args: {
    ...baseProject,
    loading: true,
  },
};

export const SinAcciones: Story = {
  args: {
    ...baseProject,
    // No se pasan los callbacks de acción
  },
};

// Story para mostrar múltiples tarjetas en un grid
export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProjectCard
        {...baseProject}
        onViewDetails={(id) => console.log('Ver detalles del proyecto:', id)}
        onEditProject={(id) => console.log('Editar proyecto:', id)}
        onViewClient={(id) => console.log('Ver cliente:', id)}
        onManageTeam={(id) => console.log('Gestionar equipo:', id)}
      />
      <ProjectCard
        {...baseProject}
        id="proj-2"
        name="Torre Corporativa Centro"
        status="completado"
        progress={100}
        budget={{
          total: 58000000,
          spent: 56500000,
          remaining: 1500000,
          currency: 'MXN',
        }}
        type="comercial"
        priority="critica"
        alerts={[]}
        onViewDetails={(id) => console.log('Ver detalles del proyecto:', id)}
        onEditProject={(id) => console.log('Editar proyecto:', id)}
        onViewClient={(id) => console.log('Ver cliente:', id)}
        onManageTeam={(id) => console.log('Gestionar equipo:', id)}
      />
      <ProjectCard
        {...baseProject}
        id="proj-3"
        name="Planta Industrial Norte"
        status="pausado"
        progress={35}
        type="industrial"
        priority="media"
        alerts={[
          {
            type: 'cronograma',
            message: 'Proyecto pausado por permisos',
            severity: 'error',
          },
        ]}
        onViewDetails={(id) => console.log('Ver detalles del proyecto:', id)}
        onEditProject={(id) => console.log('Editar proyecto:', id)}
        onViewClient={(id) => console.log('Ver cliente:', id)}
        onManageTeam={(id) => console.log('Gestionar equipo:', id)}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo de múltiples tarjetas de proyecto en un layout de grid responsive mostrando diferentes estados.',
      },
    },
  },
};