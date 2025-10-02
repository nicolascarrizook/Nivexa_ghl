import { ClientSearch } from "@/modules/clients/components/ClientSearch";
import { CreateClientModal } from "@/modules/clients/components/CreateClientModal";
import { useClients } from "@/modules/clients/hooks/useClients";
import type { ClientSearchResult } from "@/modules/clients/services/ClientService";
import type { Database } from "@/types/database.types";
import { User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useProjectWizard } from "../../hooks/useProjectWizard";
import type { AdditionalContact } from "../../types/project.types";

export function EnterpriseClientDetailsStep() {
  const { formData, updateFormData } = useProjectWizard();
  const [additionalContacts, setAdditionalContacts] = useState<
    AdditionalContact[]
  >(formData.additionalContacts || []);
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<
    Database["public"]["Tables"]["clients"]["Row"] | null
  >(null);
  const [newClientName, setNewClientName] = useState("");
  const { getClient } = useClients();

  // Load client if clientId exists in formData
  useEffect(() => {
    if (formData.clientId) {
      getClient(formData.clientId).then((client) => {
        if (client) {
          setSelectedClient(client);
        }
      });
    }
  }, [formData.clientId, getClient]);

  const handleSelectClient = (clientResult: ClientSearchResult | null) => {
    if (clientResult) {
      // Load full client data
      getClient(clientResult.id).then((client) => {
        if (client) {
          setSelectedClient(client);
          // Update form data with client information
          updateFormData({
            clientId: client.id,
            clientName: client.name,
            clientEmail: client.email || "",
            clientPhone: client.phone || "",
            clientTaxId: client.tax_id || "",
            propertyAddress: client.address || formData.propertyAddress || "",
            city: client.city || formData.city || "",
            zipCode: client.zip_code || formData.zipCode || "",
          });
        }
      });
    }
  };

  const handleClientCreated = (
    client: Database["public"]["Tables"]["clients"]["Row"]
  ) => {
    setSelectedClient(client);
    setShowCreateClientModal(false);
    // Update form data with new client information
    updateFormData({
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email || "",
      clientPhone: client.phone || "",
      clientTaxId: client.tax_id || "",
      propertyAddress: client.address || formData.propertyAddress || "",
      city: client.city || formData.city || "",
      zipCode: client.zip_code || formData.zipCode || "",
    });
  };

  const handleRemoveClient = () => {
    setSelectedClient(null);
    updateFormData({
      clientId: undefined,
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientTaxId: "",
    });
  };

  const handleCreateNew = () => {
    setNewClientName("");
    setShowCreateClientModal(true);
  };

  const addAdditionalContact = () => {
    const newContact: AdditionalContact = {
      name: "",
      role: "",
      email: "",
      phone: "",
    };
    const updated = [...additionalContacts, newContact];
    setAdditionalContacts(updated);
    updateFormData({ additionalContacts: updated });
  };

  const updateAdditionalContact = (
    index: number,
    field: keyof AdditionalContact,
    value: string
  ) => {
    const updated = [...additionalContacts];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalContacts(updated);
    updateFormData({ additionalContacts: updated });
  };

  const removeAdditionalContact = (index: number) => {
    const updated = additionalContacts.filter((_, i) => i !== index);
    setAdditionalContacts(updated);
    updateFormData({ additionalContacts: updated });
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-100 pb-6">
        <h2 className="text-xl text-gray-900 mb-2">Detalles del Cliente</h2>
        <p className="text-sm text-gray-600">
          Información sobre el cliente y ubicación de la propiedad para este
          proyecto
        </p>
      </div>

      <div className="space-y-8">
        {/* Client Search or Selection */}
        <div className="space-y-6">
          <div className="bg-gray-50 border-l-4 border-gray-200 p-4 rounded-r-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Cliente del Proyecto
            </h3>
            <p className="text-xs text-gray-600">
              {selectedClient
                ? "Cliente seleccionado para este proyecto"
                : "Busque un cliente existente o cree uno nuevo"}
            </p>
          </div>

          {selectedClient ? (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedClient.name}
                    </p>
                    {selectedClient.email && (
                      <p className="text-xs text-gray-600">
                        {selectedClient.email}
                      </p>
                    )}
                    {selectedClient.phone && (
                      <p className="text-xs text-gray-600">
                        {selectedClient.phone}
                      </p>
                    )}
                    {selectedClient.tax_id && (
                      <p className="text-xs text-gray-600">
                        CUIT/DNI: {selectedClient.tax_id}
                      </p>
                    )}
                    {selectedClient.address && (
                      <p className="text-xs text-gray-600">
                        {selectedClient.address}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveClient}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleRemoveClient}
                  className="text-sm text-gray-600 hover:text-gray-600"
                >
                  Cambiar cliente
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ClientSearch
                onSelectClient={handleSelectClient}
                onCreateNew={handleCreateNew}
                selectedClientId={formData.clientId}
                placeholder="Buscar cliente por nombre, email o teléfono..."
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Property Information */}
        <div className="space-y-6">
          <div className="bg-gray-50 border-l-4 border-gray-200 p-4 rounded-r-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              Información de la Propiedad
            </h3>
            <p className="text-xs text-gray-600">
              Ubicación y detalles de la propiedad a desarrollar
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Address */}
            <div className="space-y-2 lg:col-span-2">
              <label
                htmlFor="propertyAddress"
                className="text-sm text-gray-700"
              >
                Dirección de la Propiedad{" "}
                <span className="text-gray-600">*</span>
              </label>
              <textarea
                id="propertyAddress"
                value={formData.propertyAddress || ""}
                onChange={(e) =>
                  updateFormData({ propertyAddress: e.target.value })
                }
                placeholder="Dirección completa de la propiedad incluyendo calle, ciudad, provincia y código postal"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white resize-none"
              />
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <label htmlFor="propertyType" className="text-sm text-gray-700">
                Tipo de Propiedad
              </label>
              <select
                id="propertyType"
                value={formData.propertyType || ""}
                onChange={(e) =>
                  updateFormData({
                    propertyType: e.target.value as
                      | "residential"
                      | "commercial"
                      | "industrial",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
              >
                <option value="">Seleccione el tipo de propiedad</option>
                <option value="residential">Residencial</option>
                <option value="commercial">Comercial</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>

            {/* City and ZIP Code */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm text-gray-700">
                  Ciudad
                </label>
                <input
                  type="text"
                  id="city"
                  value={formData.city || ""}
                  onChange={(e) => updateFormData({ city: e.target.value })}
                  placeholder="Nombre de la ciudad"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="zipCode" className="text-sm text-gray-700">
                  Código Postal
                </label>
                <input
                  type="text"
                  id="zipCode"
                  value={formData.zipCode || ""}
                  onChange={(e) => updateFormData({ zipCode: e.target.value })}
                  placeholder="1234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Contacts */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="bg-gray-50 border-l-4 border-orange-500 p-4 rounded-r-lg flex-1">
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                Contactos Adicionales
              </h3>
              <p className="text-xs text-gray-600">
                Personas adicionales opcionales involucradas en este proyecto
              </p>
            </div>
            <button
              type="button"
              onClick={addAdditionalContact}
              className="ml-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Agregar Contacto
            </button>
          </div>

          {additionalContacts.map((contact, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Contacto {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeAdditionalContact(index)}
                  className="text-sm text-gray-600 hover:text-gray-600"
                >
                  Eliminar
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) =>
                      updateAdditionalContact(index, "name", e.target.value)
                    }
                    placeholder="Nombre del contacto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Rol</label>
                  <input
                    type="text"
                    value={contact.role}
                    onChange={(e) =>
                      updateAdditionalContact(index, "role", e.target.value)
                    }
                    placeholder="ej. Arquitecto, Ingeniero, Contratista"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Correo</label>
                  <input
                    type="email"
                    value={contact.email || ""}
                    onChange={(e) =>
                      updateAdditionalContact(index, "email", e.target.value)
                    }
                    placeholder="contacto@ejemplo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    value={contact.phone || ""}
                    onChange={(e) =>
                      updateAdditionalContact(index, "phone", e.target.value)
                    }
                    placeholder="+54 11 1234-5678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-gray-300 focus:border-gray-200 bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={showCreateClientModal}
        onClose={() => setShowCreateClientModal(false)}
        onClientCreated={handleClientCreated}
        initialName={newClientName}
      />
    </div>
  );
}
