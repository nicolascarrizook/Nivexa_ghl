import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Trash2, Archive, Power, UserX, Download, Settings } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Design System/Feedback/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Diálogo de confirmación para acciones importantes con diferentes niveles de riesgo y tipos de acción.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Control de visibilidad del diálogo',
    },
    title: {
      control: 'text',
      description: 'Título del diálogo',
    },
    description: {
      control: 'text',
      description: 'Descripción de la acción',
    },
    variant: {
      control: 'select',
      options: ['default', 'danger', 'warning', 'info'],
      description: 'Variante que determina el estilo y nivel de riesgo',
    },
    actionType: {
      control: 'select',
      options: ['delete', 'archive', 'disable', 'custom'],
      description: 'Tipo de acción para iconografía contextual',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component for stories
const ConfirmDialogWrapper = (args: any) => {
  const [open, setOpen] = useState(args.open || false);
  const [loading, setLoading] = useState(false);
  const [requireConfirmationChecked, setRequireConfirmationChecked] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      console.log('Acción confirmada');
    }, 2000);
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Mostrar Diálogo de Confirmación
      </button>
      <ConfirmDialog
        {...args}
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleConfirm}
        buttons={{
          ...args.buttons,
          confirm: {
            ...args.buttons?.confirm,
            loading,
          },
        }}
        requireConfirmation={args.requireConfirmation ? {
          ...args.requireConfirmation,
          checked: requireConfirmationChecked,
          onChange: setRequireConfirmationChecked,
        } : undefined}
      />
    </div>
  );
};

export const DeleteClient: Story = {
  render: (args) => <ConfirmDialogWrapper {...args} />,
  args: {
    title: 'Eliminar cliente',
    description: '¿Estás seguro de que quieres eliminar este cliente?',
    variant: 'danger',
    actionType: 'delete',
    consequences: 'Esta acción eliminará permanentemente el cliente, todos sus proyectos, facturas y documentos asociados. No podrás deshacer esta acción.',
    details: [
      { label: 'Cliente', value: 'Tecnología Avanzada S.A.' },
      { label: 'Proyectos activos', value: '3 proyectos' },
      { label: 'Facturas pendientes', value: '2 facturas' },
      { label: 'Última actividad', value: 'Hace 2 días' },
    ],
  },
};

export const DeleteWithConfirmation: Story = {
  render: (args) => <ConfirmDialogWrapper {...args} />,
  args: {
    title: 'Eliminar proyecto permanentemente',
    description: 'Esta es una acción irreversible que eliminará todo el contenido del proyecto.',
    variant: 'danger',
    actionType: 'delete',
    consequences: 'Se eliminarán todos los archivos, tareas, comentarios y historial del proyecto. Los colaboradores perderán acceso inmediatamente.',
    details: [
      { label: 'Proyecto', value: 'Rediseño de marca corporativa' },
      { label: 'Archivos', value: '47 documentos' },
      { label: 'Colaboradores', value: '5 personas' },
      { label: 'Tareas', value: '23 completadas, 8 pendientes' },
    ],
    requireConfirmation: {
      text: 'Confirmo que entiendo que esta acción es irreversible',
      checked: false,
      onChange: () => {},
    },
    buttons: {
      confirm: {
        label: 'Sí, eliminar proyecto',
        loadingText: 'Eliminando...',
      },
    },
  },
};

export const ArchiveProject: Story = {
  render: (args) => <ConfirmDialogWrapper {...args} />,
  args: {
    title: 'Archivar proyecto',
    description: '¿Quieres archivar este proyecto completado?',
    variant: 'warning',
    actionType: 'archive',
    consequences: 'El proyecto se moverá a la sección de archivados y ya no aparecerá en la lista activa. Podrás restaurarlo en cualquier momento.',
    details: [
      { label: 'Proyecto', value: 'Sitio web corporativo' },
      { label: 'Estado', value: 'Completado' },
      { label: 'Fecha de finalización', value: '15 de Enero, 2024' },
    ],
    buttons: {
      confirm: {
        label: 'Archivar proyecto',
        loadingText: 'Archivando...',
      },
    },
  },
};

export const DisableUser: Story = {
  render: (args) => <ConfirmDialogWrapper {...args} />,
  args: {
    title: 'Desactivar usuario',
    description: '¿Quieres desactivar temporalmente este usuario?',
    variant: 'warning',
    actionType: 'disable',
    consequences: 'El usuario perderá acceso al sistema inmediatamente pero su información se conservará. Podrás reactivarlo cuando lo necesites.',
    details: [
      { label: 'Usuario', value: 'Carlos Ramírez' },
      { label: 'Email', value: 'carlos.ramirez@empresa.com' },
      { label: 'Rol', value: 'Editor' },
      { label: 'Último acceso', value: 'Hace 1 semana' },
    ],
    buttons: {
      confirm: {
        label: 'Desactivar usuario',
        loadingText: 'Desactivando...',
      },
    },
  },
};

export const LogoutAll: Story = {
  render: (args) => <ConfirmDialogWrapper {...args} />,
  args: {
    title: 'Cerrar todas las sesiones',
    description: '¿Quieres cerrar sesión en todos los dispositivos?',
    variant: 'info',
    actionType: 'custom',
    customIcon: <UserX className="w-6 h-6" />,
    consequences: 'Se cerrarán todas las sesiones activas en computadoras, tablets y móviles. Tendrás que iniciar sesión nuevamente en cada dispositivo.',
    buttons: {
      confirm: {
        label: 'Cerrar todas las sesiones',
        loadingText: 'Cerrando sesiones...',
      },
    },
  },
};

export const ExportData: Story = {
  render: (args) => <ConfirmDialogWrapper {...args} />,
  args: {
    title: 'Exportar datos de clientes',
    description: '¿Confirmas que quieres exportar la información de todos los clientes?',
    variant: 'default',
    actionType: 'custom',
    customIcon: <Download className="w-6 h-6" />,
    details: [
      { label: 'Total de clientes', value: '247 registros' },
      { label: 'Formato', value: 'Excel (.xlsx)' },
      { label: 'Incluye', value: 'Contactos, proyectos, facturas' },
      { label: 'Tamaño estimado', value: '~3.2 MB' },
    ],
    buttons: {
      confirm: {
        label: 'Exportar datos',
        loadingText: 'Exportando...',
      },
    },
  },
};

export const ResetSettings: Story = {
  render: (args) => <ConfirmDialogWrapper {...args} />,
  args: {
    title: 'Restablecer configuración',
    description: '¿Quieres restablecer todas las configuraciones a los valores predeterminados?',
    variant: 'warning',
    actionType: 'custom',
    customIcon: <Settings className="w-6 h-6" />,
    consequences: 'Se perderán todas las personalizaciones: tema, notificaciones, filtros guardados, y preferencias de la interfaz.',
    buttons: {
      confirm: {
        label: 'Restablecer configuración',
        loadingText: 'Restableciendo...',
      },
      cancel: {
        label: 'Mantener actual',
        variant: 'outline' as const,
      },
    },
  },
};

export const CancelSubscription: Story = {
  render: (args) => <ConfirmDialogWrapper {...args} />,
  args: {
    title: 'Cancelar suscripción',
    description: 'Tu suscripción Premium será cancelada y perderás acceso a las funciones avanzadas.',
    variant: 'danger',
    actionType: 'custom',
    consequences: 'Mantendrás acceso hasta el final del período facturado actual (28 de Febrero, 2024). Después se aplicarán las limitaciones del plan gratuito.',
    details: [
      { label: 'Plan actual', value: 'Premium Mensual' },
      { label: 'Próxima facturación', value: '28 de Febrero, 2024' },
      { label: 'Monto', value: '$299.00 MXN/mes' },
    ],
    requireConfirmation: {
      text: 'Confirmo que quiero cancelar mi suscripción Premium',
      checked: false,
      onChange: () => {},
    },
    buttons: {
      confirm: {
        label: 'Cancelar suscripción',
        loadingText: 'Cancelando...',
      },
      cancel: {
        label: 'Mantener Premium',
      },
    },
  },
};

export const Simple: Story = {
  render: (args) => <ConfirmDialogWrapper {...args} />,
  args: {
    title: 'Confirmar acción',
    description: '¿Estás seguro de que quieres continuar?',
    variant: 'default',
  },
};