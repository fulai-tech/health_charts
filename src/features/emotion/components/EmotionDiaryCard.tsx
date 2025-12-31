import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { UI_STYLES, EMOTION_COLORS } from '@/config/theme'
import type { EmotionDomainModel, EmotionDiaryEntry } from '../types'
import { memo, useState, useRef, useCallback, useEffect } from 'react'

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
 * Single Diary Entry Component - Full width for carousel
 */
const DiaryEntry = memo(({ diary }: { diary: EmotionDiaryEntry }) => {
  return (
    <div className="w-full flex-shrink-0 px-1">
      {/* Content container with gray background */}
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
    </div>
  )
})

/**
 * Carousel Indicator Dots
 */
const CarouselIndicator = memo(({
  total,
  current,
  onSelect
}: {
  total: number
  current: number
  onSelect: (index: number) => void
}) => {
  if (total <= 1) return null

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className="transition-all duration-300"
          style={{
            width: index === current ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: index === current ? INDICATOR_ACTIVE_COLOR : INDICATOR_INACTIVE_COLOR,
          }}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  )
})

/**
 * Emotion Diary Card - Carousel/Swiper style with touch support
 */
const EmotionDiaryCardInner = ({ data, className, isLoading }: EmotionDiaryCardProps) => {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Touch state
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const isSwiping = useRef<boolean>(false)
  const [translateX, setTranslateX] = useState(0)

  const diaries = data?.diaries ?? []

  // Reset index when diaries change
  useEffect(() => {
    setCurrentIndex(0)
  }, [diaries.length])

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    isSwiping.current = false
    setTranslateX(0)
  }, [])

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = currentX - touchStartX.current
    const diffY = currentY - touchStartY.current

    // Check if horizontal swipe is dominant
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      isSwiping.current = true
      e.preventDefault()

      // Calculate resistance at edges
      let newTranslate = diffX
      if ((currentIndex === 0 && diffX > 0) ||
        (currentIndex === diaries.length - 1 && diffX < 0)) {
        newTranslate = diffX * 0.3 // Add resistance
      }
      setTranslateX(newTranslate)
    }

    touchEndX.current = currentX
  }, [currentIndex, diaries.length])

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    const diff = touchEndX.current - touchStartX.current
    const threshold = 50 // Minimum swipe distance

    if (isSwiping.current) {
      if (diff > threshold && currentIndex > 0) {
        // Swipe right - go to previous
        setCurrentIndex(prev => prev - 1)
      } else if (diff < -threshold && currentIndex < diaries.length - 1) {
        // Swipe left - go to next
        setCurrentIndex(prev => prev + 1)
      }
    }

    // Reset
    setTranslateX(0)
    isSwiping.current = false
    touchStartX.current = 0
    touchEndX.current = 0
  }, [currentIndex, diaries.length])

  // Handle indicator click
  const handleIndicatorSelect = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Calculate transform
  const containerWidth = containerRef.current?.offsetWidth || 0
  const baseTranslate = -currentIndex * 100
  const dragPercent = containerWidth > 0 ? (translateX / containerWidth) * 100 : 0

  return (
    <Card className={`${className} relative overflow-hidden`}>


      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5" style={{ color: EMOTION_COLORS.primary }} />
        <h3 className="text-base font-semibold text-slate-800">
          {t('page.emotion.diary')}
        </h3>
      </div>

      {/* Carousel Container */}
      {diaries.length > 0 ? (
        <>
          <div
            ref={containerRef}
            className="relative overflow-hidden touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'pan-y pinch-zoom' }}
          >
            <div
              className="flex"
              style={{
                transform: `translateX(calc(${baseTranslate}% + ${translateX}px))`,
                transition: translateX === 0 ? 'transform 0.3s ease-out' : 'none',
              }}
            >
              {diaries.map((diary) => (
                <DiaryEntry key={diary.diaryId} diary={diary} />
              ))}
            </div>
          </div>

          {/* Indicator Dots */}
          <CarouselIndicator
            total={diaries.length}
            current={currentIndex}
            onSelect={handleIndicatorSelect}
          />
        </>
      ) : (
        <div className="text-center py-8 text-slate-400 text-sm">
          {t('common.noData')}
        </div>
      )}
    </Card>
  )
}

export const EmotionDiaryCard = memo(EmotionDiaryCardInner)
