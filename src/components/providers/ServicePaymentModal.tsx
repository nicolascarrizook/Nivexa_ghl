import React from 'react';

export interface ServicePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId?: string;
  amount?: number;
  onSuccess?: () => void;
}

export const ServicePaymentModal: React.FC<ServicePaymentModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  amount,
  onSuccess
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Pago de Servicio</h2>
        <p className="text-gray-600 mb-4">
          Procesando pago del servicio {serviceId}
        </p>
        {amount && (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Monto a pagar:</p>
            <p className="text-2xl font-bold text-gray-900">${amount.toLocaleString('es-MX')} MXN</p>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onSuccess?.();
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Procesar Pago
          </button>
        </div>
      </div>
    </div>
  );
};