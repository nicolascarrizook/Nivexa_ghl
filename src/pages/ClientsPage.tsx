import {
  Activity,
  Building2,
  Edit2,
  Eye,
  Home,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// UI Components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Design System Components
import type { Column } from "@/design-system/components/data-display";
import {
  Badge,
  DataTable,
  StatCard,
} from "@/design-system/components/data-display";
import EmptyState from "@/design-system/components/feedback/EmptyState";
import Input from "@/design-system/components/inputs/Input";
import { SectionCard } from "@/design-system/components/layout";

// Hooks and utilities
import { Button } from "@/design-system/components/inputs";
import { CreateClientModal } from "@/modules/clients/components/CreateClientModal";
import { useClients } from "@/modules/clients/hooks/useClients";
import { formatCurrency, formatDate, formatPhone } from "@/utils/formatters";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  clientType: "individual" | "company" | "government";
  status: "active" | "inactive" | "pending";
  activeProjects: number;
  totalProjects: number;
  totalRevenue: number;
  lastActivity: string;
  createdAt: string;
}

export function ClientsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch clients from Supabase
  const {
    clients: allClients,
    isLoading,
    refetch,
    deleteClient,
  } = useClients({ autoLoad: true });

  // Convert database clients to display format
  const displayClients = useMemo(() => {
    if (!allClients) return [];

    return allClients.map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      company: client.name, // Using name as company for now
      clientType: "individual" as const, // Default type
      status: "active" as const, // Default status
      activeProjects: 0, // TODO: Calculate from projects
      totalProjects: 0, // TODO: Calculate from projects
      totalRevenue: 0, // TODO: Calculate from projects
      lastActivity: client.updated_at || client.created_at,
      createdAt: client.created_at,
    }));
  }, [allClients]);

  // Process clients data
  const clients = useMemo(() => {
    let filtered = [...displayClients];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((client) => client.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((client) => client.clientType === typeFilter);
    }

    return filtered;
  }, [displayClients, searchTerm, statusFilter, typeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalClients = displayClients.length;
    const activeClients = displayClients.filter(
      (c) => c.status === "active"
    ).length;
    const activeProjects = displayClients.reduce(
      (sum, c) => sum + c.activeProjects,
      0
    );
    const totalRevenue = displayClients.reduce(
      (sum, c) => sum + c.totalRevenue,
      0
    );

    // Calculate retention rate (clients with more than 1 project)
    const retentionRate =
      totalClients > 0
        ? Math.round(
            (displayClients.filter((c) => c.totalProjects > 1).length /
              totalClients) *
              100
          )
        : 0;

    return {
      totalClients,
      activeClients,
      activeProjects,
      retentionRate,
      totalRevenue,
    };
  }, [displayClients]);

  const handleNewClient = () => {
    setIsCreateModalOpen(true);
  };

  const handleClientCreated = () => {
    // El hook useClients ya actualiza la lista automáticamente
    // Solo necesitamos cerrar el modal
    setIsCreateModalOpen(false);
  };

  const handleEditClient = (client: Client) => {
    navigate(`/clients/${client.id}/edit`);
  };

  const handleDeleteClient = async (client: Client) => {
    if (confirm(`¿Estás seguro de eliminar el cliente "${client.name}"?`)) {
      const success = await deleteClient(client.id);
      if (success) {
        // The client list will be automatically updated by the hook
        console.log("Cliente eliminado exitosamente");
      }
    }
  };

  const handleExport = (data: Client[]) => {
    const headers = [
      "Nombre",
      "Empresa",
      "Email",
      "Teléfono",
      "Tipo",
      "Estado",
      "Proyectos Activos",
      "Total Proyectos",
      "Facturación Total",
    ];
    const rows = data.map((c) => [
      c.name,
      c.company,
      c.email,
      c.phone,
      c.clientType,
      c.status,
      c.activeProjects,
      c.totalProjects,
      c.totalRevenue,
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clientes-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const STATUS_CONFIG = {
    active: { label: "Activo", variant: "success" as const },
    inactive: { label: "Inactivo", variant: "error" as const },
    pending: { label: "Pendiente", variant: "warning" as const },
  };

  const TYPE_LABELS = {
    individual: "Individual",
    company: "Empresa",
    government: "Gobierno",
  };

  // Define table columns
  const columns: Column[] = [
    {
      key: "name",
      title: "Cliente",
      sortable: true,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            {record.clientType === "company" ||
            record.clientType === "government" ? (
              <Building2 className="h-5 w-5 text-gray-600" />
            ) : (
              <User className="h-5 w-5 text-gray-600" />
            )}
          </div>
          <div>
            <button
              onClick={() => navigate(`/clients/${record.id}`)}
              className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
            >
              {record.name}
            </button>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-xs text-gray-500">{record.company}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Contacto",
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <Mail className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-900">{record.email}</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-500">
              {formatPhone(record.phone)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "clientType",
      title: "Tipo",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {TYPE_LABELS[value as keyof typeof TYPE_LABELS] || value}
        </span>
      ),
    },
    {
      key: "status",
      title: "Estado",
      sortable: true,
      render: (value) => {
        const statusConfig = STATUS_CONFIG[value as keyof typeof STATUS_CONFIG];
        return (
          <Badge variant={statusConfig?.variant || "default"} size="sm">
            {statusConfig?.label || value}
          </Badge>
        );
      },
    },
    {
      key: "projects",
      title: "Proyectos",
      sortable: true,
      render: (_, record) => (
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">
            {record.activeProjects} activos
          </p>
          <p className="text-sm text-gray-500">{record.totalProjects} total</p>
        </div>
      ),
    },
    {
      key: "totalRevenue",
      title: "Facturación",
      sortable: true,
      align: "right",
      render: (value) => (
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {formatCurrency(value)}
          </p>
        </div>
      ),
    },
    {
      key: "lastActivity",
      title: "Última Actividad",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">{formatDate(value)}</span>
      ),
    },
  ];

  const rowActions = {
    items: [
      {
        key: "view",
        label: "Ver perfil",
        icon: <Eye className="h-4 w-4" />,
        onClick: (record: Client) => navigate(`/clients/${record.id}`),
      },
      {
        key: "edit",
        label: "Editar",
        icon: <Edit2 className="h-4 w-4" />,
        onClick: handleEditClient,
      },
      {
        key: "delete",
        label: "Eliminar",
        icon: <Trash2 className="h-4 w-4" />,
        onClick: handleDeleteClient,
        danger: true,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center">
                    <Home className="h-4 w-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Nivexa Studio</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Gestión de Clientes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
              <p className="mt-1 text-sm text-gray-500">
                {stats.totalClients}{" "}
                {stats.totalClients === 1 ? "cliente" : "clientes"} en total •{" "}
                {formatCurrency(stats.totalRevenue)} facturación total
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => handleExport(clients)}
                variant="outline"
                size="sm"
              >
                Exportar
              </Button>
              <Button onClick={handleNewClient} variant="primary" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Clientes"
            value={stats.totalClients.toString()}
            icon={Users}
            variant="default"
            description="Clientes registrados en el sistema"
          />

          <StatCard
            title="Clientes Activos"
            value={stats.activeClients.toString()}
            icon={Activity}
            variant="success"
            description="Clientes con proyectos activos"
          />

          <StatCard
            title="Proyectos en Curso"
            value={stats.activeProjects.toString()}
            icon={Building2}
            variant="info"
            description="Proyectos en desarrollo"
          />

          <StatCard
            title="Tasa de Retención"
            value={`${stats.retentionRate}%`}
            icon={TrendingUp}
            variant="default"
            description="Clientes con múltiples proyectos"
          />
        </div>

        {/* Filters */}
        <SectionCard className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="pending">Pendiente</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white"
            >
              <option value="all">Todos los tipos</option>
              <option value="individual">Individual</option>
              <option value="company">Empresa</option>
              <option value="government">Gobierno</option>
            </select>
          </div>
        </SectionCard>

        {/* Clients Table - Solo mostrar si hay clientes en la base de datos O si hay filtros activos */}
        {(displayClients.length > 0 ||
          searchTerm ||
          statusFilter !== "all" ||
          typeFilter !== "all") && (
          <SectionCard className="p-0">
            <DataTable
              data={clients}
              columns={columns}
              loading={isLoading}
              rowKey="id"
              rowActions={rowActions}
              onRowClick={(record) => navigate(`/clients/${record.id}`)}
              searchable={false}
              exportable={true}
              onExport={handleExport}
              size="md"
              bordered={true}
              emptyText="No se encontraron clientes que coincidan con los filtros."
            />
          </SectionCard>
        )}

        {/* Empty State - Solo mostrar cuando NO hay clientes en absoluto y NO hay filtros */}
        {displayClients.length === 0 &&
          !isLoading &&
          !searchTerm &&
          statusFilter === "all" &&
          typeFilter === "all" && (
            <EmptyState
              variant="no-clients"
              size="md"
              design="card"
              animated={true}
            />
          )}
      </div>

      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
}
