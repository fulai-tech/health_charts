import { useTranslation } from 'react-i18next'
import { useUrlConfig } from '@/hooks/useUrlParams'

/**
 * Disclaimer Box Component
 * 
 * Displays a disclaimer message at the bottom of pages.
 * Supports internationalization and theme customization.
 */
export function DisclaimerBox() {
    const { t } = useTranslation()
    const { theme } = useUrlConfig()

    return (
        <div
            className="rounded-lg"
            style={{
                backgroundColor: 'transparent',
                padding: 'clamp(12px, 5vw, 20px)',
                paddingLeft: 'clamp(16px, 4vw, 24px)',
                paddingRight: 'clamp(16px, 4vw, 24px)',
                fontSize: 'clamp(12px, 3.5vw, 14px)',
                lineHeight: '1.6',
                color: theme.textSecondary,
                textAlign: 'center',
            }}
        >
            {t('common.disclaimer')}
        </div>
    )
}
