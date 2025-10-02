import { useState, useCallback, useMemo } from 'react';

export interface CheckboxOption {
  id: string;
  label: string;
  disabled?: boolean;
  required?: boolean;
  incompatibleWith?: string[];
}

export interface UseCheckboxGroupOptions {
  options: CheckboxOption[];
  initialSelected?: string[];
  minSelection?: number;
  maxSelection?: number;
  onChange?: (selected: string[]) => void;
}

export function useCheckboxGroup({
  options,
  initialSelected = [],
  minSelection = 0,
  maxSelection = Infinity,
  onChange
}: UseCheckboxGroupOptions) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialSelected)
  );

  // Validación de selección
  const canSelect = useCallback((optionId: string): boolean => {
    const option = options.find(opt => opt.id === optionId);
    if (!option) return false;
    
    // Verificar límite máximo
    if (!selected.has(optionId) && selected.size >= maxSelection) {
      return false;
    }
    
    // Verificar incompatibilidades
    if (option.incompatibleWith) {
      const hasIncompatible = option.incompatibleWith.some(
        id => selected.has(id)
      );
      if (hasIncompatible) return false;
    }
    
    return !option.disabled;
  }, [selected, options, maxSelection]);

  // Validación de deselección
  const canDeselect = useCallback((optionId: string): boolean => {
    const option = options.find(opt => opt.id === optionId);
    if (!option) return false;
    
    // No permitir deseleccionar si es requerido
    if (option.required) return false;
    
    // Verificar límite mínimo
    if (selected.size <= minSelection) return false;
    
    return true;
  }, [selected, options, minSelection]);

  // Toggle optimizado con validación
  const toggle = useCallback((optionId: string) => {
    setSelected(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(optionId)) {
        // Intentar deseleccionar
        if (canDeselect(optionId)) {
          newSet.delete(optionId);
        }
      } else {
        // Intentar seleccionar
        if (canSelect(optionId)) {
          newSet.add(optionId);
          
          // Remover incompatibles
          const option = options.find(opt => opt.id === optionId);
          if (option?.incompatibleWith) {
            option.incompatibleWith.forEach(id => newSet.delete(id));
          }
        }
      }
      
      const newArray = Array.from(newSet);
      onChange?.(newArray);
      return newSet;
    });
  }, [canSelect, canDeselect, options, onChange]);

  // Seleccionar todo (respetando reglas)
  const selectAll = useCallback(() => {
    const validOptions = options
      .filter(opt => !opt.disabled)
      .slice(0, maxSelection);
    
    const newSelected = new Set(validOptions.map(opt => opt.id));
    setSelected(newSelected);
    onChange?.(Array.from(newSelected));
  }, [options, maxSelection, onChange]);

  // Limpiar selección (mantener requeridos)
  const clear = useCallback(() => {
    const requiredOptions = options
      .filter(opt => opt.required)
      .map(opt => opt.id);
    
    const newSelected = new Set(requiredOptions);
    setSelected(newSelected);
    onChange?.(requiredOptions);
  }, [options, onChange]);

  // Estado derivado
  const state = useMemo(() => ({
    selected: Array.from(selected),
    isSelected: (id: string) => selected.has(id),
    canSelect,
    canDeselect,
    isValid: selected.size >= minSelection && selected.size <= maxSelection,
    isEmpty: selected.size === 0,
    isFull: selected.size >= maxSelection,
    count: selected.size
  }), [selected, canSelect, canDeselect, minSelection, maxSelection]);

  return {
    ...state,
    toggle,
    selectAll,
    clear,
    setSelected: (ids: string[]) => {
      const newSet = new Set(ids);
      setSelected(newSet);
      onChange?.(ids);
    }
  };
}