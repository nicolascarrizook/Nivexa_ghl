import type { Meta, StoryObj } from '@storybook/react';
import TaskList from './TaskList';

const meta: Meta<typeof TaskList> = {
  title: 'Design System/Business/TaskList',
  component: TaskList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Lista de tareas para gestión de proyectos de construcción con filtros, búsqueda, comentarios y seguimiento de progreso.',
      },
    },
  },
  argTypes: {
    showFilters: {
      control: 'boolean',
      description: 'Mostrar filtros de estado y prioridad',
    },
    showSearch: {
      control: 'boolean',
      description: 'Mostrar buscador de tareas',
    },
    groupByCategory: {
      control: 'boolean',
      description: 'Agrupar tareas por categoría',
    },
    showStats: {
      control: 'boolean',
      description: 'Mostrar estadísticas de tareas',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño del componente',
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carga',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TaskList>;

const sampleTasks = [
  {
    id: 'task-1',
    title: 'Revisión de planos estructurales',
    description: 'Revisar y aprobar los planos estructurales del edificio principal antes de iniciar la construcción.',
    status: 'en-progreso' as const,
    priority: 'alta' as const,
    assignee: {
      id: 'user-1',
      name: 'Ing. Carlos Mendoza',
      role: 'Ingeniero Estructural',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    dueDate: '2024-01-20',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
    comments: [
      {
        id: 'comment-1',
        author: {
          id: 'user-2',
          name: 'Arq. Ana García',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        },
        content: 'Los planos se ven bien, solo necesito que revises la sección de cimentación.',
        createdAt: '2024-01-14',
      },
      {
        id: 'comment-2',
        author: {
          id: 'user-1',
          name: 'Ing. Carlos Mendoza',
        },
        content: 'Perfecto, ya revisé la cimentación. Todo está en orden.',
        createdAt: '2024-01-15',
      },
    ],
    project: {
      id: 'proj-1',
      name: 'Residencial Los Pinos',
    },
    tags: ['estructural', 'critico', 'aprobaciones'],
    estimatedHours: 8,
    actualHours: 5,
    category: 'diseno' as const,
  },
  {
    id: 'task-2',
    title: 'Solicitar permisos de construcción',
    description: 'Tramitar todos los permisos necesarios ante las autoridades municipales para iniciar la construcción.',
    status: 'pendiente' as const,
    priority: 'critica' as const,
    assignee: {
      id: 'user-3',
      name: 'Lic. Roberto López',
      role: 'Gestor de Permisos',
    },
    dueDate: '2024-01-18',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08',
    comments: [],
    project: {
      id: 'proj-1',
      name: 'Residencial Los Pinos',
    },
    tags: ['legal', 'gobierno', 'requisito'],
    estimatedHours: 16,
    category: 'permisos' as const,
  },
  {
    id: 'task-3',
    title: 'Cotización de materiales',
    description: 'Obtener cotizaciones de al menos 3 proveedores para materiales de construcción básicos.',
    status: 'completada' as const,
    priority: 'media' as const,
    assignee: {
      id: 'user-4',
      name: 'María Torres',
      role: 'Coordinadora de Compras',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    },
    dueDate: '2024-01-12',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-11',
    comments: [
      {
        id: 'comment-3',
        author: {
          id: 'user-4',
          name: 'María Torres',
        },
        content: 'Ya tengo las 3 cotizaciones. El proveedor A ofrece el mejor precio.',
        createdAt: '2024-01-11',
      },
    ],
    project: {
      id: 'proj-1',
      name: 'Residencial Los Pinos',
    },
    tags: ['compras', 'proveedores', 'presupuesto'],
    estimatedHours: 6,
    actualHours: 4,
    category: 'materiales' as const,
  },
  {
    id: 'task-4',
    title: 'Inspección de seguridad semanal',
    description: 'Realizar inspección semanal de seguridad en todas las áreas de trabajo activas.',
    status: 'pendiente' as const,
    priority: 'alta' as const,
    assignee: {
      id: 'user-5',
      name: 'Ing. Luis Hernández',
      role: 'Supervisor de Seguridad',
    },
    dueDate: '2024-01-16',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
    comments: [],
    project: {
      id: 'proj-1',
      name: 'Residencial Los Pinos',
    },
    tags: ['seguridad', 'semanal', 'inspeccion'],
    estimatedHours: 3,
    category: 'inspeccion' as const,
  },
  {
    id: 'task-5',
    title: 'Preparar reporte mensual',
    description: 'Compilar reporte mensual de avance del proyecto incluyendo costos, cronograma y recursos.',
    status: 'en-progreso' as const,
    priority: 'baja' as const,
    assignee: {
      id: 'user-6',
      name: 'Lic. Patricia Ruiz',
      role: 'Project Manager',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    },
    dueDate: '2024-01-25',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-14',
    comments: [
      {
        id: 'comment-4',
        author: {
          id: 'user-6',
          name: 'Lic. Patricia Ruiz',
        },
        content: 'Ya tengo la información de costos, falta el reporte de cronograma.',
        createdAt: '2024-01-14',
      },
    ],
    project: {
      id: 'proj-1',
      name: 'Residencial Los Pinos',
    },
    tags: ['reporte', 'mensual', 'seguimiento'],
    estimatedHours: 4,
    actualHours: 2,
    category: 'administrativo' as const,
  },
  {
    id: 'task-6',
    title: 'Excavación para cimentación',
    description: 'Iniciar excavación para la cimentación del edificio principal según especificaciones del proyecto.',
    status: 'cancelada' as const,
    priority: 'alta' as const,
    assignee: {
      id: 'user-7',
      name: 'Maestro José Ramírez',
      role: 'Supervisor de Obra',
    },
    dueDate: '2024-01-10',
    createdAt: '2024-01-02',
    updatedAt: '2024-01-09',
    comments: [
      {
        id: 'comment-5',
        author: {
          id: 'user-7',
          name: 'Maestro José Ramírez',
        },
        content: 'Tarea cancelada por falta de permisos. Se reanudará cuando estén listos.',
        createdAt: '2024-01-09',
      },
    ],
    project: {
      id: 'proj-1',
      name: 'Residencial Los Pinos',
    },
    tags: ['excavacion', 'cimentacion', 'obra'],
    estimatedHours: 24,
    category: 'construccion' as const,
  },
];

export const Default: Story = {
  args: {
    tasks: sampleTasks,
    title: 'Tareas del Proyecto',
    showFilters: true,
    showSearch: true,
    groupByCategory: false,
    showStats: true,
    onTaskStatusChange: (taskId, newStatus) => console.log('Cambiar estado de tarea:', taskId, 'a', newStatus),
    onEditTask: (taskId) => console.log('Editar tarea:', taskId),
    onDeleteTask: (taskId) => console.log('Eliminar tarea:', taskId),
    onAddComment: (taskId, comment) => console.log('Agregar comentario a tarea:', taskId, comment),
    onViewTask: (taskId) => console.log('Ver detalles de tarea:', taskId),
    onCreateTask: () => console.log('Crear nueva tarea'),
    onViewAssignee: (assigneeId) => console.log('Ver asignado:', assigneeId),
  },
};

export const AgrupadoPorCategoria: Story = {
  args: {
    ...Default.args,
    groupByCategory: true,
    title: 'Tareas por Categoría',
  },
};

export const SinFiltros: Story = {
  args: {
    ...Default.args,
    showFilters: false,
    showSearch: false,
    title: 'Lista Simple de Tareas',
  },
};

export const SinEstadisticas: Story = {
  args: {
    ...Default.args,
    showStats: false,
    title: 'Tareas sin Estadísticas',
  },
};

export const TareasVencidas: Story = {
  args: {
    tasks: sampleTasks.map(task => ({
      ...task,
      dueDate: task.status !== 'completada' ? '2024-01-10' : task.dueDate,
    })),
    title: 'Tareas con Vencimientos',
    showFilters: true,
    showSearch: true,
    groupByCategory: false,
    showStats: true,
    onTaskStatusChange: (taskId, newStatus) => console.log('Cambiar estado de tarea:', taskId, 'a', newStatus),
    onEditTask: (taskId) => console.log('Editar tarea:', taskId),
    onViewTask: (taskId) => console.log('Ver detalles de tarea:', taskId),
    onCreateTask: () => console.log('Crear nueva tarea'),
    onViewAssignee: (assigneeId) => console.log('Ver asignado:', assigneeId),
  },
};

export const TareasCompletadas: Story = {
  args: {
    tasks: sampleTasks.filter(task => task.status === 'completada'),
    title: 'Tareas Completadas',
    showFilters: false,
    showSearch: true,
    groupByCategory: false,
    showStats: false,
    onTaskStatusChange: (taskId, newStatus) => console.log('Cambiar estado de tarea:', taskId, 'a', newStatus),
    onViewTask: (taskId) => console.log('Ver detalles de tarea:', taskId),
    onViewAssignee: (assigneeId) => console.log('Ver asignado:', assigneeId),
  },
};

export const ListaVacia: Story = {
  args: {
    tasks: [],
    title: 'Sin Tareas',
    showFilters: true,
    showSearch: true,
    groupByCategory: false,
    showStats: true,
    onCreateTask: () => console.log('Crear primera tarea'),
  },
};

export const TamañoPequeño: Story = {
  args: {
    ...Default.args,
    size: 'sm',
    title: 'Tareas Compactas',
  },
};

export const TamañoGrande: Story = {
  args: {
    ...Default.args,
    size: 'lg',
    title: 'Tareas Expandidas',
  },
};

export const EstadoCarga: Story = {
  args: {
    tasks: [],
    loading: true,
    title: 'Cargando Tareas',
  },
};

export const SinAcciones: Story = {
  args: {
    tasks: sampleTasks,
    title: 'Tareas Solo Lectura',
    showFilters: true,
    showSearch: true,
    groupByCategory: false,
    showStats: true,
    // No se pasan los callbacks de acción
  },
};

export const TareasUrgentes: Story = {
  args: {
    tasks: sampleTasks.filter(task => task.priority === 'alta' || task.priority === 'critica'),
    title: 'Tareas Urgentes',
    showFilters: false,
    showSearch: false,
    groupByCategory: false,
    showStats: false,
    onTaskStatusChange: (taskId, newStatus) => console.log('Cambiar estado de tarea:', taskId, 'a', newStatus),
    onEditTask: (taskId) => console.log('Editar tarea:', taskId),
    onViewTask: (taskId) => console.log('Ver detalles de tarea:', taskId),
    onViewAssignee: (assigneeId) => console.log('Ver asignado:', assigneeId),
  },
};

// Story para mostrar en un layout de dashboard
export const Dashboard: Story = {
  render: () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <TaskList
          {...Default.args!}
          title="Tareas Activas"
          tasks={sampleTasks.filter(task => task.status !== 'completada' && task.status !== 'cancelada')}
          showStats={false}
        />
      </div>
      <div>
        <TaskList
          {...Default.args!}
          title="Tareas Urgentes"
          tasks={sampleTasks.filter(task => task.priority === 'alta' || task.priority === 'critica')}
          showFilters={false}
          showSearch={false}
          showStats={false}
          size="sm"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo de uso en un dashboard con múltiples listas de tareas organizadas por importancia.',
      },
    },
  },
};