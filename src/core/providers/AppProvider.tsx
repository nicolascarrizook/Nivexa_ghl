import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from '@core/contexts/AuthContext';

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * Main application provider that combines all providers
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  );
}