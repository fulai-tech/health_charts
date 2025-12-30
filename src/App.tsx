import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'

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

// Healthy Page
import { HealthyPage } from '@/pages/details/HealthyPage'

// Sleep Page
import { SleepPage } from '@/pages/details/SleepPage'

// Emotion Page
import { EmotionPage } from '@/pages/details/EmotionPage'

// Daily Report Pages (lazy loaded)
const EmotionDailyPage = lazy(() => import('@/pages/daily/EmotionDailyPage'))
const SleepDailyPage = lazy(() => import('@/pages/daily/SleepDailyPage'))
const HealthyDailyPage = lazy(() => import('@/pages/daily/HealthyDailyPage'))

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

// Loading fallback
const PageLoading = () => (
  <div className="flex items-center justify-center h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-400 border-t-transparent" />
  </div>
)

/**
 * Main App Component
 * Sets up routing with Widget-First architecture:
 * - /details/:type -> Full page with MainLayout
 * - /widget/:type/:component -> Widget only with WidgetLayout (for iframe embedding)
 * - /daily/:type -> Daily report pages
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Suspense fallback={<PageLoading />}>
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

            {/* Healthy (Comprehensive Health) */}
            <Route path="/details/healthy" element={<HealthyPage />} />

            {/* Sleep */}
            <Route path="/details/sleep" element={<SleepPage />} />

            {/* Emotion */}
            <Route path="/details/emotion" element={<EmotionPage />} />

            {/* ============================================ */}
            {/* Daily Report Pages */}
            {/* ============================================ */}

            <Route path="/daily/emotion" element={<EmotionDailyPage />} />
            <Route path="/daily/sleep" element={<SleepDailyPage />} />
            <Route path="/daily/healthy" element={<HealthyDailyPage />} />

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
        </Suspense>
      </HashRouter>
    </QueryClientProvider>
  )
}

export default App

