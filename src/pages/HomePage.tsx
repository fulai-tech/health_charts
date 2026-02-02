import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Heart, Droplets, Activity, Pill, LayoutDashboard, Moon, Smile, Utensils, Music, GitCompare, Grid2X2, FlaskConical, Calendar, BarChart3, TrendingUp } from 'lucide-react'
import { VITAL_COLORS, VITAL_COLORS_ALPHA, HEALTHY_COLORS, EMOTION_COLORS } from '@/config/theme'
import { AuthButton } from '@/components/ui/AuthButton'
import { useTokenValidation } from '@/hooks/useTokenValidation'



export function HomePage() {
  const { t, i18n } = useTranslation()

  // Token validation hook - auto checks and refreshes token
  useTokenValidation()

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('en') ? 'zh' : 'en')
  }

  const routes = [
    {
      category: t('home.detailPages'),
      items: [
        { path: '/details/healthy', label: t('nav.healthyDashboard'), icon: LayoutDashboard, color: HEALTHY_COLORS.primary, alphaColor: HEALTHY_COLORS.alpha },
        { path: '/details/blood-pressure', label: t('nav.bloodPressure'), icon: Heart, color: VITAL_COLORS.bp, alphaColor: VITAL_COLORS_ALPHA.bp },
        { path: '/details/spo2', label: t('nav.spo2'), icon: Droplets, color: VITAL_COLORS.spo2, alphaColor: VITAL_COLORS_ALPHA.spo2 },
        { path: '/details/heart-rate', label: t('nav.heartRate'), icon: Activity, color: VITAL_COLORS.heartRate, alphaColor: VITAL_COLORS_ALPHA.heartRate },
        { path: '/details/glucose', label: t('nav.glucose'), icon: Pill, color: VITAL_COLORS.glucose, alphaColor: VITAL_COLORS_ALPHA.glucose },
        { path: '/details/sleep', label: t('vitals.sleep'), icon: Moon, color: VITAL_COLORS.sleep, alphaColor: VITAL_COLORS_ALPHA.sleep },
        { path: '/details/emotion', label: t('vitals.emotion'), icon: Smile, color: EMOTION_COLORS.primary, alphaColor: EMOTION_COLORS.alpha },
        { path: '/details/nutrition', label: t('vitals.nutrition'), icon: Utensils, color: VITAL_COLORS.nutrition, alphaColor: VITAL_COLORS_ALPHA.nutrition },
      ],
    },
    {
      category: t('home.dailyReportPages'),
      items: [
        { path: '/daily/healthy', label: t('nav.healthyDailyReport'), icon: LayoutDashboard, color: HEALTHY_COLORS.primary, alphaColor: HEALTHY_COLORS.alpha },
        { path: '/daily/emotion', label: t('nav.emotionDailyReport'), icon: Smile, color: EMOTION_COLORS.primary, alphaColor: EMOTION_COLORS.alpha },
        { path: '/daily/sleep', label: t('nav.sleepDailyReport'), icon: Moon, color: VITAL_COLORS.sleep, alphaColor: VITAL_COLORS_ALPHA.sleep },
      ],
    },
    {
      category: t('home.weeklyReportCategory'),
      items: [
        { path: '/weekly/report', label: t('weeklyReport.title'), icon: Calendar, color: '#F97316', alphaColor: 'rgba(249, 115, 22, 0.125)' },
      ],
    },
    {
      category: t('home.widgetPages'),
      items: [
        // { path: '/widget/blood-pressure/trend', label: t('nav.bpTrendWidget'), icon: Heart, color: VITAL_COLORS.bp, alphaColor: VITAL_COLORS_ALPHA.bp },
        // { path: '/widget/spo2/trend', label: t('nav.spo2TrendWidget'), icon: Droplets, color: VITAL_COLORS.spo2, alphaColor: VITAL_COLORS_ALPHA.spo2 },
        // { path: '/widget/heart-rate/trend', label: t('nav.hrTrendWidget'), icon: Activity, color: VITAL_COLORS.heartRate, alphaColor: VITAL_COLORS_ALPHA.heartRate },
        // { path: '/widget/glucose/trend', label: t('nav.glucoseTrendWidget'), icon: Pill, color: VITAL_COLORS.glucose, alphaColor: VITAL_COLORS_ALPHA.glucose },
        { path: '/widget/type-1', label: t('home.widgetType1'), icon: Moon, color: VITAL_COLORS.sleep, alphaColor: VITAL_COLORS_ALPHA.sleep, type: 1 },
        { path: '/widget/type-2', label: t('home.widgetType2'), icon: GitCompare, color: VITAL_COLORS.sleep, alphaColor: VITAL_COLORS_ALPHA.sleep, type: 2 },
        { path: '/widget/type-3', label: t('home.widgetType3'), icon: Utensils, color: VITAL_COLORS.nutrition, alphaColor: VITAL_COLORS_ALPHA.nutrition, type: 3 },
        { path: '/widget/type-4', label: t('home.widgetType4'), icon: Music, color: EMOTION_COLORS.primary, alphaColor: EMOTION_COLORS.alpha, type: 4 },
        { path: '/widget/type-5', label: t('home.widgetType5'), icon: Grid2X2, color: HEALTHY_COLORS.primary, alphaColor: HEALTHY_COLORS.alpha, type: 5 },
        { path: '/widget/type-6', label: t('home.widgetType6'), icon: FlaskConical, color: VITAL_COLORS.nutrition, alphaColor: VITAL_COLORS_ALPHA.nutrition, type: 6 },
        { path: '/widget/type-7', label: t('home.widgetType7'), icon: BarChart3, color: HEALTHY_COLORS.primary, alphaColor: HEALTHY_COLORS.alpha, type: 7 },
        { path: '/widget/type-8', label: t('home.widgetType8'), icon: TrendingUp, color: VITAL_COLORS.bp, alphaColor: VITAL_COLORS_ALPHA.bp, type: 8 },
      ],
    },
  ]


  return (
    <div className="min-h-screen bg-[#F1EFEE] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{t('home.title')}</h1>
            <p className="text-slate-500 mt-1">{t('home.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <AuthButton />
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {i18n.language.startsWith('en') ? '中文' : 'English'}
            </button>
          </div>
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
                const isExternal = (route as any).isExternal
                const linkClassName = "flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all group"
                
                if (isExternal) {
                  return (
                    <a
                      key={route.path}
                      href={route.path}
                      className={linkClassName}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: route.alphaColor }}
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
                    </a>
                  )
                }
                
                return (
                  <Link
                    key={route.path}
                    to={route.path}
                    className={linkClassName}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: route.alphaColor }}
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
        <div className="p-4 bg-white/50 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">{t('home.urlParameters')}</h3>
          <div className="text-sm text-slate-500 space-y-1 font-mono">
            <p>?lang=en | ?lang=zh</p>
            <p>?theme=light | ?theme=dark</p>
          </div>
        </div>
      </div>
    </div>
  )
}
