import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Plus, Eye, ExternalLink, Download, Share, Copy } from 'lucide-react';
import SuccessModal from './SuccessModal';

const meta: Meta<typeof SuccessModal> = {
  title: 'Design System/Feedback/SuccessModal',
  component: SuccessModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Modal de confirmación de éxito con opciones de confetti, auto-cierre y acciones personalizables.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Control de visibilidad del modal',
    },
    title: {
      control: 'text',
      description: 'Título del éxito',
    },
    message: {
      control: 'text',
      description: 'Mensaje principal de éxito',
    },
    showConfetti: {
      control: 'boolean',
      description: 'Mostrar animación de confetti',
    },
    variant: {
      control: 'select',
      options: ['default', 'celebration', 'minimal'],
      description: 'Variante visual del modal',
    },
    autoCloseDelay: {
      control: 'number',
      description: 'Tiempo de auto-cierre en milisegundos (0 = sin auto-cierre)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component for stories
const SuccessModalWrapper = (args: any) => {
  const [open, setOpen] = useState(args.open || false);

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Mostrar Modal de Éxito
      </button>
      <SuccessModal
        {...args}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <SuccessModalWrapper {...args} />,
  args: {
    title: '¡Cliente creado exitosamente!',
    message: 'El cliente Juan Pérez ha sido agregado a tu base de datos.',
    details: 'Ya puedes comenzar a crear proyectos y facturas para este cliente.',
    actions: {
      viewDetails: {
        onClick: () => console.log('Ver detalles del cliente'),
      },
      createAnother: {
        onClick: () => console.log('Crear otro cliente'),
      },
    },
  },
};

export const WithConfetti: Story = {
  render: (args) => <SuccessModalWrapper {...args} />,
  args: {
    title: '¡Proyecto completado!',
    message: 'Has completado exitosamente el proyecto "Sitio Web Corporativo".',
    details: 'El cliente ha sido notificado automáticamente.',
    variant: 'celebration',
    showConfetti: true,
    actions: {
      viewDetails: {
        label: 'Ver resumen',
        onClick: () => console.log('Ver resumen del proyecto'),
      },
      createAnother: {
        label: 'Nuevo proyecto',
        onClick: () => console.log('Crear nuevo proyecto'),
      },
    },
  },
};

export const WithAutoClose: Story = {
  render: (args) => <SuccessModalWrapper {...args} />,
  args: {
    title: 'Configuración guardada',
    message: 'Tus preferencias han sido actualizadas correctamente.',
    autoCloseDelay: 3000,
    variant: 'minimal',
  },
};

export const WithCustomData: Story = {
  render: (args) => <SuccessModalWrapper {...args} />,
  args: {
    title: '¡Factura generada!',
    message: 'La factura ha sido creada y enviada al cliente.',
    details: 'Se ha enviado una copia por correo electrónico automáticamente.',
    data: [
      { label: 'Número de factura', value: 'FAC-2024-001' },
      { label: 'Cliente', value: 'Tecnología Avanzada S.A.' },
      { label: 'Monto total', value: '$15,750.00 MXN' },
      { label: 'Fecha de vencimiento', value: '15 de Febrero, 2024' },
    ],
    actions: {
      viewDetails: {
        label: 'Ver factura',
        onClick: () => console.log('Ver factura generada'),
      },
      custom: {
        label: 'Descargar PDF',
        icon: <Download className="w-4 h-4" />,
        variant: 'secondary' as const,
        onClick: () => console.log('Descargar PDF'),
      },
    },
  },
};

export const PaymentSuccess: Story = {
  render: (args) => <SuccessModalWrapper {...args} />,
  args: {
    title: '¡Pago recibido!',
    message: 'El pago de $8,500.00 MXN ha sido procesado exitosamente.',
    variant: 'celebration',
    showConfetti: true,
    data: [
      { label: 'Método de pago', value: 'Transferencia bancaria' },
      { label: 'Cliente', value: 'Construcciones del Norte' },
      { label: 'Fecha', value: 'Hoy, 14:35' },
      { label: 'Referencia', value: 'PAY-2024-0156' },
    ],
    actions: {
      viewDetails: {
        label: 'Ver comprobante',
        onClick: () => console.log('Ver comprobante de pago'),
      },
      custom: {
        label: 'Compartir',
        icon: <Share className="w-4 h-4" />,
        variant: 'secondary' as const,
        onClick: () => console.log('Compartir comprobante'),
      },
    },
  },
};

export const TaskCompleted: Story = {
  render: (args) => <SuccessModalWrapper {...args} />,
  args: {
    title: 'Tarea completada',
    message: 'Has marcado como completada la tarea "Revisión de propuesta".',
    variant: 'minimal',
    actions: {
      createAnother: {
        label: 'Nueva tarea',
        onClick: () => console.log('Crear nueva tarea'),
      },
    },
  },
};

export const DataExported: Story = {
  render: (args) => <SuccessModalWrapper {...args} />,
  args: {
    title: 'Exportación completada',
    message: 'Los datos han sido exportados exitosamente.',
    details: 'El archivo estará disponible en tu carpeta de descargas.',
    data: [
      { label: 'Archivo', value: 'clientes_2024.xlsx' },
      { label: 'Registros', value: '147 clientes' },
      { label: 'Tamaño', value: '2.3 MB' },
    ],
    actions: {
      custom: {
        label: 'Abrir carpeta',
        icon: <ExternalLink className="w-4 h-4" />,
        variant: 'primary' as const,
        onClick: () => console.log('Abrir carpeta de descargas'),
      },
    },
  },
};

export const BackupCreated: Story = {
  render: (args) => <SuccessModalWrapper {...args} />,
  args: {
    title: 'Respaldo creado',
    message: 'Se ha generado un respaldo completo de tus datos.',
    variant: 'default',
    data: [
      { label: 'Fecha', value: 'Hoy, 16:45' },
      { label: 'Tamaño', value: '156.7 MB' },
      { label: 'Ubicación', value: 'Nube segura' },
    ],
    actions: {
      viewDetails: {
        label: 'Ver historial',
        onClick: () => console.log('Ver historial de respaldos'),
      },
    },
  },
};

export const InvitationSent: Story = {
  render: (args) => <SuccessModalWrapper {...args} />,
  args: {
    title: '¡Invitación enviada!',
    message: 'Se ha enviado la invitación a colaborar en el proyecto.',
    details: 'El usuario recibirá un correo con las instrucciones para unirse.',
    variant: 'celebration',
    data: [
      { label: 'Invitado', value: 'ana.martinez@email.com' },
      { label: 'Proyecto', value: 'Rediseño de marca' },
      { label: 'Rol', value: 'Diseñadora' },
    ],
    actions: {
      createAnother: {
        label: 'Invitar otro',
        onClick: () => console.log('Invitar otro colaborador'),
      },
      custom: {
        label: 'Copiar enlace',
        icon: <Copy className="w-4 h-4" />,
        variant: 'secondary' as const,
        onClick: () => console.log('Copiar enlace de invitación'),
      },
    },
  },
};