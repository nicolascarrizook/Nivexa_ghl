# CheckboxGroup Component - Design System Documentation

## Overview

The refined CheckboxGroup component is a production-ready, fully accessible checkbox group implementation that follows the Nivexa CRM design system principles. It provides a comprehensive solution for multi-selection interfaces with advanced features like validation, search, incompatibility handling, and multiple layout options.

## Design Principles

### 1. **Visual Consistency**
- Uses established design tokens from the Nivexa color palette
- Consistent with existing UI components (Button, Card, Alert patterns)
- Follows the 4px spacing grid system
- Implements proper radius tokens (sm: 2px, base: 4px, md: 6px, lg: 8px)

### 2. **Interaction States**
- **Default**: Clean, minimal appearance with subtle hover effects
- **Hover**: 200ms transition to gray-50 background
- **Focus**: Visible focus ring with 2px blue-500 border and proper offset
- **Checked**: Blue-50 background with blue-200 border, blue-600 accent
- **Disabled**: 60% opacity with cursor-not-allowed and muted colors
- **Error**: Red-50 background with red-200 border for validation issues

### 3. **Micro-interactions**
- Smooth 200ms transitions for all state changes
- Subtle hover lift effect on elevated variant items
- Check animation using Radix Checkbox primitive
- Smooth search filtering with no layout jumps
- Progressive enhancement for visual feedback

### 4. **Dark Mode Support**
- Uses CSS custom properties for seamless theme switching
- Color values automatically adapt based on `:root.dark` context
- Maintains contrast ratios and visual hierarchy in both themes
- Consistent behavior across light and dark appearances

## Component Architecture

### Variants System (CVA)

```typescript
// Main container variants
checkboxGroupVariants = {
  variant: {
    default: "",           // Clean, minimal container
    card: "...",          // Elevated card with padding and shadow
    outline: "...",       // Outlined container with border
  },
  size: {
    sm: "space-y-2",      // Compact spacing
    md: "space-y-3",      // Standard spacing
    lg: "space-y-4",      // Generous spacing
  }
}

// Individual item variants
checkboxGroupItemVariants = {
  variant: {
    default: "hover:bg-gray-50",                    // Standard hover
    elevated: "border ... hover:shadow-sm",        // Card-like items
    minimal: "p-0 hover:bg-transparent",          // Clean minimal style
  },
  state: {
    default: "",
    checked: "bg-blue-50 border-blue-200",        // Selected appearance
    disabled: "opacity-60 cursor-not-allowed",     // Disabled state
    error: "border-red-200 bg-red-50",            // Validation error
  }
}
```

### Layout Options

1. **Vertical** (default): Standard stacked layout
2. **Horizontal**: Flex wrap layout for compact displays
3. **Grid**: Responsive grid with configurable columns (2, 3, 4)
   - 1 column on mobile
   - 2 columns on tablet
   - Full columns on desktop

## Advanced Features

### 1. **Validation System**
- **Min/Max Selection**: Enforce selection limits with real-time feedback
- **Required Options**: Options that cannot be deselected
- **Validation Callbacks**: Real-time validation state notifications
- **Error Display**: Contextual error messages with icons

### 2. **Option Incompatibilities**
- Automatic deselection of incompatible options
- Visual warnings for conflicting selections
- Smart validation that respects business rules

### 3. **Search & Filtering**
- Real-time search across option labels and descriptions
- Debounced filtering for performance
- Empty state handling for no results

### 4. **Selection Management**
- Select All: Respects max limits and disabled states
- Clear All: Maintains required selections
- Smart counter with limit display
- Visual selection indicators

## Accessibility Features

### ARIA Compliance
```html
<div role="group" 
     aria-label="Project Features"
     aria-required="true"
     aria-invalid="false"
     aria-describedby="error-id">
```

### Keyboard Navigation
- Tab navigation through all interactive elements
- Space/Enter to toggle selections
- Focus management for search input
- Proper focus indicators with ring styling

### Screen Reader Support
- Descriptive labels for all options
- Required field indicators
- Validation message associations
- Option descriptions linked via `aria-describedby`

## Performance Optimizations

### 1. **React Optimization**
- `useMemo` for expensive computations (validation, filtering)
- `useCallback` for event handlers to prevent re-renders
- Efficient Set-based selection management
- Minimal re-renders through stable references

### 2. **CSS Performance**
- Hardware-accelerated transitions
- Efficient selector usage
- Minimal style recalculations
- Optimized grid layouts

## Usage Examples

### Basic Implementation
```tsx
<CheckboxGroup
  label="Project Features"
  options={features}
  value={selected}
  onChange={setSelected}
  minSelection={2}
  maxSelection={5}
  showCounter
/>
```

### Advanced Configuration
```tsx
<CheckboxGroup
  variant="card"
  size="lg"
  itemVariant="elevated"
  orientation="grid"
  columns={3}
  searchable
  showSelectAll
  showClearAll
  minSelection={1}
  maxSelection={10}
  onValidationChange={setIsValid}
  error={validationError}
  helperText="Select features for your project"
/>
```

## Design Token Usage

### Colors
- **Primary**: `blue-600` for selected states and focus
- **Background**: `gray-50` for hover, `blue-50` for selected
- **Border**: `gray-200` default, `blue-200` selected, `red-200` error
- **Text**: `gray-900` primary, `gray-600` secondary, `gray-500` muted

### Typography
- **Labels**: `font-medium text-sm` for option labels
- **Descriptions**: `text-xs text-gray-500` for helpful text
- **Headers**: `font-semibold text-base` for group labels

### Spacing
- **Grid**: 4px base unit (space-y-1, gap-3, p-3)
- **Containers**: 24px padding for cards (p-6)
- **Items**: 12px padding for comfortable touch targets (p-3)

### Transitions
- **Duration**: 200ms for all state changes
- **Easing**: `ease-in-out` for natural motion
- **Properties**: `all` for comprehensive state transitions

## Browser Support

- **Modern browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **CSS Features**: CSS Grid, Custom Properties, Focus-visible
- **JavaScript**: ES2020, React 18+ hooks
- **Accessibility**: WCAG 2.1 AA compliant

## Testing Considerations

### Unit Tests
- Selection logic validation
- Incompatibility handling
- Search filtering accuracy
- Min/max enforcement

### Integration Tests
- Form integration scenarios
- Validation workflow testing
- Accessibility compliance
- Performance benchmarks

### Visual Regression
- State appearance consistency
- Dark mode functionality
- Responsive layout behavior
- Animation smoothness

## Migration from Legacy Component

The refined CheckboxGroup maintains API compatibility while adding:

1. **Enhanced styling** with design system consistency
2. **Advanced features** like search and incompatibilities
3. **Better accessibility** with full ARIA support
4. **Performance improvements** with optimized React patterns
5. **TypeScript enhancements** with better type safety

### Breaking Changes
- Option interface expanded with new optional fields
- Some CSS classes renamed for consistency
- Enhanced validation callbacks

### Migration Path
1. Update option objects to new interface
2. Review and update custom styling
3. Test validation logic with new features
4. Update TypeScript types if using custom extensions

This refined CheckboxGroup component represents a production-ready solution that balances advanced functionality with excellent user experience, following modern design principles and accessibility standards.