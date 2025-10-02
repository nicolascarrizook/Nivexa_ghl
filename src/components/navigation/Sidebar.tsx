import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Briefcase,
  FileText,
  DollarSign,
  TrendingUp,
  Settings,
  BarChart3,
  Package,
  Calendar,
  Mail,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Building2,
  CreditCard,
  Receipt,
  PieChart,
  Wallet,
  UserCheck,
  FolderOpen,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useSidebarBadges } from '@/hooks/useSidebarBadges';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  badge?: number | string;
  children?: MenuItem[];
  onClick?: () => void;
}

interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggle
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const badges = useSidebarBadges();

  const menuSections: MenuSection[] = [
    {
      id: 'main',
      title: 'Principal',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <Home className="w-5 h-5" />,
          path: '/dashboard'
        },
        {
          id: 'projects',
          label: 'Proyectos',
          icon: <Briefcase className="w-5 h-5" />,
          path: '/projects',
          badge: badges.projects > 0 ? badges.projects.toString() : undefined
        },
        {
          id: 'clients',
          label: 'Clientes',
          icon: <Users className="w-5 h-5" />,
          path: '/clients'
        }
      ]
    },
    {
      id: 'finance',
      title: 'Finanzas',
      items: [
        {
          id: 'finance-overview',
          label: 'Centro Financiero',
          icon: <DollarSign className="w-5 h-5" />,
          path: '/finance'
        },
        {
          id: 'cash',
          label: 'Cajas',
          icon: <Wallet className="w-5 h-5" />,
          children: [
            {
              id: 'master-cash',
              label: 'Caja Maestra',
              icon: <Building2 className="w-4 h-4" />,
              path: '/finance/master-cash'
            },
            {
              id: 'admin-cash',
              label: 'Caja Admin',
              icon: <CreditCard className="w-4 h-4" />,
              path: '/finance/admin-cash'
            }
          ]
        },
        {
          id: 'invoices',
          label: 'Facturas',
          icon: <FileText className="w-5 h-5" />,
          path: '/invoices',
          badge: badges.invoices > 0 ? badges.invoices.toString() : undefined
        },
        {
          id: 'payments',
          label: 'Pagos',
          icon: <CreditCard className="w-5 h-5" />,
          path: '/payments'
        },
        {
          id: 'expenses',
          label: 'Gastos',
          icon: <Receipt className="w-5 h-5" />,
          path: '/expenses'
        }
      ]
    },
    {
      id: 'operations',
      title: 'Operaciones',
      items: [
        {
          id: 'tasks',
          label: 'Tareas',
          icon: <CheckCircle className="w-5 h-5" />,
          path: '/tasks',
          badge: badges.tasks > 0 ? badges.tasks.toString() : undefined
        },
        {
          id: 'calendar',
          label: 'Calendario',
          icon: <Calendar className="w-5 h-5" />,
          path: '/calendar'
        },
        {
          id: 'documents',
          label: 'Documentos',
          icon: <FolderOpen className="w-5 h-5" />,
          path: '/documents'
        },
        {
          id: 'reports',
          label: 'Reportes',
          icon: <BarChart3 className="w-5 h-5" />,
          path: '/reports'
        }
      ]
    },
    {
      id: 'management',
      title: 'Gestión',
      items: [
        {
          id: 'providers',
          label: 'Proveedores',
          icon: <Package className="w-5 h-5" />,
          path: '/providers'
        },
        {
          id: 'inventory',
          label: 'Inventario',
          icon: <Building2 className="w-5 h-5" />,
          path: '/inventory'
        },
        {
          id: 'notifications',
          label: 'Notificaciones',
          icon: <Bell className="w-5 h-5" />,
          path: '/notifications',
          badge: badges.notifications > 0 ? badges.notifications.toString() : undefined
        }
      ]
    }
  ];

  const bottomMenuItems: MenuItem[] = [
    {
      id: 'settings',
      label: 'Configuración',
      icon: <Settings className="w-5 h-5" />,
      path: '/settings'
    },
    {
      id: 'help',
      label: 'Ayuda',
      icon: <HelpCircle className="w-5 h-5" />,
      path: '/help'
    },
    {
      id: 'logout',
      label: 'Cerrar Sesión',
      icon: <LogOut className="w-5 h-5" />,
      onClick: () => {
        console.log('Logout clicked');
        // Aquí iría la lógica de logout
      }
    }
  ];

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
      setIsMobileOpen(false);
    } else if (item.children) {
      toggleExpanded(item.id);
    }
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (item.path) {
      return location.pathname === item.path;
    }
    if (item.children) {
      return item.children.some(child => child.path === location.pathname);
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const isActive = isItemActive(item);
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          className={`
            w-full flex items-center justify-between px-3 py-2 rounded-lg
            transition-all duration-200 group
            ${level > 0 ? 'pl-10' : ''}
            ${isActive 
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <span className={`${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="text-sm font-medium">{item.label}</span>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              {item.badge && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-full">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <ChevronRight 
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                />
              )}
            </div>
          )}
        </button>

        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-40
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-64'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Nivexa</span>
              </div>
            )}
            
            {onToggle && (
              <button
                onClick={onToggle}
                className="hidden lg:flex p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                )}
              </button>
            )}
          </div>

          {/* Main Menu */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {menuSections.map((section) => (
              <div key={section.id} className="mb-6">
                {!isCollapsed && (
                  <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.items.map(item => renderMenuItem(item))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Menu */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="space-y-1">
              {bottomMenuItems.map(item => renderMenuItem(item))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;