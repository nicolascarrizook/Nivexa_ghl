import React, { useState, useMemo } from 'react';
import { Calendar, DollarSign, CreditCard, TrendingUp, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InstallmentData {
  number: number;
  amount: number;
  dueDate: Date;
  description: string;
  isDownPayment?: boolean;
  currency: 'USD' | 'ARS';
}

interface InstallmentBreakdownProps {
  installments: InstallmentData[];
  totalAmount: number;
  currency: 'USD' | 'ARS';
  exchangeRate?: number;
  className?: string;
}

export function InstallmentBreakdown({
  installments,
  totalAmount,
  currency,
  exchangeRate = 1,
  className,
}: InstallmentBreakdownProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const installmentsPerPage = 10;

  const formatCurrency = (amount: number, curr: 'USD' | 'ARS' = currency) => {
    if (curr === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } else {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  // Calculate totals
  const downPayment = installments.find(inst => inst.isDownPayment);
  const regularInstallments = installments.filter(inst => !inst.isDownPayment);
  const calculatedTotal = installments.reduce((sum, inst) => sum + inst.amount, 0);

  // Pagination calculations
  const totalPages = Math.ceil(installments.length / installmentsPerPage);
  const startIndex = (currentPage - 1) * installmentsPerPage;
  const endIndex = startIndex + installmentsPerPage;
  const paginatedInstallments = installments.slice(startIndex, endIndex);

  // Reset page if it's out of bounds
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handlePageSelect = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate equivalent in other currency if needed
  const getEquivalentAmount = (amount: number, fromCurrency: 'USD' | 'ARS') => {
    if (fromCurrency === currency) return null;
    
    if (fromCurrency === 'USD' && currency === 'ARS') {
      return amount * exchangeRate;
    } else if (fromCurrency === 'ARS' && currency === 'USD') {
      return amount / exchangeRate;
    }
    return null;
  };

  if (installments.length === 0) {
    return (
      <div className={cn("bg-gray-50 border border-gray-200 rounded-lg p-6", className)}>
        <div className="text-center text-gray-500">
          <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Configure los montos para ver el desglose de cuotas</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-900 rounded-lg">
              <CreditCard className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Plan de Pagos
              </h3>
              <p className="text-sm text-gray-600">
                Desglose detallado de cuotas y vencimientos
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalAmount)}
            </div>
            <div className="text-sm text-gray-600">
              Total del proyecto
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {downPayment && (
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Anticipo</div>
              <div className="text-lg font-semibold text-gray-600">
                {formatCurrency(downPayment.amount)}
              </div>
              <div className="text-xs text-gray-500">
                {((downPayment.amount / totalAmount) * 100).toFixed(1)}% del total
              </div>
            </div>
          )}
          
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Cuotas</div>
            <div className="text-lg font-semibold text-gray-600">
              {regularInstallments.length}
            </div>
            <div className="text-xs text-gray-500">
              Pagos programados
            </div>
          </div>
          
          {regularInstallments.length > 0 && (
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Cuota promedio</div>
              <div className="text-lg font-semibold text-purple-600">
                {formatCurrency(
                  regularInstallments.reduce((sum, inst) => sum + inst.amount, 0) / 
                  regularInstallments.length
                )}
              </div>
              <div className="text-xs text-gray-500">
                Monto por cuota
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls - Top */}
      {totalPages > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Mostrando {startIndex + 1} - {Math.min(endIndex, installments.length)} de {installments.length} pagos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={cn(
                  "p-1 rounded-lg border transition-colors",
                  currentPage === 1
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageSelect(pageNum)}
                      className={cn(
                        "px-3 py-1 text-sm rounded-lg transition-colors",
                        currentPage === pageNum
                          ? "bg-gray-900 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={cn(
                  "p-1 rounded-lg border transition-colors",
                  currentPage === totalPages
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Installments List */}
      <div className="divide-y divide-gray-100">
        {paginatedInstallments.map((installment, index) => {
          const equivalentAmount = getEquivalentAmount(installment.amount, installment.currency);
          const isOverdue = installment.dueDate < new Date();
          const isDueSoon = !isOverdue && installment.dueDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

          return (
            <div 
              key={`${installment.number}-${index}`}
              className={cn(
                "px-6 py-4 hover:bg-gray-50 transition-colors",
                installment.isDownPayment && "bg-gray-100",
                isOverdue && "bg-gray-100",
                isDueSoon && "bg-gray-100"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Installment Number/Badge */}
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold",
                    installment.isDownPayment 
                      ? "bg-gray-100 text-gray-600"
                      : isOverdue
                      ? "bg-gray-100 text-gray-600"
                      : isDueSoon
                      ? "bg-gray-100 text-gray-600"
                      : "bg-gray-900 text-gray-600"
                  )}>
                    {installment.isDownPayment ? 'A' : installment.number}
                  </div>

                  {/* Installment Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {installment.description}
                      </h4>
                      {installment.isDownPayment && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Anticipo
                        </span>
                      )}
                      {isOverdue && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Vencido
                        </span>
                      )}
                      {isDueSoon && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Próximo
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Vence: {formatDate(installment.dueDate)}</span>
                      </div>
                      
                      {equivalentAmount && (
                        <div className="text-sm text-gray-500">
                          ≈ {formatCurrency(equivalentAmount, currency === 'USD' ? 'ARS' : 'USD')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(installment.amount, installment.currency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {((installment.amount / totalAmount) * 100).toFixed(1)}% del total
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls - Bottom */}
      {totalPages > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={cn(
                "flex items-center gap-1 px-3 py-1 text-sm rounded-lg border transition-colors",
                currentPage === 1
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            
            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={cn(
                "flex items-center gap-1 px-3 py-1 text-sm rounded-lg border transition-colors",
                currentPage === totalPages
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              )}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Footer with Summary */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="h-4 w-4" />
            <span>
              Total calculado: {formatCurrency(calculatedTotal)} • 
              {installments.length} pago{installments.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {currency === 'USD' && exchangeRate > 1 && (
            <div className="text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>
                  Equivalente: {formatCurrency(totalAmount * exchangeRate, 'ARS')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}