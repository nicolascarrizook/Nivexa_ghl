# Nivexa CRM - Professional Input Components

Professional input components designed specifically for the Mexican CRM market with Spanish localization, currency support, and business-specific features.

## 🎯 Components Overview

### 1. **SearchCommand** - Global Search with Command Palette
Advanced search component with Cmd+K keyboard shortcut for quick CRM navigation.

**Features:**
- Global search across clients, projects, and invoices
- Keyboard shortcuts (Cmd+K / Ctrl+K)
- Categorized results with icons
- Recent searches and AI-powered suggestions
- Responsive design with dark mode support

**Usage:**
```tsx
import { SearchCommand } from '@/design-system/components/inputs'

<SearchCommand
  items={searchItems}
  onSelect={(item) => navigate(item)}
  placeholder="Buscar clientes, proyectos, facturas..."
  recentSearches={recentItems}
  aiSuggestions={aiSuggestions}
/>
```

### 2. **FilterBar** - Advanced Filtering System
Comprehensive filtering solution with multiple filter types and preset management.

**Features:**
- Multiple filter types: text, select, date, number range
- Save and load filter presets
- Active filter pills with easy removal
- Clear all functionality
- Grouped filter organization

**Usage:**
```tsx
import { FilterBar } from '@/design-system/components/inputs'

<FilterBar
  filters={filterConfig}
  activeFilters={activeFilters}
  onFiltersChange={setActiveFilters}
  presets={savedPresets}
  onLoadPreset={loadPreset}
/>
```

### 3. **DateRangePicker** - Mexican Business Date Ranges
Specialized date range selector with Mexican fiscal year support and common business presets.

**Features:**
- Common presets: Hoy, Ayer, Esta semana, Este mes
- Mexican fiscal year quarters (April - March)
- Custom date range selection
- Mobile-friendly interface
- Localized to Spanish (es-MX)

**Usage:**
```tsx
import { DateRangePicker } from '@/design-system/components/inputs'

<DateRangePicker
  value={dateRange}
  onChange={setDateRange}
  showPresets={true}
  showFiscalQuarters={true}
  placeholder="Seleccionar período de reporte"
/>
```

### 4. **MoneyInput** - Mexican Peso Currency Input
Specialized currency input with automatic formatting for Mexican Peso (MXN) and other currencies.

**Features:**
- Mexican Peso (MXN) formatting with proper localization
- Support for USD and EUR currencies
- Automatic number formatting and validation
- Percentage mode for commission rates
- Min/max value constraints
- Decimal precision control

**Usage:**
```tsx
import { MoneyInput } from '@/design-system/components/inputs'

<MoneyInput
  value={amount}
  onChange={setAmount}
  currency="MXN"
  placeholder="Monto del proyecto"
  min={100000}
  max={50000000}
  showCurrencySymbol={true}
/>
```

### 5. **PhoneInput** - International Phone with WhatsApp Detection
International phone number input optimized for Mexican market with WhatsApp availability detection.

**Features:**
- Mexico (+52) as default country
- Support for Latin American countries
- Automatic format validation per country
- WhatsApp availability indicator
- International format with country flags
- Mobile number validation

**Usage:**
```tsx
import { PhoneInput } from '@/design-system/components/inputs'

<PhoneInput
  value={phoneNumber}
  onChange={(full, formatted, country) => setPhone({ full, formatted, country })}
  defaultCountry="MX"
  showWhatsAppIcon={true}
  placeholder="Número de contacto"
/>
```

## 🎨 Design System Integration

All components follow the Nivexa design system principles:

- **Consistent Typography**: Using the established font scales and weights
- **Color Palette**: Primary purple theme with semantic color usage
- **Dark Mode**: Full support for light/dark theme switching
- **Accessibility**: WCAG 2.1 AA compliance with proper ARIA labels
- **Responsive**: Mobile-first design with breakpoint considerations
- **Spanish Localization**: All text, formats, and cultural adaptations for Mexico

## 🛠 Technical Features

### Form Integration
All components are compatible with popular form libraries:

```tsx
// React Hook Form integration
import { useForm, Controller } from 'react-hook-form'

const { control } = useForm()

<Controller
  name="budget"
  control={control}
  render={({ field, fieldState }) => (
    <MoneyInput
      {...field}
      error={fieldState.error?.message}
      currency="MXN"
    />
  )}
/>
```

### Validation States
All inputs support validation feedback:

```tsx
<MoneyInput
  value={amount}
  onChange={setAmount}
  error="El monto debe ser mayor a $100,000 MXN"
  // or
  success="Monto válido y dentro del presupuesto"
  loading={isValidating}
/>
```

### Dark Mode Support
Components automatically adapt to the theme:

```tsx
// Automatic dark mode support through CSS custom properties
<div data-theme="dark">
  <SearchCommand /> {/* Automatically uses dark theme */}
</div>
```

## 📱 Mobile Optimization

All components are optimized for mobile devices:

- **Touch-friendly**: Larger touch targets (minimum 44px)
- **Responsive layouts**: Adapt to different screen sizes
- **Mobile interactions**: Support for swipe, pinch, and touch gestures
- **Virtual keyboard**: Proper input types for mobile keyboards

## 🚀 Performance Features

- **Lazy loading**: Components load only when needed
- **Debounced inputs**: Search and filter inputs use debouncing
- **Memoization**: Heavy calculations are memoized
- **Virtual scrolling**: Large lists use virtual scrolling
- **Bundle optimization**: Tree-shakeable exports

## 📊 Business Logic Integration

### CRM-Specific Features

**SearchCommand** integrates with:
- Client management system
- Project tracking
- Invoice management
- Document search

**FilterBar** supports:
- Advanced client filtering
- Project status filtering
- Financial range filtering
- Date-based filtering

**MoneyInput** handles:
- Project budgets in MXN
- Invoice amounts
- Commission calculations
- Cost estimates

**PhoneInput** manages:
- Client contact information
- WhatsApp business integration
- International client support
- Contact validation

## 🔧 Development

### Storybook Documentation
All components include comprehensive Storybook stories:

```bash
npm run storybook
```

Navigate to the "Design System/Inputs" section to see all components with interactive examples.

### Testing
Components include unit tests and accessibility testing:

```bash
npm run test
npm run test:coverage
```

## 📦 Bundle Information

Each component is optimized for production:

- **SearchCommand**: ~8KB gzipped (includes cmdk dependency)
- **FilterBar**: ~6KB gzipped
- **DateRangePicker**: ~5KB gzipped (includes date-fns)
- **MoneyInput**: ~3KB gzipped
- **PhoneInput**: ~4KB gzipped

Total bundle impact: ~26KB gzipped for all input components.

## 🌟 Best Practices

### Accessibility
- Use proper ARIA labels and descriptions
- Ensure keyboard navigation works
- Provide clear error messages
- Support screen readers

### Performance
- Use debouncing for search inputs
- Implement proper loading states
- Cache heavy computations
- Optimize re-renders

### UX Guidelines
- Provide immediate feedback
- Use consistent interaction patterns
- Show clear validation states
- Support undo/redo operations

## 🔮 Future Enhancements

Planned improvements:
- Voice input support
- AI-powered autocomplete
- Advanced date parsing
- Currency conversion integration
- Multi-language support expansion
- Enhanced mobile gestures

---

Built with ❤️ for the Mexican CRM market by the Nivexa team.