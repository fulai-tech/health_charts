import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'

// ============================================
// All pages are lazy-loaded for optimal bundle splitting
// Each route will only load its required code when accessed
// ============================================

// Home Page
const HomePage = lazy(() => import('@/pages/HomePage').then(m => ({ default: m.HomePage })))

// Blood Pressure Pages
const BloodPressurePage = lazy(() => import('@/pages/details/BloodPressurePage').then(m => ({ default: m.BloodPressurePage })))
const BPTrendWidgetPage = lazy(() => import('@/pages/widget/BPTrendWidgetPage').then(m => ({ default: m.BPTrendWidgetPage })))

// SpO2 Pages
const SpO2Page = lazy(() => import('@/pages/details/SpO2Page').then(m => ({ default: m.SpO2Page })))
const SpO2TrendWidgetPage = lazy(() => import('@/pages/widget/SpO2TrendWidgetPage').then(m => ({ default: m.SpO2TrendWidgetPage })))

// Heart Rate Pages
const HeartRatePage = lazy(() => import('@/pages/details/HeartRatePage').then(m => ({ default: m.HeartRatePage })))
const HRTrendWidgetPage = lazy(() => import('@/pages/widget/HRTrendWidgetPage').then(m => ({ default: m.HRTrendWidgetPage })))

// Glucose Pages
const GlucosePage = lazy(() => import('@/pages/details/GlucosePage').then(m => ({ default: m.GlucosePage })))
const GlucoseTrendWidgetPage = lazy(() => import('@/pages/widget/GlucoseTrendWidgetPage').then(m => ({ default: m.GlucoseTrendWidgetPage })))

// Healthy Page
const HealthyPage = lazy(() => import('@/pages/details/HealthyPage').then(m => ({ default: m.HealthyPage })))

// Sleep Page
const SleepPage = lazy(() => import('@/pages/details/SleepPage').then(m => ({ default: m.SleepPage })))

// Emotion Page
const EmotionPage = lazy(() => import('@/pages/details/EmotionPage').then(m => ({ default: m.EmotionPage })))

// Nutrition Page
const NutritionPage = lazy(() => import('@/features/nutrition/pages/NutritionPage').then(m => ({ default: m.NutritionPage })))

// Daily Report Pages
const EmotionDailyPage = lazy(() => import('@/pages/daily/EmotionDailyPage'))
const SleepDailyPage = lazy(() => import('@/pages/daily/SleepDailyPage'))
const HealthyDailyPage = lazy(() => import('@/pages/daily/HealthyDailyPage'))

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

            {/* Nutrition */}
            <Route path="/details/nutrition" element={<NutritionPage />} />

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

