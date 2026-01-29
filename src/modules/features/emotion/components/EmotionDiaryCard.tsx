import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'
import { EMOTION_COLORS } from '@/config/theme'
import { SwipeableCarousel } from '@/components/ui/swipeable-carousel'
import type { EmotionDomainModel, EmotionDiaryEntry } from '../types'
import { memo } from 'react'

// Emotion tag colors mapping - match with distribution colors
const EMOTION_TAG_COLORS: Record<string, string> = {
  '开心': EMOTION_COLORS.happy,
  '生气': EMOTION_COLORS.angry,
  '平静': EMOTION_COLORS.calm,
  '庆幸': EMOTION_COLORS.surprised,
  '悲伤': EMOTION_COLORS.sad,
  '恐惧': EMOTION_COLORS.fearful,
  '厌恶': EMOTION_COLORS.disgusted,
  'Happy': EMOTION_COLORS.happy,
  'Angry': EMOTION_COLORS.angry,
  'Calm': EMOTION_COLORS.calm,
  'Surprised': EMOTION_COLORS.surprised,
  'Sad': EMOTION_COLORS.sad,
  'Fearful': EMOTION_COLORS.fearful,
  'Disgusted': EMOTION_COLORS.disgusted,
}

// Indicator colors
const INDICATOR_ACTIVE_COLOR = '#FB923D'
const INDICATOR_INACTIVE_COLOR = '#D1D5DB'

interface EmotionDiaryCardProps {
  data?: EmotionDomainModel
  className?: string
  isLoading?: boolean
}

/**
 * Single Diary Entry Component - Renders diary content
 */
const DiaryEntry = memo(({ diary }: { diary: EmotionDiaryEntry }) => {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 relative overflow-hidden">
      {/* Header: Title and Date */}
      <div className="mb-3">
        <h4 className="text-base font-semibold text-slate-800 mb-1">
          {diary.title}
        </h4>
        <div className="text-xs text-slate-400">
          {diary.dateLabel} {diary.weekLabel} {diary.timeLabel}
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        {diary.content}
      </p>

      {/* Image - Full width, no white border */}
      {diary.imageUrl && (
        <div className="mb-4 -mx-4 px-4">
          <div className="rounded-xl overflow-hidden">
            <img
              src={diary.imageUrl}
              alt={diary.title}
              className="w-full h-auto max-h-64 object-contain"
              style={{ backgroundColor: 'transparent' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        </div>
      )}

      {/* Emotion Tags */}
      <div className="flex flex-wrap gap-2">
        {diary.emotionTags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 rounded-full text-xs text-white font-medium"
            style={{ backgroundColor: EMOTION_TAG_COLORS[tag] || EMOTION_COLORS.calm }}
          >
            # {tag}
          </span>
        ))}
      </div>

      {/* Corner decoration */}
      <div
        className="absolute bottom-0 right-0 w-12 h-12"
        style={{
          background: 'linear-gradient(135deg, transparent 50%, rgba(148, 163, 184, 0.15) 50%)',
        }}
      />
    </div>
  )
})

/**
 * Carousel Header Component
 */
const DiaryHeader = memo(() => {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <BookOpen className="w-5 h-5" style={{ color: EMOTION_COLORS.primary }} />
      <h3 className="text-base font-semibold text-slate-800">
        {t('page.emotion.diary')}
      </h3>
    </div>
  )
})

/**
 * Emotion Diary Card - Uses SwipeableCarousel for touch support
 */
const EmotionDiaryCardInner = ({ data, className, isLoading }: EmotionDiaryCardProps) => {
  const { t } = useTranslation()
  const diaries = data?.diaries ?? []

  return (
    <SwipeableCarousel
      items={diaries}
      renderItem={(diary: EmotionDiaryEntry) => (
        <DiaryEntry diary={diary} />
      )}
      className={className}
      isLoading={isLoading}
      header={<DiaryHeader />}
      emptyMessage={t('common.noData')}
      indicatorActiveColor={INDICATOR_ACTIVE_COLOR}
      indicatorInactiveColor={INDICATOR_INACTIVE_COLOR}
    />
  )
}

export const EmotionDiaryCard = memo(EmotionDiaryCardInner)
