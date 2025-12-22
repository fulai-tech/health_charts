import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { VITAL_COLORS } from '@/config/theme'

interface MainLayoutProps {
  children: ReactNode
  className?: string
}

// Navigation items configuration
const NAV_ITEMS = [
  { path: '/details/blood-pressure', labelKey: 'vitals.bloodPressure', color: VITAL_COLORS.bp },
  { path: '/details/spo2', labelKey: 'vitals.spo2', color: VITAL_COLORS.spo2 },
  { path: '/details/heart-rate', labelKey: 'vitals.heartRate', color: VITAL_COLORS.heartRate },
  { path: '/details/glucose', labelKey: 'vitals.glucose', color: VITAL_COLORS.glucose },
]

/**
 * MainLayout - Full page layout with header and navigation
 * Used for routes like /details/blood-pressure
 */
export function MainLayout({ children, className }: MainLayoutProps) {
  const { t, i18n } = useTranslation()
  const location = useLocation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh'
    i18n.changeLanguage(newLang)
  }

  // Get current page title
  const currentNav = NAV_ITEMS.find((item) => item.path === location.pathname)
  const pageTitle = currentNav ? t(currentNav.labelKey) : t('common.loading')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">{pageTitle}</h1>
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {i18n.language === 'zh' ? 'EN' : '中文'}
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="sticky top-14 z-40 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all',
                    isActive
                      ? 'text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                  style={{
                    backgroundColor: isActive ? item.color : undefined,
                  }}
                >
                  {t(item.labelKey)}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={cn('max-w-4xl mx-auto px-4 py-6', className)}>
        {children}
      </main>
    </div>
  )
}
