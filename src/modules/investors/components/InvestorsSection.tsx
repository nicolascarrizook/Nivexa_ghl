import { Button } from "@/components/Button";
import { SectionCard } from "@/design-system/components/layout/SectionCard";
import {
  AlertCircle,
  Building2,
  Copy,
  DollarSign,
  Edit,
  Mail,
  MoreVertical,
  Percent,
  Phone,
  Plus,
  Shield,
  Trash2,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  useProjectInvestors,
  useProjectTotalInvested,
  useProjectRemainingPercentage,
  useRemoveInvestorFromProject,
} from "../hooks/useProjectInvestors";
import { useGenerateAccessToken, useCopyMagicLink } from "../hooks/useInvestorAccess";
import { AddInvestorModal } from "./AddInvestorModal";
import {
  INVESTMENT_TYPE_LABELS,
  INVESTOR_TYPE_LABELS,
  type InvestmentType,
} from "../types/investor.types";

interface InvestorsSectionProps {
  projectId: string;
}

export function InvestorsSection({ projectId }: InvestorsSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInvestorMenu, setSelectedInvestorMenu] = useState<
    string | null
  >(null);

  // Queries
  const { data: investors = [], isLoading } = useProjectInvestors(projectId);
  const { data: totals, isLoading: loadingTotals } =
    useProjectTotalInvested(projectId);
  const { data: remainingPercentage, isLoading: loadingPercentage } =
    useProjectRemainingPercentage(projectId);

  // Mutations
  const removeMutation = useRemoveInvestorFromProject();
  const generateTokenMutation = useGenerateAccessToken();
  const copyLinkMutation = useCopyMagicLink();

  const handleRemoveInvestor = async (projectInvestorId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar este inversionista del proyecto?"
      )
    ) {
      return;
    }

    try {
      await removeMutation.mutateAsync(projectInvestorId);
    } catch (error) {
      console.error("Error removing investor:", error);
    }
  };

  const handleGenerateMagicLink = async (investorId: string) => {
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

      alert("¡Link de acceso copiado al portapapeles!");
    } catch (error) {
      console.error("Error generating magic link:", error);
      alert("Error al generar el link de acceso");
    }
  };

  const distributedPercentage =
    remainingPercentage !== undefined ? 100 - remainingPercentage : 0;

  if (isLoading) {
    return (
      <SectionCard
        title="Inversionistas"
        icon={<Users className="w-5 h-5" />}
        subtitle="Cargando información de inversionistas..."
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </SectionCard>
    );
  }

  return (
    <>
      <SectionCard
        title="Inversionistas del Proyecto"
        icon={<Users className="w-5 h-5" />}
        subtitle={
          investors.length > 0
            ? `${investors.length} inversionista${investors.length > 1 ? "s" : ""} participando en el proyecto`
            : "No hay inversionistas en este proyecto"
        }
        actions={[
          {
            id: "add",
            label: "Agregar Inversionista",
            onClick: () => setShowAddModal(true),
          },
        ]}
      >
        {/* Statistics */}
        {!loadingTotals && totals && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-medium text-blue-900 uppercase tracking-wide">
                  Total ARS
                </p>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                ${totals.totalArs.toLocaleString()}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-600" />
                <p className="text-xs font-medium text-green-900 uppercase tracking-wide">
                  Total USD
                </p>
              </div>
              <p className="text-2xl font-bold text-green-900">
                ${totals.totalUsd.toLocaleString()}
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Percent className="w-4 h-4 text-purple-600" />
                <p className="text-xs font-medium text-purple-900 uppercase tracking-wide">
                  % Distribuido
                </p>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {distributedPercentage.toFixed(1)}%
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <p className="text-xs font-medium text-orange-900 uppercase tracking-wide">
                  % Disponible
                </p>
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {remainingPercentage?.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* Investors List */}
        {investors.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">
              Aún no hay inversionistas en este proyecto
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              variant="primary"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Inversionista
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {investors.map((projectInvestor) => (
              <div
                key={projectInvestor.id}
                className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  {/* Investor Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {projectInvestor.investor.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {
                              INVESTOR_TYPE_LABELS[
                                projectInvestor.investor.investor_type
                              ]
                            }
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {
                              INVESTMENT_TYPE_LABELS[
                                projectInvestor.investment_type as InvestmentType
                              ]
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm text-gray-600">
                      {projectInvestor.investor.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{projectInvestor.investor.email}</span>
                        </div>
                      )}
                      {projectInvestor.investor.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{projectInvestor.investor.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Investment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Participación
                        </p>
                        <p className="font-semibold text-gray-900">
                          {projectInvestor.percentage_share.toFixed(2)}%
                        </p>
                      </div>

                      {projectInvestor.investment_amount_ars > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Inversión ARS
                          </p>
                          <p className="font-semibold text-gray-900">
                            $
                            {projectInvestor.investment_amount_ars.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {projectInvestor.investment_amount_usd > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Inversión USD
                          </p>
                          <p className="font-semibold text-gray-900">
                            $
                            {projectInvestor.investment_amount_usd.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {projectInvestor.estimated_value_ars > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Valor Estimado ARS
                          </p>
                          <p className="font-semibold text-gray-900">
                            $
                            {projectInvestor.estimated_value_ars.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {projectInvestor.estimated_value_usd > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Valor Estimado USD
                          </p>
                          <p className="font-semibold text-gray-900">
                            $
                            {projectInvestor.estimated_value_usd.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Description/Notes */}
                    {(projectInvestor.investment_description ||
                      projectInvestor.notes) && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        {projectInvestor.investment_description && (
                          <p className="text-sm text-gray-700">
                            {projectInvestor.investment_description}
                          </p>
                        )}
                        {projectInvestor.notes && (
                          <p className="text-xs text-gray-500 mt-1">
                            {projectInvestor.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Menu */}
                  <div className="relative ml-4">
                    <Button
                      onClick={() =>
                        setSelectedInvestorMenu(
                          selectedInvestorMenu === projectInvestor.id
                            ? null
                            : projectInvestor.id
                        )
                      }
                      variant="ghost"
                      size="sm"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>

                    {selectedInvestorMenu === projectInvestor.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <button
                          onClick={() =>
                            handleGenerateMagicLink(
                              projectInvestor.investor.id
                            )
                          }
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Copiar link de acceso</span>
                        </button>

                        <button
                          onClick={() => {
                            /* TODO: Edit functionality */
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() =>
                            handleRemoveInvestor(projectInvestor.id)
                          }
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 border-t border-gray-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Warning about percentage */}
        {!loadingPercentage &&
          remainingPercentage !== undefined &&
          remainingPercentage < 10 && (
            <div className="mt-6 flex items-center space-x-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-900">
                {remainingPercentage === 0
                  ? "El 100% del proyecto está distribuido entre inversionistas"
                  : `Quedan solo ${remainingPercentage.toFixed(1)}% disponibles para asignar`}
              </p>
            </div>
          )}
      </SectionCard>

      {/* Add Investor Modal */}
      <AddInvestorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        projectId={projectId}
        onSuccess={() => {
          // Queries will automatically refetch due to cache invalidation
          console.log("✅ Inversionista agregado exitosamente");
        }}
      />
    </>
  );
}
