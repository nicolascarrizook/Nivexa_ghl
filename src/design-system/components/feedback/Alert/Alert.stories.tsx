import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { User, ShieldCheck } from 'lucide-react';
import Alert from './Alert';

const meta: Meta<typeof Alert> = {
  title: 'Design System/Feedback/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Componente de alerta para mostrar mensajes importantes al usuario con soporte para temas mexicanos de CRM y localización en español.'
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info'],
      description: 'Tipo visual de la alerta'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño de la alerta'
    },
    dismissible: {
      control: 'boolean',
      description: 'Si la alerta puede ser cerrada'
    },
    hideIcon: {
      control: 'boolean',
      description: 'Ocultar el icono por defecto'
    },
    title: {
      control: 'text',
      description: 'Título de la alerta'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof meta>;

// Historia básica
export const Default: Story = {
  args: {
    variant: 'info',
    title: 'Información del sistema',
    children: 'Esta es una alerta informativa básica.',
    dismissible: false
  }
};

// Variantes de estado
export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Cliente agregado exitosamente',
    children: 'El nuevo cliente ha sido registrado en el sistema CRM.',
    dismissible: true
  }
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Error en la conexión',
    children: 'No se pudo conectar con el servidor. Verifique su conexión a internet.',
    dismissible: true
  }
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Facturación pendiente',
    children: 'Tienes 3 facturas vencidas. Es recomendable revisarlas pronto.',
    dismissible: true
  }
};

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Actualización disponible',
    children: 'Una nueva versión del sistema está disponible. Se recomienda actualizar.',
    dismissible: true
  }
};

// Tamaños
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert
        variant="info"
        size="sm"
        title="Alerta pequeña"
        dismissible
      >
        Mensaje compacto para espacios reducidos.
      </Alert>
      
      <Alert
        variant="warning"
        size="md"
        title="Alerta mediana"
        dismissible
      >
        Tamaño estándar para la mayoría de casos de uso.
      </Alert>
      
      <Alert
        variant="success"
        size="lg"
        title="Alerta grande"
        dismissible
      >
        Tamaño prominente para mensajes importantes que requieren mayor atención visual.
      </Alert>
    </div>
  )
};

// Iconos personalizados
export const CustomIcons: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert
        variant="info"
        title="Usuario actualizado"
        icon={<User />}
        dismissible
      >
        Los datos del usuario han sido actualizados correctamente.
      </Alert>
      
      <Alert
        variant="success"
        title="Seguridad verificada"
        icon={<ShieldCheck />}
        dismissible
      >
        El sistema de seguridad ha sido verificado exitosamente.
      </Alert>
    </div>
  )
};

// Sin icono
export const NoIcon: Story = {
  args: {
    variant: 'info',
    title: 'Mensaje simple',
    children: 'Esta alerta no tiene icono para un diseño más limpio.',
    hideIcon: true,
    dismissible: true
  }
};

// Solo contenido (sin título)
export const ContentOnly: Story = {
  args: {
    variant: 'warning',
    children: 'Mensaje de alerta sin título, solo con contenido descriptivo.',
    dismissible: true
  }
};

// Casos específicos del CRM mexicano
export const CRMScenarios: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert
        variant="success"
        title="Cotización enviada"
        dismissible
      >
        La cotización COT-2024-001 fue enviada exitosamente al cliente.
      </Alert>
      
      <Alert
        variant="warning"
        title="RFC inválido"
        dismissible
      >
        El RFC ingresado no cumple con el formato válido mexicano (13 caracteres).
      </Alert>
      
      <Alert
        variant="error"
        title="Error CFDI"
        dismissible
      >
        No se pudo generar el CFDI. Verifique los datos fiscales del cliente.
      </Alert>
      
      <Alert
        variant="info"
        title="Periodo fiscal"
        dismissible
      >
        Recuerda que el período fiscal mexicano cierra el 31 de diciembre.
      </Alert>
    </div>
  )
};

// Alerta interactiva con estado
export const Interactive: Story = {
  render: () => {
    const [alerts, setAlerts] = useState([
      { id: 1, variant: 'success' as const, title: 'Venta registrada', message: 'Nueva venta por $12,500 MXN registrada.' },
      { id: 2, variant: 'warning' as const, title: 'Inventario bajo', message: 'Quedan solo 5 unidades del producto ABC-123.' },
      { id: 3, variant: 'info' as const, title: 'Recordatorio', message: 'Reunión con cliente programada para mañana a las 10:00 AM.' }
    ]);

    const dismissAlert = (id: number) => {
      setAlerts(alerts.filter(alert => alert.id !== id));
    };

    return (
      <div className="space-y-4">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            variant={alert.variant}
            title={alert.title}
            dismissible
            onDismiss={() => dismissAlert(alert.id)}
          >
            {alert.message}
          </Alert>
        ))}
        {alerts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Todas las alertas han sido cerradas
          </div>
        )}
      </div>
    );
  }
};

// Con contenido complejo
export const ComplexContent: Story = {
  args: {
    variant: 'warning',
    title: 'Documentos fiscales pendientes',
    dismissible: true,
    children: (
      <div>
        <p className="mb-2">Se encontraron varios documentos fiscales que requieren atención:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Factura FACT-2024-001 - Cliente ABC Corp</li>
          <li>Nota de crédito NC-2024-005 - Cliente XYZ S.A.</li>
          <li>Complemento de pago CP-2024-012 - Cliente DEF Ltda</li>
        </ul>
        <p className="mt-2 text-sm">
          <strong>Acción requerida:</strong> Revisar y procesar antes del cierre fiscal.
        </p>
      </div>
    )
  }
};