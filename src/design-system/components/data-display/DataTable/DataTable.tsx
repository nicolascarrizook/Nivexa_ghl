import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  Check,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

export interface Column<T = any> {
  /** Clave única de la columna */
  key: string;
  /** Título mostrado en el header */
  title: string;
  /** Función para renderizar el contenido de la celda */
  render?: (value: any, record: T, index: number) => React.ReactNode;
  /** Si la columna es ordenable */
  sortable?: boolean;
  /** Ancho de la columna */
  width?: string | number;
  /** Alineación del contenido */
  align?: 'left' | 'center' | 'right';
  /** Si la columna se puede filtrar */
  filterable?: boolean;
  /** Si la columna está fija */
  fixed?: 'left' | 'right';
  /** Función de ordenación personalizada */
  sorter?: (a: T, b: T) => number;
}

export interface DataTableProps<T = any> {
  /** Datos a mostrar en la tabla */
  data: T[];
  /** Definición de columnas */
  columns: Column<T>[];
  /** Clave única para cada fila */
  rowKey?: string | ((record: T) => string);
  /** Estado de carga */
  loading?: boolean;
  /** Mensaje cuando no hay datos */
  emptyText?: string;
  /** Si se pueden seleccionar filas */
  rowSelection?: {
    selectedRowKeys?: string[];
    onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
  };
  /** Configuración de paginación */
  pagination?: {
    current?: number;
    pageSize?: number;
    total?: number;
    onChange?: (page: number, pageSize: number) => void;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
    showTotal?: (total: number, range: [number, number]) => string;
  } | false;
  /** Acciones de fila */
  rowActions?: {
    items: Array<{
      key: string;
      label: string;
      icon?: React.ReactNode;
      onClick: (record: T) => void;
      disabled?: (record: T) => boolean;
      danger?: boolean;
    }>;
  };
  /** Callback cuando se hace clic en una fila */
  onRowClick?: (record: T, index: number) => void;
  /** Filtros globales */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Exportación de datos */
  exportable?: boolean;
  onExport?: (data: T[]) => void;
  /** Tamaño de la tabla */
  size?: 'sm' | 'md' | 'lg';
  /** Bandas zebra */
  striped?: boolean;
  /** Bordes */
  bordered?: boolean;
  className?: string;
}

function DataTable<T = any>({
  data,
  columns,
  rowKey = 'id',
  loading = false,
  emptyText = 'No hay datos disponibles',
  rowSelection,
  pagination,
  rowActions,
  onRowClick,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  exportable = false,
  onExport,
  size = 'md',
  striped = false,
  bordered = true,
  className = '',
}: DataTableProps<T>) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(
    pagination && typeof pagination === 'object' ? pagination.current || 1 : 1
  );
  const [pageSize, setPageSize] = useState(
    pagination && typeof pagination === 'object' ? pagination.pageSize || 10 : 10
  );

  const getRowKey = useCallback((record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey as keyof T] as string || index.toString();
  }, [rowKey]);

  // Filtrado de datos
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter((record) => {
      return columns.some((column) => {
        const value = record[column.key as keyof T];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm, columns]);

  // Ordenación de datos
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    const column = columns.find(col => col.key === sortField);
    
    return [...filteredData].sort((a, b) => {
      if (column?.sorter) {
        const result = column.sorter(a, b);
        return sortDirection === 'desc' ? -result : result;
      }

      const aVal = a[sortField as keyof T];
      const bVal = b[sortField as keyof T];

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortField, sortDirection, columns]);

  // Paginación
  const paginatedData = useMemo(() => {
    if (pagination === false) return sortedData;
    
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, pageSize, pagination]);

  const handleSort = (columnKey: string) => {
    if (sortField === columnKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(columnKey);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(sortedData);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  const getCellPadding = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2';
      case 'lg':
        return 'px-6 py-4';
      default:
        return 'px-4 py-3';
    }
  };

  const renderCell = (column: Column<T>, record: T, index: number) => {
    const value = record[column.key as keyof T];
    
    if (column.render) {
      return column.render(value, record, index);
    }
    
    return value?.toString() || '-';
  };

  const renderRowActions = (record: T) => {
    if (!rowActions) return null;

    return (
      <div className="flex items-center gap-1">
        {rowActions.items.map((action) => {
          const isDisabled = action.disabled?.(record) || false;
          
          return (
            <button
              key={action.key}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDisabled) {
                  action.onClick(record);
                }
              }}
              disabled={isDisabled}
              className={`
                p-1 rounded-md transition-colors
                ${isDisabled 
                  ? 'text-neutral-400 cursor-not-allowed' 
                  : action.danger
                    ? 'text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }
              `}
              title={action.label}
            >
              {action.icon}
            </button>
          );
        })}
      </div>
    );
  };

  const renderPagination = () => {
    if (pagination === false) return null;

    const total = (pagination && typeof pagination === 'object' ? pagination.total : undefined) || sortedData.length;
    const totalPages = Math.ceil(total / pageSize);
    
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-700">
        <div className="text-sm text-neutral-500 dark:text-neutral-400">
          Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} de {total} resultados
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Anterior
          </button>
          <span className="text-sm text-neutral-600 dark:text-neutral-300">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            Siguiente
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden ${className}`}>
      {/* Header con controles */}
      {(searchable || exportable) && (
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {exportable && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className={`w-full ${getSizeClasses()}`}>
          <thead className="bg-neutral-50 dark:bg-neutral-800">
            <tr>
              {rowSelection && (
                <th className={`${getCellPadding()} w-12`}>
                  <input
                    type="checkbox"
                    className="rounded border-neutral-300 dark:border-neutral-600"
                    onChange={(e) => {
                      const allKeys = paginatedData.map((record, index) => getRowKey(record, index));
                      if (e.target.checked) {
                        rowSelection.onChange?.(allKeys, paginatedData);
                      } else {
                        rowSelection.onChange?.([], []);
                      }
                    }}
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    ${getCellPadding()} text-left font-medium text-neutral-900 dark:text-neutral-100
                    ${column.sortable ? 'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700' : ''}
                    ${column.align === 'center' ? 'text-center' : ''}
                    ${column.align === 'right' ? 'text-right' : ''}
                  `}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sortField === column.key ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <ArrowUpDown className="w-4 h-4 text-neutral-400" />
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
              
              {rowActions && (
                <th className={`${getCellPadding()} w-24 text-right`}>
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          
          <tbody>
            <AnimatePresence>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (rowSelection ? 1 : 0) + (rowActions ? 1 : 0)} className="p-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      <span className="ml-2 text-neutral-500 dark:text-neutral-400">Cargando...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (rowSelection ? 1 : 0) + (rowActions ? 1 : 0)} className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                    {emptyText}
                  </td>
                </tr>
              ) : (
                paginatedData.map((record, index) => {
                  const key = getRowKey(record, index);
                  const isSelected = rowSelection?.selectedRowKeys?.includes(key);
                  
                  return (
                    <motion.tr
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`
                        transition-colors border-b border-neutral-100 dark:border-neutral-800
                        ${onRowClick ? 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800' : ''}
                        ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                        ${striped && index % 2 === 1 ? 'bg-neutral-25 dark:bg-neutral-875' : ''}
                      `}
                      onClick={() => onRowClick?.(record, index)}
                    >
                      {rowSelection && (
                        <td className={getCellPadding()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const currentSelected = rowSelection.selectedRowKeys || [];
                              if (e.target.checked) {
                                const newSelected = [...currentSelected, key];
                                const newSelectedRecords = [...(rowSelection.selectedRowKeys?.map(k => 
                                  paginatedData.find((r, i) => getRowKey(r, i) === k)
                                ).filter(Boolean) || []), record];
                                rowSelection.onChange?.(newSelected, newSelectedRecords as T[]);
                              } else {
                                const newSelected = currentSelected.filter(k => k !== key);
                                const newSelectedRecords = newSelected.map(k => 
                                  paginatedData.find((r, i) => getRowKey(r, i) === k)
                                ).filter(Boolean);
                                rowSelection.onChange?.(newSelected, newSelectedRecords as T[]);
                              }
                            }}
                            className="rounded border-neutral-300 dark:border-neutral-600"
                            {...(rowSelection.getCheckboxProps?.(record) || {})}
                          />
                        </td>
                      )}
                      
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`
                            ${getCellPadding()} text-neutral-900 dark:text-neutral-100
                            ${column.align === 'center' ? 'text-center' : ''}
                            ${column.align === 'right' ? 'text-right' : ''}
                          `}
                        >
                          {renderCell(column, record, index)}
                        </td>
                      ))}
                      
                      {rowActions && (
                        <td className={`${getCellPadding()} text-right`}>
                          {renderRowActions(record)}
                        </td>
                      )}
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {renderPagination()}
    </div>
  );
}

export default DataTable;