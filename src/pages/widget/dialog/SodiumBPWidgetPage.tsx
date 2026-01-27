import { useState, useCallback, useEffect } from 'react'
import { WidgetLayout } from '@/layouts/WidgetLayout'
import { useNativeBridge } from '@/hooks/useNativeBridge'
import { ChevronRight } from 'lucide-react'
import { VITAL_COLORS } from '@/config/theme'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

// ============================================
// 类型定义
// ============================================

/**
 * 警告等级类型
 */
type AlertLevel = 'normal' | 'warning' | 'danger'

/**
 * 钠摄入与血压关联卡片数据类型
 * 
 * JSON 数据格式规范（必须是 JSON 对象，不支持数组）：
 * {
 *   "intake": {
 *     "value": 8,
 *     "unit": "mg",
 *     "label": "Sodium intake per meal",
 *     "percent": 60,          // 仪表盘百分比 (0-100)，用于确定指针位置
 *     "level": "danger"       // 等级: "normal" | "warning" | "danger"
 *   },
 *   "alert": {
 *     "text": "BP sharp rise",
 *     "label": "Sodium intake per meal",
 *     "level": "danger"
 *   }
 * }
 */
interface SodiumBPData {
  intake: {
    value: number
    unit: string
    label: string
    percent: number
    level: AlertLevel
  }
  alert: {
    text: string
    label: string
    level: AlertLevel
  }
}

// ============================================
// 配置
// ============================================

const PAGE_CONFIG = {
  pageId: 'sodium-bp',
  pageName: '钠摄入与血压关联卡片',
  type: 6, // 钠摄入与血压关联卡片类型标识
} as const

const DEFAULT_DATA: SodiumBPData = {
  intake: {
    value: 8,
    unit: 'mg',
    label: 'Sodium intake per meal',
    percent: 60,
    level: 'danger',
  },
  alert: {
    text: 'BP sharp rise',
    label: 'Sodium intake per meal',
    level: 'danger',
  },
}

// ============================================
// 工具函数
// ============================================

/**
 * 数值边界限制
 * 确保百分比值在 0-100 范围内
 */
function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, value))
}

/**
 * 截断文本，避免溢出
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 2) + '...'
}

/**
 * 解析原生数据
 * 
 * 期望的数据格式：JSON 对象（不支持数组）
 */
function parseSodiumBPData(raw: unknown): SodiumBPData | null {
  // 如果是字符串，先尝试 JSON 解析
  let data = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      console.error('[SodiumBPWidget] JSON 解析失败:', raw)
      return null
    }
  }

  // 验证数据格式：必须是 JSON 对象，不支持数组
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    console.warn('[SodiumBPWidget] 数据格式错误，期望 JSON 对象:', data)
    return null
  }
  
  const obj = data as Record<string, unknown>
  
  if (!obj.intake || !obj.alert) {
    console.warn('[SodiumBPWidget] 缺少必需字段 intake 或 alert:', data)
    return null
  }
  
  return data as SodiumBPData
}


// ============================================
// 警告卡片组件
// ============================================

interface AlertCardProps {
  text: string
  level: AlertLevel
}

function AlertCard({ text, level }: AlertCardProps) {
  // 截断警告文本，防止溢出（最多18个字符）
  const displayText = truncateText(text, 18)
  
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200">
      {/* 图标 */}
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2">
        <img 
          src="/images/widgets/sodium.png" 
          alt="Sodium" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* 警告文字 */}
      <span
        className="text-sm font-medium px-3 py-1 rounded-full text-center max-w-full truncate"
        style={{
          backgroundColor: level === 'danger' 
            ? 'rgba(254, 226, 226, 0.8)'
            : level === 'warning'
            ? 'rgba(254, 243, 199, 0.8)'
            : 'rgba(220, 252, 231, 0.8)',
          color: level === 'danger' 
            ? 'rgb(220, 38, 38)'
            : level === 'warning'
            ? 'rgb(217, 119, 6)'
            : 'rgb(22, 163, 74)',
        }}
      >
        {displayText}
      </span>
    </div>
  )
}

// ============================================
// 主组件
// ============================================

/**
 * 钠摄入与血压关联 Widget 页面
 * 
 * 路由: /widget/sodium-bp
 * 
 * 通信方式：
 * - Android -> JS: NativeBridge.receiveData(jsonString)
 * - JS -> Android: window.android.onJsMessage(jsonString)
 */
export function SodiumBPWidgetPage() {
  const [data, setData] = useState<SodiumBPData>(DEFAULT_DATA)

  // 初始化原生桥接
  const { onData, send, isReady } = useNativeBridge({
    pageId: PAGE_CONFIG.pageId,
    pageName: PAGE_CONFIG.pageName,
    debug: import.meta.env.DEV,
  })

  // 注册数据接收回调
  useEffect(() => {
    onData((rawData) => {
      console.log('[SodiumBPWidget] 收到原生数据')
      const parsed = parseSodiumBPData(rawData)
      if (parsed) {
        setData(parsed)
        console.log('[SodiumBPWidget] 渲染完成')
      } else {
        console.warn('[SodiumBPWidget] 数据解析失败，使用默认数据')
      }
    })
  }, [onData])

  // 处理卡片点击 - 内卡片高亮
  const handleIntakeClick = useCallback(() => {
    send('cardClick', { pageId: PAGE_CONFIG.pageId, cardType: 'intake', data: data.intake })
  }, [send, data.intake])

  const handleAlertClick = useCallback(() => {
    send('cardClick', { pageId: PAGE_CONFIG.pageId, cardType: 'alert', data: data.alert })
  }, [send, data.alert])

  return (
    <WidgetLayout className="bg-[#F5F5F5] p-0">
      <div className="w-full max-w-lg mx-auto p-4">
        {/* 对比卡片 */}
        <div className="relative flex items-stretch justify-center gap-3">
          {/* 左侧：环形进度条卡片 */}
          <div
            className="flex-1 rounded-2xl p-4 cursor-pointer select-none transition-all duration-200 flex flex-col items-center justify-between min-h-[172px]"
            onClick={handleIntakeClick}
          >
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative" style={{ width: 100, height: 100 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    startAngle={90}
                    endAngle={-270}
                    data={[
                      { name: 'bg', value: 100, fill: 'rgb(229, 231, 235)' },
                      { name: 'value', value: clampPercent(data.intake.percent), fill: VITAL_COLORS.nutrition },
                    ]}
                    barSize={10}
                  >
                    <RadialBar
                      dataKey="value"
                      cornerRadius={5}
                      background={false}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                {/* 中心数值 - 限制显示范围防止溢出 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold truncate max-w-[60px]" style={{ color: VITAL_COLORS.nutrition }}>
                    {Math.max(0, Math.min(9999, data.intake.value))}
                  </span>
                  <span className="text-xs text-slate-500 ml-0.5 flex-shrink-0">{data.intake.unit}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">
              {data.intake.label}
            </p>
          </div>
          
          {/* 箭头连接符 */}
          <div className="flex items-center justify-center flex-shrink-0">
            <ChevronRight className="w-5 h-5" style={{ color: VITAL_COLORS.nutrition }} />
          </div>
          
          {/* 右侧：警告卡片 */}
          <div
            className="flex-1 rounded-2xl p-4 cursor-pointer select-none transition-all duration-200 flex flex-col justify-between min-h-[172px]"
            onClick={handleAlertClick}
          >
            <AlertCard
              text={data.alert.text}
              level={data.alert.level}
            />
            <p className="text-xs text-slate-500 text-center mt-2">
              {data.alert.label}
            </p>
          </div>
        </div>

        {/* 调试信息（仅开发环境） */}
        {import.meta.env.DEV && (
          <div className="mt-4 text-xs text-gray-400 text-center">
            NativeBridge Ready: {isReady ? '✅' : '⏳'}
          </div>
        )}
      </div>
    </WidgetLayout>
  )
}
