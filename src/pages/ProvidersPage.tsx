import { Badge } from "@/design-system/components/data-display/Badge/Badge";
import DataTable, { type Column } from "@/design-system/components/data-display/DataTable/DataTable";
import { SectionCard } from "@/design-system/components/layout";
import { supabase } from "@/config/supabase";
import {
  Building,
  Home,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CreateProviderModal } from "@/modules/providers/components/CreateProviderModal";

interface Provider {
  id: string;
  name: string;
  business_name: string | null;
  tax_id: string | null;
  provider_type: "contractor" | "supplier" | "service" | "professional";
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

interface ProviderStats {
  totalProviders: number;
  activeProviders: number;
  byType: {
    contractor: number;
    supplier: number;
    service: number;
    professional: number;
  };
}

export default function ProvidersPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [stats, setStats] = useState<ProviderStats>({
    totalProviders: 0,
    activeProviders: 0,
    byType: {
      contractor: 0,
      supplier: 0,
      service: 0,
      professional: 0,
    },
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("providers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const providersData = data || [];
      setProviders(providersData);

      // Calculate stats
      const activeCount = providersData.filter((p) => p.status === "active").length;
      const typeCount = {
        contractor: providersData.filter((p) => p.provider_type === "contractor").length,
        supplier: providersData.filter((p) => p.provider_type === "supplier").length,
        service: providersData.filter((p) => p.provider_type === "service").length,
        professional: providersData.filter((p) => p.provider_type === "professional").length,
      };

      setStats({
        totalProviders: providersData.length,
        activeProviders: activeCount,
        byType: typeCount,
      });
    } catch (error) {
      console.error("Error loading providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProviderTypeLabel = (type: string) => {
    const labels = {
      contractor: "Proveedor",
      supplier: "Proveedor",
      service: "Servicio",
      professional: "Profesional",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getProviderTypeBadgeVariant = (type: string) => {
    const variants = {
      contractor: "default" as const,
      supplier: "success" as const,
      service: "warning" as const,
      professional: "error" as const,
    };
    return variants[type as keyof typeof variants] || ("default" as const);
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === "active" ? ("success" as const) : ("default" as const);
  };

  const getStatusLabel = (status: string) => {
    return status === "active" ? "Activo" : "Inactivo";
  };

  // Filter providers
  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.phone?.includes(searchTerm) ||
      false;

    const matchesType = filterType === "all" || provider.provider_type === filterType;
    const matchesStatus = filterStatus === "all" || provider.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // DataTable columns
  const columns: Column<Provider>[] = [
    {
      key: "name",
      title: "Nombre",
      sortable: true,
      render: (value: string, record: Provider) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{value}</p>
          {record.business_name && (
            <p className="text-xs text-gray-500">{record.business_name}</p>
          )}
        </div>
      ),
    },
    {
      key: "provider_type",
      title: "Tipo",
      sortable: true,
      render: (value: string) => (
        <Badge variant={getProviderTypeBadgeVariant(value)} size="sm">
          {getProviderTypeLabel(value)}
        </Badge>
      ),
    },
    {
      key: "email",
      title: "Contacto",
      render: (value: string | null, record: Provider) => (
        <div className="space-y-1">
          {value && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-3 w-3" />
              {value}
            </div>
          )}
          {record.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-3 w-3" />
              {record.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "city",
      title: "Ubicación",
      render: (value: string | null) => (
        value ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-3 w-3" />
            {value}
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )
      ),
    },
    {
      key: "tax_id",
      title: "CUIT/CUIL",
      render: (value: string | null) => (
        <span className="text-sm text-gray-600">{value || "-"}</span>
      ),
    },
    {
      key: "status",
      title: "Estado",
      sortable: true,
      render: (value: string) => (
        <Badge variant={getStatusBadgeVariant(value)} size="sm">
          {getStatusLabel(value)}
        </Badge>
      ),
    },
  ];

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
                <BreadcrumbPage>Proveedores</BreadcrumbPage>
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
              <h1 className="text-2xl font-semibold text-gray-900">
                Proveedores
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestione sus proveedores y profesionales
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadProviders}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proveedor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SectionCard className="p-0">
            <div className="px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Proveedores
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalProviders}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard className="p-0">
            <div className="px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Activos</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.activeProviders}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard className="p-0">
            <div className="px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Servicios
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.byType.service}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard className="p-0">
            <div className="px-6 py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Proveedores
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.byType.supplier}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Filters and Search */}
        <SectionCard className="mb-6 p-0">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o teléfono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="contractor">Proveedores</option>
                  <option value="supplier">Proveedores</option>
                  <option value="service">Servicios</option>
                  <option value="professional">Profesionales</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Providers Table */}
        <SectionCard className="p-0">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-600" />
              <h3 className="text-base font-medium text-gray-900">
                Lista de Proveedores
              </h3>
              {filteredProviders.length > 0 && (
                <Badge variant="default" size="sm">
                  {filteredProviders.length}
                </Badge>
              )}
            </div>
          </div>
          <div className="px-6 py-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredProviders}
                emptyText="No se encontraron proveedores"
                searchable={false}
                striped={true}
              />
            )}
          </div>
        </SectionCard>
      </div>

      {/* Create Provider Modal */}
      <CreateProviderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadProviders}
      />
    </div>
  );
}