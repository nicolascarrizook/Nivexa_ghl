/**
 * Nivexa CRM Design System - Input Components
 *
 * Professional input components designed for the Mexican CRM market
 * with Spanish localization, currency support, and business-specific features.
 */

// Search and Command Components
export {
  SearchCommand,
  type SearchCommandItem,
  type SearchCommandProps,
} from "./SearchCommand";

// Filter Components
export {
  FilterBar,
  type ActiveFilter,
  type FilterBarProps,
  type FilterConfig,
  type FilterOption,
  type FilterPreset,
} from "./FilterBar";

// Date Components
export {
  DateRangePicker,
  type DateRange,
  type DateRangePickerProps,
  type DateRangePreset,
} from "./DateRangePicker";

// Money and Currency Components
export { MoneyInput, type MoneyInputProps } from "./MoneyInput";

// Phone and Communication Components
export {
  PhoneInput,
  type CountryOption,
  type PhoneInputProps,
} from "./PhoneInput";

// Button Components
export { Button, type ButtonProps } from "./Button";

// Basic Input Components
export { default as Input } from "./Input/Input";
export type { InputProps } from "./Input/Input";

// Import components for use in component groups
import { SearchCommand } from "./SearchCommand";
import { FilterBar } from "./FilterBar";
import { DateRangePicker } from "./DateRangePicker";
import { MoneyInput } from "./MoneyInput";
import { PhoneInput } from "./PhoneInput";
import { Button } from "./Button";

// Common types used across input components
export interface ValidationState {
  error?: string;
  success?: string;
  loading?: boolean;
}

export interface BaseInputProps {
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

// Input component groups for organization
export const searchComponents = {
  SearchCommand,
};

export const filterComponents = {
  FilterBar,
};

export const dateComponents = {
  DateRangePicker,
};

export const moneyComponents = {
  MoneyInput,
};

export const phoneComponents = {
  PhoneInput,
};

export const buttonComponents = {
  Button,
};

import InputComponent from "./Input/Input";

export const basicInputComponents = {
  Input: InputComponent,
};

// All input components
export const inputComponents = {
  ...searchComponents,
  ...filterComponents,
  ...dateComponents,
  ...moneyComponents,
  ...phoneComponents,
  ...buttonComponents,
  ...basicInputComponents,
};

// Component metadata for documentation
export const inputComponentsMeta = {
  SearchCommand: {
    category: "Search & Navigation",
    description:
      "Global search with command palette (Cmd+K) for CRM navigation",
    features: [
      "Keyboard shortcuts",
      "Categories",
      "Recent searches",
      "AI suggestions",
    ],
    useCases: ["Global search", "Quick navigation", "Data discovery"],
  },
  FilterBar: {
    category: "Data Filtering",
    description: "Advanced filtering system with multiple types and presets",
    features: [
      "Multiple filter types",
      "Save presets",
      "Clear all",
      "Active filter pills",
    ],
    useCases: ["List filtering", "Report parameters", "Data analysis"],
  },
  DateRangePicker: {
    category: "Date & Time",
    description: "Date range selector with Mexican fiscal year support",
    features: [
      "Common presets",
      "Fiscal quarters",
      "Custom ranges",
      "Mobile friendly",
    ],
    useCases: ["Report periods", "Date filtering", "Time-based analysis"],
  },
  MoneyInput: {
    category: "Financial",
    description: "Currency input with Mexican Peso formatting",
    features: [
      "Multi-currency",
      "Auto-formatting",
      "Validation",
      "Percentage mode",
    ],
    useCases: ["Project budgets", "Invoice amounts", "Financial data"],
  },
  PhoneInput: {
    category: "Communication",
    description: "International phone input with WhatsApp detection",
    features: [
      "Country codes",
      "Format validation",
      "WhatsApp indicator",
      "Mexico default",
    ],
    useCases: ["Contact information", "Customer data", "Communication"],
  },
  Button: {
    category: "Actions",
    description:
      "Professional button component with multiple variants and states",
    features: [
      "5 variants",
      "Multiple sizes",
      "Loading states",
      "Icon support",
      "Full accessibility",
    ],
    useCases: [
      "Form actions",
      "Navigation",
      "Data operations",
      "User interactions",
    ],
  },
  Input: {
    category: "Basic Input",
    description:
      "Versatile input component for forms with validation and Mexican formatting",
    features: [
      "Multiple types",
      "Icon support",
      "Validation states",
      "Mexican formats",
      "Accessibility",
    ],
    useCases: [
      "Form fields",
      "User data entry",
      "Search inputs",
      "Contact information",
    ],
  },
} as const;

export default inputComponents;
