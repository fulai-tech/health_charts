/**
 * Blood Pressure Feature Module
 *
 * Data pipeline: API → adapter → seal(membrane) → verify → unseal → component
 *
 * Hook architecture:
 *   useBPTrendData(dateRange) → SealedQueryResult<'bp', BPDomainModel>
 *   usePrefetchBPData()       → prefetch for instant navigation
 */

// Domain types
export type {
  BPStatus,
  TrendDirection,
  BPDataPoint,
  BPDistribution,
  BPSummary,
  BPComparison,
  BPDomainModel,
} from './types'

// Pipeline-integrated hooks
export {
  useBPTrendData,
  usePrefetchBPData,
  bpQueryKeys,
  type BPSealedResult,
  type DateRange,
} from './api'

// Adapter (pure transform, used internally by useSealedQuery.select)
export { adaptBPData } from './adapter'

// Components
export { BPSummaryCard } from './components/BPSummaryCard'
export { BPTrendyReportCard } from './components/BPTrendyReportCard'
export { BPStatisticsCard } from './components/BPStatisticsCard'
export { BPCompareCard } from './components/BPCompareCard'
export { BPWeeklyOverviewCard } from './components/BPWeeklyOverviewCard'

