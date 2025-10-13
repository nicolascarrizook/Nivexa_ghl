import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  Wallet,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Plus,
  ArrowLeftRight,
  FileText,
  RefreshCw,
} from 'lucide-react';

// UI Components
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import MetricGrid from '@/design-system/components/data-display/MetricGrid/MetricGrid';
import type { StatCardProps } from '@/design-system/components/data-display/StatCard/StatCard';
import { SectionCard } from '@/design-system/components/layout';
import { EmptyState } from '@/design-system/components/feedback';

// Services
import { newCashBoxService } from '@/services/cash/NewCashBoxService';
import type { MasterCash, CashMovement } from '@/services/cash/NewCashBoxService';

// Hooks
import {
  useLoanStatistics,
  useActiveLoans,
  useOverdueInstallments,
  useMasterAccounts,
} from '@/hooks/useMasterCash';
import { formatCurrency } from '@/utils/formatters';

// Components
import { CreateLoanModal } from '@/modules/master-cash/components/CreateLoanModal';
import { LoansDataTable } from '@/modules/master-cash/components/LoansDataTable';
import { TransferModal } from '@/modules/master-cash/components/TransferModal';
import { AuditTrailTable } from '@/modules/master-cash/components/AuditTrailTable';

export function MasterCashPage() {
  const [isCreateLoanModalOpen, setIsCreateLoanModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Cash Box data (replaces accountStats)
  const [masterCash, setMasterCash] = useState<MasterCash | null>(null);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [isLoadingCash, setIsLoadingCash] = useState(true);

  // Data fetching
  const { data: loanStats, isLoading: loansLoading, refetch: refetchLoans } = useLoanStatistics();
  const { data: activeLoans, isLoading: activeLoansLoading } = useActiveLoans();
  const { data: overdueInstallments } = useOverdueInstallments();
  const { data: masterAccounts } = useMasterAccounts();

  const isLoading = isLoadingCash || loansLoading;

  // Load master cash data
  const loadData = async () => {
    try {
      setIsLoadingCash(true);
      const masterCashData = await newCashBoxService.getMasterCash();
      setMasterCash(masterCashData);

      if (masterCashData) {
        const movementsData = await newCashBoxService.getCashMovements(
          'master',
          masterCashData.id,
          50
        );
        setMovements(movementsData);
      }
    } catch (error) {
      console.error('Error loading master cash:', error);
    } finally {
      setIsLoadingCash(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData();
    refetchLoans();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center">
                    <Home className="h-4 w-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Nivexa Studio</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Caja Maestra</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Caja Maestra
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Sistema de gestión financiera centralizado
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </button>
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              >
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Transferir
              </button>
              <button
                onClick={() => setIsCreateLoanModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Préstamo
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <MetricGrid
          metrics={
            [
              {
                title: 'Caja Maestra ARS',
                value: formatCurrency(masterCash?.balance_ars || 0),
                icon: Wallet,
                description: 'Balance en pesos argentinos',
                variant: 'default',
              },
              {
                title: 'Caja Maestra USD',
                value: `USD ${(masterCash?.balance_usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                icon: DollarSign,
                description: 'Balance en dólares',
                variant: 'default',
              },
              {
                title: 'Préstamos Activos',
                value: loanStats?.totalActive.toString() || '0',
                icon: TrendingUp,
                description: `${loanStats?.totalOverdue || 0} vencidos`,
                variant: (loanStats?.totalOverdue || 0) > 0 ? 'warning' : 'default',
              },
              {
                title: 'Saldo Pendiente',
                value: formatCurrency(loanStats?.totalOutstandingARS || 0),
                icon: AlertCircle,
                description: `USD ${(loanStats?.totalOutstandingUSD || 0).toLocaleString('en-US')}`,
                variant: 'default',
              },
            ] as StatCardProps[]
          }
          columns={4}
          gap="md"
          animated={!isLoading}
        />

        {/* Alertas de cuotas vencidas */}
        {overdueInstallments && overdueInstallments.length > 0 && (
          <SectionCard className="border-l-4 border-l-red-500 bg-red-50">
            <div className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <h3 className="text-sm font-semibold text-red-900">
                    Cuotas Vencidas
                  </h3>
                  <p className="text-sm text-red-700">
                    Hay {overdueInstallments.length} cuota(s) vencida(s) que requieren atención inmediata
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Préstamos Activos */}
        <SectionCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Préstamos Activos
              </h2>
              <span className="text-sm text-gray-500">
                {activeLoans?.length || 0} préstamo(s)
              </span>
            </div>

            {activeLoansLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Cargando préstamos...</p>
              </div>
            ) : activeLoans && activeLoans.length > 0 ? (
              <LoansDataTable loans={activeLoans} />
            ) : (
              <EmptyState
                variant="no-data"
                title="No hay préstamos activos"
                description="Comienza creando un nuevo préstamo inter-proyecto"
                actions={{
                  primary: {
                    label: 'Nuevo Préstamo',
                    icon: <Plus className="h-4 w-4" />,
                    onClick: () => setIsCreateLoanModalOpen(true),
                  },
                }}
              />
            )}
          </div>
        </SectionCard>

        {/* Cuentas Bancarias */}
        {masterAccounts && masterAccounts.length > 0 && (
          <SectionCard>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Cuentas Bancarias Master
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {masterAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {account.account_name}
                      </h3>
                      <span className="text-xs font-medium text-gray-500">
                        {account.currency}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Balance:</span>
                        <span className="font-semibold text-gray-900">
                          {account.currency === 'ARS'
                            ? formatCurrency(account.balance)
                            : `USD ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Disponible:</span>
                        <span className="font-semibold text-green-600">
                          {account.currency === 'ARS'
                            ? formatCurrency(account.available_balance)
                            : `USD ${account.available_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        )}

        {/* Trazabilidad de Movimientos */}
        <AuditTrailTable limit={50} showFilters={true} />
      </div>

      {/* Modales */}
      <CreateLoanModal
        isOpen={isCreateLoanModalOpen}
        onClose={() => setIsCreateLoanModalOpen(false)}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />
    </div>
  );
}
