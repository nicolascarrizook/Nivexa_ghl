import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppProvider } from '@core/providers/AppProvider'
import { ThemeProvider } from '@core/contexts/ThemeContext'
import { initSentry } from '@core/services/SentryService'
import { analytics } from '@core/services/AnalyticsService'
import './index.css'
import App from './App.tsx'

// Initialize monitoring services before rendering the app
initSentry();

// Initialize Google Analytics if measurement ID is provided
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (GA_MEASUREMENT_ID) {
  analytics.initGA4(GA_MEASUREMENT_ID);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </ThemeProvider>
  </StrictMode>,
)
