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

// Dialog Widget Pages (moved to widget/dialog/)
import { MusicWidgetPage } from '@/pages/widget/dialog/MusicWidgetPage'
import { SleepScoreWidgetPage } from '@/pages/widget/dialog/SleepScoreWidgetPage'
import { NutritionIntakeWidgetPage } from '@/pages/widget/dialog/NutritionIntakeWidgetPage'
import { SleepFatigueComparisonWidgetPage } from '@/pages/widget/dialog/ComparisonWidgetPage'
import { VitalOverviewWidgetPage } from '@/pages/widget/dialog/VitalOverviewWidgetPage'
import { SodiumBPWidgetPage } from '@/pages/widget/dialog/SodiumBPWidgetPage'

// Questionnaire Widget Page
import { QuestionnaireWidgetPage } from '@/pages/widget/QuestionnaireWidgetPage'

// Sleep BP Chart Widget Page
import { SleepBPChartPage } from '@/pages/widget/SleepBPChartPage'

// Healthy Page
import { HealthyPage } from '@/pages/details/HealthyPage'

// Sleep Page
import { SleepPage } from '@/pages/details/SleepPage'

// Emotion Page
import { EmotionPage } from '@/pages/details/EmotionPage'

// Nutrition Page
import { NutritionPage } from '@/pages/details/NutritionPage'

// Daily Report Pages
import EmotionDailyPage from '@/pages/daily/EmotionDailyPage'
import SleepDailyPage from '@/pages/daily/SleepDailyPage'
import HealthyDailyPage from '@/pages/daily/HealthyDailyPage'

// Home Page
import { HomePage } from '@/pages/HomePage'

// Super Panel (Test Environment Only)
import { SuperPanel } from '@/components/common/SuperPanel'

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
        {/* Super Panel - Floating control panel for test environment */}
        <SuperPanel />
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

            {/* Type 1 - Sleep Score Widget */}
            <Route path="/widget/type-1" element={<SleepScoreWidgetPage />} />

            {/* Type 2 - Sleep Fatigue Comparison Widget */}
            <Route path="/widget/type-2" element={<SleepFatigueComparisonWidgetPage />} />

            {/* Type 3 - Nutrition Intake Widget */}
            <Route path="/widget/type-3" element={<NutritionIntakeWidgetPage />} />

            {/* Type 4 - Music Widget */}
            <Route path="/widget/type-4" element={<MusicWidgetPage />} />

            {/* Type 5 - Vital Overview Widget */}
            <Route path="/widget/type-5" element={<VitalOverviewWidgetPage />} />

            {/* Type 6 - Sodium BP Widget */}
            <Route path="/widget/type-6" element={<SodiumBPWidgetPage />} />

            {/* Questionnaire Widget */}
            <Route path="/widget/questionnaire" element={<QuestionnaireWidgetPage />} />

            {/* Sleep BP Chart Widget */}
            <Route path="/widget/sleep-bp-chart" element={<SleepBPChartPage />} />

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </QueryClientProvider>
  )
}

export default App

