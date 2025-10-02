import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Eye, Edit, Download, Copy, MessageSquare, Calendar, Mail } from 'lucide-react';
import ActivityFeed, { type ActivityItem } from './ActivityFeed/ActivityFeed';

const meta = {
  title: 'Design System/Data Display/ActivityFeed',
  component: ActivityFeed,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Feed de actividad en tiempo real para mostrar acciones recientes en el CRM con avatares, timestamps y acciones.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño del componente',
    },
    showAvatars: {
      control: 'boolean',
      description: 'Mostrar avatares de usuario',
    },
    showRelativeTime: {
      control: 'boolean',
      description: 'Mostrar tiempo relativo',
    },
    groupByDate: {
      control: 'boolean',
      description: 'Agrupar por fecha',
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carga',
    },
    hasMore: {
      control: 'boolean',
      description: 'Hay más elementos para cargar',
    },
  },
} satisfies Meta<typeof ActivityFeed>;

export default meta;
type Story = StoryObj<typeof meta>;

// Datos de ejemplo
const sampleActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'contact',
    title: 'Nuevo cliente registrado',
    description: 'Juan Pérez se ha registrado como cliente potencial desde el formulario web',
    user: {
      name: 'Sistema Automático',
      initials: 'SA',
    },
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // Hace 5 minutos
    status: 'completed',
    metadata: {
      client: 'Tech Solutions S.L.',
      priority: 'medium',
    },
    actions: [
      {
        key: 'view',
        label: 'Ver perfil',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => console.log('Ver perfil'),
      },
      {
        key: 'contact',
        label: 'Contactar',
        icon: <MessageSquare className="w-4 h-4" />,
        onClick: () => console.log('Contactar'),
      },
    ],
  },
  {
    id: '2',
    type: 'deal',
    title: 'Propuesta enviada',
    description: 'Propuesta comercial enviada por valor de €15,000 para desarrollo de plataforma',
    user: {
      name: 'María García',
      initials: 'MG',
    },
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // Hace 30 minutos
    status: 'pending',
    metadata: {
      client: 'Innovate Corp',
      amount: 15000,
      priority: 'high',
      attachments: 2,
    },
    actions: [
      {
        key: 'view',
        label: 'Ver propuesta',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => console.log('Ver propuesta'),
      },
      {
        key: 'edit',
        label: 'Editar',
        icon: <Edit className="w-4 h-4" />,
        onClick: () => console.log('Editar'),
      },
      {
        key: 'download',
        label: 'Descargar PDF',
        icon: <Download className="w-4 h-4" />,
        onClick: () => console.log('Descargar'),
      },
    ],
  },
  {
    id: '3',
    type: 'call',
    title: 'Llamada de seguimiento',
    description: 'Llamada de 25 minutos para revisar el progreso del proyecto y próximos pasos',
    user: {
      name: 'Carlos Rodríguez',
      initials: 'CR',
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
    status: 'completed',
    metadata: {
      client: 'Digital Ventures',
      priority: 'medium',
    },
    actions: [
      {
        key: 'notes',
        label: 'Ver notas',
        icon: <MessageSquare className="w-4 h-4" />,
        onClick: () => console.log('Ver notas'),
      },
      {
        key: 'schedule',
        label: 'Programar siguiente',
        icon: <Calendar className="w-4 h-4" />,
        onClick: () => console.log('Programar'),
      },
    ],
  },
  {
    id: '4',
    type: 'email',
    title: 'Email de bienvenida enviado',
    description: 'Secuencia de emails automática iniciada para nuevo cliente',
    user: {
      name: 'Ana Martínez',
      initials: 'AM',
    },
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // Hace 4 horas
    status: 'completed',
    metadata: {
      client: 'StartupHub',
      priority: 'low',
    },
    actions: [
      {
        key: 'view',
        label: 'Ver email',
        icon: <Mail className="w-4 h-4" />,
        onClick: () => console.log('Ver email'),
      },
      {
        key: 'copy',
        label: 'Copiar enlace',
        icon: <Copy className="w-4 h-4" />,
        onClick: () => console.log('Copiar'),
      },
    ],
  },
  {
    id: '5',
    type: 'payment',
    title: 'Pago recibido',
    description: 'Pago de factura #2024-001 procesado correctamente',
    user: {
      name: 'Sistema de Pagos',
      initials: 'SP',
    },
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // Hace 6 horas
    status: 'completed',
    metadata: {
      client: 'Enterprise Solutions',
      amount: 8500,
      priority: 'high',
    },
    actions: [
      {
        key: 'receipt',
        label: 'Ver recibo',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => console.log('Ver recibo'),
      },
      {
        key: 'download',
        label: 'Descargar',
        icon: <Download className="w-4 h-4" />,
        onClick: () => console.log('Descargar'),
      },
    ],
  },
  {
    id: '6',
    type: 'task',
    title: 'Tarea completada',
    description: 'Revisión de documentos legales finalizada',
    user: {
      name: 'Luis Fernández',
      initials: 'LF',
    },
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // Hace 8 horas
    status: 'completed',
    metadata: {
      client: 'Legal Corp',
      priority: 'urgent',
      attachments: 5,
    },
    actions: [
      {
        key: 'view',
        label: 'Ver detalles',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => console.log('Ver detalles'),
      },
    ],
  },
  {
    id: '7',
    type: 'meeting',
    title: 'Reunión de seguimiento programada',
    description: 'Reunión para revisar el avance del proyecto para el próximo viernes',
    user: {
      name: 'Patricia López',
      initials: 'PL',
    },
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hace 1 día
    status: 'pending',
    metadata: {
      client: 'Global Tech',
      priority: 'medium',
    },
    actions: [
      {
        key: 'calendar',
        label: 'Ver en calendario',
        icon: <Calendar className="w-4 h-4" />,
        onClick: () => console.log('Ver calendario'),
      },
      {
        key: 'edit',
        label: 'Reprogramar',
        icon: <Edit className="w-4 h-4" />,
        onClick: () => console.log('Reprogramar'),
      },
    ],
  },
];

const failedActivity: ActivityItem = {
  id: 'failed-1',
  type: 'email',
  title: 'Error al enviar email',
  description: 'El email de seguimiento no pudo ser entregado por dirección inválida',
  user: {
    name: 'Sistema de Email',
    initials: 'SE',
  },
  timestamp: new Date(Date.now() - 10 * 60 * 1000),
  status: 'failed',
  metadata: {
    client: 'Cliente Test',
    priority: 'high',
  },
  actions: [
    {
      key: 'retry',
      label: 'Reintentar',
      icon: <MessageSquare className="w-4 h-4" />,
      onClick: () => console.log('Reintentar'),
    },
    {
      key: 'edit',
      label: 'Editar destinatario',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => console.log('Editar'),
    },
  ],
};

export const Default: Story = {
  args: {
    activities: sampleActivities.slice(0, 4),
  },
};

export const WithRefresh: Story = {
  args: {
    activities: sampleActivities,
    onRefresh: () => {
      console.log('Refrescando actividades...');
      alert('Refrescando actividades...');
    },
  },
};

export const WithLoadMore: Story = {
  args: {
    activities: sampleActivities.slice(0, 3),
    hasMore: true,
    onLoadMore: () => {
      console.log('Cargando más actividades...');
      alert('Cargando más actividades...');
    },
  },
};

export const SmallSize: Story = {
  args: {
    activities: sampleActivities.slice(0, 4),
    size: 'sm',
  },
};

export const LargeSize: Story = {
  args: {
    activities: sampleActivities.slice(0, 4),
    size: 'lg',
  },
};

export const WithoutAvatars: Story = {
  args: {
    activities: sampleActivities.slice(0, 4),
    showAvatars: false,
  },
};

export const AbsoluteTime: Story = {
  args: {
    activities: sampleActivities.slice(0, 4),
    showRelativeTime: false,
  },
};

export const Loading: Story = {
  args: {
    activities: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    activities: [],
    emptyText: 'No hay actividades recientes para mostrar',
  },
};

export const WithFailedActivity: Story = {
  args: {
    activities: [failedActivity, ...sampleActivities.slice(0, 3)],
  },
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo con actividad fallida mostrando el estado de error.',
      },
    },
  },
};

export const CompactFeed: Story = {
  args: {
    activities: sampleActivities,
    size: 'sm',
    maxHeight: '300px',
    showAvatars: true,
    showRelativeTime: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Feed compacto ideal para sidebars o widgets.',
      },
    },
  },
};

export const DetailedFeed: Story = {
  args: {
    activities: sampleActivities,
    size: 'lg',
    maxHeight: '600px',
    showAvatars: true,
    showRelativeTime: true,
    onRefresh: () => console.log('Refresh'),
    hasMore: true,
    onLoadMore: () => console.log('Load more'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Feed detallado con todas las funcionalidades para página principal.',
      },
    },
  },
};

export const InteractiveFeed: Story = {
  args: {
    activities: [],
    loading: false
  },
  render: () => {
    const [activities, setActivities] = React.useState(sampleActivities.slice(0, 4));
    const [loading, setLoading] = React.useState(false);
    
    const handleRefresh = () => {
      setLoading(true);
      setTimeout(() => {
        setActivities([
          {
            id: 'new-' + Date.now(),
            type: 'contact',
            title: 'Nueva actividad generada',
            description: 'Esta es una nueva actividad creada al refrescar',
            user: { name: 'Sistema', initials: 'S' },
            timestamp: new Date(),
            status: 'completed',
            metadata: { client: 'Cliente Dinámico' },
          },
          ...activities,
        ]);
        setLoading(false);
      }, 1000);
    };
    
    const handleLoadMore = () => {
      setLoading(true);
      setTimeout(() => {
        setActivities([
          ...activities,
          ...sampleActivities.slice(activities.length, activities.length + 2),
        ]);
        setLoading(false);
      }, 1000);
    };
    
    return (
      <ActivityFeed
        activities={activities}
        loading={loading}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        hasMore={activities.length < sampleActivities.length}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Feed interactivo con funcionalidad real de refresh y load more.',
      },
    },
  },
};