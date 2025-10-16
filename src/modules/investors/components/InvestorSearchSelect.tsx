import { Button } from "@/components/Button";
import Input from "@/design-system/components/inputs/Input";
import { SectionCard } from "@/design-system/components/layout/SectionCard";
import { ChevronRight, Search, User, Users } from "lucide-react";
import { useState } from "react";
import { useSearchInvestors } from "../hooks/useInvestors";
import type { Investor } from "../types/investor.types";

interface InvestorSearchSelectProps {
  onSelect: (investor: Investor) => void;
  onCreateNew: () => void;
  selectedInvestor?: Investor | null;
}

export function InvestorSearchSelect({
  onSelect,
  onCreateNew,
  selectedInvestor,
}: InvestorSearchSelectProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Only search when we have at least 3 characters
  const { data: searchResults = [], isLoading } = useSearchInvestors(
    searchTerm,
    searchTerm.length >= 3
  );

  const handleSelectInvestor = (investor: Investor) => {
    onSelect(investor);
  };

  const handleNewInvestor = () => {
    onCreateNew();
  };

  if (selectedInvestor) {
    return (
      <SectionCard
        title="Inversionista Seleccionado"
        icon={<User className="w-5 h-5" />}
        subtitle="Información del inversionista"
        actions={[
          {
            id: "change",
            label: "Cambiar inversionista",
            onClick: onCreateNew,
          },
        ]}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Nombre</p>
            <p className="font-medium text-gray-900">{selectedInvestor.name}</p>
          </div>

          {selectedInvestor.email && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="text-sm text-gray-700">{selectedInvestor.email}</p>
            </div>
          )}

          {selectedInvestor.phone && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Teléfono</p>
              <p className="text-sm text-gray-700">{selectedInvestor.phone}</p>
            </div>
          )}

          {selectedInvestor.tax_id && (
            <div>
              <p className="text-xs text-gray-500 mb-1">CUIT/DNI</p>
              <p className="text-sm text-gray-700">{selectedInvestor.tax_id}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 mb-1">Tipo</p>
            <p className="text-sm text-gray-700">
              {selectedInvestor.investor_type === "individual"
                ? "Persona física"
                : "Empresa"}
            </p>
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Seleccionar Inversionista"
      icon={<Search className="w-5 h-5" />}
      subtitle="Busca un inversionista existente o registra uno nuevo"
    >
      <div className="space-y-4 mt-6">
        <Input
          label=""
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre, email o CUIT/DNI..."
          helperText="Ingresa al menos 3 caracteres para buscar"
        />

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Buscando inversionistas...</p>
          </div>
        ) : searchTerm.length >= 3 ? (
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
            {searchResults.length > 0 ? (
              searchResults.map((investor) => (
                <button
                  key={investor.id}
                  onClick={() => handleSelectInvestor(investor)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">
                        {investor.name}
                      </p>
                      {investor.investor_type === "company" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Empresa
                        </span>
                      )}
                    </div>
                    {investor.email && (
                      <p className="text-sm text-gray-500 mt-1">
                        {investor.email}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                      {investor.tax_id && <span>CUIT/DNI: {investor.tax_id}</span>}
                      {investor.phone && <span>Tel: {investor.phone}</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">
                  No se encontraron inversionistas
                </p>
                <Button onClick={handleNewInvestor} variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Crear nuevo inversionista
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center border border-gray-200 rounded-lg bg-gray-50">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">
              Busca un inversionista existente o crea uno nuevo
            </p>
            <Button onClick={handleNewInvestor} variant="outline" size="sm">
              <User className="w-4 h-4 mr-2" />
              Crear nuevo inversionista
            </Button>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
