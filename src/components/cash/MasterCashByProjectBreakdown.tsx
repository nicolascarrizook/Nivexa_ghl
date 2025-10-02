import { useEffect, useState } from 'react';
import { masterCashService } from '@/services/MasterCashService';
import { Building2, TrendingUp, Calendar, Loader2 } from 'lucide-react';

interface ProjectBreakdown {
  project_id: string;
  project_name: string;
  project_code: string;
  contributed_amount: number;
  installments_count: number;
  last_payment_date: string | null;
}

export function MasterCashByProjectBreakdown() {
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [projects, setProjects] = useState<ProjectBreakdown[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await masterCashService.getMasterCashByProject();
      setTotalBalance(data.total_master_balance);
      setProjects(data.by_project);
    } catch (error) {
      console.error('Error loading master cash breakdown:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getPercentage = (amount: number) => {
    if (totalBalance === 0) return 0;
    return ((amount / totalBalance) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Cargando desglose...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Desglose de Caja Maestra por Proyecto
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Trazabilidad completa del origen del dinero
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Saldo Total</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="divide-y divide-gray-200">
        {projects.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay proyectos con aportes
            </h3>
            <p className="text-gray-500">
              Los proyectos que reciban pagos aparecerán aquí
            </p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.project_id}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                {/* Project Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-gray-900">
                        {project.project_name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Código: {project.project_code}
                      </p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="ml-13 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>{project.installments_count} cuota{project.installments_count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Último pago: {formatDate(project.last_payment_date)}</span>
                    </div>
                  </div>
                </div>

                {/* Amount and Percentage */}
                <div className="text-right ml-4">
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(project.contributed_amount)}
                  </p>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getPercentage(project.contributed_amount)}% del total
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="ml-13 mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getPercentage(project.contributed_amount)}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer with summary */}
      {projects.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              <span className="font-medium">{projects.length}</span> proyecto{projects.length !== 1 ? 's' : ''} con aportes
            </div>
            <div className="text-gray-600">
              <span className="font-medium">
                {projects.reduce((sum, p) => sum + p.installments_count, 0)}
              </span>{' '}
              cuotas totales pagadas
            </div>
          </div>
        </div>
      )}
    </div>
  );
}