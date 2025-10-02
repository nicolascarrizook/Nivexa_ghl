import { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Percent, FileText } from 'lucide-react';
import { useCreateLoan } from '@/hooks/useMasterCash';
import type { CreateLoanData } from '@/services/InterProjectLoanService';
import { cn } from '@/lib/utils';

interface CreateLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateLoanModal({ isOpen, onClose }: CreateLoanModalProps) {
  const { mutateAsync: createLoan, isPending } = useCreateLoan();

  const [formData, setFormData] = useState<CreateLoanData>({
    lender_project_id: '',
    borrower_project_id: '',
    amount: 0,
    currency: 'ARS',
    interest_rate: 0,
    due_date: '',
    description: '',
    notes: '',
    payment_terms: '',
    installments_count: 1,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateLoanData, string>>>({});
  const [projects, setProjects] = useState<Array<{ id: string; name: string; code: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Cargar proyectos disponibles
      const loadProjects = async () => {
        try {
          const { createClient } = await import('@/config/supabase');
          const supabase = createClient();
          const { data } = await supabase
            .from('projects')
            .select('id, name, code')
            .in('status', ['in_progress', 'planning'])
            .order('name');

          if (data) setProjects(data);
        } catch (error) {
          console.error('Error loading projects:', error);
        }
      };

      loadProjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateLoanData, string>> = {};

    if (!formData.lender_project_id) {
      newErrors.lender_project_id = 'Selecciona el proyecto prestador';
    }

    if (!formData.borrower_project_id) {
      newErrors.borrower_project_id = 'Selecciona el proyecto prestatario';
    }

    if (formData.lender_project_id === formData.borrower_project_id) {
      newErrors.borrower_project_id = 'Los proyectos deben ser diferentes';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'La fecha de vencimiento es requerida';
    } else {
      const dueDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dueDate <= today) {
        newErrors.due_date = 'La fecha debe ser futura';
      }
    }

    if (formData.installments_count < 1 || formData.installments_count > 60) {
      newErrors.installments_count = 'Entre 1 y 60 cuotas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPending) return;

    const isValid = validateForm();
    if (!isValid) return;

    try {
      await createLoan(formData);
      onClose();

      // Reset form
      setFormData({
        lender_project_id: '',
        borrower_project_id: '',
        amount: 0,
        currency: 'ARS',
        interest_rate: 0,
        due_date: '',
        description: '',
        notes: '',
        payment_terms: '',
        installments_count: 1,
      });
    } catch (error) {
      console.error('Error creating loan:', error);
    }
  };

  const handleInputChange = <K extends keyof CreateLoanData>(field: K) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = field === 'amount' || field === 'interest_rate' || field === 'installments_count'
      ? parseFloat(e.target.value) || 0
      : e.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-md bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-[5%] z-50 mx-auto max-w-3xl bg-white rounded-lg border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Nuevo Préstamo Inter-Proyecto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Proyectos */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Proyectos Involucrados
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Lender Project */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proyecto Prestador *
                  </label>
                  <select
                    value={formData.lender_project_id}
                    onChange={handleInputChange('lender_project_id')}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg text-gray-900",
                      "focus:outline-none focus:ring-2 focus:ring-gray-300",
                      errors.lender_project_id ? "border-red-300" : "border-gray-200"
                    )}
                  >
                    <option value="">Seleccionar...</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.code})
                      </option>
                    ))}
                  </select>
                  {errors.lender_project_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.lender_project_id}</p>
                  )}
                </div>

                {/* Borrower Project */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proyecto Prestatario *
                  </label>
                  <select
                    value={formData.borrower_project_id}
                    onChange={handleInputChange('borrower_project_id')}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg text-gray-900",
                      "focus:outline-none focus:ring-2 focus:ring-gray-300",
                      errors.borrower_project_id ? "border-red-300" : "border-gray-200"
                    )}
                  >
                    <option value="">Seleccionar...</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.code})
                      </option>
                    ))}
                  </select>
                  {errors.borrower_project_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.borrower_project_id}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Monto y Moneda */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Detalles Financieros
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {/* Amount */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount || ''}
                      onChange={handleInputChange('amount')}
                      className={cn(
                        "w-full pl-9 pr-3 py-2 border rounded-lg text-gray-900",
                        "focus:outline-none focus:ring-2 focus:ring-gray-300",
                        errors.amount ? "border-red-300" : "border-gray-200"
                      )}
                      placeholder="100000.00"
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Moneda *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={handleInputChange('currency')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    <option value="ARS">ARS ($)</option>
                    <option value="USD">USD (U$S)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Términos del Préstamo */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Términos del Préstamo
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tasa de Interés (%)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Percent className="h-4 w-4" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.interest_rate || ''}
                      onChange={handleInputChange('interest_rate')}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vencimiento *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={handleInputChange('due_date')}
                      className={cn(
                        "w-full pl-9 pr-3 py-2 border rounded-lg text-gray-900",
                        "focus:outline-none focus:ring-2 focus:ring-gray-300",
                        errors.due_date ? "border-red-300" : "border-gray-200"
                      )}
                    />
                  </div>
                  {errors.due_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
                  )}
                </div>

                {/* Installments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuotas *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.installments_count || ''}
                    onChange={handleInputChange('installments_count')}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg text-gray-900",
                      "focus:outline-none focus:ring-2 focus:ring-gray-300",
                      errors.installments_count ? "border-red-300" : "border-gray-200"
                    )}
                    placeholder="12"
                  />
                  {errors.installments_count && (
                    <p className="mt-1 text-sm text-red-600">{errors.installments_count}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description and Notes */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Información Adicional
              </h3>
              <div className="space-y-4">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <textarea
                      value={formData.description || ''}
                      onChange={handleInputChange('description')}
                      rows={2}
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      placeholder="Propósito del préstamo..."
                    />
                  </div>
                </div>

                {/* Payment Terms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Términos de Pago
                  </label>
                  <input
                    type="text"
                    value={formData.payment_terms || ''}
                    onChange={handleInputChange('payment_terms')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    placeholder="Ej: Pagos mensuales, primer vencimiento..."
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={handleInputChange('notes')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className={cn(
              "px-4 py-2 text-white bg-gray-900 rounded-lg",
              "hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300",
              "disabled:bg-gray-400 disabled:cursor-not-allowed"
            )}
          >
            {isPending ? 'Creando...' : 'Crear Préstamo'}
          </button>
        </div>
      </div>
    </>
  );
}
