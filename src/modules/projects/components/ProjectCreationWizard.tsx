import { Button } from "@/components/Button";
import { supabase } from "@/config/supabase";
import Modal from "@/design-system/components/feedback/Modal";
import Input from "@/design-system/components/inputs/Input";
import { SectionCard } from "@/design-system/components/layout/SectionCard";
import { useCurrencyExchange } from "@/hooks/useCurrencyExchange";
import { useClients } from "@/modules/clients/hooks/useClients";
import {
  AlertCircle,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Plus,
  Save,
  Search,
  Trash2,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { GanttChart, type GanttStage } from "../../../components/GanttChart";
import { GanttChartModal } from "../../../components/GanttChart/GanttChartModal";
import { contractStorageService } from "../services/ContractStorageService";
import { projectService } from "../services/ProjectService";
import type { ProjectFormData, ProjectPhase } from "../types/project.types";
import { ContractPreviewModal } from "./wizard/ContractPreviewModal";

interface ProjectCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectData: any) => void;
}

const SECTIONS = [
  {
    id: 1,
    title: "Información Básica",
    icon: Building2,
    description: "Datos generales del proyecto",
  },
  {
    id: 2,
    title: "Cliente",
    icon: User,
    description: "Información del cliente",
  },
  {
    id: 3,
    title: "Configuración Financiera",
    icon: CreditCard,
    description: "Pagos y administración",
  },
  {
    id: 4,
    title: "Términos y Plazos",
    icon: FileText,
    description: "Fechas y condiciones",
  },
  {
    id: 5,
    title: "Revisión Final",
    icon: Check,
    description: "Confirmar información",
  },
];

export function ProjectCreationWizard({
  isOpen,
  onClose,
  onSuccess,
}: ProjectCreationWizardProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProjectFormData, string>>
  >({});
  const [showGanttModal, setShowGanttModal] = useState(false);
  const [showContractPreview, setShowContractPreview] = useState(false);

  // Currency exchange hook
  const {
    exchangeRate,
    isLoading: exchangeLoading,
    convertUSDtoARS,
    convertARStoUSD,
    formatARS,
    formatUSD,
    displayRate,
  } = useCurrencyExchange();

  // Clients hook - debe estar en el nivel superior del componente
  const { clients, isLoading: clientsLoading } = useClients({ autoLoad: true });

  // Estados para búsqueda de cliente
  const [searchTerm, setSearchTerm] = useState("");
  const [showClientSearch, setShowClientSearch] = useState(true);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Estados para gestión de etapas
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [newStage, setNewStage] = useState<Partial<ProjectPhase>>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [formData, setFormData] = useState<ProjectFormData>({
    // Step 1: Project Basics
    projectName: "",
    projectType: "construction",
    description: "",

    // Step 2: Client Details
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientTaxId: "",
    propertyAddress: "",
    propertyType: "residential",
    city: "",
    zipCode: "",

    // Step 3: Payment Configuration
    currency: "ARS",
    totalAmount: 0,
    downPaymentAmount: 0,
    downPaymentPercentage: 30,
    installmentCount: 12,
    installmentAmount: 0,
    paymentFrequency: "monthly",
    firstPaymentDate: "",
    lateFeePercentage: 5,
    gracePeriodDays: 5,
    adminFeeType: "percentage",
    adminFeePercentage: 10,
    adminFeeAmount: 0,

    // Step 4: Terms & Conditions
    startDate: "",
    estimatedEndDate: "",
    projectPhases: [],
    paymentTerms: "",
    specialConditions: "",

    // Step 5: Review & Confirm
    termsAccepted: false,
    dataAccuracyConfirmed: false,
    authorityConfirmed: false,

    // Contract Signature
    clientSignature: "",
    signatureDate: "",
    contractSigned: false,
  });

  // Auto-calculate related fields
  useEffect(() => {
    const total = formData.totalAmount || 0;
    const percentage = formData.downPaymentPercentage || 0;
    const downPayment = total * (percentage / 100);
    const remaining = total - downPayment;
    const installmentValue =
      formData.installmentCount > 0 ? remaining / formData.installmentCount : 0;

    setFormData((prev) => ({
      ...prev,
      downPaymentAmount: downPayment,
      installmentAmount: installmentValue,
    }));
  }, [
    formData.totalAmount,
    formData.downPaymentPercentage,
    formData.installmentCount,
  ]);

  // Auto-calculate admin fees
  useEffect(() => {
    if (formData.adminFeeType === "percentage") {
      const fee = (formData.totalAmount * formData.adminFeePercentage) / 100;
      setFormData((prev) => ({ ...prev, adminFeeAmount: fee }));
    }
  }, [
    formData.totalAmount,
    formData.adminFeePercentage,
    formData.adminFeeType,
  ]);

  // Reset client search when entering section 2
  useEffect(() => {
    if (currentSection === 2) {
      setShowClientSearch(true);
      setSearchTerm("");
    }
  }, [currentSection]);

  const validateSection = (sectionId: number): boolean => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {};

    switch (sectionId) {
      case 1:
        if (!formData.projectName)
          newErrors.projectName = "Nombre del proyecto requerido";
        if (!formData.projectType)
          newErrors.projectType = "Tipo de proyecto requerido";
        break;
      case 2:
        if (!formData.clientName)
          newErrors.clientName = "Nombre del cliente requerido";
        if (!formData.clientEmail)
          newErrors.clientEmail = "Email del cliente requerido";
        if (!formData.clientPhone)
          newErrors.clientPhone = "Teléfono del cliente requerido";
        if (!formData.propertyAddress)
          newErrors.propertyAddress = "Dirección requerida";
        break;
      case 3:
        if (formData.totalAmount <= 0)
          newErrors.totalAmount = "Monto total debe ser mayor a 0";
        if (!formData.firstPaymentDate)
          newErrors.firstPaymentDate = "Fecha de primer pago requerida";
        break;
      case 4:
        if (!formData.startDate)
          newErrors.startDate = "Fecha de inicio requerida";
        if (!formData.estimatedEndDate)
          newErrors.estimatedEndDate = "Fecha estimada de fin requerida";
        if (formData.projectPhases && formData.projectPhases.length > 0) {
          const invalidStages = formData.projectPhases.some(
            (stage) => !stage.name || !stage.startDate || !stage.endDate
          );
          if (invalidStages) {
            (newErrors as any).projectPhases =
              "Todas las etapas deben tener nombre y fechas";
          }
        }
        break;
      case 5:
        if (!formData.contractSigned)
          (newErrors as any).contractSigned =
            "Debe firmar el contrato antes de continuar";
        if (!formData.termsAccepted)
          newErrors.termsAccepted = "Debe aceptar los términos";
        if (!formData.dataAccuracyConfirmed)
          newErrors.dataAccuracyConfirmed =
            "Debe confirmar la exactitud de los datos";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSectionChange = (sectionId: number) => {
    if (
      sectionId < currentSection ||
      completedSections.includes(currentSection)
    ) {
      setCurrentSection(sectionId);
    } else if (validateSection(currentSection)) {
      setCompletedSections([...completedSections, currentSection]);
      setCurrentSection(sectionId);
    }
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      if (!completedSections.includes(currentSection)) {
        setCompletedSections([...completedSections, currentSection]);
      }
      if (currentSection < SECTIONS.length) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateSection(currentSection)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await projectService.createProjectFromForm(formData);
      if (result) {
        // Generate and upload signed contract PDF
        if (formData.contractSigned && result.id) {
          try {
            console.log("Generating and uploading signed contract PDF...");
            const contractData = await contractStorageService.uploadContract(
              result.id,
              formData
            );

            // Update project metadata with contract information
            await supabase
              .from("projects")
              .update({
                metadata: {
                  ...(result.metadata || {}),
                  contract: {
                    pdfPath: contractData.path,
                    pdfUrl: contractData.url,
                    signedBy: formData.clientSignature,
                    signedAt: formData.signatureDate,
                    generatedAt: new Date().toISOString(),
                  },
                },
              })
              .eq("id", result.id);

            console.log("Contract PDF uploaded successfully:", contractData);
          } catch (error) {
            console.error("Error uploading contract PDF:", error);
            // Don't fail the project creation if PDF upload fails
          }
        }

        // Note: Down payment is already processed by projectService.createProjectFromForm()
        // including administrator fees

        onSuccess(result);
        resetForm();
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentSection(1);
    setCompletedSections([]);
    setSearchTerm("");
    setShowClientSearch(true);
    setSelectedClient(null);
    setFormData({
      projectName: "",
      projectType: "construction",
      description: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientTaxId: "",
      propertyAddress: "",
      propertyType: "residential",
      city: "",
      zipCode: "",
      currency: "ARS",
      totalAmount: 0,
      downPaymentAmount: 0,
      downPaymentPercentage: 30,
      installmentCount: 12,
      installmentAmount: 0,
      paymentFrequency: "monthly",
      firstPaymentDate: "",
      lateFeePercentage: 5,
      gracePeriodDays: 5,
      adminFeeType: "percentage",
      adminFeePercentage: 10,
      adminFeeAmount: 0,
      startDate: "",
      estimatedEndDate: "",
      projectPhases: [],
      paymentTerms: "",
      specialConditions: "",
      termsAccepted: false,
      dataAccuracyConfirmed: false,
      authorityConfirmed: false,
      clientSignature: "",
      signatureDate: "",
      contractSigned: false,
    });
    setErrors({});
  };

  const renderSection1 = () => (
    <SectionCard
      title="Información del Proyecto"
      icon={<Building2 className="w-5 h-5" />}
      subtitle="Define los datos básicos del nuevo proyecto"
    >
      <div className="space-y-6 mt-6">
        <div className="grid grid-cols-1 gap-6">
          <Input
            label="Nombre del Proyecto"
            value={formData.projectName}
            onChange={(e) =>
              setFormData({ ...formData, projectName: e.target.value })
            }
            error={errors.projectName}
            placeholder="Ej: Casa Familia González"
            helperText="Utiliza un nombre descriptivo y único"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Proyecto
            </label>
            <select
              value={formData.projectType}
              onChange={(e) =>
                setFormData({ ...formData, projectType: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              <option value="construction">Construcción</option>
              <option value="renovation">Renovación</option>
              <option value="design">Diseño</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Proyecto
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descripción detallada del alcance y objetivos del proyecto"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              rows={4}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );

  const renderSection2 = () => {
    // Usar los clientes del hook que está en el nivel superior
    const filteredClients = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email &&
          client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.tax_id && client.tax_id.includes(searchTerm))
    );

    const handleSelectClient = (client: any) => {
      setSelectedClient(client);
      setFormData({
        ...formData,
        clientName: client.name,
        clientEmail: client.email || "",
        clientPhone: client.phone || "",
        clientTaxId: client.tax_id || "",
      });
      setShowClientSearch(false);
    };

    const handleNewClient = () => {
      setShowClientSearch(false);
      setSelectedClient(null);
      setFormData({
        ...formData,
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        clientTaxId: "",
      });
    };

    return (
      <div className="space-y-6">
        {showClientSearch ? (
          <SectionCard
            title="Seleccionar Cliente"
            icon={<Search className="w-5 h-5" />}
            subtitle="Busca un cliente existente o registra uno nuevo"
          >
            <div className="space-y-4 mt-6">
              <Input
                label=""
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, email o CUIT/DNI..."
                helperText="Ingresa al menos 3 caracteres para buscar"
              />

              {clientsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Cargando clientes...</p>
                </div>
              ) : searchTerm.length >= 3 ? (
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => handleSelectClient(client)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {client.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {client.email || "Sin email"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            CUIT/DNI: {client.tax_id || "N/A"}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-gray-500 mb-4">
                        No se encontraron clientes
                      </p>
                      <Button
                        onClick={handleNewClient}
                        variant="outline"
                        size="sm"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Crear nuevo cliente
                      </Button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </SectionCard>
        ) : (
          <>
            <SectionCard
              title={selectedClient ? "Cliente Seleccionado" : "Nuevo Cliente"}
              icon={<User className="w-5 h-5" />}
              subtitle="Información de contacto del cliente"
              actions={[
                {
                  id: "change",
                  label: "Cambiar cliente",
                  onClick: () => setShowClientSearch(true),
                },
              ]}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Input
                  label="Nombre Completo"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  error={errors.clientName}
                  placeholder="Nombre y apellido"
                  required
                  disabled={!!selectedClient}
                />

                <Input
                  label="Email"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, clientEmail: e.target.value })
                  }
                  error={errors.clientEmail}
                  placeholder="correo@ejemplo.com"
                  required
                  disabled={!!selectedClient}
                />

                <Input
                  label="Teléfono"
                  value={formData.clientPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, clientPhone: e.target.value })
                  }
                  error={errors.clientPhone}
                  placeholder="+54 11 1234-5678"
                  required
                  disabled={!!selectedClient}
                />

                <Input
                  label="CUIT/DNI"
                  value={formData.clientTaxId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientTaxId: e.target.value })
                  }
                  placeholder="20-12345678-9"
                  disabled={!!selectedClient}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Ubicación del Proyecto"
              icon={<Building2 className="w-5 h-5" />}
              subtitle="Dirección donde se realizará el trabajo"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="md:col-span-2">
                  <Input
                    label="Dirección Completa"
                    value={formData.propertyAddress}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        propertyAddress: e.target.value,
                      })
                    }
                    error={errors.propertyAddress}
                    placeholder="Calle, número, piso, departamento"
                    required
                  />
                </div>

                <Input
                  label="Ciudad"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Buenos Aires"
                />

                <Input
                  label="Código Postal"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                  placeholder="1234"
                />
              </div>
            </SectionCard>
          </>
        )}
      </div>
    );
  };

  const renderSection3 = () => (
    <div className="space-y-6">
      {/* Currency Exchange Info */}
      {formData.currency === "USD" && exchangeRate && (
        <SectionCard
          title="Tipo de Cambio"
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="Cotización actual del dólar"
          background="gray"
          padding="md"
        >
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Cotización</p>
              <p className="text-lg font-semibold text-gray-900">
                1 USD = {formatARS(exchangeRate.sell)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Fuente</p>
              <p className="text-sm text-gray-700">{exchangeRate.source}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Actualizado</p>
              <p className="text-sm text-gray-700">
                {new Date(exchangeRate.timestamp).toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </SectionCard>
      )}

      <SectionCard
        title="Configuración de Pago"
        icon={<CreditCard className="w-5 h-5" />}
        subtitle="Define los montos y condiciones de pago"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda
            </label>
            <select
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              <option value="ARS">ARS - Pesos Argentinos</option>
              <option value="USD">USD - Dólares</option>
            </select>
          </div>

          <div>
            <Input
              label="Monto Total"
              type="number"
              value={formData.totalAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  totalAmount: parseFloat(e.target.value) || 0,
                })
              }
              error={errors.totalAmount}
              placeholder="0.00"
              required
            />
            {formData.currency === "USD" && exchangeRate && (
              <p className="text-xs text-gray-500 mt-1">
                ≈ {formatARS(convertUSDtoARS(formData.totalAmount))}
              </p>
            )}
          </div>

          <Input
            label="Anticipo (%)"
            type="number"
            value={formData.downPaymentPercentage}
            onChange={(e) =>
              setFormData({
                ...formData,
                downPaymentPercentage: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="30"
            helperText="Porcentaje del monto total"
          />

          <div>
            <Input
              label="Monto Anticipo"
              type="number"
              value={formData.downPaymentAmount.toFixed(2)}
              disabled
              helperText="Calculado automáticamente"
            />
            {formData.currency === "USD" && exchangeRate && (
              <p className="text-xs text-gray-500 mt-1">
                ≈ {formatARS(convertUSDtoARS(formData.downPaymentAmount))}
              </p>
            )}
          </div>

          <Input
            label="Cantidad de Cuotas"
            type="number"
            value={formData.installmentCount}
            onChange={(e) =>
              setFormData({
                ...formData,
                installmentCount: parseInt(e.target.value) || 0,
              })
            }
            placeholder="12"
          />

          <div>
            <Input
              label="Monto por Cuota"
              type="number"
              value={formData.installmentAmount.toFixed(2)}
              disabled
              helperText="Calculado automáticamente"
            />
            {formData.currency === "USD" && exchangeRate && (
              <p className="text-xs text-gray-500 mt-1">
                ≈ {formatARS(convertUSDtoARS(formData.installmentAmount))}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frecuencia de Pago
            </label>
            <select
              value={formData.paymentFrequency}
              onChange={(e) =>
                setFormData({ ...formData, paymentFrequency: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              <option value="monthly">Mensual</option>
              <option value="biweekly">Quincenal</option>
              <option value="weekly">Semanal</option>
              <option value="quarterly">Trimestral</option>
            </select>
          </div>

          <Input
            label="Fecha Primer Pago"
            type="date"
            value={formData.firstPaymentDate}
            onChange={(e) =>
              setFormData({ ...formData, firstPaymentDate: e.target.value })
            }
            error={errors.firstPaymentDate}
            required
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Comisiones Administrativas"
        icon={<DollarSign className="w-5 h-5" />}
        subtitle="Configuración de comisiones y cargos administrativos"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Comisión
            </label>
            <select
              value={formData.adminFeeType}
              onChange={(e) =>
                setFormData({ ...formData, adminFeeType: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              <option value="percentage">Porcentaje</option>
              <option value="fixed">Monto Fijo</option>
              <option value="manual">Manual</option>
              <option value="none">Sin Comisión</option>
            </select>
          </div>

          {formData.adminFeeType === "percentage" && (
            <Input
              label="Porcentaje de Comisión"
              type="number"
              value={formData.adminFeePercentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  adminFeePercentage: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="10"
              helperText="Porcentaje sobre el anticipo (se cobrará comisión adicional en cada cuota)"
            />
          )}

          {(formData.adminFeeType === "fixed" ||
            formData.adminFeeType === "manual") && (
            <Input
              label="Monto de Comisión"
              type="number"
              value={formData.adminFeeAmount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  adminFeeAmount: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0.00"
            />
          )}
        </div>
      </SectionCard>
    </div>
  );

  // Helper functions for stage management
  const addStage = () => {
    if (!newStage.name || !newStage.startDate || !newStage.endDate) {
      return;
    }

    const stage: ProjectPhase = {
      name: newStage.name,
      description: newStage.description || "",
      startDate: newStage.startDate,
      endDate: newStage.endDate,
      duration: calculateDuration(newStage.startDate, newStage.endDate),
    };

    setFormData({
      ...formData,
      projectPhases: [...(formData.projectPhases || []), stage],
    });

    setNewStage({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
    });
  };

  const removeStage = (index: number) => {
    const updatedStages = [...(formData.projectPhases || [])];
    updatedStages.splice(index, 1);
    setFormData({ ...formData, projectPhases: updatedStages });
  };

  const updateStage = (index: number, updatedStage: ProjectPhase) => {
    const updatedStages = [...(formData.projectPhases || [])];
    updatedStages[index] = {
      ...updatedStage,
      duration: calculateDuration(updatedStage.startDate, updatedStage.endDate),
    };
    setFormData({ ...formData, projectPhases: updatedStages });
    setEditingStage(null);
  };

  const calculateDuration = (startDate?: string, endDate?: string): string => {
    if (!startDate || !endDate) return "";
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} días`;
  };

  // Convert project phases to Gantt stages
  const ganttStages: GanttStage[] = (formData.projectPhases || []).map(
    (phase, index) => ({
      id: `stage-${index}`,
      name: phase.name,
      description: phase.description,
      startDate: phase.startDate || "",
      endDate: phase.endDate || "",
      status: "pending" as const,
      progress: Math.floor(Math.random() * 30), // Demo progress
    })
  );

  const renderSection4 = () => (
    <div className="space-y-6">
      {/* Project Dates */}
      <SectionCard
        title="Fechas del Proyecto"
        icon={<Calendar className="w-5 h-5" />}
        subtitle="Define las fechas generales del proyecto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Input
            label="Fecha de Inicio"
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            error={errors.startDate}
            required
          />

          <Input
            label="Fecha Estimada de Finalización"
            type="date"
            value={formData.estimatedEndDate}
            onChange={(e) =>
              setFormData({ ...formData, estimatedEndDate: e.target.value })
            }
            error={errors.estimatedEndDate}
            required
          />
        </div>
      </SectionCard>

      {/* Project Stages Management */}
      <SectionCard
        title="Etapas del Proyecto"
        icon={<Clock className="w-5 h-5" />}
        subtitle="Organiza el proyecto en etapas con fechas específicas"
      >
        <div className="space-y-6 mt-6">
          {/* Add New Stage Form */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              Agregar Nueva Etapa
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre de la Etapa"
                value={newStage.name || ""}
                onChange={(e) =>
                  setNewStage({ ...newStage, name: e.target.value })
                }
                placeholder="Ej: Excavación y cimientos"
              />
              <Input
                label="Descripción (opcional)"
                value={newStage.description || ""}
                onChange={(e) =>
                  setNewStage({ ...newStage, description: e.target.value })
                }
                placeholder="Descripción breve de la etapa"
              />
              <Input
                label="Fecha de Inicio"
                type="date"
                value={newStage.startDate || ""}
                onChange={(e) =>
                  setNewStage({ ...newStage, startDate: e.target.value })
                }
              />
              <Input
                label="Fecha de Fin"
                type="date"
                value={newStage.endDate || ""}
                onChange={(e) =>
                  setNewStage({ ...newStage, endDate: e.target.value })
                }
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={addStage}
                size="sm"
                variant="outline"
                disabled={
                  !newStage.name || !newStage.startDate || !newStage.endDate
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Etapa
              </Button>
            </div>
          </div>

          {/* Stages List */}
          {formData.projectPhases && formData.projectPhases.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">
                Etapas Definidas
              </h4>
              {formData.projectPhases.map((stage, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  {editingStage === `stage-${index}` ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Nombre"
                          value={stage.name}
                          onChange={(e) => {
                            const updatedStages = [
                              ...(formData.projectPhases || []),
                            ];
                            updatedStages[index] = {
                              ...stage,
                              name: e.target.value,
                            };
                            setFormData({
                              ...formData,
                              projectPhases: updatedStages,
                            });
                          }}
                        />
                        <Input
                          label="Descripción"
                          value={stage.description || ""}
                          onChange={(e) => {
                            const updatedStages = [
                              ...(formData.projectPhases || []),
                            ];
                            updatedStages[index] = {
                              ...stage,
                              description: e.target.value,
                            };
                            setFormData({
                              ...formData,
                              projectPhases: updatedStages,
                            });
                          }}
                        />
                        <Input
                          label="Fecha de Inicio"
                          type="date"
                          value={stage.startDate || ""}
                          onChange={(e) => {
                            const updatedStages = [
                              ...(formData.projectPhases || []),
                            ];
                            updatedStages[index] = {
                              ...stage,
                              startDate: e.target.value,
                            };
                            setFormData({
                              ...formData,
                              projectPhases: updatedStages,
                            });
                          }}
                        />
                        <Input
                          label="Fecha de Fin"
                          type="date"
                          value={stage.endDate || ""}
                          onChange={(e) => {
                            const updatedStages = [
                              ...(formData.projectPhases || []),
                            ];
                            updatedStages[index] = {
                              ...stage,
                              endDate: e.target.value,
                            };
                            setFormData({
                              ...formData,
                              projectPhases: updatedStages,
                            });
                          }}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          onClick={() => setEditingStage(null)}
                          size="sm"
                          variant="ghost"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => updateStage(index, stage)}
                          size="sm"
                          variant="primary"
                        >
                          Guardar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">
                          {stage.name}
                        </h5>
                        {stage.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {stage.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>
                            Inicio:{" "}
                            {stage.startDate
                              ? new Date(stage.startDate).toLocaleDateString(
                                  "es-AR"
                                )
                              : "No definida"}
                          </span>
                          <span>
                            Fin:{" "}
                            {stage.endDate
                              ? new Date(stage.endDate).toLocaleDateString(
                                  "es-AR"
                                )
                              : "No definida"}
                          </span>
                          <span>{stage.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => setEditingStage(`stage-${index}`)}
                          size="sm"
                          variant="ghost"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => removeStage(index)}
                          size="sm"
                          variant="ghost"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Gantt Chart Preview */}
          {ganttStages.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Cronograma del Proyecto
                </h4>
                <Button
                  onClick={() => setShowGanttModal(true)}
                  size="sm"
                  variant="outline"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                  Expandir
                </Button>
              </div>
              <div
                className="border border-gray-200 rounded-lg bg-gray-50 overflow-auto"
                style={{ height: "250px", maxHeight: "300px" }}
              >
                <div className="p-4">
                  <GanttChart
                    stages={ganttStages}
                    showDependencies={false}
                    showProgress={true}
                    isEditable={false}
                    minDate={formData.startDate}
                    maxDate={formData.estimatedEndDate}
                    onStageClick={(stage) => {
                      console.log("Stage clicked:", stage);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {(errors as any).projectPhases && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{(errors as any).projectPhases}</span>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Terms and Conditions */}
      <SectionCard
        title="Términos y Condiciones"
        icon={<FileText className="w-5 h-5" />}
        subtitle="Define las condiciones específicas del proyecto"
      >
        <div className="space-y-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Términos de Pago
            </label>
            <textarea
              value={formData.paymentTerms}
              onChange={(e) =>
                setFormData({ ...formData, paymentTerms: e.target.value })
              }
              placeholder="Describe los términos y condiciones de pago..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condiciones Especiales
            </label>
            <textarea
              value={formData.specialConditions}
              onChange={(e) =>
                setFormData({ ...formData, specialConditions: e.target.value })
              }
              placeholder="Condiciones especiales o notas adicionales..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              rows={4}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  );

  const handleContractSign = (signatureData: {
    clientSignature: string;
    date: string;
  }) => {
    setFormData({
      ...formData,
      clientSignature: signatureData.clientSignature,
      signatureDate: signatureData.date,
      contractSigned: true,
      termsAccepted: true, // Auto-accept terms when signing contract
    });
  };

  const renderSection5 = () => (
    <div className="space-y-6">
      {/* Contract Preview and Signature */}
      <SectionCard
        title="Contrato del Proyecto"
        icon={<FileText className="w-5 h-5" />}
        subtitle="Revise y firme el contrato antes de crear el proyecto"
      >
        <div className="space-y-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            {formData.contractSigned ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Contrato Firmado
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Firmado por:{" "}
                      <span className="font-medium">
                        {formData.clientSignature}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formData.signatureDate
                        ? new Date(formData.signatureDate).toLocaleDateString(
                            "es-AR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "-"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowContractPreview(true)}
                  variant="ghost"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Contrato
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Firma Pendiente
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Debe firmar el contrato para continuar
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowContractPreview(true)}
                  variant="primary"
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Firmar Contrato
                </Button>
              </div>
            )}
          </div>

          {(errors as any).contractSigned && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{(errors as any).contractSigned}</span>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Project Summary */}
      <SectionCard
        title="Resumen del Proyecto"
        icon={<FileText className="w-5 h-5" />}
        subtitle="Revisa toda la información antes de crear el proyecto"
        background="gray"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Proyecto</p>
            <p className="font-medium text-gray-900">
              {formData.projectName || "Sin nombre"}
            </p>
            <p className="text-xs text-gray-500 mt-1">{formData.projectType}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Cliente</p>
            <p className="font-medium text-gray-900">
              {formData.clientName || "Sin cliente"}
            </p>
            <p className="text-xs text-gray-500 mt-1">{formData.clientEmail}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Ubicación</p>
            <p className="font-medium text-gray-900">
              {formData.propertyAddress || "Sin dirección"}
            </p>
            <p className="text-xs text-gray-500 mt-1">{formData.city}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Monto Total</p>
            <p className="font-medium text-gray-900">
              {formData.currency} {formData.totalAmount.toLocaleString()}
            </p>
            {formData.currency === "USD" && exchangeRate && (
              <p className="text-xs text-gray-500 mt-1">
                ≈ {formatARS(convertUSDtoARS(formData.totalAmount))}
              </p>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Anticipo</p>
            <p className="font-medium text-gray-900">
              {formData.currency} {formData.downPaymentAmount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ({formData.downPaymentPercentage}%)
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Plan de Pagos</p>
            <p className="font-medium text-gray-900">
              {formData.installmentCount} cuotas
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formData.currency} {formData.installmentAmount.toLocaleString()}{" "}
              c/u
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Fecha de Inicio</p>
            <p className="font-medium text-gray-900">
              {formData.startDate
                ? new Date(formData.startDate).toLocaleDateString()
                : "No definida"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Fecha Estimada de Fin</p>
            <p className="font-medium text-gray-900">
              {formData.estimatedEndDate
                ? new Date(formData.estimatedEndDate).toLocaleDateString()
                : "No definida"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Comisión Admin</p>
            <p className="font-medium text-gray-900">
              {formData.adminFeeType === "percentage"
                ? `${formData.adminFeePercentage}%`
                : formData.adminFeeType === "none"
                ? "Sin comisión"
                : `${
                    formData.currency
                  } ${formData.adminFeeAmount.toLocaleString()}`}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Confirmation Checkboxes */}
      <SectionCard
        title="Confirmación"
        icon={<Check className="w-5 h-5" />}
        subtitle="Confirma los siguientes puntos para crear el proyecto"
      >
        <div className="space-y-4 mt-6">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) =>
                setFormData({ ...formData, termsAccepted: e.target.checked })
              }
              className="mt-1 h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              Acepto los términos y condiciones del contrato de servicio
            </span>
          </label>

          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.dataAccuracyConfirmed}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dataAccuracyConfirmed: e.target.checked,
                })
              }
              className="mt-1 h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              Confirmo que todos los datos ingresados son correctos y completos
            </span>
          </label>

          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.authorityConfirmed}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  authorityConfirmed: e.target.checked,
                })
              }
              className="mt-1 h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              Tengo la autoridad necesaria para crear este proyecto y
              comprometer los recursos
            </span>
          </label>

          {errors.termsAccepted && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Debe aceptar todos los términos para continuar</span>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 1:
        return renderSection1();
      case 2:
        return renderSection2();
      case 3:
        return renderSection3();
      case 4:
        return renderSection4();
      case 5:
        return renderSection5();
      default:
        return null;
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl" hideCloseButton>
        <div className="flex h-[600px] bg-gray-50 rounded-lg overflow-hidden">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Nuevo Proyecto
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Complete la información
              </p>
            </div>

            <nav className="flex-1 p-3 overflow-y-auto">
              <ul className="space-y-1">
                `
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const isActive = currentSection === section.id;
                  const isCompleted = completedSections.includes(section.id);

                  return (
                    <li key={section.id}>
                      <button
                        onClick={() => handleSectionChange(section.id)}
                        className={`
                        w-full flex items-start space-x-2 px-2 py-2 rounded-md transition-all
                        ${
                          isActive
                            ? "bg-gray-100 text-gray-900"
                            : isCompleted
                            ? "text-gray-700 hover:bg-gray-50"
                            : "text-gray-400 cursor-not-allowed"
                        }
                      `}
                        disabled={!isCompleted && section.id > currentSection}
                      >
                        <div
                          className={`
                        flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5
                        ${
                          isActive
                            ? "bg-gray-900 text-white"
                            : isCompleted
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }
                      `}
                        >
                          {isCompleted && !isActive ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Icon className="w-3 h-3" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{section.title}</p>
                          <p className="text-xs text-gray-500">
                            {section.description}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-3 border-t border-gray-200">
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Progress Bar */}
            <div className="bg-white px-6 py-3 border-b border-gray-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">
                  Paso {currentSection} de {SECTIONS.length}
                </span>
                <span className="text-xs text-gray-600">
                  {Math.round(
                    (completedSections.length / SECTIONS.length) * 100
                  )}
                  % completado
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-gray-900 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (completedSections.length / SECTIONS.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto">{renderCurrentSection()}</div>
            </div>

            {/* Action Bar */}
            <div className="bg-white border-t border-gray-200 px-6 py-3">
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                <Button
                  onClick={handlePrevious}
                  variant="ghost"
                  size="sm"
                  disabled={currentSection === 1}
                >
                  Anterior
                </Button>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => {}}
                    variant="ghost"
                    size="sm"
                    className="flex items-center"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Guardar
                  </Button>

                  {currentSection < SECTIONS.length ? (
                    <Button onClick={handleNext} variant="ghost" size="sm">
                      Siguiente
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      variant="primary"
                      size="sm"
                      disabled={
                        isSubmitting ||
                        !formData.contractSigned ||
                        !formData.termsAccepted ||
                        !formData.dataAccuracyConfirmed
                      }
                    >
                      {isSubmitting ? "Creando..." : "Crear Proyecto"}
                      <Check className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Gantt Chart Modal */}
      <GanttChartModal
        isOpen={showGanttModal}
        onClose={() => setShowGanttModal(false)}
        projectName={formData.projectName}
        stages={ganttStages}
        showDependencies={true}
        showProgress={true}
        isEditable={false}
        minDate={formData.startDate}
        maxDate={formData.estimatedEndDate}
        onStageClick={(stage) => {
          console.log("Stage clicked:", stage);
        }}
      />

      {/* Contract Preview Modal */}
      <ContractPreviewModal
        isOpen={showContractPreview}
        onClose={() => setShowContractPreview(false)}
        formData={formData}
        onSign={handleContractSign}
      />
    </>
  );
}
