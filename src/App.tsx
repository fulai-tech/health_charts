import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'

// Blood Pressure Pages
import { BloodPressurePage } from '@/pages/details/BloodPressurePage'
import { BPTrendWidgetPage } from '@/pages/widgets/BPTrendWidgetPage'

// SpO2 Pages
import { SpO2Page } from '@/pages/details/SpO2Page'
import { SpO2TrendWidgetPage } from '@/pages/widgets/SpO2TrendWidgetPage'

// Heart Rate Pages
import { HeartRatePage } from '@/pages/details/HeartRatePage'
import { HRTrendWidgetPage } from '@/pages/widgets/HRTrendWidgetPage'

// Glucose Pages
import { GlucosePage } from '@/pages/details/GlucosePage'
import { GlucoseTrendWidgetPage } from '@/pages/widgets/GlucoseTrendWidgetPage'

// Dialog Widget Pages (TypeN_NameWidgetPage.tsx)
import { Type1_SleepScoreWidgetPage } from '@/pages/widgets/dialog/Type1_SleepScoreWidgetPage'
import { Type2_ComparisonWidgetPage } from '@/pages/widgets/dialog/Type2_ComparisonWidgetPage'
import { Type3_NutritionIntakeWidgetPage } from '@/pages/widgets/dialog/Type3_NutritionIntakeWidgetPage'
import { Type4_MusicWidgetPage } from '@/pages/widgets/dialog/Type4_MusicWidgetPage'
import { Type5_VitalOverviewWidgetPage } from '@/pages/widgets/dialog/Type5_VitalOverviewWidgetPage'
import { Type6_SodiumBPWidgetPage } from '@/pages/widgets/dialog/Type6_SodiumBPWidgetPage'
import { Type7_WeeklyHealthScoreWidgetPage } from '@/pages/widgets/dialog/Type7_WeeklyHealthScoreWidgetPage'
import { Type8_SbpSleepTrendWidgetPage } from '@/pages/widgets/dialog/Type8_SbpSleepTrendWidgetPage'
import { Type9_ImprovementPlanWidgetPage } from '@/pages/widgets/dialog/Type9_ImprovementPlanWidgetPage'
import { Type10_PPGSignalWidgetPage } from '@/pages/widgets/dialog/Type10_PPGSignalWidgetPage'
import { Type11_HealthInterventionWidgetPage } from '@/pages/widgets/dialog/Type11_HealthInterventionWidgetPage'
import { Type12_HRERecommendationWidgetPage } from '@/pages/widgets/dialog/Type12_HRERecommendationWidgetPage'

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

// Weekly Report Page
import { WeeklyReportPage } from '@/pages/weekly/WeeklyReportPage'

// AI Security Page
import { AISecurityPage } from '@/pages/ai-security/AISecurityPage'

// Home Page
import { HomePage } from '@/pages/HomePage'

// Page init: token/lang from URL, runs once per URL change for all routes
import { useInitPage } from '@/lib/initPage'

// Initialize i18n
import '@/i18n'

// Lazy load SuperPanel (visibility controlled by MobX store internally)
const SuperPanel = lazy(() => import('@/components/common/SuperPanel').then(module => ({ default: module.SuperPanel })))

/** Runs initPage (token + lang from URL) for every route; only re-runs when URL params change. */
function InitPageRunner() {
  useInitPage()
  return null
}

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
        <InitPageRunner />
        {/* Super Panel - Floating control panel (visibility controlled by MobX store) */}
        <Suspense fallback={null}>
          <SuperPanel />
        </Suspense>
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
            {/* Weekly Report Page */}
            {/* ============================================ */}

            <Route path="/weekly/report" element={<WeeklyReportPage />} />

            {/* ============================================ */}
            {/* AI Security Page */}
            {/* ============================================ */}

            <Route path="/ai-security" element={<AISecurityPage />} />

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
            <Route path="/widget/type-1" element={<Type1_SleepScoreWidgetPage />} />

            {/* Type 2 - Sleep Fatigue Comparison Widget */}
            <Route path="/widget/type-2" element={<Type2_ComparisonWidgetPage />} />

            {/* Type 3 - Nutrition Intake Widget */}
            <Route path="/widget/type-3" element={<Type3_NutritionIntakeWidgetPage />} />

            {/* Type 4 - Music Widget */}
            <Route path="/widget/type-4" element={<Type4_MusicWidgetPage />} />

            {/* Type 5 - Vital Overview Widget */}
            <Route path="/widget/type-5" element={<Type5_VitalOverviewWidgetPage />} />

            {/* Type 6 - Sodium BP Widget */}
            <Route path="/widget/type-6" element={<Type6_SodiumBPWidgetPage />} />

            {/* Type 7 - Weekly Health Score Widget */}
            <Route path="/widget/type-7" element={<Type7_WeeklyHealthScoreWidgetPage />} />

            {/* Type 8 - SBP & Sleep Trend Chart Widget */}
            <Route path="/widget/type-8" element={<Type8_SbpSleepTrendWidgetPage />} />

            {/* Type 9 - Customized Improvement Plan Widget */}
            <Route path="/widget/type-9" element={<Type9_ImprovementPlanWidgetPage />} />

            {/* Type 10 - PPG Signal Widget */}
            <Route path="/widget/type-10" element={<Type10_PPGSignalWidgetPage />} />

            {/* Type 11 - Health Intervention Video Widget */}
            <Route path="/widget/type-11" element={<Type11_HealthInterventionWidgetPage />} />

            {/* Type 12 - HRE Recommendation Widget */}
            <Route path="/widget/type-12" element={<Type12_HRERecommendationWidgetPage />} />

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </QueryClientProvider>
  )
}

export default App

