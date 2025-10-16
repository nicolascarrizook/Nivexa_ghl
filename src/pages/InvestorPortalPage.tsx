import { useParams, Navigate } from "react-router-dom";
import { useValidateAccessToken } from "@/modules/investors/hooks/useInvestorAccess";
import { useInvestorProjects } from "@/modules/investors/hooks/useProjectInvestors";
import { Spinner } from "@/design-system/components/feedback";
import { SectionCard } from "@/design-system/components/layout/SectionCard";
import MetricGrid from "@/design-system/components/data-display/MetricGrid/MetricGrid";
import type { StatCardProps } from "@/design-system/components/data-display/StatCard/StatCard";
import {
  Building2,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Award,
  Lock,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

export function InvestorPortalPage() {
  const { token } = useParams<{ token: string }>();

  // Validate token and get investor data
  const {
    data: investor,
    isLoading: validating,
    error: validationError,
  } = useValidateAccessToken(token || "");

  // Get investor's projects
  const { data: projects = [], isLoading: loadingProjects } =
    useInvestorProjects(investor?.id || "", !!investor?.id);

  // Loading state
  if (validating || loadingProjects) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Validando acceso...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (validationError || !investor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso No Válido
          </h1>
          <p className="text-gray-600 mb-6">
            El enlace que utilizaste ha expirado o no es válido. Por favor,
            solicita un nuevo enlace de acceso al arquitecto.
          </p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalInvestedArs = projects.reduce(
    (sum, p) => sum + (p.amount_ars || 0),
    0
  );
  const totalInvestedUsd = projects.reduce(
    (sum, p) => sum + (p.amount_usd || 0),
    0
  );
  const totalProjects = projects.length;
  const avgShare =
    totalProjects > 0
      ? projects.reduce((sum, p) => sum + p.percentage_share, 0) / totalProjects
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-blue-100 text-sm font-medium">
                  Portal del Inversionista
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-2">
                Bienvenido, {investor.name}
              </h1>
              <p className="text-blue-100 text-lg">
                Aquí puedes ver el estado de tus inversiones
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm mb-1">Tipo de Inversionista</p>
              <p className="text-xl font-semibold">
                {investor.investor_type === "individual"
                  ? "Persona Física"
                  : "Empresa"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <MetricGrid
          metrics={
            [
              {
                title: "Proyectos Activos",
                value: totalProjects.toString(),
                icon: Building2,
                description: "Proyectos en los que participas",
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
                value: `${avgShare.toFixed(1)}%`,
                icon: TrendingUp,
                description: "Porcentaje promedio de participación",
                variant: "default",
              },
            ] as StatCardProps[]
          }
          columns={4}
          gap="md"
          animated
        />

        {/* Projects List */}
        <SectionCard
          title="Mis Proyectos"
          icon={<Building2 className="w-5 h-5" />}
          subtitle={`${totalProjects} proyecto${totalProjects !== 1 ? "s" : ""} en cartera`}
        >
          <div className="space-y-4 mt-6">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tienes proyectos registrados</p>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {project.project_name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Código: {project.project_code}</span>
                        </div>
                        {project.project_location && (
                          <span>• {project.project_location}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {project.percentage_share.toFixed(1)}% Participación
                      </div>
                    </div>
                  </div>

                  {/* Investment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Tipo de Inversión</span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {project.investment_type === "cash_ars" && "Efectivo ARS"}
                        {project.investment_type === "cash_usd" && "Efectivo USD"}
                        {project.investment_type === "materials" && "Materiales"}
                        {project.investment_type === "land" && "Terreno"}
                        {project.investment_type === "labor" && "Mano de Obra"}
                        {project.investment_type === "equipment" && "Equipamiento"}
                        {project.investment_type === "other" && "Otro"}
                      </p>
                    </div>

                    {project.amount_ars > 0 && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 text-sm text-green-700 mb-1">
                          <DollarSign className="w-4 h-4" />
                          <span>Inversión ARS</span>
                        </div>
                        <p className="font-semibold text-green-900">
                          ${project.amount_ars.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {project.amount_usd > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 text-sm text-blue-700 mb-1">
                          <DollarSign className="w-4 h-4" />
                          <span>Inversión USD</span>
                        </div>
                        <p className="font-semibold text-blue-900">
                          ${project.amount_usd.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Co-investors Count */}
                  {project.co_investors_count > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 pt-4 border-t border-gray-200">
                      <Users className="w-4 h-4" />
                      <span>
                        {project.co_investors_count} co-inversionista
                        {project.co_investors_count !== 1 ? "s" : ""} en este
                        proyecto
                      </span>
                    </div>
                  )}

                  {/* Investment Date */}
                  {project.investment_date && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Inversión realizada el{" "}
                        {new Date(project.investment_date).toLocaleDateString(
                          "es-AR"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </SectionCard>

        {/* Contact Information */}
        <SectionCard
          title="Información de Contacto"
          icon={<Users className="w-5 h-5" />}
        >
          <div className="mt-6 bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {investor.email && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{investor.email}</p>
                </div>
              )}
              {investor.phone && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Teléfono</p>
                  <p className="font-medium text-gray-900">{investor.phone}</p>
                </div>
              )}
              {investor.tax_id && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">CUIT/DNI</p>
                  <p className="font-medium text-gray-900">{investor.tax_id}</p>
                </div>
              )}
              {investor.address && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Dirección</p>
                  <p className="font-medium text-gray-900">{investor.address}</p>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Este es un portal de solo lectura. Para realizar cambios o consultas,
            contacta al arquitecto responsable del proyecto.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            © {new Date().getFullYear()} Nivexa - Sistema de Gestión Financiera
          </p>
        </div>
      </div>
    </div>
  );
}
