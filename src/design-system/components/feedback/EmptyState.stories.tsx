import type { Meta, StoryObj } from '@storybook/react';
import { 
  Plus, 
  RefreshCw, 
  Settings, 
  Filter, 
  Upload, 
  Search,
  Users,
  Calendar,
  FileText
} from 'lucide-react';
import EmptyState from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Design System/Feedback/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Componente para mostrar estados vacíos con diferentes variantes según el contexto y acciones sugeridas.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'no-data',
        'no-results', 
        'no-access',
        'error',
        'offline',
        'loading-error',
        'no-clients',
        'no-projects',
        'no-invoices',
        'no-tasks',
        'no-appointments',
        'no-notifications',
        'empty-folder',
        'no-search-results',
        'filtered-empty'
      ],
      description: 'Tipo de estado vacío',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño del componente',
    },
    design: {
      control: 'select',
      options: ['default', 'minimal', 'card'],
      description: 'Variante de diseño',
    },
    animated: {
      control: 'boolean',
      description: 'Mostrar animación de entrada',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NoClients: Story = {
  args: {
    variant: 'no-clients',
    size: 'md',
    design: 'default',
    animated: true,
    actions: {
      primary: {
        label: 'Agregar primer cliente',
        icon: <Plus className="w-4 h-4" />,
        onClick: () => console.log('Agregar cliente'),
      },
      secondary: {
        label: 'Importar clientes',
        icon: <Upload className="w-4 h-4" />,
        onClick: () => console.log('Importar clientes'),
      },
    },
    tips: [
      'Puedes importar clientes desde un archivo Excel o CSV',
      'Los datos del cliente incluyen información de contacto y facturación',
      'Cada cliente puede tener múltiples proyectos asociados',
    ],
  },
};

export const NoProjects: Story = {
  args: {
    variant: 'no-projects',
    size: 'md',
    design: 'default',
    actions: {
      primary: {
        label: 'Crear primer proyecto',
        icon: <Plus className="w-4 h-4" />,
        onClick: () => console.log('Crear proyecto'),
      },
      secondary: {
        label: 'Ver plantillas',
        icon: <FileText className="w-4 h-4" />,
        onClick: () => console.log('Ver plantillas'),
      },
    },
    tips: [
      'Los proyectos te ayudan a organizar tu trabajo por cliente',
      'Puedes asignar tareas y hacer seguimiento del progreso',
      'Cada proyecto puede generar múltiples facturas',
    ],
  },
};

export const NoInvoices: Story = {
  args: {
    variant: 'no-invoices',
    size: 'md',
    design: 'default',
    actions: {
      primary: {
        label: 'Crear primera factura',
        icon: <Plus className="w-4 h-4" />,
        onClick: () => console.log('Crear factura'),
      },
    },
    tips: [
      'Las facturas se generan automáticamente en formato PDF',
      'Puedes personalizar la plantilla con tu logo y datos',
      'Se envían por correo electrónico automáticamente al cliente',
    ],
  },
};

export const NoSearchResults: Story = {
  args: {
    variant: 'no-search-results',
    title: 'No encontramos "diseño web"',
    description: 'No hay proyectos que coincidan con tu búsqueda.',
    size: 'md',
    design: 'default',
    actions: {
      secondary: {
        label: 'Limpiar búsqueda',
        icon: <RefreshCw className="w-4 h-4" />,
        onClick: () => console.log('Limpiar búsqueda'),
      },
      tertiary: {
        label: 'Buscar en archivados',
        icon: <Search className="w-4 h-4" />,
        onClick: () => console.log('Buscar en archivados'),
      },
    },
    tips: [
      'Verifica la ortografía de los términos de búsqueda',
      'Usa palabras más generales para ampliar los resultados',
      'Puedes buscar por cliente, estado o fecha de creación',
    ],
  },
};

export const FilteredEmpty: Story = {
  args: {
    variant: 'filtered-empty',
    size: 'md',
    design: 'default',
    actions: {
      primary: {
        label: 'Quitar filtros',
        icon: <RefreshCw className="w-4 h-4" />,
        onClick: () => console.log('Quitar filtros'),
      },
      secondary: {
        label: 'Ajustar filtros',
        icon: <Filter className="w-4 h-4" />,
        onClick: () => console.log('Ajustar filtros'),
      },
    },
  },
};

export const ErrorState: Story = {
  args: {
    variant: 'error',
    size: 'md',
    design: 'default',
    actions: {
      primary: {
        label: 'Reintentar',
        icon: <RefreshCw className="w-4 h-4" />,
        onClick: () => console.log('Reintentar'),
      },
      secondary: {
        label: 'Reportar problema',
        onClick: () => console.log('Reportar problema'),
      },
    },
  },
};

export const OfflineState: Story = {
  args: {
    variant: 'offline',
    size: 'md',
    design: 'default',
    actions: {
      primary: {
        label: 'Verificar conexión',
        icon: <RefreshCw className="w-4 h-4" />,
        onClick: () => console.log('Verificar conexión'),
      },
    },
    tips: [
      'Verifica que tu dispositivo esté conectado a internet',
      'Algunos datos se guardan localmente y estarán disponibles cuando recuperes la conexión',
    ],
  },
};

export const NoAccess: Story = {
  args: {
    variant: 'no-access',
    size: 'md',
    design: 'default',
    actions: {
      primary: {
        label: 'Solicitar acceso',
        onClick: () => console.log('Solicitar acceso'),
      },
      secondary: {
        label: 'Contactar administrador',
        onClick: () => console.log('Contactar administrador'),
      },
    },
  },
};

export const NoTasks: Story = {
  args: {
    variant: 'no-tasks',
    size: 'md',
    design: 'default',
    actions: {
      primary: {
        label: 'Crear nueva tarea',
        icon: <Plus className="w-4 h-4" />,
        onClick: () => console.log('Crear tarea'),
      },
      secondary: {
        label: 'Ver calendario',
        icon: <Calendar className="w-4 h-4" />,
        onClick: () => console.log('Ver calendario'),
      },
    },
  },
};

export const NoNotifications: Story = {
  args: {
    variant: 'no-notifications',
    size: 'md',
    design: 'default',
    actions: {
      secondary: {
        label: 'Configurar notificaciones',
        icon: <Settings className="w-4 h-4" />,
        onClick: () => console.log('Configurar notificaciones'),
      },
    },
  },
};

export const EmptyFolder: Story = {
  args: {
    variant: 'empty-folder',
    size: 'md',
    design: 'default',
    actions: {
      primary: {
        label: 'Subir archivos',
        icon: <Upload className="w-4 h-4" />,
        onClick: () => console.log('Subir archivos'),
      },
    },
    tips: [
      'Arrastra archivos aquí para subirlos rápidamente',
      'Formatos soportados: PDF, DOC, DOCX, XLS, XLSX, IMG',
      'Tamaño máximo por archivo: 10 MB',
    ],
  },
};

export const MinimalDesign: Story = {
  args: {
    variant: 'no-data',
    title: 'Sin datos',
    description: 'No hay información para mostrar en este momento.',
    size: 'sm',
    design: 'minimal',
    animated: true,
  },
};

export const CardDesign: Story = {
  args: {
    variant: 'no-clients',
    size: 'md',
    design: 'card',
    animated: true,
    actions: {
      primary: {
        label: 'Agregar primer cliente',
        icon: <Plus className="w-4 h-4" />,
        onClick: () => console.log('Agregar cliente'),
      },
    },
  },
};

export const LoadingError: Story = {
  args: {
    variant: 'loading-error',
    size: 'md',
    design: 'default',
    actions: {
      primary: {
        label: 'Recargar página',
        icon: <RefreshCw className="w-4 h-4" />,
        loading: false,
        onClick: () => console.log('Recargar página'),
      },
      secondary: {
        label: 'Ir al inicio',
        onClick: () => console.log('Ir al inicio'),
      },
    },
  },
};

export const CustomContent: Story = {
  args: {
    variant: 'no-data',
    title: 'Área de trabajo personalizada',
    description: 'Configura tu espacio de trabajo para comenzar a ser más productivo.',
    illustration: (
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center">
        <Settings className="w-12 h-12 text-white" />
      </div>
    ),
    size: 'lg',
    design: 'default',
    actions: {
      primary: {
        label: 'Personalizar ahora',
        icon: <Settings className="w-4 h-4" />,
        onClick: () => console.log('Personalizar workspace'),
      },
    },
    tips: [
      'Puedes cambiar el tema entre claro y oscuro',
      'Organiza tus widgets según tu flujo de trabajo',
      'Configura notificaciones para mantenerte al día',
    ],
  },
};