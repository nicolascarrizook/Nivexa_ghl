import { useProjectWizard } from '../../hooks/useProjectWizard';
import { formatPhone } from '@/utils/formatters';

const PROPERTY_TYPE_OPTIONS = [
  { value: 'residential', label: 'Residencial', description: 'Casa, departamento, etc.' },
  { value: 'commercial', label: 'Comercial', description: 'Local, oficina, etc.' },
  { value: 'industrial', label: 'Industrial', description: 'Galpón, fábrica, etc.' },
];

export function ClientDetailsStep() {
  const { formData, updateFormData } = useProjectWizard();

  const handlePhoneChange = (value: string) => {
    // Format phone number as user types
    const formatted = formatPhone(value);
    updateFormData({ clientPhone: formatted });
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-light text-primary mb-2">Información del Cliente</h2>
        <p className="text-sm text-tertiary">
          Ingresa los datos del propietario del proyecto
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Primary Contact Section */}
        <div className="space-y-6">
          <h3 className="text-base font-normal text-secondary border-b border-gray-800/30 pb-2">
            Datos de Contacto
          </h3>

          {/* Client Name */}
          <div>
            <label className="block text-sm font-normal text-secondary mb-2">
              Nombre Completo <span className="text-gray-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                value={formData.clientName || ''}
                onChange={(e) => updateFormData({ clientName: e.target.value })}
                className="input-field w-full pl-10"
                placeholder="Juan Carlos González"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-normal text-secondary mb-2">
              Correo Electrónico <span className="text-gray-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                value={formData.clientEmail || ''}
                onChange={(e) => updateFormData({ clientEmail: e.target.value })}
                className="input-field w-full pl-10"
                placeholder="cliente@ejemplo.com"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-normal text-secondary mb-2">
              Teléfono <span className="text-gray-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                type="tel"
                value={formData.clientPhone || ''}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="input-field w-full pl-10"
                placeholder="+54 11 1234-5678"
              />
            </div>
          </div>

          {/* Tax ID */}
          <div>
            <label className="block text-sm font-normal text-secondary mb-2">
              CUIT/DNI
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <input
                type="text"
                value={formData.clientTaxId || ''}
                onChange={(e) => updateFormData({ clientTaxId: e.target.value })}
                className="input-field w-full pl-10"
                placeholder="20-12345678-9"
              />
            </div>
            <p className="text-xs text-tertiary mt-1">Opcional</p>
          </div>
        </div>

        {/* Property Information Section */}
        <div className="space-y-6">
          <h3 className="text-base font-normal text-secondary border-b border-gray-800/30 pb-2">
            Información de la Propiedad
          </h3>

          {/* Property Address */}
          <div>
            <label className="block text-sm font-normal text-secondary mb-2">
              Dirección de la Propiedad <span className="text-gray-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={formData.propertyAddress || ''}
                onChange={(e) => updateFormData({ propertyAddress: e.target.value })}
                className="input-field w-full pl-10"
                placeholder="Av. Libertador 1234, Piso 5"
              />
            </div>
          </div>

          {/* City and ZIP */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-normal text-secondary mb-2">
                Ciudad <span className="text-gray-600">*</span>
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => updateFormData({ city: e.target.value })}
                className="input-field w-full"
                placeholder="Buenos Aires"
              />
            </div>
            <div>
              <label className="block text-sm font-normal text-secondary mb-2">
                Código Postal <span className="text-gray-600">*</span>
              </label>
              <input
                type="text"
                value={formData.zipCode || ''}
                onChange={(e) => updateFormData({ zipCode: e.target.value })}
                className="input-field w-full"
                placeholder="C1425"
              />
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-normal text-secondary mb-3">
              Tipo de Propiedad <span className="text-gray-600">*</span>
            </label>
            <div className="space-y-2">
              {PROPERTY_TYPE_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateFormData({ propertyType: option.value as any })}
                  className={`
                    w-full p-3 rounded-lg border text-left transition-all duration-200
                    ${formData.propertyType === option.value
                      ? 'bg-gray-100/20 border-gray-200/50'
                      : 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-sm font-normal ${
                        formData.propertyType === option.value ? 'text-gray-600' : 'text-gray-300'
                      }`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-tertiary mt-0.5">
                        {option.description}
                      </div>
                    </div>
                    {formData.propertyType === option.value && (
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Contacts Section */}
      <div className="pt-6 border-t border-gray-800/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-normal text-secondary">Contactos Adicionales</h3>
            <p className="text-xs text-tertiary mt-1">
              Agrega otros interesados, co-propietarios o tomadores de decisiones
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost text-sm flex items-center gap-2"
            onClick={() => {
              const newContacts = [...(formData.additionalContacts || []), 
                { name: '', role: '', email: '', phone: '' }
              ];
              updateFormData({ additionalContacts: newContacts });
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Contacto
          </button>
        </div>

        {formData.additionalContacts && formData.additionalContacts.length > 0 && (
          <div className="space-y-3">
            {formData.additionalContacts.map((contact, index) => (
              <div key={index} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => {
                      const updated = [...formData.additionalContacts!];
                      updated[index].name = e.target.value;
                      updateFormData({ additionalContacts: updated });
                    }}
                    className="input-field"
                    placeholder="Nombre"
                  />
                  <input
                    type="text"
                    value={contact.role}
                    onChange={(e) => {
                      const updated = [...formData.additionalContacts!];
                      updated[index].role = e.target.value;
                      updateFormData({ additionalContacts: updated });
                    }}
                    className="input-field"
                    placeholder="Rol (ej: Co-propietario)"
                  />
                  <input
                    type="email"
                    value={contact.email || ''}
                    onChange={(e) => {
                      const updated = [...formData.additionalContacts!];
                      updated[index].email = e.target.value;
                      updateFormData({ additionalContacts: updated });
                    }}
                    className="input-field"
                    placeholder="Email"
                  />
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={contact.phone || ''}
                      onChange={(e) => {
                        const updated = [...formData.additionalContacts!];
                        updated[index].phone = e.target.value;
                        updateFormData({ additionalContacts: updated });
                      }}
                      className="input-field flex-1"
                      placeholder="Teléfono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = formData.additionalContacts!.filter((_, i) => i !== index);
                        updateFormData({ additionalContacts: updated });
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100/10 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}