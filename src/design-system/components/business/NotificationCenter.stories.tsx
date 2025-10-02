import type { Meta, StoryObj } from '@storybook/react';
import NotificationCenter from './NotificationCenter';

const meta: Meta<typeof NotificationCenter> = {
  title: 'Design System/Business/NotificationCenter',
  component: NotificationCenter,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Centro de notificaciones para mostrar alertas, avisos y actualizaciones del sistema CRM con filtros, acciones masivas y agrupación por fecha.',
      },
    },
  },
  argTypes: {
    groupByDate: {
      control: 'boolean',
      description: 'Agrupar notificaciones por fecha',
    },
    showFilters: {
      control: 'boolean',
      description: 'Mostrar filtros de tipo y categoría',
    },
    showBulkActions: {
      control: 'boolean',
      description: 'Mostrar acciones masivas',
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
    maxNotifications: {
      control: 'number',
      description: 'Máximo número de notificaciones a mostrar',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NotificationCenter>;

const sampleNotifications = [
  {
    id: 'notif-1',
    title: 'Pago recibido - Factura #FAC-2024-001',
    message: 'Se ha recibido el pago completo de $122,380.00 MXN por parte de Constructora Del Valle.',
    type: 'success' as const,
    category: 'pago' as const,
    isRead: false,
    createdAt: new Date().toISOString(),
    priority: 'alta' as const,
    sender: {
      id: 'system',
      name: 'Sistema de Pagos',
    },
    relatedEntity: {
      id: 'inv-001',
      type: 'invoice' as const,
      name: 'FAC-2024-001',
    },
    actions: [
      {
        id: 'view-invoice',
        label: 'Ver Factura',
        type: 'primary' as const,
        onClick: () => console.log('Ver factura'),
      },
      {
        id: 'download-receipt',
        label: 'Descargar Recibo',
        type: 'secondary' as const,
        onClick: () => console.log('Descargar recibo'),
      },
    ],
  },
  {
    id: 'notif-2',
    title: 'Tarea vencida: Revisión de planos',
    message: 'La tarea "Revisión de planos estructurales" asignada a Ing. Carlos Mendoza venció hace 2 días.',
    type: 'warning' as const,
    category: 'tarea' as const,
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    priority: 'critica' as const,
    sender: {
      id: 'user-1',
      name: 'Ing. Carlos Mendoza',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    relatedEntity: {
      id: 'task-1',
      type: 'task' as const,
      name: 'Revisión de planos estructurales',
    },
    actions: [
      {
        id: 'view-task',
        label: 'Ver Tarea',
        type: 'primary' as const,
        onClick: () => console.log('Ver tarea'),
      },
      {
        id: 'reassign',
        label: 'Reasignar',
        type: 'secondary' as const,
        onClick: () => console.log('Reasignar tarea'),
      },
    ],
  },
  {
    id: 'notif-3',
    title: 'Nuevo cliente registrado',
    message: 'María González López se ha registrado como nuevo cliente particular.',
    type: 'info' as const,
    category: 'cliente' as const,
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    priority: 'media' as const,
    sender: {
      id: 'user-2',
      name: 'María González López',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    },
    relatedEntity: {
      id: 'client-2',
      type: 'client' as const,
      name: 'María González López',
    },
    actions: [
      {
        id: 'view-client',
        label: 'Ver Cliente',
        type: 'primary' as const,
        onClick: () => console.log('Ver cliente'),
      },
    ],
  },
  {
    id: 'notif-4',
    title: 'Error en respaldo de base de datos',
    message: 'El proceso de respaldo automático falló. Se requiere intervención manual.',
    type: 'error' as const,
    category: 'sistema' as const,
    isRead: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    priority: 'critica' as const,
    sender: {
      id: 'system',
      name: 'Sistema de Respaldos',
    },
    actions: [
      {
        id: 'view-logs',
        label: 'Ver Logs',
        type: 'primary' as const,
        onClick: () => console.log('Ver logs'),
      },
      {
        id: 'retry-backup',
        label: 'Reintentar',
        type: 'secondary' as const,
        onClick: () => console.log('Reintentar respaldo'),
      },
    ],
  },
  {
    id: 'notif-5',
    title: 'Proyecto completado',
    message: 'El proyecto "Torre Corporativa Centro" ha sido marcado como completado exitosamente.',
    type: 'success' as const,
    category: 'proyecto' as const,
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    priority: 'alta' as const,
    sender: {
      id: 'user-3',
      name: 'Lic. Patricia Ruiz',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    },
    relatedEntity: {
      id: 'proj-2',
      type: 'project' as const,
      name: 'Torre Corporativa Centro',
    },
    actions: [
      {
        id: 'view-project',
        label: 'Ver Proyecto',
        type: 'primary' as const,
        onClick: () => console.log('Ver proyecto'),
      },
      {
        id: 'generate-report',
        label: 'Generar Reporte',
        type: 'secondary' as const,
        onClick: () => console.log('Generar reporte'),
      },
    ],
  },
  {
    id: 'notif-6',
    title: 'Documento firmado digitalmente',
    message: 'El contrato de construcción #CONT-2024-005 ha sido firmado por todas las partes.',
    type: 'success' as const,
    category: 'documento' as const,
    isRead: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    priority: 'media' as const,
    sender: {
      id: 'user-4',
      name: 'Roberto López',
    },
    relatedEntity: {
      id: 'doc-005',
      type: 'project' as const,
      name: 'CONT-2024-005',
    },
    actions: [
      {
        id: 'download-contract',
        label: 'Descargar',
        type: 'primary' as const,
        onClick: () => console.log('Descargar contrato'),
      },
    ],
  },
  {
    id: 'notif-7',
    title: 'Actualización del sistema',
    message: 'Nueva versión 2.1.0 disponible con mejoras de seguridad y nuevas funcionalidades.',
    type: 'info' as const,
    category: 'sistema' as const,
    isRead: false,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
    priority: 'baja' as const,
    sender: {
      id: 'system',
      name: 'Equipo de Desarrollo',
    },
    actions: [
      {
        id: 'view-changelog',
        label: 'Ver Cambios',
        type: 'primary' as const,
        onClick: () => console.log('Ver changelog'),
      },
      {
        id: 'schedule-update',
        label: 'Programar',
        type: 'secondary' as const,
        onClick: () => console.log('Programar actualización'),
      },
    ],
  },
  {
    id: 'notif-8',
    title: 'Recordatorio: Reunión de seguimiento',
    message: 'Reunión programada para mañana a las 10:00 AM con el equipo del proyecto Los Pinos.',
    type: 'info' as const,
    category: 'proyecto' as const,
    isRead: true,
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), // 4 days ago
    priority: 'media' as const,
    sender: {
      id: 'user-5',
      name: 'Ana García',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    },
    relatedEntity: {
      id: 'proj-1',
      type: 'project' as const,
      name: 'Residencial Los Pinos',
    },
    actions: [
      {
        id: 'join-meeting',
        label: 'Unirse',
        type: 'primary' as const,
        onClick: () => console.log('Unirse a reunión'),
      },
      {
        id: 'reschedule',
        label: 'Reprogramar',
        type: 'secondary' as const,
        onClick: () => console.log('Reprogramar reunión'),
      },
    ],
  },
];

export const Default: Story = {
  args: {
    notifications: sampleNotifications,
    title: 'Centro de Notificaciones',
    groupByDate: true,
    showFilters: true,
    showBulkActions: true,
    onMarkAsRead: (id) => console.log('Marcar como leída:', id),
    onMarkAllAsRead: () => console.log('Marcar todas como leídas'),
    onDeleteNotification: (id) => console.log('Eliminar notificación:', id),
    onClearAll: () => console.log('Limpiar todas las notificaciones'),
    onNotificationClick: (notification) => console.log('Click en notificación:', notification.title),
    onActionClick: (notificationId, actionId) => console.log('Acción ejecutada:', actionId, 'en notificación:', notificationId),
  },
};

export const SinAgrupar: Story = {
  args: {
    ...Default.args,
    groupByDate: false,
    title: 'Notificaciones sin Agrupar',
  },
};

export const SinFiltros: Story = {
  args: {
    ...Default.args,
    showFilters: false,
    title: 'Notificaciones sin Filtros',
  },
};

export const SinAccionesMasivas: Story = {
  args: {
    ...Default.args,
    showBulkActions: false,
    title: 'Sin Acciones Masivas',
  },
};

export const SoloNoLeidas: Story = {
  args: {
    notifications: sampleNotifications.filter(n => !n.isRead),
    title: 'Notificaciones No Leídas',
    groupByDate: true,
    showFilters: false,
    showBulkActions: true,
    onMarkAsRead: (id) => console.log('Marcar como leída:', id),
    onMarkAllAsRead: () => console.log('Marcar todas como leídas'),
    onDeleteNotification: (id) => console.log('Eliminar notificación:', id),
    onNotificationClick: (notification) => console.log('Click en notificación:', notification.title),
    onActionClick: (notificationId, actionId) => console.log('Acción ejecutada:', actionId, 'en notificación:', notificationId),
  },
};

export const NotificacionesCriticas: Story = {
  args: {
    notifications: sampleNotifications.filter(n => n.priority === 'critica'),
    title: 'Notificaciones Críticas',
    groupByDate: false,
    showFilters: false,
    showBulkActions: false,
    onMarkAsRead: (id) => console.log('Marcar como leída:', id),
    onDeleteNotification: (id) => console.log('Eliminar notificación:', id),
    onNotificationClick: (notification) => console.log('Click en notificación:', notification.title),
    onActionClick: (notificationId, actionId) => console.log('Acción ejecutada:', actionId, 'en notificación:', notificationId),
  },
};

export const LimitadaA5: Story = {
  args: {
    ...Default.args,
    maxNotifications: 5,
    title: 'Últimas 5 Notificaciones',
  },
};

export const TamañoPequeño: Story = {
  args: {
    ...Default.args,
    size: 'sm',
    title: 'Notificaciones Compactas',
  },
};

export const TamañoGrande: Story = {
  args: {
    ...Default.args,
    size: 'lg',
    title: 'Notificaciones Expandidas',
  },
};

export const EstadoCarga: Story = {
  args: {
    notifications: [],
    loading: true,
    title: 'Cargando Notificaciones',
  },
};

export const SinNotificaciones: Story = {
  args: {
    notifications: [],
    title: 'Sin Notificaciones',
    groupByDate: true,
    showFilters: true,
    showBulkActions: true,
  },
};

export const SoloSistema: Story = {
  args: {
    notifications: sampleNotifications.filter(n => n.category === 'sistema'),
    title: 'Notificaciones del Sistema',
    groupByDate: false,
    showFilters: false,
    showBulkActions: false,
    onMarkAsRead: (id) => console.log('Marcar como leída:', id),
    onDeleteNotification: (id) => console.log('Eliminar notificación:', id),
    onNotificationClick: (notification) => console.log('Click en notificación:', notification.title),
    onActionClick: (notificationId, actionId) => console.log('Acción ejecutada:', actionId, 'en notificación:', notificationId),
  },
};

export const SinAcciones: Story = {
  args: {
    notifications: sampleNotifications.map(n => ({ ...n, actions: [] })),
    title: 'Notificaciones sin Acciones',
    groupByDate: true,
    showFilters: true,
    showBulkActions: true,
    onMarkAsRead: (id) => console.log('Marcar como leída:', id),
    onMarkAllAsRead: () => console.log('Marcar todas como leídas'),
    onDeleteNotification: (id) => console.log('Eliminar notificación:', id),
    onClearAll: () => console.log('Limpiar todas las notificaciones'),
    onNotificationClick: (notification) => console.log('Click en notificación:', notification.title),
  },
};

// Story para mostrar en un layout de sidebar
export const Sidebar: Story = {
  args: {
    notifications: sampleNotifications,
    title: "Notificaciones",
    maxNotifications: 10,
    size: "sm",
    showFilters: false,
    className: "h-96 overflow-y-auto"
  },
  render: (args) => (
    <div className="w-80">
      <NotificationCenter {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo de centro de notificaciones en un sidebar con altura limitada y scroll.',
      },
    },
  },
};

// Story para mostrar diferentes tipos de notificaciones
export const TiposDeNotificacion: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <NotificationCenter
        notifications={sampleNotifications.filter(n => n.type === 'success')}
        title="Notificaciones de Éxito"
        groupByDate={false}
        showFilters={false}
        showBulkActions={false}
        size="sm"
        onNotificationClick={(notification) => console.log('Click en notificación:', notification.title)}
      />
      <NotificationCenter
        notifications={sampleNotifications.filter(n => n.type === 'error')}
        title="Notificaciones de Error"
        groupByDate={false}
        showFilters={false}
        showBulkActions={false}
        size="sm"
        onNotificationClick={(notification) => console.log('Click en notificación:', notification.title)}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo de múltiples centros de notificaciones organizados por tipo.',
      },
    },
  },
};