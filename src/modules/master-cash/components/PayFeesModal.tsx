import { useState, useEffect } from 'react';
import { X, DollarSign, FileText, ArrowRight } from 'lucide-react';
import { usePayFees } from '@/hooks/useMasterCash';
import { supabase } from '@/config/supabase';
import { cn } from '@/lib/utils';

interface PayFeesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PayFeesModal({ isOpen, onClose }: PayFeesModalProps) {
  const { mutateAsync: payFees, isPending } = usePayFees();

  const [formData, setFormData] = useState({
    projectId: '',
    amount: 0,
    currency: 'ARS' as 'ARS' | 'USD',
    description: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [projects, setProjects] = useState<Array<{ id: string; name: string; code: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Cargar proyectos disponibles
      const loadProjects = async () => {
        try {
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
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (!formData.projectId) {
      newErrors.projectId = 'Selecciona el proyecto destino';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'La descripción es requerida';
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
      await payFees(formData);
      onClose();

      // Reset form
      setFormData({
        projectId: '',
        amount: 0,
        currency: 'ARS',
        description: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error paying fees:', error);
    }
  };

  const handleInputChange = <K extends keyof typeof formData>(field: K) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = field === 'amount'
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
      <div className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-2xl bg-white rounded-lg border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Cobrar Honorarios al Proyecto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-6">
            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proyecto a Cobrar *
              </label>
              <select
                value={formData.projectId}
                onChange={handleInputChange('projectId')}
                className={cn(
                  "w-full px-3 py-2 border rounded-lg text-gray-900",
                  "focus:outline-none focus:ring-2 focus:ring-gray-300",
                  errors.projectId ? "border-red-300" : "border-gray-200"
                )}
              >
                <option value="">Seleccionar proyecto...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.code})
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
              )}

              {/* Visual Flow Indicator */}
              {formData.projectId && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 mb-1">De</p>
                      <p className="text-xs font-medium text-gray-900">Proyecto</p>
                    </div>
                    <div className="px-2">
                      <ArrowRight className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-gray-500 mb-1">→</p>
                      <p className="text-xs font-medium text-gray-900">Caja Admin</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Amount and Currency */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Monto a Transferir
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
                      placeholder="50000.00"
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

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción del Pago *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <FileText className="h-4 w-4" />
                </div>
                <textarea
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  rows={3}
                  className={cn(
                    "w-full pl-9 pr-3 py-2 border rounded-lg text-gray-900",
                    "focus:outline-none focus:ring-2 focus:ring-gray-300",
                    errors.description ? "border-red-300" : "border-gray-200"
                  )}
                  placeholder="Ej: Pago de honorarios profesionales periodo 01/2024..."
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Adicionales
              </label>
              <textarea
                value={formData.notes}
                onChange={handleInputChange('notes')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
                placeholder="Información adicional (opcional)..."
              />
            </div>

            {/* Info Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Nota:</strong> Esta operación cobrará honorarios al proyecto seleccionado.
                Los fondos se transferirán DESDE la cuenta del proyecto HACIA la Caja Admin.
                Se registrará automáticamente como movimiento de tipo "fee_collection".
              </p>
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
            {isPending ? 'Procesando...' : 'Realizar Pago'}
          </button>
        </div>
      </div>
    </>
  );
}
