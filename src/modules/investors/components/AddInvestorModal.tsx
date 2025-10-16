import { Button } from "@/components/Button";
import Input from "@/design-system/components/inputs/Input";
import Modal from "@/design-system/components/feedback/Modal";
import { SectionCard } from "@/design-system/components/layout/SectionCard";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Check,
  DollarSign,
  Percent,
  TrendingUp,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  useAddInvestorToProject,
  useProjectRemainingPercentage,
} from "../hooks/useProjectInvestors";
import { useFindOrCreateInvestor } from "../hooks/useInvestors";
import { InvestorSearchSelect } from "./InvestorSearchSelect";
import type {
  AddInvestorToProjectFormData,
  Investor,
  InvestmentType,
  InvestorType,
  INVESTMENT_TYPE_LABELS,
} from "../types/investor.types";

interface AddInvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess?: () => void;
}

// Validation schema
const investorFormSchema = z.object({
  investorId: z.string().optional(),
  investorName: z.string().min(1, "Nombre requerido").optional(),
  investorEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  investorPhone: z.string().optional(),
  investorTaxId: z.string().optional(),
  investorType: z.enum(["individual", "company"]).optional(),

  investmentType: z.enum([
    "cash_ars",
    "cash_usd",
    "materials",
    "land",
    "labor",
    "equipment",
    "other",
  ]),
  amountArs: z.number().min(0, "Monto debe ser positivo").optional(),
  amountUsd: z.number().min(0, "Monto debe ser positivo").optional(),
  description: z.string().optional(),
  estimatedValueArs: z.number().min(0).optional(),
  estimatedValueUsd: z.number().min(0).optional(),
  percentageShare: z
    .number()
    .min(0.01, "Porcentaje debe ser mayor a 0")
    .max(100, "Porcentaje no puede exceder 100"),
  notes: z.string().optional(),
});

type InvestorFormData = z.infer<typeof investorFormSchema>;

const INVESTMENT_TYPES: { value: InvestmentType; label: string }[] = [
  { value: "cash_ars", label: "Efectivo (ARS)" },
  { value: "cash_usd", label: "Efectivo (USD)" },
  { value: "materials", label: "Materiales" },
  { value: "land", label: "Terreno" },
  { value: "labor", label: "Mano de obra" },
  { value: "equipment", label: "Equipamiento" },
  { value: "other", label: "Otro" },
];

export function AddInvestorModal({
  isOpen,
  onClose,
  projectId,
  onSuccess,
}: AddInvestorModalProps) {
  const [step, setStep] = useState<"search" | "details">("search");
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(
    null
  );

  // Fetch remaining percentage
  const { data: remainingPercentage, isLoading: loadingPercentage } =
    useProjectRemainingPercentage(projectId);

  // Mutations
  const findOrCreateMutation = useFindOrCreateInvestor();
  const addInvestorMutation = useAddInvestorToProject();

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<InvestorFormData>({
    resolver: zodResolver(investorFormSchema),
    defaultValues: {
      investmentType: "cash_ars",
      percentageShare: 10,
      amountArs: 0,
      amountUsd: 0,
      estimatedValueArs: 0,
      estimatedValueUsd: 0,
    },
  });

  const investmentType = watch("investmentType");
  const isCashInvestment =
    investmentType === "cash_ars" || investmentType === "cash_usd";

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("search");
      setSelectedInvestor(null);
      reset();
    }
  }, [isOpen, reset]);

  const handleSelectInvestor = (investor: Investor) => {
    setSelectedInvestor(investor);
    setValue("investorId", investor.id);
    setValue("investorName", investor.name);
    setValue("investorEmail", investor.email || "");
    setValue("investorPhone", investor.phone || "");
    setValue("investorTaxId", investor.tax_id || "");
    setValue("investorType", investor.investor_type);
    setStep("details");
  };

  const handleCreateNewInvestor = () => {
    setSelectedInvestor(null);
    setValue("investorId", undefined);
    setStep("details");
  };

  const onSubmit = async (data: InvestorFormData) => {
    try {
      // Step 1: Find or create investor if needed
      let investorId = data.investorId;

      if (!investorId && data.investorName) {
        const investor = await findOrCreateMutation.mutateAsync({
          name: data.investorName,
          email: data.investorEmail || null,
          phone: data.investorPhone || null,
          tax_id: data.investorTaxId || null,
          investor_type: data.investorType || "individual",
        });
        investorId = investor.id;
      }

      if (!investorId) {
        throw new Error("No se pudo obtener o crear el inversionista");
      }

      // Step 2: Add investor to project
      await addInvestorMutation.mutateAsync({
        projectId,
        investorId,
        investmentType: data.investmentType,
        amountArs: data.amountArs,
        amountUsd: data.amountUsd,
        description: data.description,
        estimatedValueArs: data.estimatedValueArs,
        estimatedValueUsd: data.estimatedValueUsd,
        percentageShare: data.percentageShare,
        notes: data.notes,
      });

      // Success
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error adding investor to project:", error);
    }
  };

  const renderSearchStep = () => (
    <InvestorSearchSelect
      onSelect={handleSelectInvestor}
      onCreateNew={handleCreateNewInvestor}
      selectedInvestor={selectedInvestor}
    />
  );

  const renderDetailsStep = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Investor Info (if creating new) */}
      {!selectedInvestor && (
        <SectionCard
          title="Información del Inversionista"
          icon={<User className="w-5 h-5" />}
          subtitle="Datos del nuevo inversionista"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Input
              label="Nombre Completo"
              {...register("investorName")}
              error={errors.investorName?.message}
              placeholder="Nombre y apellido o razón social"
              required
            />

            <Input
              label="Email"
              type="email"
              {...register("investorEmail")}
              error={errors.investorEmail?.message}
              placeholder="correo@ejemplo.com"
            />

            <Input
              label="Teléfono"
              {...register("investorPhone")}
              placeholder="+54 11 1234-5678"
            />

            <Input
              label="CUIT/DNI"
              {...register("investorTaxId")}
              placeholder="20-12345678-9"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Inversionista
              </label>
              <select
                {...register("investorType")}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
              >
                <option value="individual">Persona física</option>
                <option value="company">Empresa</option>
              </select>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Investment Details */}
      <SectionCard
        title="Detalles de la Inversión"
        icon={<DollarSign className="w-5 h-5" />}
        subtitle="Tipo y monto de la inversión"
      >
        <div className="space-y-4 mt-6">
          {/* Investment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Inversión
            </label>
            <select
              {...register("investmentType")}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
            >
              {INVESTMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cash Investment Fields */}
          {isCashInvestment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {investmentType === "cash_ars" && (
                <Input
                  label="Monto en ARS"
                  type="number"
                  step="0.01"
                  {...register("amountArs", { valueAsNumber: true })}
                  error={errors.amountArs?.message}
                  placeholder="0.00"
                  required
                />
              )}

              {investmentType === "cash_usd" && (
                <Input
                  label="Monto en USD"
                  type="number"
                  step="0.01"
                  {...register("amountUsd", { valueAsNumber: true })}
                  error={errors.amountUsd?.message}
                  placeholder="0.00"
                  required
                />
              )}
            </div>
          )}

          {/* Non-Cash Investment Fields */}
          {!isCashInvestment && (
            <>
              <Input
                label="Descripción del Aporte"
                {...register("description")}
                placeholder="Ej: Materiales de construcción, terreno en Palermo, etc."
                helperText="Describe detalladamente el aporte no monetario"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Valor Estimado (ARS)"
                  type="number"
                  step="0.01"
                  {...register("estimatedValueArs", { valueAsNumber: true })}
                  placeholder="0.00"
                  helperText="Valor aproximado en pesos argentinos"
                />

                <Input
                  label="Valor Estimado (USD)"
                  type="number"
                  step="0.01"
                  {...register("estimatedValueUsd", { valueAsNumber: true })}
                  placeholder="0.00"
                  helperText="Valor aproximado en dólares"
                />
              </div>
            </>
          )}
        </div>
      </SectionCard>

      {/* Participation Percentage */}
      <SectionCard
        title="Porcentaje de Participación"
        icon={<Percent className="w-5 h-5" />}
        subtitle="Define el porcentaje de participación en el proyecto"
      >
        <div className="space-y-4 mt-6">
          {/* Remaining percentage info */}
          {!loadingPercentage && remainingPercentage !== undefined && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Porcentaje disponible: {remainingPercentage.toFixed(2)}%
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Este es el porcentaje que aún puede ser asignado a
                    inversionistas
                  </p>
                </div>
              </div>
            </div>
          )}

          <Input
            label="Porcentaje de Participación"
            type="number"
            step="0.01"
            {...register("percentageShare", { valueAsNumber: true })}
            error={errors.percentageShare?.message}
            placeholder="10.00"
            helperText="Porcentaje de participación en el proyecto (debe no exceder el disponible)"
            required
          />

          <Input
            label="Notas Adicionales"
            {...register("notes")}
            placeholder="Información adicional sobre la inversión..."
          />
        </div>
      </SectionCard>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button
          type="button"
          onClick={() => setStep("search")}
          variant="ghost"
          size="sm"
        >
          Volver
        </Button>

        <div className="flex items-center space-x-2">
          <Button type="button" onClick={onClose} variant="ghost" size="sm">
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={
              findOrCreateMutation.isPending || addInvestorMutation.isPending
            }
          >
            {findOrCreateMutation.isPending || addInvestorMutation.isPending ? (
              "Agregando..."
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Agregar Inversionista
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {(findOrCreateMutation.isError || addInvestorMutation.isError) && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-900">
            {findOrCreateMutation.error?.message ||
              addInvestorMutation.error?.message ||
              "Error al agregar inversionista"}
          </p>
        </div>
      )}
    </form>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Agregar Inversionista
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Selecciona o crea un inversionista y define los detalles de su
          participación
        </p>

        {step === "search" ? renderSearchStep() : renderDetailsStep()}
      </div>
    </Modal>
  );
}
