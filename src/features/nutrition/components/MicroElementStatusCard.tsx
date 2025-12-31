import { Card } from '@/components/ui/card'
import type { MicroElementData } from '../types'
import { LayoutGrid } from 'lucide-react'

interface MicroElementStatusCardProps {
    data?: MicroElementData[]
    className?: string
}

export const MicroElementStatusCard = ({ data, className }: MicroElementStatusCardProps) => {
    if (!data) return null

    return (
        <Card className={`${className} p-5`}>
            <div className="flex items-center gap-2 mb-4">
                <LayoutGrid className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-semibold text-slate-800">Micro-element status</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {data.map((item, index) => {
                    // Simple status color logic
                    const statusColor = item.status === 'normal' ? 'bg-green-100 text-green-600' : (item.status === 'low' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600')
                    const statusLabel = item.status === 'normal' ? 'Normal' : (item.status === 'low' ? 'Insufficient' : 'Excess')
                    const barColor = item.status === 'normal' ? '#86EFAC' : (item.status === 'low' ? '#93C5FD' : '#FB923D')

                    // Calculate a simple position for the indicator bar (Mock visual)
                    // If low: 20%, Normal: 50%, High: 80%
                    const barWidth = item.status === 'low' ? '30%' : (item.status === 'normal' ? '60%' : '90%')

                    return (
                        <div key={index} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${statusColor}`}>
                                    {statusLabel}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-xl font-bold text-slate-800">{item.value}</span>
                                <span className="text-xs text-slate-400">{item.unit}</span>
                            </div>

                            {/* Visual Range Indicator */}
                            <div className="relative h-1.5 bg-slate-200 rounded-full w-full overflow-hidden">
                                <div
                                    className="absolute h-full rounded-full"
                                    style={{ width: barWidth, backgroundColor: barColor }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                <span>Range</span>
                                <span>{item.range[0]}-{item.range[1]}</span>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-xl text-center text-sm font-medium text-blue-600">
                View all elements &gt;
            </div>
        </Card>
    )
}
