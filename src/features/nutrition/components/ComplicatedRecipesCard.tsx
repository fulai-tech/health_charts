import { SwipeableCarousel } from '@/components/ui/swipeable-carousel'
import type { RecipeData } from '../types'
import { Utensils } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ComplicatedRecipesCardProps {
    data?: RecipeData[]
    className?: string
}

export const ComplicatedRecipesCard = ({ data, className }: ComplicatedRecipesCardProps) => {
    const { t } = useTranslation()

    if (!data) return null

    const header = (
        <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-orange-500" />
            <h3 className="text-base font-semibold text-slate-800">{t('nutrition.complicatedRecipes', 'Complicated recipes')}</h3>
        </div>
    )

    const renderRecipe = (recipe: RecipeData) => (
        <div className="bg-orange-50 rounded-2xl p-4 flex gap-4 items-center">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
                <h4 className="text-base font-bold text-slate-800 mb-1">{recipe.title}</h4>
                <div className="flex gap-2 mb-2">
                    {recipe.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-white text-orange-600 px-2 py-0.5 rounded-full border border-orange-100">
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="text-lg font-bold text-orange-500">
                    +{recipe.calories} <span className="text-xs font-normal text-slate-500">{t('nutrition.kcal', 'kcal')}</span>
                </div>
            </div>
            {/* Go button / Arrow */}
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-200">
                &gt;
            </div>
        </div>
    )

    return (
        <SwipeableCarousel
            className={className}
            items={data}
            renderItem={renderRecipe}
            header={header}
            indicatorActiveColor="#FB923D"
            indicatorInactiveColor="#FED7AA"
        />
    )
}
