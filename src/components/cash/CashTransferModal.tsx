import React from 'react';

export interface CashTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount?: number;
  onSuccess?: () => void;
}

export const CashTransferModal: React.FC<CashTransferModalProps> = ({
  isOpen,
  onClose,
  amount,
  onSuccess
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Transferencia de Efectivo</h2>
        <p className="text-gray-600 mb-4">
          Funcionalidad de transferencia en desarrollo. Monto: ${amount || 0} MXN
        </p>
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
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Transferir
          </button>
        </div>
      </div>
    </div>
  );
};