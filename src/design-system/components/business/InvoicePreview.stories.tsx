import type { Meta, StoryObj } from '@storybook/react';
import InvoicePreview from './InvoicePreview';

const meta: Meta<typeof InvoicePreview> = {
  title: 'Design System/Business/InvoicePreview',
  component: InvoicePreview,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Componente de vista previa de factura para mostrar información financiera, estado de pagos y acciones rápidas en el CRM de construcción.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['pagada', 'pendiente', 'vencida', 'cancelada', 'parcial'],
      description: 'Estado de la factura',
    },
    currency: {
      control: 'select',
      options: ['MXN', 'USD'],
      description: 'Moneda de la factura',
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
type Story = StoryObj<typeof InvoicePreview>;

const baseInvoice = {
  id: 'inv-001',
  invoiceNumber: 'FAC-2024-001',
  issueDate: '2024-01-15',
  dueDate: '2024-02-14',
  client: {
    id: 'client-1',
    name: 'Constructora Del Valle S.A. de C.V.',
    rfc: 'CDV123456789',
    address: 'Av. Revolución 1234, Ciudad de México, CDMX',
    type: 'empresa' as const,
  },
  status: 'pendiente' as const,
  items: [
    {
      id: 'item-1',
      description: 'Materiales de construcción - Cemento y agregados',
      quantity: 50,
      unitPrice: 850.00,
      total: 42500.00,
    },
    {
      id: 'item-2',
      description: 'Mano de obra especializada - Estructura',
      quantity: 80,
      unitPrice: 450.00,
      total: 36000.00,
    },
    {
      id: 'item-3',
      description: 'Supervisión técnica del proyecto',
      quantity: 1,
      unitPrice: 15000.00,
      total: 15000.00,
    },
    {
      id: 'item-4',
      description: 'Equipos y herramientas especializadas',
      quantity: 1,
      unitPrice: 12000.00,
      total: 12000.00,
    },
  ],
  subtotal: 105500.00,
  tax: 16880.00,
  withholdings: 0,
  total: 122380.00,
  currency: 'MXN' as const,
  project: {
    id: 'proj-1',
    name: 'Residencial Los Pinos',
  },
  paymentHistory: [
    {
      id: 'pay-1',
      date: '2024-01-20',
      amount: 50000.00,
      method: 'transferencia' as const,
      reference: 'TRANSF-001',
      status: 'confirmado' as const,
    },
  ],
  paidAmount: 50000.00,
  remainingAmount: 72380.00,
  notes: 'Factura correspondiente a la primera etapa del proyecto residencial.',
  terms: 'Pago a 30 días. Intereses moratorios del 2% mensual por pagos tardíos.',
};

export const Default: Story = {
  args: {
    ...baseInvoice,
    status: 'pendiente',
    onDownload: (id) => console.log('Descargar factura:', id),
    onSend: (id) => console.log('Enviar factura:', id),
    onView: (id) => console.log('Ver factura:', id),
    onPrint: (id) => console.log('Imprimir factura:', id),
    onShare: (id) => console.log('Compartir factura:', id),
    onViewPayments: (id) => console.log('Ver historial de pagos:', id),
    onAddPayment: (id) => console.log('Agregar pago:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onViewProject: (id) => console.log('Ver proyecto:', id),
  },
};

export const FacturaPagada: Story = {
  args: {
    ...baseInvoice,
    id: 'inv-002',
    invoiceNumber: 'FAC-2024-002',
    status: 'pagada',
    paymentHistory: [
      {
        id: 'pay-1',
        date: '2024-01-20',
        amount: 50000.00,
        method: 'transferencia',
        reference: 'TRANSF-001',
        status: 'confirmado',
      },
      {
        id: 'pay-2',
        date: '2024-01-25',
        amount: 72380.00,
        method: 'cheque',
        reference: 'CHQ-12345',
        status: 'confirmado',
      },
    ],
    paidAmount: 122380.00,
    remainingAmount: 0.00,
    onDownload: (id) => console.log('Descargar factura:', id),
    onView: (id) => console.log('Ver factura:', id),
    onPrint: (id) => console.log('Imprimir factura:', id),
    onShare: (id) => console.log('Compartir factura:', id),
    onViewPayments: (id) => console.log('Ver historial de pagos:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onViewProject: (id) => console.log('Ver proyecto:', id),
  },
};

export const FacturaVencida: Story = {
  args: {
    ...baseInvoice,
    id: 'inv-003',
    invoiceNumber: 'FAC-2024-003',
    issueDate: '2023-12-01',
    dueDate: '2023-12-31',
    status: 'vencida',
    paymentHistory: [],
    paidAmount: 0.00,
    remainingAmount: 122380.00,
    onDownload: (id) => console.log('Descargar factura:', id),
    onSend: (id) => console.log('Enviar factura:', id),
    onView: (id) => console.log('Ver factura:', id),
    onPrint: (id) => console.log('Imprimir factura:', id),
    onShare: (id) => console.log('Compartir factura:', id),
    onAddPayment: (id) => console.log('Agregar pago:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onViewProject: (id) => console.log('Ver proyecto:', id),
  },
};

export const PagoParcial: Story = {
  args: {
    ...baseInvoice,
    id: 'inv-004',
    invoiceNumber: 'FAC-2024-004',
    status: 'parcial',
    paymentHistory: [
      {
        id: 'pay-1',
        date: '2024-01-20',
        amount: 50000.00,
        method: 'transferencia',
        reference: 'TRANSF-001',
        status: 'confirmado',
      },
      {
        id: 'pay-2',
        date: '2024-01-25',
        amount: 30000.00,
        method: 'efectivo',
        status: 'confirmado',
      },
    ],
    paidAmount: 80000.00,
    remainingAmount: 42380.00,
    onDownload: (id) => console.log('Descargar factura:', id),
    onSend: (id) => console.log('Enviar factura:', id),
    onView: (id) => console.log('Ver factura:', id),
    onPrint: (id) => console.log('Imprimir factura:', id),
    onShare: (id) => console.log('Compartir factura:', id),
    onViewPayments: (id) => console.log('Ver historial de pagos:', id),
    onAddPayment: (id) => console.log('Agregar pago:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onViewProject: (id) => console.log('Ver proyecto:', id),
  },
};

export const ClienteParticular: Story = {
  args: {
    ...baseInvoice,
    id: 'inv-005',
    invoiceNumber: 'FAC-2024-005',
    client: {
      id: 'client-2',
      name: 'María González López',
      type: 'particular',
    },
    subtotal: 85000.00,
    tax: 13600.00,
    total: 98600.00,
    paymentHistory: [],
    paidAmount: 0.00,
    remainingAmount: 98600.00,
    project: {
      id: 'proj-2',
      name: 'Casa Familiar González',
    },
    onDownload: (id) => console.log('Descargar factura:', id),
    onSend: (id) => console.log('Enviar factura:', id),
    onView: (id) => console.log('Ver factura:', id),
    onAddPayment: (id) => console.log('Agregar pago:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onViewProject: (id) => console.log('Ver proyecto:', id),
  },
};

export const ConRetenciones: Story = {
  args: {
    ...baseInvoice,
    id: 'inv-006',
    invoiceNumber: 'FAC-2024-006',
    subtotal: 200000.00,
    tax: 32000.00,
    withholdings: 20000.00,
    total: 212000.00,
    paymentHistory: [],
    paidAmount: 0.00,
    remainingAmount: 212000.00,
    notes: 'Factura con retenciones por servicios profesionales de construcción.',
    onDownload: (id) => console.log('Descargar factura:', id),
    onSend: (id) => console.log('Enviar factura:', id),
    onView: (id) => console.log('Ver factura:', id),
    onAddPayment: (id) => console.log('Agregar pago:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onViewProject: (id) => console.log('Ver proyecto:', id),
  },
};

export const SinProyecto: Story = {
  args: {
    ...baseInvoice,
    id: 'inv-007',
    invoiceNumber: 'FAC-2024-007',
    project: undefined,
    items: [
      {
        id: 'item-1',
        description: 'Consultoría técnica en construcción',
        quantity: 10,
        unitPrice: 2500.00,
        total: 25000.00,
      },
    ],
    subtotal: 25000.00,
    tax: 4000.00,
    total: 29000.00,
    paymentHistory: [],
    paidAmount: 0.00,
    remainingAmount: 29000.00,
    onDownload: (id) => console.log('Descargar factura:', id),
    onSend: (id) => console.log('Enviar factura:', id),
    onView: (id) => console.log('Ver factura:', id),
    onAddPayment: (id) => console.log('Agregar pago:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
  },
};

export const MonedaDolar: Story = {
  args: {
    ...baseInvoice,
    id: 'inv-008',
    invoiceNumber: 'FAC-2024-008',
    currency: 'USD',
    subtotal: 5500.00,
    tax: 880.00,
    total: 6380.00,
    paymentHistory: [],
    paidAmount: 0.00,
    remainingAmount: 6380.00,
    notes: 'Factura en dólares americanos para equipo importado.',
    onDownload: (id) => console.log('Descargar factura:', id),
    onSend: (id) => console.log('Enviar factura:', id),
    onView: (id) => console.log('Ver factura:', id),
    onAddPayment: (id) => console.log('Agregar pago:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onViewProject: (id) => console.log('Ver proyecto:', id),
  },
};

export const TamañoPequeño: Story = {
  args: {
    ...baseInvoice,
    size: 'sm',
    onDownload: (id) => console.log('Descargar factura:', id),
    onSend: (id) => console.log('Enviar factura:', id),
    onView: (id) => console.log('Ver factura:', id),
    onAddPayment: (id) => console.log('Agregar pago:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onViewProject: (id) => console.log('Ver proyecto:', id),
  },
};

export const TamañoGrande: Story = {
  args: {
    ...baseInvoice,
    size: 'lg',
    onDownload: (id) => console.log('Descargar factura:', id),
    onSend: (id) => console.log('Enviar factura:', id),
    onView: (id) => console.log('Ver factura:', id),
    onAddPayment: (id) => console.log('Agregar pago:', id),
    onViewClient: (id) => console.log('Ver cliente:', id),
    onViewProject: (id) => console.log('Ver proyecto:', id),
  },
};

export const EstadoCarga: Story = {
  args: {
    ...baseInvoice,
    loading: true,
  },
};

export const SinAcciones: Story = {
  args: {
    ...baseInvoice,
    // No se pasan los callbacks de acción
  },
};

// Story para mostrar múltiples facturas en un grid
export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <InvoicePreview
        {...baseInvoice}
        status="pendiente"
        onDownload={(id) => console.log('Descargar factura:', id)}
        onSend={(id) => console.log('Enviar factura:', id)}
        onView={(id) => console.log('Ver factura:', id)}
        onAddPayment={(id) => console.log('Agregar pago:', id)}
        onViewClient={(id) => console.log('Ver cliente:', id)}
        onViewProject={(id) => console.log('Ver proyecto:', id)}
      />
      <InvoicePreview
        {...baseInvoice}
        id="inv-002"
        invoiceNumber="FAC-2024-002"
        status="pagada"
        paidAmount={122380.00}
        remainingAmount={0.00}
        paymentHistory={[
          {
            id: 'pay-1',
            date: '2024-01-20',
            amount: 122380.00,
            method: 'transferencia',
            reference: 'TRANSF-001',
            status: 'confirmado',
          },
        ]}
        onDownload={(id) => console.log('Descargar factura:', id)}
        onView={(id) => console.log('Ver factura:', id)}
        onViewClient={(id) => console.log('Ver cliente:', id)}
        onViewProject={(id) => console.log('Ver proyecto:', id)}
      />
      <InvoicePreview
        {...baseInvoice}
        id="inv-003"
        invoiceNumber="FAC-2024-003"
        issueDate="2023-12-01"
        dueDate="2023-12-31"
        status="vencida"
        paymentHistory={[]}
        paidAmount={0.00}
        remainingAmount={122380.00}
        onDownload={(id) => console.log('Descargar factura:', id)}
        onSend={(id) => console.log('Enviar factura:', id)}
        onView={(id) => console.log('Ver factura:', id)}
        onAddPayment={(id) => console.log('Agregar pago:', id)}
        onViewClient={(id) => console.log('Ver cliente:', id)}
        onViewProject={(id) => console.log('Ver proyecto:', id)}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo de múltiples facturas en un layout de grid responsive mostrando diferentes estados de pago.',
      },
    },
  },
};