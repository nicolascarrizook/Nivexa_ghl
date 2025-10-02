/**
 * Layout Component Types for Nivexa CRM
 *
 * Common types and interfaces used across layout components
 */

import { ReactNode } from "react";

/**
 * Base layout component props
 */
export interface BaseLayoutProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

/**
 * Navigation item structure
 */
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  isActive?: boolean;
  badge?: string | number;
  children?: NavigationItem[];
  disabled?: boolean;
}

/**
 * Navigation section structure
 */
export interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

/**
 * User menu item structure
 */
export interface UserMenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
}

/**
 * Notification structure
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

/**
 * Breadcrumb item structure
 */
export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  isActive?: boolean;
}

/**
 * Page action structure
 */
export interface PageAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Tab structure
 */
export interface TabItem {
  id: string;
  label: string;
  content?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
  href?: string;
}

/**
 * Quick action structure
 */
export interface QuickAction {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  shortcut?: string;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Loading state types
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Responsive breakpoint values
 */
export const breakpoints = {
  mobile: "(max-width: 640px)",
  tablet: "(max-width: 768px)",
  desktop: "(min-width: 769px)",
} as const;

/**
 * Layout size variants
 */
export type LayoutSize = "compact" | "normal" | "comfortable";

/**
 * Layout density settings
 */
export type LayoutDensity = "dense" | "normal" | "spacious";

/**
 * Layout theme modes
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * Animation duration presets
 */
export const animationDurations = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

/**
 * Z-index layers for layout components
 */
export const zIndexLayers = {
  backdrop: 50,
  modal: 60,
  drawer: 55,
  tooltip: 70,
  toast: 80,
  quickActions: 45,
} as const;

/**
 * Component-specific prop types
 */
export interface DashboardLayoutProps extends BaseLayoutProps {
  navigation?: NavigationSection[];
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  userMenuItems?: UserMenuItem[];
  notifications?: Notification[];
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
  showNotifications?: boolean;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  logo?: ReactNode;
  footer?: ReactNode;
  theme?: ThemeMode;
}

export interface PageContainerProps extends BaseLayoutProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: PageAction[];
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  loading?: boolean;
  error?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export interface SectionCardProps extends BaseLayoutProps {
  title?: string;
  subtitle?: string;
  actions?: PageAction[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
  loading?: boolean;
  error?: string;
  footer?: ReactNode;
  variant?: "flat" | "raised" | "outlined";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export interface DetailPanelProps extends BaseLayoutProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  actions?: PageAction[];
  position?: "left" | "right";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  overlay?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  loading?: boolean;
  error?: string;
  footer?: ReactNode;
}

export interface QuickActionsProps extends BaseLayoutProps {
  actions?: QuickAction[];
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  expanded?: boolean;
  onToggle?: () => void;
  showShortcuts?: boolean;
  maxVisible?: number;
  variant?: "floating" | "inline";
}
