import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Heart, Droplets, Activity, Pill, LayoutDashboard, Moon, Smile, Utensils, Music, GitCompare, Grid2X2, FlaskConical, Calendar, BarChart3, TrendingUp, Zap, Radio, ChevronRight, ShieldAlert, Sparkles } from 'lucide-react'
import { VITAL_COLORS, VITAL_COLORS_ALPHA, HEALTHY_COLORS, EMOTION_COLORS } from '@/config/theme'
import { AuthButton } from '@/components/ui/AuthButton'
import { useTokenValidation } from '@/hooks/useTokenValidation'

// 动画配置
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
} as const

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
}

const categoryVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
}

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
      category: t('home.aiSecurityCategory', 'AI 安全'),
      items: [
        { path: '/ai-security', label: t('aiSecurity.title', 'AI 智能急救系统'), icon: ShieldAlert, color: '#FF7A00', alphaColor: 'rgba(255, 122, 0, 0.125)' },
      ],
    },
    {
      category: t('home.widgetPages'),
      items: [
        { path: '/widget/type-1', label: t('home.widgetType1'), icon: Moon, color: VITAL_COLORS.sleep, alphaColor: VITAL_COLORS_ALPHA.sleep, type: 1 },
        { path: '/widget/type-2', label: t('home.widgetType2'), icon: GitCompare, color: VITAL_COLORS.sleep, alphaColor: VITAL_COLORS_ALPHA.sleep, type: 2 },
        { path: '/widget/type-3', label: t('home.widgetType3'), icon: Utensils, color: VITAL_COLORS.nutrition, alphaColor: VITAL_COLORS_ALPHA.nutrition, type: 3 },
        { path: '/widget/type-4', label: t('home.widgetType4'), icon: Music, color: EMOTION_COLORS.primary, alphaColor: EMOTION_COLORS.alpha, type: 4 },
        { path: '/widget/type-5', label: t('home.widgetType5'), icon: Grid2X2, color: HEALTHY_COLORS.primary, alphaColor: HEALTHY_COLORS.alpha, type: 5 },
        { path: '/widget/type-6', label: t('home.widgetType6'), icon: FlaskConical, color: VITAL_COLORS.nutrition, alphaColor: VITAL_COLORS_ALPHA.nutrition, type: 6 },
        { path: '/widget/type-7', label: t('home.widgetType7'), icon: BarChart3, color: HEALTHY_COLORS.primary, alphaColor: HEALTHY_COLORS.alpha, type: 7 },
        { path: '/widget/type-8', label: t('home.widgetType8'), icon: TrendingUp, color: VITAL_COLORS.bp, alphaColor: VITAL_COLORS_ALPHA.bp, type: 8 },
        { path: '/widget/type-9', label: t('home.widgetType9'), icon: Zap, color: '#F97316', alphaColor: 'rgba(249, 115, 22, 0.125)', type: 9 },
        { path: '/widget/type-10', label: t('home.widgetType10'), icon: Radio, color: VITAL_COLORS.heartRate, alphaColor: VITAL_COLORS_ALPHA.heartRate, type: 10 },
        { path: '/widget/type-11', label: t('home.widgetType11'), icon: Zap, color: '#FF7F27', alphaColor: 'rgba(255, 127, 39, 0.125)', type: 11 },
        { path: '/widget/type-12', label: t('home.widgetType12'), icon: Sparkles, color: '#FF7F27', alphaColor: 'rgba(255, 127, 39, 0.125)', type: 12 },
      ],
    },
  ]

  // 渲染路由卡片
  const renderRouteCard = (route: typeof routes[0]['items'][0], index: number) => {
    const Icon = route.icon
    const isExternal = !!(route as { path: string; isExternal?: boolean }).isExternal

    const cardContent = (
      <>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: route.alphaColor }}
        >
          <Icon className="w-6 h-6" style={{ color: route.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 group-hover:text-slate-900 truncate">
            {route.label}
          </p>
          <p className="text-sm text-slate-400 font-mono truncate">{route.path}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
      </>
    )

    // 卡片样式
    const cardClassName = `
      flex items-center gap-4 p-4 bg-white rounded-2xl 
      shadow-sm hover:shadow-xl
      transition-shadow duration-300 ease-out
      group cursor-pointer
    `

    if (isExternal) {
      return (
        <motion.a
          key={route.path}
          href={route.path}
          className={cardClassName}
          variants={itemVariants}
          whileHover={{ x: 4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          {cardContent}
        </motion.a>
      )
    }

    return (
      <motion.div
        key={route.path}
        variants={itemVariants}
        custom={index}
        whileHover={{ x: 4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Link to={route.path} className={cardClassName}>
          {cardContent}
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F1EFEE] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header - 带动画 */}
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <div>
            <motion.h1 
              className="text-3xl font-bold text-slate-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              {t('home.title')}
            </motion.h1>
            <motion.p 
              className="text-slate-500 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {t('home.subtitle')}
            </motion.p>
          </div>
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <AuthButton />
            <motion.button
              onClick={toggleLanguage}
              className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {i18n.language.startsWith('en') ? '中文' : 'English'}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Route Categories - 交错进场 */}
        {routes.map((category, categoryIndex) => (
          <motion.div 
            key={category.category} 
            className="mb-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            custom={categoryIndex}
          >
            <motion.h2 
              className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4"
              variants={categoryVariants}
            >
              {category.category}
            </motion.h2>
            <motion.div 
              className="grid gap-3"
              variants={containerVariants}
            >
              {category.items.map((route, index) => renderRouteCard(route, index))}
            </motion.div>
          </motion.div>
        ))}

        {/* URL 参数说明 - 淡入 */}
        <motion.div 
          className="p-4 bg-white/50 rounded-2xl border border-slate-200 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h3 className="text-sm font-semibold text-slate-600 mb-2">{t('home.urlParameters')}</h3>
          <div className="text-sm text-slate-500 space-y-1 font-mono">
            <p>?lang=en | ?lang=zh</p>
            <p>?theme=light | ?theme=dark</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
