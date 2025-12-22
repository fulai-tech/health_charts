import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Blood Pressure Pages
import { BloodPressurePage } from '@/pages/details/BloodPressurePage'
import { BPTrendWidgetPage } from '@/pages/widget/BPTrendWidgetPage'

// SpO2 Pages
import { SpO2Page } from '@/pages/details/SpO2Page'
import { SpO2TrendWidgetPage } from '@/pages/widget/SpO2TrendWidgetPage'

// Heart Rate Pages
import { HeartRatePage } from '@/pages/details/HeartRatePage'
import { HRTrendWidgetPage } from '@/pages/widget/HRTrendWidgetPage'

// Glucose Pages
import { GlucosePage } from '@/pages/details/GlucosePage'
import { GlucoseTrendWidgetPage } from '@/pages/widget/GlucoseTrendWidgetPage'

// Home Page
import { HomePage } from '@/pages/HomePage'

// Initialize i18n
import '@/i18n'

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * Main App Component
 * Sets up routing with Widget-First architecture:
 * - /details/:type -> Full page with MainLayout
 * - /widget/:type/:component -> Widget only with WidgetLayout (for iframe embedding)
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Home Page - Route Navigation */}
          <Route path="/" element={<HomePage />} />

          {/* ============================================ */}
          {/* Full Detail Pages */}
          {/* ============================================ */}
          
          {/* Blood Pressure */}
          <Route path="/details/blood-pressure" element={<BloodPressurePage />} />
          
          {/* SpO2 (Blood Oxygen) */}
          <Route path="/details/spo2" element={<SpO2Page />} />
          
          {/* Heart Rate */}
          <Route path="/details/heart-rate" element={<HeartRatePage />} />
          
          {/* Blood Glucose */}
          <Route path="/details/glucose" element={<GlucosePage />} />

          {/* ============================================ */}
          {/* Widget Routes (for iframe embedding) */}
          {/* ============================================ */}
          
          {/* Blood Pressure Widget */}
          <Route path="/widget/blood-pressure/trend" element={<BPTrendWidgetPage />} />
          
          {/* SpO2 Widget */}
          <Route path="/widget/spo2/trend" element={<SpO2TrendWidgetPage />} />
          
          {/* Heart Rate Widget */}
          <Route path="/widget/heart-rate/trend" element={<HRTrendWidgetPage />} />
          
          {/* Glucose Widget */}
          <Route path="/widget/glucose/trend" element={<GlucoseTrendWidgetPage />} />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
