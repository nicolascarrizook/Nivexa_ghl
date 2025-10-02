import type { Meta, StoryObj } from '@storybook/react';
import { Eye, Edit, Trash2, User, Mail, Phone, MapPin, Calendar, DollarSign } from 'lucide-react';
import DataTable, { type Column } from './DataTable/DataTable';

const meta = {
  title: 'Design System/Data Display/DataTable',
  component: DataTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Tabla de datos avanzada con ordenación, filtrado, paginación y selección de filas para el CRM.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Tamaño de la tabla',
    },
    striped: {
      control: 'boolean',
      description: 'Filas con bandas zebra',
    },
    bordered: {
      control: 'boolean',
      description: 'Bordes en la tabla',
    },
    searchable: {
      control: 'boolean',
      description: 'Búsqueda global',
    },
    exportable: {
      control: 'boolean',
      description: 'Función de exportar',
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carga',
    },
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// Datos de ejemplo para CRM
const clientsData = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+34 600 123 456',
    company: 'Tech Solutions S.L.',
    status: 'Activo',
    lastContact: '2024-01-15',
    value: 15000,
    location: 'Madrid, España',
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria.garcia@company.com',
    phone: '+34 600 789 012',
    company: 'Innovate Corp',
    status: 'Prospecto',
    lastContact: '2024-01-12',
    value: 8500,
    location: 'Barcelona, España',
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@business.es',
    phone: '+34 600 345 678',
    company: 'Digital Ventures',
    status: 'Inactivo',
    lastContact: '2023-12-20',
    value: 22000,
    location: 'Valencia, España',
  },
  {
    id: '4',
    name: 'Ana Martínez',
    email: 'ana.martinez@startup.io',
    phone: '+34 600 901 234',
    company: 'StartupHub',
    status: 'Activo',
    lastContact: '2024-01-18',
    value: 12000,
    location: 'Sevilla, España',
  },
  {
    id: '5',
    name: 'Luis Fernández',
    email: 'luis.fernandez@enterprise.com',
    phone: '+34 600 567 890',
    company: 'Enterprise Solutions',
    status: 'Negociación',
    lastContact: '2024-01-20',
    value: 35000,
    location: 'Bilbao, España',
  },
];

const getStatusBadge = (status: string) => {
  const variants = {
    'Activo': 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400',
    'Prospecto': 'bg-info-100 text-info-800 dark:bg-info-900/20 dark:text-info-400',
    'Inactivo': 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400',
    'Negociación': 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[status as keyof typeof variants] || variants.Inactivo}`}>
      {status}
    </span>
  );
};

const clientColumns: Column[] = [
  {
    key: 'name',
    title: 'Cliente',
    sortable: true,
    render: (value, record) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <div className="font-medium text-neutral-900 dark:text-neutral-100">{value}</div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">{record.company}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'email',
    title: 'Contacto',
    render: (value, record) => (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-3 h-3 text-neutral-400" />
          <span className="text-neutral-900 dark:text-neutral-100">{value}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-3 h-3 text-neutral-400" />
          <span className="text-neutral-500 dark:text-neutral-400">{record.phone}</span>
        </div>
      </div>
    ),
  },
  {
    key: 'location',
    title: 'Ubicación',
    render: (value) => (
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-neutral-400" />
        <span className="text-neutral-900 dark:text-neutral-100">{value}</span>
      </div>
    ),
  },
  {
    key: 'status',
    title: 'Estado',
    sortable: true,
    align: 'center',
    render: (value) => getStatusBadge(value),
  },
  {
    key: 'value',
    title: 'Valor',
    sortable: true,
    align: 'right',
    render: (value) => (
      <div className="flex items-center justify-end gap-1">
        <DollarSign className="w-4 h-4 text-success-600 dark:text-success-400" />
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {new Intl.NumberFormat('es-ES', { 
            style: 'currency', 
            currency: 'EUR',
            minimumFractionDigits: 0,
          }).format(value)}
        </span>
      </div>
    ),
    sorter: (a, b) => a.value - b.value,
  },
  {
    key: 'lastContact',
    title: 'Último Contacto',
    sortable: true,
    render: (value) => (
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-neutral-400" />
        <span className="text-neutral-900 dark:text-neutral-100">
          {new Date(value).toLocaleDateString('es-ES')}
        </span>
      </div>
    ),
  },
];

export const Default: Story = {
  args: {
    data: clientsData,
    columns: clientColumns,
    rowKey: 'id',
  },
};

export const WithSearch: Story = {
  args: {
    data: clientsData,
    columns: clientColumns,
    rowKey: 'id',
    searchable: true,
    searchPlaceholder: 'Buscar clientes...',
  },
};

export const WithPagination: Story = {
  args: {
    data: [...clientsData, ...clientsData, ...clientsData], // Más datos para mostrar paginación
    columns: clientColumns,
    rowKey: 'id',
    searchable: true,
    pagination: {
      pageSize: 5,
      showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} clientes`,
    },
  },
};

export const WithRowSelection: Story = {
  args: {
    data: clientsData,
    columns: clientColumns,
    rowKey: 'id',
    searchable: true,
    rowSelection: {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log('Selected:', selectedRowKeys, selectedRows);
      },
    },
  },
};

export const WithRowActions: Story = {
  args: {
    data: clientsData,
    columns: clientColumns,
    rowKey: 'id',
    searchable: true,
    rowActions: {
      items: [
        {
          key: 'view',
          label: 'Ver detalles',
          icon: <Eye className="w-4 h-4" />,
          onClick: (record) => console.log('Ver:', record.name),
        },
        {
          key: 'edit',
          label: 'Editar',
          icon: <Edit className="w-4 h-4" />,
          onClick: (record) => console.log('Editar:', record.name),
        },
        {
          key: 'delete',
          label: 'Eliminar',
          icon: <Trash2 className="w-4 h-4" />,
          onClick: (record) => console.log('Eliminar:', record.name),
          danger: true,
          disabled: (record) => record.status === 'Activo',
        },
      ],
    },
  },
};

export const WithExport: Story = {
  args: {
    data: clientsData,
    columns: clientColumns,
    rowKey: 'id',
    searchable: true,
    exportable: true,
    onExport: (data) => {
      console.log('Exportando datos:', data);
      // En una implementación real, aquí se generaría el archivo CSV/Excel
      alert(`Exportando ${data.length} registros`);
    },
  },
};

export const SmallSize: Story = {
  args: {
    data: clientsData.slice(0, 3),
    columns: clientColumns,
    rowKey: 'id',
    size: 'sm',
    searchable: true,
  },
};

export const LargeSize: Story = {
  args: {
    data: clientsData,
    columns: clientColumns,
    rowKey: 'id',
    size: 'lg',
    searchable: true,
    striped: true,
  },
};

export const Loading: Story = {
  args: {
    data: [],
    columns: clientColumns,
    rowKey: 'id',
    loading: true,
    searchable: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns: clientColumns,
    rowKey: 'id',
    searchable: true,
    emptyText: 'No se encontraron clientes',
  },
};

export const CompleteExample: Story = {
  args: {
    data: clientsData,
    columns: clientColumns,
    rowKey: 'id',
    searchable: true,
    exportable: true,
    striped: true,
    pagination: {
      pageSize: 10,
    },
    rowSelection: {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log('Clientes seleccionados:', selectedRows.length);
      },
    },
    rowActions: {
      items: [
        {
          key: 'view',
          label: 'Ver perfil',
          icon: <Eye className="w-4 h-4" />,
          onClick: (record) => alert(`Ver perfil de ${record.name}`),
        },
        {
          key: 'edit',
          label: 'Editar cliente',
          icon: <Edit className="w-4 h-4" />,
          onClick: (record) => alert(`Editar ${record.name}`),
        },
        {
          key: 'delete',
          label: 'Eliminar cliente',
          icon: <Trash2 className="w-4 h-4" />,
          onClick: (record) => alert(`¿Eliminar ${record.name}?`),
          danger: true,
          disabled: (record) => record.status === 'Activo',
        },
      ],
    },
    onRowClick: (record) => {
      console.log('Clic en fila:', record.name);
    },
    onExport: (data) => {
      alert(`Exportando ${data.length} clientes`);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Ejemplo completo con todas las funcionalidades disponibles.',
      },
    },
  },
};