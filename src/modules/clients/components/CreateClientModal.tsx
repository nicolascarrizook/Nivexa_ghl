import Modal from "@/design-system/components/feedback/Modal";
import { Button } from "@/design-system/components/inputs";
import Input from "@/design-system/components/inputs/Input";
import { SectionCard } from "@/design-system/components/layout";
import type { Database } from "@/types/database.types";
import { Building, MapPin, User } from "lucide-react";
import React, { useState } from "react";
import { useClients } from "../hooks/useClients";

type ClientInsert = Omit<
  Database["public"]["Tables"]["clients"]["Insert"],
  "id" | "architect_id" | "created_at" | "updated_at"
>;

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (
    client: Database["public"]["Tables"]["clients"]["Row"]
  ) => void;
  initialName?: string;
}

export function CreateClientModal({
  isOpen,
  onClose,
  onClientCreated,
  initialName = "",
}: CreateClientModalProps) {
  const { createClient, checkEmailExists, checkTaxIdExists, isLoading } =
    useClients();

  const [formData, setFormData] = useState<ClientInsert>({
    name: initialName,
    email: "",
    phone: "",
    tax_id: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "Argentina",
    notes: "",
    metadata: {},
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ClientInsert, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Partial<Record<keyof ClientInsert, string>> = {};

    // Required fields
    if (!formData.name?.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    // Email validation
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Email inválido";
      } else {
        // Check if email already exists
        const emailExists = await checkEmailExists(formData.email);
        if (emailExists) {
          newErrors.email = "Este email ya está registrado";
        }
      }
    }

    // Phone validation
    if (formData.phone) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = "Teléfono inválido";
      }
    }

    // Tax ID validation
    if (formData.tax_id) {
      const taxIdExists = await checkTaxIdExists(formData.tax_id);
      if (taxIdExists) {
        newErrors.tax_id = "Este CUIT/DNI ya está registrado";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isLoading) return;

    setIsSubmitting(true);

    const isValid = await validateForm();
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    const newClient = await createClient(formData);

    if (newClient) {
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        tax_id: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'Argentina',
        notes: '',
        metadata: {},
      });

      // Notify parent and let it handle closing
      onClientCreated(newClient);
    }

    setIsSubmitting(false);
  };

  const handleInputChange =
    (field: keyof ClientInsert) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" hideCloseButton>
      <form onSubmit={handleSubmit}>
        <div className="rounded-lg bg-gray-50 overflow-hidden -m-6">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Crear Nuevo Cliente
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Complete la información del cliente
            </p>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <SectionCard
              title="Información Básica"
              icon={<User className="w-5 h-5" />}
              subtitle="Datos de contacto del cliente"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Input
                  label="Nombre Completo"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  error={errors.name}
                  placeholder="Ej: Juan Pérez"
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange("email")}
                  error={errors.email}
                  placeholder="cliente@email.com"
                />

                <Input
                  label="Teléfono"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={handleInputChange("phone")}
                  error={errors.phone}
                  placeholder="+54 11 1234-5678"
                />

                <Input
                  label="CUIT/DNI"
                  value={formData.tax_id || ""}
                  onChange={handleInputChange("tax_id")}
                  error={errors.tax_id}
                  placeholder="20-12345678-9"
                />
              </div>
            </SectionCard>

            {/* Address Information */}
            <SectionCard
              title="Dirección"
              icon={<MapPin className="w-5 h-5" />}
              subtitle="Ubicación del cliente"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="md:col-span-2">
                  <Input
                    label="Dirección"
                    value={formData.address || ""}
                    onChange={handleInputChange("address")}
                    placeholder="Calle 123, Piso 4, Depto A"
                  />
                </div>

                <Input
                  label="Ciudad"
                  value={formData.city || ""}
                  onChange={handleInputChange("city")}
                  placeholder="Buenos Aires"
                />

                <Input
                  label="Provincia"
                  value={formData.state || ""}
                  onChange={handleInputChange("state")}
                  placeholder="Buenos Aires"
                />

                <Input
                  label="Código Postal"
                  value={formData.zip_code || ""}
                  onChange={handleInputChange("zip_code")}
                  placeholder="1234"
                />

                <Input
                  label="País"
                  value={formData.country || ""}
                  onChange={handleInputChange("country")}
                  placeholder="Argentina"
                />
              </div>
            </SectionCard>

            {/* Notes */}
            <SectionCard
              title="Notas Adicionales"
              icon={<Building className="w-5 h-5" />}
              subtitle="Información complementaria"
            >
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={handleInputChange("notes")}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  placeholder="Notas adicionales sobre el cliente..."
                />
              </div>
            </SectionCard>
          </div>
        </div>

          {/* Footer */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-end space-x-3">
              <Button
                type="button"
                onClick={onClose}
                variant="ghost"
                size="sm"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? "Creando..." : "Crear Cliente"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
