import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, Droplets, Activity, Pill } from 'lucide-react'
import { VITAL_COLORS } from '@/config/theme'

const routes = [
  {
    category: 'Details Pages',
    items: [
      { path: '/details/blood-pressure', label: 'Blood Pressure', icon: Heart, color: VITAL_COLORS.bp },
      { path: '/details/spo2', label: 'Blood Oxygen (SpO2)', icon: Droplets, color: VITAL_COLORS.spo2 },
      { path: '/details/heart-rate', label: 'Heart Rate', icon: Activity, color: VITAL_COLORS.heartRate },
      { path: '/details/glucose', label: 'Blood Glucose', icon: Pill, color: VITAL_COLORS.glucose },
    ],
  },
  {
    category: 'Widget Pages (for iframe embedding)',
    items: [
      { path: '/widget/blood-pressure/trend', label: 'BP Trend Widget', icon: Heart, color: VITAL_COLORS.bp },
      { path: '/widget/spo2/trend', label: 'SpO2 Trend Widget', icon: Droplets, color: VITAL_COLORS.spo2 },
      { path: '/widget/heart-rate/trend', label: 'HR Trend Widget', icon: Activity, color: VITAL_COLORS.heartRate },
      { path: '/widget/glucose/trend', label: 'Glucose Trend Widget', icon: Pill, color: VITAL_COLORS.glucose },
    ],
  },
]

export function HomePage() {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
  }

  return (
    <div className="min-h-screen bg-[#F1EFEE] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Health Vitals</h1>
            <p className="text-slate-500 mt-1">Visualization Library</p>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {i18n.language === 'en' ? '中文' : 'English'}
          </button>
        </div>

        {/* Route Categories */}
        {routes.map((category) => (
          <div key={category.category} className="mb-8">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              {category.category}
            </h2>
            <div className="grid gap-3">
              {category.items.map((route) => {
                const Icon = route.icon
                return (
                  <Link
                    key={route.path}
                    to={route.path}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all group"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${route.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: route.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 group-hover:text-slate-900">
                        {route.label}
                      </p>
                      <p className="text-sm text-slate-400 font-mono">{route.path}</p>
                    </div>
                    <svg
                      className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* URL Parameters Info */}
        <div className="p-4 bg-white/50 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">URL Parameters</h3>
          <div className="text-sm text-slate-500 space-y-1 font-mono">
            <p>?lang=en | ?lang=zh</p>
            <p>?theme=light | ?theme=dark</p>
          </div>
        </div>
      </div>
    </div>
  )
}
