import { Button } from "@/components/Button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DataTable } from "@/design-system/components/data-display";
import type { Column } from "@/design-system/components/data-display";
import { SectionCard } from "@/design-system/components/layout/SectionCard";
import MetricGrid from "@/design-system/components/data-display/MetricGrid/MetricGrid";
import type { StatCardProps } from "@/design-system/components/data-display/StatCard/StatCard";
import {
  ArrowLeft,
  Building2,
  Copy,
  DollarSign,
  Edit,
  Mail,
  MapPin,
  Percent,
  Phone,
  Shield,
  TrendingUp,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useInvestor,
  useUpdateInvestor,
  useDeleteInvestor,
} from "@/modules/investors/hooks/useInvestors";
import { useInvestorProjects } from "@/modules/investors/hooks/useProjectInvestors";
import {
  useGenerateAccessToken,
  useCopyMagicLink,
} from "@/modules/investors/hooks/useInvestorAccess";
import {
  INVESTOR_TYPE_LABELS,
  INVESTMENT_TYPE_LABELS,
  type InvestmentType,
} from "@/modules/investors/types/investor.types";
import Modal from "@/design-system/components/feedback/Modal";
import Input from "@/design-system/components/inputs/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/hooks/useToast";
import { formatDate } from "@/utils/formatters";

// Validation schema for edit
const editInvestorSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  tax_id: z.string().optional(),
  investor_type: z.enum(["individual", "company"]),
  address: z.string().optional(),
  city: z.string().optional(),
});

type EditInvestorFormData = z.infer<typeof editInvestorSchema>;

export function InvestorProfilePage() {
  const navigate = useNavigate();
  const { investorId } = useParams<{ investorId: string }>();
  const [showEditModal, setShowEditModal] = useState(false);

  // Queries
  const { data: investor, isLoading } = useInvestor(investorId || "");
  const { data: projects = [], isLoading: loadingProjects } =
    useInvestorProjects(investorId || "");

  // Mutations
  const updateMutation = useUpdateInvestor();
  const deleteMutation = useDeleteInvestor();
  const generateTokenMutation = useGenerateAccessToken();
  const copyLinkMutation = useCopyMagicLink();

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditInvestorFormData>({
    resolver: zodResolver(editInvestorSchema),
  });

  // Load form data when investor loads
  useState(() => {
    if (investor) {
      reset({
        name: investor.name,
        email: investor.email || "",
        phone: investor.phone || "",
        tax_id: investor.tax_id || "",
        investor_type: investor.investor_type,
        address: investor.address || "",
        city: investor.city || "",
      });
    }
  });

  const onSubmit = async (data: EditInvestorFormData) => {
    if (!investorId) return;

    try {
      await updateMutation.mutateAsync({
        id: investorId,
        updates: {
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          tax_id: data.tax_id || null,
          investor_type: data.investor_type,
          address: data.address || null,
          city: data.city || null,
        },
      });

      toast({
        title: "Inversionista actualizado",
        description: "Los cambios se guardaron correctamente",
      });

      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating investor:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el inversionista",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!investorId) return;

    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar este inversionista? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(investorId);
      toast({
        title: "Inversionista eliminado",
        description: "El inversionista ha sido eliminado del sistema",
      });
      navigate("/investors");
    } catch (error) {
      console.error("Error deleting investor:", error);
      toast({
        title: "Error",
        description:
          "No se pudo eliminar el inversionista. Puede tener proyectos activos.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateMagicLink = async () => {
    if (!investorId) return;

    try {
      // Generate token (expires in 30 days)
      const token = await generateTokenMutation.mutateAsync({
        investorId,
        expiresInDays: 30,
      });

      // Copy magic link to clipboard
      await copyLinkMutation.mutateAsync({
        token: token.token,
        baseUrl: window.location.origin,
      });

      toast({
        title: "Link copiado",
        description: "El link de acceso ha sido copiado al portapapeles",
      });
    } catch (error) {
      console.error("Error generating magic link:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el link de acceso",
        variant: "destructive",
      });
    }
  };

  // Calculate totals
  const totalProjects = projects.length;
  const totalInvestedArs = projects.reduce(
    (sum, proj) => sum + proj.investment_amount_ars,
    0
  );
  const totalInvestedUsd = projects.reduce(
    (sum, proj) => sum + proj.investment_amount_usd,
    0
  );
  const averageShare =
    totalProjects > 0
      ? projects.reduce((sum, proj) => sum + proj.percentage_share, 0) /
        totalProjects
      : 0;

  // DataTable columns
  const columns: Column<any>[] = [
    {
      id: "project",
      header: "Proyecto",
      accessor: "project_name",
      cell: (row) => (
        <div>
          <Link
            to={`/projects/${row.project_id}`}
            className="font-medium text-gray-900 hover:text-blue-600"
          >
            {row.project_name}
          </Link>
          <p className="text-xs text-gray-500 mt-1">{row.project_code}</p>
        </div>
      ),
    },
    {
      id: "investment_type",
      header: "Tipo de Inversión",
      accessor: "investment_type",
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {INVESTMENT_TYPE_LABELS[row.investment_type as InvestmentType]}
        </span>
      ),
    },
    {
      id: "amount_ars",
      header: "Inversión ARS",
      accessor: "investment_amount_ars",
      cell: (row) => (
        <div className="text-right">
          <p className="font-medium text-gray-900">
            ${row.investment_amount_ars.toLocaleString()}
          </p>
        </div>
      ),
    },
    {
      id: "amount_usd",
      header: "Inversión USD",
      accessor: "investment_amount_usd",
      cell: (row) => (
        <div className="text-right">
          <p className="font-medium text-gray-900">
            ${row.investment_amount_usd.toLocaleString()}
          </p>
        </div>
      ),
    },
    {
      id: "percentage",
      header: "Participación",
      accessor: "percentage_share",
      cell: (row) => (
        <div className="flex items-center justify-end space-x-2">
          <Percent className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">
            {row.percentage_share.toFixed(2)}%
          </span>
        </div>
      ),
    },
    {
      id: "date",
      header: "Fecha",
      accessor: "created_at",
      cell: (row) => (
        <span className="text-sm text-gray-600">
          {formatDate(row.created_at)}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Inversionista no encontrado</p>
          <Button
            onClick={() => navigate("/investors")}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Inversionistas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/investors">Inversionistas</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{investor.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-4 bg-gray-100 rounded-xl">
              <User className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {investor.name}
              </h1>
              <div className="flex items-center space-x-2 mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {INVESTOR_TYPE_LABELS[investor.investor_type]}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={handleGenerateMagicLink}
              variant="outline"
              size="sm"
              disabled={generateTokenMutation.isPending}
            >
              <Copy className="w-4 h-4 mr-2" />
              {generateTokenMutation.isPending
                ? "Generando..."
                : "Copiar Link de Acceso"}
            </Button>

            <Button
              onClick={() => setShowEditModal(true)}
              variant="outline"
              size="sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        {/* Investor Details Card */}
        <SectionCard
          title="Información del Inversionista"
          icon={<User className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {investor.email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm text-gray-900">{investor.email}</p>
                </div>
              </div>
            )}

            {investor.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Teléfono</p>
                  <p className="text-sm text-gray-900">{investor.phone}</p>
                </div>
              </div>
            )}

            {investor.tax_id && (
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">CUIT/DNI</p>
                  <p className="text-sm text-gray-900">{investor.tax_id}</p>
                </div>
              </div>
            )}

            {investor.city && (
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ciudad</p>
                  <p className="text-sm text-gray-900">{investor.city}</p>
                </div>
              </div>
            )}

            {investor.address && (
              <div className="flex items-center space-x-3 md:col-span-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Dirección</p>
                  <p className="text-sm text-gray-900">{investor.address}</p>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Stats */}
        <MetricGrid
          metrics={
            [
              {
                title: "Proyectos Activos",
                value: totalProjects.toString(),
                icon: Building2,
                description: "Proyectos con participación",
                variant: "default",
              },
              {
                title: "Inversión Total ARS",
                value: `$${totalInvestedArs.toLocaleString()}`,
                icon: DollarSign,
                description: "Capital invertido en pesos",
                variant: "default",
              },
              {
                title: "Inversión Total USD",
                value: `$${totalInvestedUsd.toLocaleString()}`,
                icon: DollarSign,
                description: "Capital invertido en dólares",
                variant: "default",
              },
              {
                title: "Participación Promedio",
                value: `${averageShare.toFixed(1)}%`,
                icon: TrendingUp,
                description: "Porcentaje promedio en proyectos",
                variant: "default",
              },
            ] as StatCardProps[]
          }
          columns={4}
          gap="md"
          animated
        />

        {/* Projects Table */}
        <SectionCard
          title="Proyectos con Participación"
          icon={<Building2 className="w-5 h-5" />}
          subtitle={`${totalProjects} proyecto${totalProjects !== 1 ? "s" : ""}`}
        >
          <DataTable
            data={projects}
            columns={columns}
            loading={loadingProjects}
            rowKey="id"
            searchable={false}
            exportable
            size="md"
            bordered={false}
            emptyText="Este inversionista aún no participa en ningún proyecto"
            pagination
            pageSize={10}
          />
        </SectionCard>

        {/* Danger Zone */}
        <SectionCard
          title="Zona de Peligro"
          icon={<Shield className="w-5 h-5" />}
          subtitle="Acciones irreversibles"
        >
          <div className="mt-6 p-4 border border-red-200 rounded-lg bg-red-50">
            <p className="text-sm text-red-900 mb-4">
              Eliminar este inversionista es una acción permanente. Solo se
              puede eliminar si no tiene proyectos activos.
            </p>
            <Button
              onClick={handleDelete}
              variant="outline"
              size="sm"
              disabled={totalProjects > 0 || deleteMutation.isPending}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar Inversionista"}
            </Button>
            {totalProjects > 0 && (
              <p className="text-xs text-red-600 mt-2">
                No se puede eliminar: tiene {totalProjects} proyecto
                {totalProjects !== 1 ? "s" : ""} activo
                {totalProjects !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        size="lg"
      >
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Editar Inversionista
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Modifica la información del inversionista
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <SectionCard
              title="Información Básica"
              icon={<User className="w-5 h-5" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Input
                  label="Nombre Completo"
                  {...register("name")}
                  error={errors.name?.message}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Inversionista
                  </label>
                  <select
                    {...register("investor_type")}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                  >
                    <option value="individual">Persona física</option>
                    <option value="company">Empresa</option>
                  </select>
                </div>

                <Input
                  label="Email"
                  type="email"
                  {...register("email")}
                  error={errors.email?.message}
                />

                <Input label="Teléfono" {...register("phone")} />

                <Input label="CUIT/DNI" {...register("tax_id")} />

                <Input label="Ciudad" {...register("city")} />

                <div className="md:col-span-2">
                  <Input label="Dirección" {...register("address")} />
                </div>
              </div>
            </SectionCard>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={() => setShowEditModal(false)}
                variant="ghost"
                size="sm"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
