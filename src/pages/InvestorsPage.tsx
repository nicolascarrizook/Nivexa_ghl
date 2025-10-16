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
  Building2,
  DollarSign,
  Mail,
  Phone,
  Plus,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useInvestorsWithStats, useCreateInvestor } from "@/modules/investors/hooks/useInvestors";
import {
  INVESTOR_TYPE_LABELS,
  type InvestorType,
} from "@/modules/investors/types/investor.types";
import Modal from "@/design-system/components/feedback/Modal";
import Input from "@/design-system/components/inputs/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "@/hooks/useToast";

// Validation schema for new investor
const createInvestorSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  tax_id: z.string().optional(),
  investor_type: z.enum(["individual", "company"]),
  address: z.string().optional(),
  city: z.string().optional(),
});

type CreateInvestorFormData = z.infer<typeof createInvestorSchema>;

export function InvestorsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load investors with stats
  const { data: investors = [], isLoading } = useInvestorsWithStats();

  // Create mutation
  const createMutation = useCreateInvestor();

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateInvestorFormData>({
    resolver: zodResolver(createInvestorSchema),
    defaultValues: {
      investor_type: "individual",
    },
  });

  const onSubmit = async (data: CreateInvestorFormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        tax_id: data.tax_id || null,
        investor_type: data.investor_type,
        address: data.address || null,
        city: data.city || null,
      });

      toast({
        title: "Inversionista creado",
        description: `${data.name} ha sido registrado exitosamente`,
      });

      setShowCreateModal(false);
      reset();
    } catch (error) {
      console.error("Error creating investor:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el inversionista",
        variant: "destructive",
      });
    }
  };

  // Calculate totals
  const totalInvestors = investors.length;
  const totalProjects = investors.reduce((sum, inv) => sum + inv.total_projects, 0);
  const totalInvestedArs = investors.reduce(
    (sum, inv) => sum + inv.total_investment_ars,
    0
  );
  const totalInvestedUsd = investors.reduce(
    (sum, inv) => sum + inv.total_investment_usd,
    0
  );

  // DataTable columns
  const columns: Column<any>[] = [
    {
      id: "name",
      header: "Inversionista",
      accessor: "name",
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <Link
              to={`/investors/${row.id}`}
              className="font-medium text-gray-900 hover:text-blue-600"
            >
              {row.name}
            </Link>
            <div className="flex items-center space-x-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                {INVESTOR_TYPE_LABELS[row.investor_type as InvestorType]}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "contact",
      header: "Contacto",
      accessor: "email",
      cell: (row) => (
        <div className="space-y-1">
          {row.email && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{row.email}</span>
            </div>
          )}
          {row.phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{row.phone}</span>
            </div>
          )}
          {!row.email && !row.phone && (
            <span className="text-sm text-gray-400">Sin datos</span>
          )}
        </div>
      ),
    },
    {
      id: "projects",
      header: "Proyectos",
      accessor: "total_projects",
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">
            {row.total_projects}
          </span>
        </div>
      ),
    },
    {
      id: "investment_ars",
      header: "Inversión ARS",
      accessor: "total_investment_ars",
      cell: (row) => (
        <div className="text-right">
          <p className="font-medium text-gray-900">
            ${row.total_investment_ars.toLocaleString()}
          </p>
        </div>
      ),
    },
    {
      id: "investment_usd",
      header: "Inversión USD",
      accessor: "total_investment_usd",
      cell: (row) => (
        <div className="text-right">
          <p className="font-medium text-gray-900">
            ${row.total_investment_usd.toLocaleString()}
          </p>
        </div>
      ),
    },
  ];

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
              <BreadcrumbPage>Inversionistas</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <Users className="w-8 h-8" />
              <span>Inversionistas</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Gestiona los inversionistas y sus participaciones en proyectos
            </p>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            size="md"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Inversionista
          </Button>
        </div>

        {/* Stats */}
        <MetricGrid
          metrics={
            [
              {
                title: "Total Inversionistas",
                value: totalInvestors.toString(),
                icon: Users,
                description: "Inversionistas registrados",
                variant: "default",
              },
              {
                title: "Proyectos Activos",
                value: totalProjects.toString(),
                icon: Building2,
                description: "Con participación de inversionistas",
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
            ] as StatCardProps[]
          }
          columns={4}
          gap="md"
          animated
        />

        {/* Investors Table */}
        <SectionCard
          title="Lista de Inversionistas"
          icon={<Users className="w-5 h-5" />}
          subtitle={`${totalInvestors} inversionista${totalInvestors !== 1 ? "s" : ""} registrado${totalInvestors !== 1 ? "s" : ""}`}
        >
          <DataTable
            data={investors}
            columns={columns}
            loading={isLoading}
            rowKey="id"
            searchable
            exportable
            size="md"
            bordered={false}
            emptyText="No hay inversionistas registrados"
            pagination
            pageSize={10}
          />
        </SectionCard>
      </div>

      {/* Create Investor Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          reset();
        }}
        size="lg"
      >
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Nuevo Inversionista
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Registra un nuevo inversionista en el sistema
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
                  placeholder="Nombre y apellido o razón social"
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
                  placeholder="correo@ejemplo.com"
                />

                <Input
                  label="Teléfono"
                  {...register("phone")}
                  placeholder="+54 11 1234-5678"
                />

                <Input
                  label="CUIT/DNI"
                  {...register("tax_id")}
                  placeholder="20-12345678-9"
                />

                <Input
                  label="Ciudad"
                  {...register("city")}
                  placeholder="Buenos Aires"
                />

                <div className="md:col-span-2">
                  <Input
                    label="Dirección"
                    {...register("address")}
                    placeholder="Calle, número, piso, departamento"
                  />
                </div>
              </div>
            </SectionCard>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  reset();
                }}
                variant="ghost"
                size="sm"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creando..." : "Crear Inversionista"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
