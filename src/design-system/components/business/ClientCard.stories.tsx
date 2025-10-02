import type { Meta, StoryObj } from '@storybook/react';
import ClientCard from './ClientCard';

const meta: Meta<typeof ClientCard> = {
  title: 'Design System/Business/ClientCard',
  component: ClientCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Tarjeta de cliente para mostrar información de contacto, proyectos y acciones rápidas en el CRM de construcción mexicano.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['activo', 'inactivo', 'prospecto'],
      description: 'Estado actual del cliente',
    },
    type: {
      control: 'select',
      options: ['empresa', 'particular'],
      description: 'Tipo de cliente',
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
type Story = StoryObj<typeof ClientCard>;

const baseClient = {
  id: 'client-1',
  name: 'Constructora Del Valle',
  type: 'empresa' as const,
  status: 'activo' as const,
  contact: {
    name: 'Carlos Mendoza',
    phone: '+52 55 1234 5678',
    email: 'carlos.mendoza@delvalle.com.mx',
    position: 'Director de Proyectos',
    whatsapp: '+525512345678',
    isPrimary: true,
  },
  company: {
    name: 'Constructora Del Valle S.A. de C.V.',
    industry: 'Construcción Residencial',
    size: 'mediana' as const,
    rfc: 'CDV123456789',
  },
  address: {
    street: 'Av. Revolución 1234',
    city: 'Ciudad de México',
    state: 'CDMX',
    zipCode: '03100',
  },
  recentProjects: [
    {
      id: 'proj-1',
      name: 'Residencial Los Pinos',
      status: 'en-curso' as const,
      value: 2500000,
      startDate: '2024-01-15',
      progress: 65,
    },
    {
      id: 'proj-2',
      name: 'Torre Corporativa Centro',
      status: 'completado' as const,
      value: 5800000,
      startDate: '2023-08-01',
      progress: 100,
    },
    {
      id: 'proj-3',
      name: 'Fraccionamiento Valle Verde',
      status: 'propuesta' as const,
      value: 1200000,
      startDate: '2024-03-01',
      progress: 0,
    },
  ],
  totalValue: 9500000,
  lastContact: '2024-01-10',
  notes: 'Cliente preferencial con excelente historial de pagos. Interesado en proyectos de vivienda social.',
};

export const Default: Story = {
  args: {
    ...baseClient,
    onCall: (phone) => console.log('Llamando a:', phone),
    onEmail: (email) => console.log('Enviando email a:', email),
    onWhatsApp: (phone) => console.log('WhatsApp a:', phone),
    onViewDetails: (id) => console.log('Ver detalles del cliente:', id),
    onEditClient: (id) => console.log('Editar cliente:', id),
  },
};

export const ClienteParticular: Story = {
  args: {
    ...baseClient,
    id: 'client-2',
    name: 'María González López',
    type: 'particular',
    status: 'activo',
    contact: {
      name: 'María González López',
      phone: '+52 55 9876 5432',
      email: 'maria.gonzalez@gmail.com',
      whatsapp: '+525598765432',
      isPrimary: true,
    },
    company: undefined,
    recentProjects: [
      {
        id: 'proj-4',
        name: 'Casa Familiar González',
        status: 'en-curso',
        value: 850000,
        startDate: '2024-02-01',
        progress: 30,
      },
    ],
    totalValue: 850000,
    notes: 'Cliente particular interesada en construcción de casa familiar. Primera construcción.',
    onCall: (phone) => console.log('Llamando a:', phone),
    onEmail: (email) => console.log('Enviando email a:', email),
    onWhatsApp: (phone) => console.log('WhatsApp a:', phone),
    onViewDetails: (id) => console.log('Ver detalles del cliente:', id),
    onEditClient: (id) => console.log('Editar cliente:', id),
  },
};

export const Prospecto: Story = {
  args: {
    ...baseClient,
    id: 'client-3',
    name: 'Desarrollos Inmobiliarios Norte',
    status: 'prospecto',
    recentProjects: [
      {
        id: 'proj-5',
        name: 'Complejo Residencial Norte',
        status: 'propuesta',
        value: 12000000,
        startDate: '2024-04-01',
        progress: 0,
      },
    ],
    totalValue: 12000000,
    lastContact: '2024-01-05',
    notes: 'Prospecto con gran potencial. Interesados en proyecto de gran escala. Pendiente propuesta técnica.',
    onCall: (phone) => console.log('Llamando a:', phone),
    onEmail: (email) => console.log('Enviando email a:', email),
    onWhatsApp: (phone) => console.log('WhatsApp a:', phone),
    onViewDetails: (id) => console.log('Ver detalles del cliente:', id),
    onEditClient: (id) => console.log('Editar cliente:', id),
  },
};

export const ClienteInactivo: Story = {
  args: {
    ...baseClient,
    id: 'client-4',
    name: 'Construcciones del Sur',
    status: 'inactivo',
    recentProjects: [
      {
        id: 'proj-6',
        name: 'Oficinas Corporativas Sur',
        status: 'completado',
        value: 3200000,
        startDate: '2023-03-01',
        progress: 100,
      },
    ],
    totalValue: 3200000,
    lastContact: '2023-12-15',
    notes: 'Cliente inactivo desde diciembre 2023. Último proyecto completado exitosamente.',
    onCall: (phone) => console.log('Llamando a:', phone),
    onEmail: (email) => console.log('Enviando email a:', email),
    onWhatsApp: (phone) => console.log('WhatsApp a:', phone),
    onViewDetails: (id) => console.log('Ver detalles del cliente:', id),
    onEditClient: (id) => console.log('Editar cliente:', id),
  },
};

export const SinProyectos: Story = {
  args: {
    ...baseClient,
    id: 'client-5',
    name: 'Nuevo Cliente Potencial',
    status: 'prospecto',
    recentProjects: [],
    totalValue: 0,
    lastContact: '2024-01-12',
    notes: 'Cliente nuevo sin proyectos previos. Primera reunión programada.',
    onCall: (phone) => console.log('Llamando a:', phone),
    onEmail: (email) => console.log('Enviando email a:', email),
    onWhatsApp: (phone) => console.log('WhatsApp a:', phone),
    onViewDetails: (id) => console.log('Ver detalles del cliente:', id),
    onEditClient: (id) => console.log('Editar cliente:', id),
  },
};

export const TamañoPequeño: Story = {
  args: {
    ...baseClient,
    size: 'sm',
    onCall: (phone) => console.log('Llamando a:', phone),
    onEmail: (email) => console.log('Enviando email a:', email),
    onWhatsApp: (phone) => console.log('WhatsApp a:', phone),
    onViewDetails: (id) => console.log('Ver detalles del cliente:', id),
    onEditClient: (id) => console.log('Editar cliente:', id),
  },
};

export const TamañoGrande: Story = {
  args: {
    ...baseClient,
    size: 'lg',
    onCall: (phone) => console.log('Llamando a:', phone),
    onEmail: (email) => console.log('Enviando email a:', email),
    onWhatsApp: (phone) => console.log('WhatsApp a:', phone),
    onViewDetails: (id) => console.log('Ver detalles del cliente:', id),
    onEditClient: (id) => console.log('Editar cliente:', id),
  },
};

export const EstadoCarga: Story = {
  args: {
    ...baseClient,
    loading: true,
  },
};

export const ConAvatar: Story = {
  args: {
    ...baseClient,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    onCall: (phone) => console.log('Llamando a:', phone),
    onEmail: (email) => console.log('Enviando email a:', email),
    onWhatsApp: (phone) => console.log('WhatsApp a:', phone),
    onViewDetails: (id) => console.log('Ver detalles del cliente:', id),
    onEditClient: (id) => console.log('Editar cliente:', id),
  },
};

export const SinAcciones: Story = {
  args: {
    ...baseClient,
    // No se pasan los callbacks de acción
  },
};

// Story para mostrar múltiples tarjetas en un grid
export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ClientCard
        {...baseClient}
        onCall={(phone) => console.log('Llamando a:', phone)}
        onEmail={(email) => console.log('Enviando email a:', email)}
        onWhatsApp={(phone) => console.log('WhatsApp a:', phone)}
        onViewDetails={(id) => console.log('Ver detalles del cliente:', id)}
        onEditClient={(id) => console.log('Editar cliente:', id)}
      />
      <ClientCard
        {...baseClient}
        id="client-2"
        name="María González López"
        type="particular"
        status="prospecto"
        company={undefined}
        recentProjects={[
          {
            id: 'proj-4',
            name: 'Casa Familiar González',
            status: 'propuesta',
            value: 850000,
            startDate: '2024-02-01',
            progress: 0,
          },
        ]}
        totalValue={850000}
        onCall={(phone) => console.log('Llamando a:', phone)}
        onEmail={(email) => console.log('Enviando email a:', email)}
        onWhatsApp={(phone) => console.log('WhatsApp a:', phone)}
        onViewDetails={(id) => console.log('Ver detalles del cliente:', id)}
        onEditClient={(id) => console.log('Editar cliente:', id)}
      />
      <ClientCard
        {...baseClient}
        id="client-3"
        name="Construcciones del Sur"
        status="inactivo"
        recentProjects={[]}
        totalValue={0}
        lastContact="2023-11-20"
        onCall={(phone) => console.log('Llamando a:', phone)}
        onEmail={(email) => console.log('Enviando email a:', email)}
        onWhatsApp={(phone) => console.log('WhatsApp a:', phone)}
        onViewDetails={(id) => console.log('Ver detalles del cliente:', id)}
        onEditClient={(id) => console.log('Editar cliente:', id)}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo de múltiples tarjetas de cliente en un layout de grid responsive.',
      },
    },
  },
};