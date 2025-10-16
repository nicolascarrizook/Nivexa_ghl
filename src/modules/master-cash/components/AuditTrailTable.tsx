import { useState, useEffect } from 'react';
import { Calendar, ArrowRight, Filter, Download, Search } from 'lucide-react';
import DataTable, { type Column } from '@/design-system/components/data-display/DataTable/DataTable';
import { Badge } from '@/design-system/components/data-display/Badge/Badge';
import { SectionCard } from '@/design-system/components/layout';
import { supabase } from '@/config/supabase';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface AuditMovement {
  id: string;
  movement_type: string;
  source_type: string | null;
  source_id: string | null;
  destination_type: string | null;
  destination_id: string | null;
  amount: number;
  description: string;
  project_id?: string;
  metadata?: any;
  created_at: string;
  created_by?: string;
  // Balance snapshots
  balance_before_ars?: number;
  balance_after_ars?: number;
  balance_before_usd?: number;
  balance_after_usd?: number;
  // Información expandida
  source_name?: string;
  destination_name?: string;
  project_name?: string;
  currency?: string;
}

interface AuditTrailTableProps {
  limit?: number;
  projectId?: string;
  showFilters?: boolean;
}

const movementTypeLabels: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  project_payment: { label: 'Pago de Cliente', variant: 'success' },
  project_income: { label: 'Ingreso de Proyecto', variant: 'success' },
  project_expense: { label: 'Gasto de Proyecto', variant: 'warning' },
  salary_payment: { label: 'Pago de Salario', variant: 'info' },
  operational_expense: { label: 'Gasto Operativo', variant: 'warning' },
  tax_payment: { label: 'Pago de Impuestos', variant: 'danger' },
  investment: { label: 'Inversión', variant: 'info' },
  transfer: { label: 'Transferencia', variant: 'default' },
  fee_collection: { label: 'Cobro de Honorarios', variant: 'success' },
  fee_payment: { label: 'Pago de Honorarios', variant: 'warning' },
  project_funding: { label: 'Financiamiento', variant: 'success' },
  loan_disbursement: { label: 'Desembolso de Préstamo', variant: 'info' },
  loan_payment: { label: 'Pago de Préstamo', variant: 'success' },
  currency_exchange: { label: 'Cambio de Moneda', variant: 'info' },
  master_duplication: { label: 'Control Financiero', variant: 'info' },
  adjustment: { label: 'Ajuste', variant: 'default' },
  other: { label: 'Otro', variant: 'default' },
};

const sourceTypeLabels: Record<string, string> = {
  master: 'Caja Maestra',
  admin: 'Caja Admin',
  project: 'Proyecto',
  external: 'Externo',
  client: 'Cliente',
};

export function AuditTrailTable({ limit, projectId, showFilters = true }: AuditTrailTableProps) {
  const [movements, setMovements] = useState<AuditMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: '',
    to: '',
  });

  useEffect(() => {
    loadMovements();
  }, [projectId, limit]);

  const loadMovements = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('cash_movements')
        .select(`
          *,
          project:project_id (
            id,
            name,
            code
          )
        `)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Obtener todos los IDs únicos de proyectos mencionados en movimientos
      // IMPORTANTE: source_id y destination_id cuando type='project' son IDs de CAJAS, no de proyectos
      // Solo usamos project_id que es el ID real del proyecto
      const projectIds = new Set<string>();
      (data || []).forEach((movement) => {
        if (movement.project_id) {
          projectIds.add(movement.project_id);
        }
      });

      // Cargar todos los proyectos de una sola vez (INCLUYENDO ELIMINADOS para historial)
      const projectsMap = new Map<string, string>();
      if (projectIds.size > 0) {
        const { data: projects } = await supabase
          .from('projects')
          .select('id, name, deleted_at')
          .in('id', Array.from(projectIds));

        projects?.forEach((project) => {
          // Si está eliminado, agregar indicador
          const displayName = project.deleted_at
            ? `${project.name} (Eliminado)`
            : project.name;
          projectsMap.set(project.id, displayName);
        });
      }

      // Enriquecer datos con nombres
      const enrichedMovements = (data || []).map((movement) => {
        const enriched: AuditMovement = {
          ...movement,
          project_name: movement.project?.name,
          currency: movement.metadata?.currency || 'ARS',
          source_name: undefined,
          destination_name: undefined,
        };

        // Obtener nombre de origen
        // Si es un proyecto, usar project_id (source_id es el ID de la caja, no del proyecto)
        if (movement.source_type === 'project' && movement.project_id) {
          const projectName = projectsMap.get(movement.project_id);
          if (projectName) {
            enriched.source_name = projectName;
          } else {
            // Proyecto no existe en BD (hard-deleted antes de soft delete)
            const shortId = movement.project_id.substring(0, 8);
            enriched.source_name = `Proyecto No Encontrado (${shortId})`;
          }
        } else if (movement.source_type) {
          enriched.source_name = sourceTypeLabels[movement.source_type] || movement.source_type;
        }

        // Obtener nombre de destino
        // Si es un proyecto, usar project_id (destination_id es el ID de la caja, no del proyecto)
        if (movement.destination_type === 'project' && movement.project_id) {
          const projectName = projectsMap.get(movement.project_id);
          if (projectName) {
            enriched.destination_name = projectName;
          } else {
            // Proyecto no existe en BD (hard-deleted antes de soft delete)
            const shortId = movement.project_id.substring(0, 8);
            enriched.destination_name = `Proyecto No Encontrado (${shortId})`;
          }
        } else if (movement.destination_type) {
          enriched.destination_name = sourceTypeLabels[movement.destination_type] || movement.destination_type;
        }

        return enriched;
      });

      setMovements(enrichedMovements);
    } catch (error) {
      console.error('Error loading audit trail:', error);
      setMovements([]); // Evitar errores en el render
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';

      return new Intl.DateTimeFormat('es-AR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return '-';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return `USD ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return formatCurrency(amount);
  };

  const getMovementTypeInfo = (type: string) => {
    return movementTypeLabels[type] || { label: type, variant: 'default' as const };
  };

  // Filtrar movimientos
  const filteredMovements = movements.filter((movement) => {
    const matchesSearch =
      !searchTerm ||
      movement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.source_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.destination_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || movement.movement_type === filterType;

    const matchesDateRange =
      (!dateRange.from || movement.created_at >= dateRange.from) &&
      (!dateRange.to || movement.created_at <= dateRange.to);

    return matchesSearch && matchesType && matchesDateRange;
  });

  const columns: Column<AuditMovement>[] = [
    {
      key: 'created_at',
      title: 'Fecha',
      render: (value, movement) => {
        if (!movement) return <span>-</span>;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <div className="text-sm font-medium text-gray-900">{formatDate(movement.created_at)}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'movement_type',
      title: 'Tipo',
      render: (value, movement) => {
        if (!movement) return <span>-</span>;
        const typeInfo = getMovementTypeInfo(movement.movement_type);
        return (
          <Badge variant={typeInfo.variant} className="text-xs px-2 py-0.5">
            {typeInfo.label}
          </Badge>
        );
      },
    },
    {
      key: 'flow',
      title: 'Flujo',
      render: (value, movement) => {
        if (!movement) return <span>-</span>;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">De:</span>
              <p className="text-xs font-medium text-gray-900 truncate">
                {movement.source_name || 'N/A'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">→</span>
              <p className="text-xs font-medium text-gray-900 truncate">
                {movement.destination_name || 'N/A'}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'description',
      title: 'Descripción',
      render: (value, movement) => {
        if (!movement) return <span>-</span>;
        return (
          <div>
            <p className="text-sm text-gray-900">{movement.description || '-'}</p>
            {movement.project_name && (
              <p className="text-xs text-gray-500 mt-1">Proyecto: {movement.project_name}</p>
            )}
          </div>
        );
      },
    },
    {
      key: 'balance_before',
      title: 'Saldo Anterior',
      render: (value, movement) => {
        if (!movement) return <span>-</span>;
        const currency = movement.currency || 'ARS';
        const balanceBefore = currency === 'ARS'
          ? movement.balance_before_ars
          : movement.balance_before_usd;

        // Para movimientos históricos sin snapshot, mostrar $0
        const displayBalance = balanceBefore ?? 0;

        return (
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {formatAmount(displayBalance, currency)}
            </p>
          </div>
        );
      },
    },
    {
      key: 'amount',
      title: 'Monto',
      render: (value, movement) => {
        if (!movement) return <span>-</span>;
        return (
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {formatAmount(movement.amount, movement.currency || 'ARS')}
            </p>
            {movement.metadata?.exchange_rate && (
              <p className="text-xs text-gray-500">
                TC: {movement.metadata.exchange_rate}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'balance_after',
      title: 'Saldo Nuevo',
      render: (value, movement) => {
        if (!movement) return <span>-</span>;
        const currency = movement.currency || 'ARS';
        const balanceAfter = currency === 'ARS'
          ? movement.balance_after_ars
          : movement.balance_after_usd;

        // Para movimientos históricos sin snapshot, mostrar $0
        const displayBalance = balanceAfter ?? 0;

        return (
          <div className="text-right">
            <p className="text-sm font-bold text-green-600">
              {formatAmount(displayBalance, currency)}
            </p>
          </div>
        );
      },
    },
  ];

  const handleExport = () => {
    // Exportar a CSV
    const headers = ['Fecha', 'Tipo', 'Origen', 'Destino', 'Descripción', 'Monto', 'Moneda'];
    const rows = filteredMovements.map((m) => [
      formatDate(m.created_at),
      getMovementTypeInfo(m.movement_type).label,
      m.source_name || 'N/A',
      m.destination_name || 'N/A',
      m.description,
      m.amount,
      m.currency || 'ARS',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <SectionCard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Trazabilidad de Movimientos</h2>
            <p className="text-sm text-gray-500 mt-1">
              Historial completo de transacciones y flujos de dinero
            </p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </button>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar movimientos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>

              {/* Filtro por tipo */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <option value="all">Todos los tipos</option>
                  {Object.entries(movementTypeLabels).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha desde */}
              <div>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Resumen de filtros */}
            {(searchTerm || filterType !== 'all' || dateRange.from || dateRange.to) && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Mostrando {filteredMovements.length} de {movements.length} movimientos</span>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setDateRange({ from: '', to: '' });
                  }}
                  className="text-gray-500 hover:text-gray-700 underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tabla */}
        <DataTable
          data={filteredMovements}
          columns={columns}
          loading={loading}
          emptyText="No hay movimientos registrados"
        />
      </div>
    </SectionCard>
  );
}
