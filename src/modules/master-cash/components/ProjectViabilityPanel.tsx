import { useEffect, useState } from 'react';
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { projectViabilityService, type ViabilityAnalysis } from '@/services/ProjectViabilityAnalysisService';
import { formatCurrency } from '@/utils/formatters';

interface ProjectViabilityPanelProps {
  projectId: string | null;
  onAnalysisComplete?: (analysis: ViabilityAnalysis | null) => void;
}

export function ProjectViabilityPanel({ projectId, onAnalysisComplete }: ProjectViabilityPanelProps) {
  const [analysis, setAnalysis] = useState<ViabilityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setAnalysis(null);
      onAnalysisComplete?.(null);
      return;
    }

    const loadAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await projectViabilityService.analyzeProject(projectId);
        setAnalysis(result);
        onAnalysisComplete?.(result);
      } catch (err: any) {
        console.error('Error loading viability analysis:', err);
        setError('Error al cargar el análisis de viabilidad');
        onAnalysisComplete?.(null);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [projectId, onAnalysisComplete]);

  if (!projectId) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-sm text-gray-500 text-center">
          Seleccione un proyecto para ver el análisis de viabilidad
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-sm text-gray-600">Analizando proyecto...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-800' };
      case 'medium': return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-800' };
      case 'high': return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800' };
      case 'critical': return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-800' };
    }
  };

  const colors = getRiskColor(analysis.riskLevel);

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Riesgo Bajo';
      case 'medium': return 'Riesgo Medio';
      case 'high': return 'Riesgo Alto';
      case 'critical': return 'Riesgo Crítico';
      default: return 'Riesgo Desconocido';
    }
  };

  return (
    <div className={`border ${colors.border} ${colors.bg} rounded-lg p-6 space-y-6`}>
      {/* Header with Risk Score */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Análisis de Viabilidad - {analysis.projectName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Evaluación automática basada en datos históricos y proyecciones
          </p>
        </div>
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center">
            {/* Circular progress */}
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - analysis.riskScore / 100)}`}
                className={
                  analysis.riskLevel === 'low' ? 'text-green-600' :
                  analysis.riskLevel === 'medium' ? 'text-yellow-600' :
                  analysis.riskLevel === 'high' ? 'text-orange-600' :
                  'text-red-600'
                }
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{analysis.riskScore}</span>
              <span className="text-xs text-gray-500">Score</span>
            </div>
          </div>
          <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}>
            {getRiskLabel(analysis.riskLevel)}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Historical Income */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Ingresos Históricos</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(analysis.historicalIncome.totalARS)}
            </p>
            <p className="text-sm text-gray-600">
              USD {analysis.historicalIncome.totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500">
              {analysis.historicalIncome.paymentCount} pagos realizados
            </p>
          </div>
        </div>

        {/* Future Projections */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Cuotas Pendientes</span>
            <Calendar className="h-4 w-4 text-green-600" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(analysis.futureProjections.projectedIncomeARS)}
            </p>
            <p className="text-sm text-gray-600">
              USD {analysis.futureProjections.projectedIncomeUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500">
              {analysis.futureProjections.pendingInstallmentsCount} cuotas por cobrar
            </p>
          </div>
        </div>

        {/* Current Debt */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Deuda Actual</span>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(analysis.debtAnalysis.totalDebtARS)}
            </p>
            <p className="text-sm text-gray-600">
              USD {analysis.debtAnalysis.totalDebtUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500">
              {analysis.debtAnalysis.activeLoansCount} préstamo(s) activo(s)
            </p>
          </div>
        </div>
      </div>

      {/* Payment Capacity */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Capacidad de Pago</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Ingreso Mensual Estimado</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(analysis.paymentCapacity.monthlyIncomeCapacityARS)} / mes
            </p>
            <p className="text-xs text-gray-600">
              USD {analysis.paymentCapacity.monthlyIncomeCapacityUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} / mes
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Ratio Deuda/Ingresos</p>
            <p className={`text-sm font-semibold ${
              analysis.paymentCapacity.debtToIncomeRatio > 50 ? 'text-red-600' :
              analysis.paymentCapacity.debtToIncomeRatio > 30 ? 'text-orange-600' :
              'text-green-600'
            }`}>
              {analysis.paymentCapacity.debtToIncomeRatio.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-600">
              {analysis.paymentCapacity.debtToIncomeRatio < 30 ? 'Saludable' :
               analysis.paymentCapacity.debtToIncomeRatio < 50 ? 'Moderado' : 'Alto'}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <DollarSign className="h-4 w-4 mr-2 text-green-600" />
          Recomendaciones de Préstamo
        </h4>

        {/* Currency-based recommendations */}
        <div className="space-y-3 mb-4">
          {/* Primary currency options */}
          {(analysis.recommendations.primaryCurrency === 'ARS' || analysis.recommendations.primaryCurrency === 'BOTH') && analysis.recommendations.maxSafeLoanARS > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-green-700">💵 Préstamo en Pesos (ARS)</span>
                {analysis.recommendations.primaryCurrency === 'ARS' && (
                  <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">Recomendado</span>
                )}
              </div>
              <p className="text-xl font-bold text-green-700">
                {formatCurrency(analysis.recommendations.maxSafeLoanARS)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Basado en capacidad de pago en ARS
              </p>
              {analysis.recommendations.maxSafeLoanUSDConverted > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  ≈ USD {analysis.recommendations.maxSafeLoanUSDConverted.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="ml-1">(conversión aprox.)</span>
                </p>
              )}
            </div>
          )}

          {(analysis.recommendations.primaryCurrency === 'USD' || analysis.recommendations.primaryCurrency === 'BOTH') && analysis.recommendations.maxSafeLoanUSD > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-700">💵 Préstamo en Dólares (USD)</span>
                {analysis.recommendations.primaryCurrency === 'USD' && (
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Recomendado</span>
                )}
              </div>
              <p className="text-xl font-bold text-blue-700">
                USD {analysis.recommendations.maxSafeLoanUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Basado en capacidad de pago en USD
              </p>
              {analysis.recommendations.maxSafeLoanARSConverted > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  ≈ {formatCurrency(analysis.recommendations.maxSafeLoanARSConverted)}
                  <span className="ml-1">(conversión aprox. a ${analysis.recommendations.exchangeRate} ARS/USD)</span>
                </p>
              )}
            </div>
          )}

          {/* No capacity warning */}
          {analysis.recommendations.maxSafeLoanARS === 0 && analysis.recommendations.maxSafeLoanUSD === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                <p className="text-xs text-yellow-700">
                  El proyecto no tiene capacidad de pago actual para nuevos préstamos
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Plazo Recomendado</p>
          <p className="text-sm font-semibold text-gray-900">
            {analysis.recommendations.recommendedTermMonths} meses
          </p>
        </div>

        {/* Warnings */}
        {analysis.recommendations.warnings.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-orange-700 mb-2 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Advertencias
            </p>
            <ul className="space-y-1">
              {analysis.recommendations.warnings.map((warning, idx) => (
                <li key={idx} className="text-xs text-orange-600 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strengths */}
        {analysis.recommendations.strengths.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-green-700 mb-2 flex items-center">
              <CheckCircle className="h-3 w-3 mr-1" />
              Fortalezas
            </p>
            <ul className="space-y-1">
              {analysis.recommendations.strengths.map((strength, idx) => (
                <li key={idx} className="text-xs text-green-600 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Lending Decision Guide */}
      <div className={`rounded-lg p-4 ${
        analysis.riskScore >= 70 ? 'bg-green-50 border border-green-200' :
        analysis.riskScore >= 50 ? 'bg-yellow-50 border border-yellow-200' :
        'bg-red-50 border border-red-200'
      }`}>
        <p className={`text-sm font-semibold mb-2 ${
          analysis.riskScore >= 70 ? 'text-green-800' :
          analysis.riskScore >= 50 ? 'text-yellow-800' :
          'text-red-800'
        }`}>
          {analysis.riskScore >= 70 ? '✅ Préstamo Recomendado' :
           analysis.riskScore >= 50 ? '⚠️ Préstamo con Precaución' :
           '❌ Préstamo No Recomendado'}
        </p>
        <p className={`text-xs ${
          analysis.riskScore >= 70 ? 'text-green-700' :
          analysis.riskScore >= 50 ? 'text-yellow-700' :
          'text-red-700'
        }`}>
          {analysis.riskScore >= 70
            ? 'El proyecto muestra buena capacidad de pago y bajo riesgo. Puede proceder con el préstamo dentro de los montos recomendados.'
            : analysis.riskScore >= 50
            ? 'El proyecto presenta algunos factores de riesgo. Considere reducir el monto o el plazo del préstamo.'
            : 'El proyecto presenta alto riesgo de impago. Se recomienda no otorgar el préstamo o esperar a que mejore su situación financiera.'}
        </p>
      </div>
    </div>
  );
}
