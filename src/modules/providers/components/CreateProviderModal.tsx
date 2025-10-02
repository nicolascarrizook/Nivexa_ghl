import { useState } from 'react';
import { Check, User, Building2, CreditCard, FileText } from 'lucide-react';
import { supabase } from '@/config/supabase';
import Modal from '@/design-system/components/feedback/Modal';
import { toast } from '@/hooks/useToast';

interface CreateProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SECTIONS = [
  { id: 1, title: 'Información Básica', icon: User, description: 'Datos generales del proveedor' },
  { id: 2, title: 'Información de Contacto', icon: Building2, description: 'Datos de comunicación' },
  { id: 3, title: 'Información de Pago', icon: CreditCard, description: 'Datos bancarios y condiciones' },
  { id: 4, title: 'Revisión Final', icon: Check, description: 'Confirmar información' }
];

export function CreateProviderModal({ isOpen, onClose, onSuccess }: CreateProviderModalProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    tax_id: '',
    provider_type: 'contractor' as 'contractor' | 'supplier' | 'service' | 'professional',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip_code: '',
    bank_name: '',
    account_number: '',
    account_type: 'checking' as 'checking' | 'savings',
    payment_terms: 30,
    notes: ''
  });

  const validateSection = (sectionId: number): boolean => {
    switch (sectionId) {
      case 1:
        return !!formData.name;
      case 2:
        return true; // Contacto es opcional
      case 3:
        return true; // Pago es opcional
      case 4:
        return !!formData.name;
      default:
        return false;
    }
  };

  const handleSectionChange = (sectionId: number) => {
    if (sectionId < currentSection || completedSections.includes(currentSection)) {
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
    if (!formData.name) {
      toast.warning('El nombre es requerido');
      return;
    }

    setLoading(true);
    try {
      const providerData: any = {
        name: formData.name,
        status: 'active'
      };

      if (formData.business_name) providerData.business_name = formData.business_name;
      if (formData.tax_id) providerData.tax_id = formData.tax_id;
      if (formData.provider_type) providerData.provider_type = formData.provider_type;
      if (formData.email) providerData.email = formData.email;
      if (formData.phone) providerData.phone = formData.phone;
      if (formData.address) providerData.address = formData.address;
      if (formData.city) providerData.city = formData.city;
      if (formData.zip_code) providerData.zip_code = formData.zip_code;
      if (formData.notes) providerData.notes = formData.notes;
      if (formData.bank_name) providerData.bank_name = formData.bank_name;
      if (formData.account_number) providerData.account_number = formData.account_number;
      if (formData.account_type) providerData.account_type = formData.account_type;
      if (formData.payment_terms) providerData.payment_terms = formData.payment_terms;

      const { error } = await supabase
        .from('providers')
        .insert(providerData);

      if (error) throw error;

      toast.success('Proveedor registrado exitosamente');
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating provider:', error);
      toast.error('Error al registrar el proveedor');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentSection(1);
    setCompletedSections([]);
    setFormData({
        name: '',
        business_name: '',
        tax_id: '',
        provider_type: 'contractor',
        email: '',
        phone: '',
        address: '',
        city: '',
        zip_code: '',
        bank_name: '',
        account_number: '',
        account_type: 'checking',
        payment_terms: 30,
        notes: ''
      });
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 1:
        return (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-light text-primary">Información Básica</h2>
                <p className="text-sm text-tertiary">Datos principales del proveedor</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="Juan Pérez"
                />
                <p className="text-xs text-tertiary mt-2">
                  Nombre completo del proveedor o profesional
                </p>
              </div>

              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Razón Social
                </label>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="input-field w-full"
                  placeholder="Construcciones JP S.A."
                />
              </div>

              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  CUIT/DNI
                </label>
                <input
                  type="text"
                  value={formData.tax_id}
                  onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                  className="input-field w-full"
                  placeholder="20-12345678-9"
                />
              </div>

              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Tipo de Proveedor
                </label>
                <select
                  value={formData.provider_type}
                  onChange={(e) => setFormData({ ...formData, provider_type: e.target.value as any })}
                  className="select-field w-full"
                >
                  <option value="contractor">Proveedor</option>
                  <option value="supplier">Proveedor de Materiales</option>
                  <option value="service">Servicio</option>
                  <option value="professional">Profesional</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Building2 className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-light text-primary">Información de Contacto</h2>
                <p className="text-sm text-tertiary">Datos de comunicación con el proveedor</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field w-full"
                  placeholder="proveedor@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field w-full"
                  placeholder="+54 11 1234-5678"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-normal text-secondary mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field w-full"
                  placeholder="Av. Corrientes 1234"
                />
              </div>

              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input-field w-full"
                  placeholder="Buenos Aires"
                />
              </div>

              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Código Postal
                </label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  className="input-field w-full"
                  placeholder="C1234"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-light text-primary">Información de Pago</h2>
                <p className="text-sm text-tertiary">Datos bancarios y condiciones de pago</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Banco
                </label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className="input-field w-full"
                  placeholder="Banco Nación"
                />
              </div>

              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Número de Cuenta/CBU
                </label>
                <input
                  type="text"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  className="input-field w-full"
                  placeholder="0110012345678901234567"
                />
              </div>

              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Tipo de Cuenta
                </label>
                <select
                  value={formData.account_type}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value as any })}
                  className="select-field w-full"
                >
                  <option value="checking">Cuenta Corriente</option>
                  <option value="savings">Caja de Ahorro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-normal text-secondary mb-2">
                  Términos de Pago (días)
                </label>
                <input
                  type="number"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: parseInt(e.target.value) || 30 })}
                  className="input-field w-full"
                  placeholder="30"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-normal text-secondary mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="textarea-field w-full"
                  rows={4}
                  placeholder="Información adicional sobre el proveedor..."
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-light text-primary">Revisión Final</h2>
                <p className="text-sm text-tertiary">Confirme la información del proveedor</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Información Básica */}
              <div>
                <h3 className="text-sm font-medium text-primary mb-3">Información Básica</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary">Nombre:</span>
                    <span className="text-sm text-primary font-medium">{formData.name || '-'}</span>
                  </div>
                  {formData.business_name && (
                    <div className="flex justify-between">
                      <span className="text-sm text-secondary">Razón Social:</span>
                      <span className="text-sm text-primary">{formData.business_name}</span>
                    </div>
                  )}
                  {formData.tax_id && (
                    <div className="flex justify-between">
                      <span className="text-sm text-secondary">CUIT/DNI:</span>
                      <span className="text-sm text-primary">{formData.tax_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-secondary">Tipo:</span>
                    <span className="text-sm text-primary">
                      {formData.provider_type === 'contractor' && 'Proveedor'}
                      {formData.provider_type === 'supplier' && 'Proveedor de Materiales'}
                      {formData.provider_type === 'service' && 'Servicio'}
                      {formData.provider_type === 'professional' && 'Profesional'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              {(formData.email || formData.phone || formData.address) && (
                <div>
                  <h3 className="text-sm font-medium text-primary mb-3">Información de Contacto</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {formData.email && (
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary">Email:</span>
                        <span className="text-sm text-primary">{formData.email}</span>
                      </div>
                    )}
                    {formData.phone && (
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary">Teléfono:</span>
                        <span className="text-sm text-primary">{formData.phone}</span>
                      </div>
                    )}
                    {formData.address && (
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary">Dirección:</span>
                        <span className="text-sm text-primary">{formData.address}</span>
                      </div>
                    )}
                    {formData.city && (
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary">Ciudad:</span>
                        <span className="text-sm text-primary">{formData.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información de Pago */}
              {(formData.bank_name || formData.account_number) && (
                <div>
                  <h3 className="text-sm font-medium text-primary mb-3">Información de Pago</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {formData.bank_name && (
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary">Banco:</span>
                        <span className="text-sm text-primary">{formData.bank_name}</span>
                      </div>
                    )}
                    {formData.account_number && (
                      <div className="flex justify-between">
                        <span className="text-sm text-secondary">Cuenta:</span>
                        <span className="text-sm text-primary">{formData.account_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-secondary">Tipo de Cuenta:</span>
                      <span className="text-sm text-primary">
                        {formData.account_type === 'checking' ? 'Cuenta Corriente' : 'Caja de Ahorro'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-secondary">Términos de Pago:</span>
                      <span className="text-sm text-primary">{formData.payment_terms} días</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" hideCloseButton>
      <div className="flex h-[600px] bg-gray-50 rounded-lg overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Nuevo Proveedor</h2>
            <p className="text-xs text-gray-500 mt-1">Complete la información</p>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto">
            <ul className="space-y-1">
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
                        ${isActive ? 'bg-gray-100 text-gray-900' : isCompleted ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-400 cursor-not-allowed'}
                      `}
                      disabled={!isCompleted && section.id > currentSection}
                    >
                      <div className={`
                        flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5
                        ${isActive ? 'bg-gray-900 text-white' : isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}
                      `}>
                        {isCompleted && !isActive ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{section.title}</p>
                        <p className="text-xs text-gray-500">{section.description}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-3 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
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
                {Math.round((completedSections.length / SECTIONS.length) * 100)}% completado
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-gray-900 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(completedSections.length / SECTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              {renderCurrentSection()}
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white border-t border-gray-200 px-6 py-3">
            <div className="max-w-3xl mx-auto flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentSection === 1}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg transition-colors
                  ${currentSection === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                Anterior
              </button>

              <div className="flex items-center space-x-2">
                {currentSection < SECTIONS.length ? (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`
                      px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center
                      ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'}
                    `}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creando...
                      </>
                    ) : (
                      <>
                        Crear Proveedor
                        <Check className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}