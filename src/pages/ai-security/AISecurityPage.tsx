import { memo, useState, useEffect, useRef, createContext, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Grid3X3, Hospital, Loader2, Activity, Sparkles, CheckCircle2 } from 'lucide-react'

// ================== 状态上下文 ==================
const StatusContext = createContext<{
  isComplete: boolean
  setIsComplete: (value: boolean) => void
}>({
  isComplete: false,
  setIsComplete: () => {},
})

// ================== 颜色配置 ==================
const COLORS = {
  primaryGradientBg: 'linear-gradient(to bottom, #FF8C42 0%, #FFF5E6 40%, #F5F5F5 100%)',
  primaryOrange: '#FF7A00',
  secondaryOrange: '#FF9E4F',
  textDark: '#333333',
  textGray: '#888888',
  textWhite: '#FFFFFF',
  dangerRed: '#FF4D4F',
  successGreen: '#52C41A',
  cardBg: '#FFFFFF',
  peachLight: 'rgba(255, 158, 79, 0.15)',
}

// ================== 动画配置 ==================
const headerVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const gridItemVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
}

const logCardVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: 'spring' as const, stiffness: 100, delay: 0.4 },
}

const chatBubbleVariants = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: 'spring', damping: 20, stiffness: 300 },
}

// ================== 数据类型定义 ==================
interface LogEntry {
  time: string
  title: string
  titleColor: string
  icon: 'activity' | 'sparkles'
  description: string
}

interface ChatMessage {
  id: number
  sender: 'remote' | 'local'
  role: string
  bgColor: string
  textColor: string
  text: string
  animationDelay: number
}

// ================== 静态数据 ==================
const LOG_ENTRIES: LogEntry[] = [
  {
    time: '13:55:12',
    title: 'Visual AI Triggered',
    titleColor: 'text-red-500',
    icon: 'activity',
    description: 'Abnormal body posture detected',
  },
  {
    time: '13:53:37',
    title: 'Multimodal Fusion',
    titleColor: 'text-orange-400',
    icon: 'sparkles',
    description: 'Comprehensive assessment: Fall detected; patient unable to get up; no other persons present.',
  },
]

const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    sender: 'remote',
    role: '120 Agent',
    bgColor: 'bg-white',
    textColor: 'text-gray-800',
    text: 'Hello, this is the 120 Emergency Center. What is the emergency?',
    animationDelay: 1000,
  },
  {
    id: 2,
    sender: 'local',
    role: 'AI System',
    bgColor: '', // 使用内联样式渐变
    textColor: 'text-white',
    text: 'Emergency. Elderly fall detected at: Unit 3, Room 103, Joy City North Residential Area... Sudden fall, patient\'s consciousness is blurred.',
    animationDelay: 2500,
  },
  {
    id: 3,
    sender: 'remote',
    role: '120 Agent',
    bgColor: 'bg-white',
    textColor: 'text-gray-800',
    text: 'Received. Is the patient conscious? Is he breathing?',
    animationDelay: 4500,
  },
  {
    id: 4,
    sender: 'local',
    role: 'AI System',
    bgColor: '', // 使用内联样式渐变
    textColor: 'text-white',
    text: 'Sudden fall; patient is semi-conscious; weak breathing; HR 110; 55-year-old male.',
    animationDelay: 6000,
  },
  {
    id: 5,
    sender: 'remote',
    role: '120 Agent',
    bgColor: 'bg-white',
    textColor: 'text-gray-800',
    text: 'Does the patient have any pre-existing medical conditions?',
    animationDelay: 8000,
  },
  {
    id: 6,
    sender: 'local',
    role: 'AI System',
    bgColor: '', // 使用内联样式渐变
    textColor: 'text-white',
    text: 'Medical History: Hypertension, Coronary Heart Disease. Long-term Aspirin use. On-site contact: ... (Family).',
    animationDelay: 9500,
  },
  {
    id: 7,
    sender: 'remote',
    role: '120 Agent',
    bgColor: 'bg-white',
    textColor: 'text-gray-800',
    text: 'Understood. An ambulance has been dispatched.',
    animationDelay: 11500,
  },
]

// ================== 子组件 ==================

/** 微信图标 - 自定义 SVG */
const WechatIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.133 0 .241-.108.241-.243 0-.06-.023-.118-.039-.177l-.326-1.233a.49.49 0 0 1 .178-.553C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.02-.406-.032z" />
  </svg>
)

/** 头部区域 */
const HeaderSection = () => {
  const { t } = useTranslation()
  const { isComplete } = useContext(StatusContext)
  
  return (
    <motion.header
      className="mb-6"
      initial={headerVariants.initial}
      animate={headerVariants.animate}
      transition={headerVariants.transition}
    >
      <h1 className="text-lg font-semibold text-white/90 tracking-wide">
        {t('aiSecurity.appName', 'AI Security Core')}
      </h1>
      <h2 className="text-xl font-bold text-white mt-0.5">
        {t('aiSecurity.moduleName', 'Smart Emergency Rescue System')}
      </h2>
      <div className="flex items-center gap-2 mt-2">
        {isComplete ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-green-300" />
            <span className="text-sm text-green-200 font-medium">
              {t('aiSecurity.status.complete', 'Complete')}
            </span>
          </>
        ) : (
          <>
            <Loader2 className="w-4 h-4 text-orange-200 animate-spin" />
            <span className="text-sm text-orange-100 font-medium">
              {t('aiSecurity.status.processing', 'Processing')}
            </span>
          </>
        )}
      </div>
    </motion.header>
  )
}

/** 快捷操作网格 */
const QuickActionsGrid = () => {
  const { t } = useTranslation()
  
  const actions = [
    { 
      label: t('aiSecurity.actions.message', 'Message'), 
      icon: MessageCircle, 
      badge: '9+', 
      isActive: true 
    },
    { 
      label: t('aiSecurity.actions.wechat', 'Wechat'), 
      icon: WechatIcon, 
      isActive: false 
    },
    { 
      label: t('aiSecurity.actions.app', 'APP'), 
      icon: Grid3X3, 
      isActive: false 
    },
    { 
      label: t('aiSecurity.actions.emergency', '120'), 
      icon: Hospital, 
      isActive: false 
    },
  ]

  return (
    <motion.div 
      className="grid grid-cols-4 gap-3 mb-6"
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
      }}
    >
      {actions.map((action, index) => {
        const Icon = action.icon
        return (
          <motion.div
            key={action.label}
            variants={gridItemVariants}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex flex-col items-center"
          >
            <div
              className={`
                relative w-14 h-14 rounded-2xl flex items-center justify-center
                shadow-sm transition-all duration-200
                ${action.isActive 
                  ? 'bg-white shadow-md' 
                  : 'bg-white/20 backdrop-blur-sm'
                }
              `}
              style={{ borderRadius: '18px' }}
            >
              <Icon 
                className={`w-6 h-6 ${action.isActive ? 'text-orange-500' : 'text-white'}`}
              />
              {action.badge && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {action.badge}
                </span>
              )}
            </div>
            <span className={`mt-2 text-xs font-medium ${action.isActive ? 'text-white' : 'text-white/80'}`}>
              {action.label}
            </span>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

/** 系统日志卡片 */
const SystemLogCard = () => {
  const { t } = useTranslation()
  
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm p-4 mb-4"
      initial={logCardVariants.initial}
      animate={logCardVariants.animate}
      transition={logCardVariants.transition}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
          {t('aiSecurity.systemLog', 'SYSTEM LOG')}
        </span>
        <span className="text-[10px] text-gray-400 font-mono tracking-wide">13:55:12</span>
      </div>
      
      {/* 日志条目 */}
      <div className="space-y-3">
        {LOG_ENTRIES.map((entry, index) => (
          <div key={index} className="flex items-start gap-2.5">
            <div className="flex-shrink-0 mt-0.5">
              {entry.icon === 'activity' ? (
                <Activity className="w-4 h-4 text-red-500" />
              ) : (
                <Sparkles className="w-4 h-4 text-orange-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-gray-400 font-mono">{entry.time}</span>
              <p className={`text-[13px] font-semibold ${entry.titleColor} mt-0.5`}>
                {entry.title}
              </p>
              <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">
                {entry.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/** 聊天气泡组件 */
const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isLocal = message.sender === 'local'
  
  // 本地消息（AI系统）使用渐变背景
  const localBubbleStyle = isLocal ? {
    background: 'linear-gradient(to right, #FF9E4F, #FF7A00)',
    boxShadow: '0 2px 8px rgba(255, 122, 0, 0.25)',
  } : {}
  
  return (
    <motion.div
      className={`flex ${isLocal ? 'justify-end' : 'justify-start'} mb-3`}
      variants={chatBubbleVariants}
      initial="initial"
      animate="animate"
    >
      <div
        className={`
          w-fit max-w-[85%] px-4 py-3 rounded-2xl
          ${message.bgColor} ${message.textColor}
          ${!isLocal ? 'shadow-sm' : ''}
        `}
        style={{
          borderBottomRightRadius: isLocal ? '6px' : '16px',
          borderBottomLeftRadius: isLocal ? '16px' : '6px',
          ...localBubbleStyle,
        }}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
      </div>
    </motion.div>
  )
}

/** 聊天界面容器 */
const ChatInterface = () => {
  const { t } = useTranslation()
  const [visibleCount, setVisibleCount] = useState(0)
  const [showThankYou, setShowThankYou] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const { setIsComplete } = useContext(StatusContext)

  // 消息逐个显示逻辑
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    
    CHAT_MESSAGES.forEach((msg, index) => {
      const timer = setTimeout(() => {
        setVisibleCount(index + 1)
      }, msg.animationDelay)
      timers.push(timer)
    })

    // "Thank you" 按钮在最后一条消息后显示
    const thankYouTimer = setTimeout(() => {
      setShowThankYou(true)
      setIsComplete(true)
    }, CHAT_MESSAGES[CHAT_MESSAGES.length - 1].animationDelay + 1500)
    timers.push(thankYouTimer)

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [])

  // 每次有新消息时滚动到底部
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [visibleCount, showThankYou])

  return (
    <motion.div
      className="flex flex-col rounded-3xl overflow-hidden shadow-md"
      style={{ backgroundColor: 'rgba(249, 250, 251, 0.8)', height: '95svh' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      {/* 头部条 */}
      <div 
        className="px-4 py-3 flex items-center justify-between rounded-t-3xl flex-shrink-0"
        style={{ background: 'linear-gradient(to right, #FF9E4F, #FF7A00)' }}
      >
        <span className="text-white font-semibold text-sm tracking-wide">
          {t('aiSecurity.chat.title', '120 Emergency Call Log')}
        </span>
        <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
          {t('aiSecurity.chat.recording', 'Recording...')}
        </span>
      </div>

      {/* 聊天区域 - 填充剩余高度 */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* 时间戳 - 无背景色 */}
        <div className="text-center mb-4">
          <span className="text-xs text-gray-400">
            Jan 9, 14:49 Connected
          </span>
        </div>

        {/* 消息列表 */}
        <AnimatePresence>
          {CHAT_MESSAGES.slice(0, visibleCount).map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {/* Thank you 消息气泡 */}
        <AnimatePresence>
          {showThankYou && (
            <motion.div
              className="flex justify-end mb-3"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            >
              <div 
                className="w-fit max-w-[92%] px-4 py-3 rounded-2xl text-white"
                style={{ 
                  background: 'linear-gradient(to right, #FF9E4F, #FF7A00)',
                  boxShadow: '0 2px 8px rgba(255, 122, 0, 0.25)',
                  borderBottomRightRadius: '6px',
                  borderBottomLeftRadius: '16px',
                }}
              >
                <p className="text-sm leading-relaxed">{t('aiSecurity.chat.thankYou', 'Thank you.')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={chatEndRef} />
      </div>
    </motion.div>
  )
}

// ================== 主页面组件 ==================
const AISecurityPageInner = () => {
  const [isComplete, setIsComplete] = useState(false)
  
  return (
    <StatusContext.Provider value={{ isComplete, setIsComplete }}>
      <div
        className="min-h-screen"
        style={{ background: COLORS.primaryGradientBg }}
      >
        {/* 主容器 - 移动端优先，宽屏居中 */}
        <div className="w-full max-w-md mx-auto px-4 pt-6 pb-6">
          <HeaderSection />
          <QuickActionsGrid />
          <SystemLogCard />
          <ChatInterface />
        </div>
      </div>
    </StatusContext.Provider>
  )
}

export const AISecurityPage = memo(AISecurityPageInner)
export default AISecurityPage
