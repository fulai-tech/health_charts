import { Card } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { WeeklyManagementData } from '../types'
import { TrendingUp, AlertCircle } from 'lucide-react'

interface NutritionWeeklyGaugeCardProps {
    data?: WeeklyManagementData
    className?: string
}

export const NutritionWeeklyGaugeCard = ({ data, className }: NutritionWeeklyGaugeCardProps) => {
    if (!data) return null

    // Gauge Configuration
    // 3 Segments: Low (Blue), Normal (Green), High/Excess (Orange)
    // We assume the total range is 0 to roughly 1.5 * Target (or 3000 kcal for example)
    // Let's standardise on a max value of 3000 for visualization or use data driven max.
    // If target is 2000, max could be 3000.
    const MAX_VAL = 3500;

    // Segments data
    const gaugeData = [
        { name: 'Low', value: MAX_VAL * 0.33, color: '#93C5FD' },     // Blue
        { name: 'Normal', value: MAX_VAL * 0.33, color: '#86EFAC' },  // Green
        { name: 'Excess', value: MAX_VAL * 0.34, color: '#FB923D' },  // Orange
    ]

    // Calculate rotation for needle
    // 180 degrees total span (from 180 to 0)
    // Value 0 -> 180 deg
    // Value MAX -> 0 deg
    // Wait, Recharts convention: 0 is right (3 o'clock). 180 is left (9 o'clock).
    // We want gauge from Left (180) to Right (0).
    // So Value 0 should be at 180 deg. Value MAX should be at 0 deg.
    // Angle = 180 - (Value / Max) * 180
    const clampedValue = Math.min(MAX_VAL, Math.max(0, data.currentCal))
    const needleAngle = 180 - (clampedValue / MAX_VAL) * 180

    // Needle component
    const NEEDLE_RAD = 80; // Length matches outer radius approx
    const cx = 50 + '%';
    const cy = 70 + '%'; // Push down to match the semi-circle look

    return (
        <Card className={`${className} p-5 relative overflow-hidden`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    <h3 className="text-base font-semibold text-slate-800">Weekly average report</h3>
                </div>
            </div>

            {/* Sub-header / Status */}
            <div className="flex justify-between items-center text-xs text-slate-400 mb-4">
                <span>Weekly intake report</span>
                {data.status === 'alert' && (
                    <span className="flex items-center gap-1 text-orange-500">
                        <AlertCircle className="w-3 h-3" />
                        Excessive intake
                    </span>
                )}
            </div>

            {/* Chart Area */}
            <div className="h-48 relative -mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={gaugeData}
                            cx="50%"
                            cy="70%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius="75%"
                            outerRadius="100%"
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={5} // Rounded ends for segments
                        >
                            {gaugeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        {/* Needle (Custom SVG Overlay) */}
                        {/* We use specific coordinate math or just SVG rotation group */}
                    </PieChart>
                </ResponsiveContainer>

                {/* Needle Implementation */}
                {/* Visual container centered at bottom of gauge semicircle */}
                {/* Needle Implementation */}
                {/* Visual container centered at bottom of gauge semicircle */}
                <div className="absolute inset-x-0 bottom-[30%] flex justify-center items-end pointer-events-none">
                    <div
                        className="relative w-full max-w-[220px]"
                        style={{ height: 0 }}
                    >
                        {/* 
                            Correct Rotation Logic:
                            - Gauge spans 180 degrees: Left (180deg) -> Top (90deg) -> Right (0deg).
                            - Our needle container is anchored at bottom-center.
                            - We want 0 value => Points Left.
                            - Max value (or high value) => Points Right.
                            
                            Let's use a simple transform-origin center.
                            - If we have a horizontal needle pointing Right by default (0 deg).
                            - To point Left (Minimum), we need rotate(-180deg).
                            - To point Right (Maximum), we need rotate(0deg).
                            
                            Let's Recalculate Angle based on this:
                            - Range: -180 (Min) to 0 (Max).
                            - Fraction = Value / Max.
                            - Rotation = -180 + (Fraction * 180).
                             - If Fraction 0 => -180 deg (Left).
                             - If Fraction 1 => 0 deg (Right).
                             - If Fraction 0.5 => -90 deg (Up).
                        */}
                        <div
                            className="absolute bottom-0 left-1/2 w-[50%] h-0 origin-left flex items-center justify-start transition-transform duration-1000 ease-out"
                            style={{
                                // We use a container that pivots around the center (which is its left edge here).
                                // But wait, standard CSS rotation: positive is clockwise.
                                // 0 deg is 3 o'clock (Right).
                                // -180 deg is 9 o'clock (Left).
                                // So Rotation = -180 + (data.currentCal / MAX_VAL * 180).
                                transform: `rotate(${-180 + (Math.min(data.currentCal, MAX_VAL) / MAX_VAL) * 180}deg)`
                            }}
                        >
                            {/* The Needle Itself */}
                            {/* Since container rotates around its left edge (center of gauge),
                                 the needle should extend to the Right. 
                             */}
                            <div className="w-[90%] h-3 bg-orange-500 rounded-r-full relative shadow-sm"></div>

                            {/* Center Pivot Point */}
                            {/* Positioned at the left edge (pivot) */}
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-orange-500 rounded-full border-[3px] border-white shadow-md z-10 box-content"></div>
                        </div>
                    </div>
                </div>

                {/* Center Labels */}
                <div className="absolute inset-0 flex flex-col items-center pt-[35%] pointer-events-none">
                    <span className="text-4xl font-bold text-orange-500">{data.currentCal}</span>
                    <span className="text-sm font-medium text-slate-400">kcal</span>
                    <span className="text-xs text-slate-400 mt-1">Target: {data.targetCal} kcal</span>
                </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-400 mb-1">Calorie intake</span>
                    <span className="text-xl font-bold text-orange-500">+{data.remainingCal} <span className="text-xs font-normal text-slate-500">kcal</span></span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-400 mb-1">Average consumption</span>
                    <span className="text-xl font-bold text-orange-400">--- <span className="text-xs font-normal text-slate-500">kcal</span></span>
                </div>
            </div>
        </Card>
    )
}
