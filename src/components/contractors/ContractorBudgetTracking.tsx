import React from 'react';

export interface ContractorBudgetTrackingProps {
  projectId?: string;
  contractorId?: string;
  budget?: number;
  spent?: number;
}

export const ContractorBudgetTracking: React.FC<ContractorBudgetTrackingProps> = ({
  projectId,
  contractorId,
  budget = 0,
  spent = 0
}) => {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = budget - spent;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Seguimiento de Presupuesto del Contratista</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Presupuesto Total</span>
            <span>${budget.toLocaleString('es-MX')} MXN</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Gastado</span>
            <span className="text-red-600">${spent.toLocaleString('es-MX')} MXN</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Restante</span>
            <span className="text-green-600">${remaining.toLocaleString('es-MX')} MXN</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progreso</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                percentage > 90 ? 'bg-red-500' : 
                percentage > 75 ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>Proyecto ID: {projectId || 'N/A'}</p>
          <p>Contratista ID: {contractorId || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};