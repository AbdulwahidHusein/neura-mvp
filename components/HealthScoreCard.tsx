'use client'

import { useState } from 'react'

interface CategoryScore {
  category_id: string
  name: string
  max_points: number
  points_awarded: number
  metrics: string[]
}

interface Driver {
  metric_id: string
  label: string
  impact_points: number
  why_it_matters: string
  recommended_action: string
}

interface SubScore {
  metric_id: string
  name: string
  max_points: number
  points_awarded: number
  status: 'ok' | 'missing' | 'estimated'
  value: number | null
  formula: string
  inputs_used: string[]
}

interface HealthScoreData {
  schema_version: string
  generated_at: string
  scorecard: {
    raw_score: number
    confidence: 'high' | 'medium' | 'low'
    confidence_cap: number
    final_score: number
    grade: 'A' | 'B' | 'C' | 'D'
  }
  category_scores: {
    A: CategoryScore
    B: CategoryScore
    C: CategoryScore
    D: CategoryScore
    E: CategoryScore
  }
  subscores: Record<string, SubScore>
  drivers: {
    top_positive: Driver[]
    top_negative: Driver[]
  }
  data_quality: {
    signals: Array<{
      signal_id: string
      severity: 'info' | 'warning' | 'critical'
      message: string
    }>
    warnings: string[]
  }
}

interface HealthScoreCardProps {
  data: HealthScoreData | null
  isLoading?: boolean
  onRefresh?: () => void
}

const gradeConfig = {
  A: {
    label: 'Healthy',
    description: 'Your business is performing excellently with strong cash flow and low risks.',
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  B: {
    label: 'Healthy',
    description: 'Your business is performing well with stable cash flow and manageable risks. A few items need attention but nothing urgent.',
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  C: {
    label: 'At Risk',
    description: 'Your business needs attention. Cash flow challenges and some risks require monitoring.',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  D: {
    label: 'Critical',
    description: 'Your business requires immediate attention. Significant cash flow and risk concerns.',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
}

const confidenceConfig = {
  high: { label: 'High confidence' },
  medium: { label: 'Medium confidence' },
  low: { label: 'Low confidence' },
}

// Helper to get trend arrow for a score (relative to max)
function getTrendIcon(score: number, max: number) {
  const percentage = (score / max) * 100
  if (percentage >= 70) {
    return <span className="text-text-brand-tertiary-600">↗</span>
  } else if (percentage >= 50) {
    return <span className="text-text-quaternary-500">→</span>
  } else {
    return <span className="text-amber-500">↘</span>
  }
}

// Calculate runway months from score
function getRunwayMonths(score: number): number {
  // Approximate: higher score = more runway
  if (score >= 80) return 6
  if (score >= 60) return 4
  if (score >= 40) return 2
  return 1
}

export default function HealthScoreCard({ data, isLoading, onRefresh }: HealthScoreCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Loading skeleton matching Figma layout
  if (isLoading) {
    return (
      <div className="bg-bg-primary rounded-xl border border-border-secondary p-6 animate-pulse">
        {/* Badges skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 bg-bg-secondary rounded-full w-16"></div>
          <div className="h-6 bg-bg-secondary rounded-full w-32"></div>
        </div>
        {/* Title skeleton */}
        <div className="h-7 bg-bg-secondary rounded w-48 mb-4"></div>
        {/* Score box skeleton */}
        <div className="border-l-4 border-l-bg-secondary bg-bg-secondary-subtle rounded-lg p-5 mb-4">
          <div className="h-12 bg-bg-secondary rounded w-24 mb-3"></div>
          <div className="h-4 bg-bg-secondary rounded w-full mb-4"></div>
          <div className="flex gap-8 mb-4">
            <div className="flex-1">
              <div className="h-3 bg-bg-secondary rounded w-20 mb-2"></div>
              <div className="h-6 bg-bg-secondary rounded w-12"></div>
            </div>
            <div className="flex-1">
              <div className="h-3 bg-bg-secondary rounded w-16 mb-2"></div>
              <div className="h-6 bg-bg-secondary rounded w-12"></div>
            </div>
            <div className="flex-1">
              <div className="h-3 bg-bg-secondary rounded w-18 mb-2"></div>
              <div className="h-6 bg-bg-secondary rounded w-12"></div>
            </div>
          </div>
          <div className="h-4 bg-bg-secondary rounded w-3/4"></div>
        </div>
        {/* Footer skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-4 bg-bg-secondary rounded w-40"></div>
          <div className="h-9 bg-bg-secondary rounded w-28"></div>
        </div>
      </div>
    )
  }

  // Empty state
  if (!data) {
    return (
      <div className="bg-bg-primary rounded-xl border border-border-secondary p-6">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-utility-gray-200 text-text-quaternary-500">
            --
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-border-secondary text-text-quaternary-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            No data
          </span>
        </div>
        {/* Title */}
        <h2 className="text-xl font-semibold text-text-primary-900 mb-4">
          Business Health Score
        </h2>
        <div className="text-center py-8">
          <p className="text-text-quaternary-500 mb-4">
            No health score data available yet.
          </p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-bg-brand-solid text-text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium cursor-pointer"
            >
              Calculate Health Score
            </button>
          )}
        </div>
      </div>
    )
  }

  const { scorecard, category_scores = {}, drivers, data_quality } = data
  const grade = gradeConfig[scorecard?.grade] ?? gradeConfig.D
  const confidence = confidenceConfig[scorecard?.confidence] ?? confidenceConfig.low
  const runwayMonths = getRunwayMonths(scorecard.final_score)

  // Extract key metrics for the 3-box display (Cash, Revenue, Expenses from categories)
  // Default values handle case when health score hasn't been calculated yet
  const defaultScore = { points_awarded: 0, max_points: 1 }
  const cashScore = category_scores.A ?? defaultScore
  const profitabilityScore = category_scores.B ?? defaultScore
  const liquidityScore = category_scores.D ?? defaultScore

  return (
    <div className="bg-bg-primary rounded-xl border border-border-secondary p-6">
      {/* Badges Row - Figma 2.2 */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${grade.badgeClass}`}>
          {grade.label}
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-border-secondary text-text-secondary-700 bg-white dark:bg-bg-secondary">
          <svg className="w-3.5 h-3.5 text-text-brand-tertiary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {confidence.label}
        </span>
      </div>

      {/* Title - Figma 2.3 */}
      <h2 className="text-xl font-semibold text-text-primary-900 mb-4">
        Business Health Score
      </h2>

      {/* Score Box with Teal Left Border - Figma 2.4 */}
      <div className="border-l-4 border-l-text-brand-tertiary-600 bg-bg-secondary-subtle dark:bg-bg-secondary rounded-r-lg p-5 mb-4">
        {/* Large Score Display */}
        <div className="mb-3">
          <span className="text-5xl font-bold text-text-primary-900">
            {Math.round(scorecard.final_score)}
          </span>
          <span className="text-xl text-text-quaternary-500 ml-1">/100</span>
        </div>

        {/* Description */}
        <p className="text-sm text-text-secondary-700 mb-5">
          {grade.description}
        </p>

        {/* Three Metric Boxes - Centered as per Figma 2.4 */}
        <div className="flex justify-center gap-12 mb-5">
          <div className="text-center">
            <div className="text-xs text-text-quaternary-500 mb-1">Cash position</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-xl font-semibold text-text-primary-900">
                {Math.round((cashScore.points_awarded / cashScore.max_points) * 100)}
              </span>
              {getTrendIcon(cashScore.points_awarded, cashScore.max_points)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-text-quaternary-500 mb-1">Revenue</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-xl font-semibold text-text-primary-900">
                {Math.round((profitabilityScore.points_awarded / profitabilityScore.max_points) * 100)}
              </span>
              {getTrendIcon(profitabilityScore.points_awarded, profitabilityScore.max_points)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-text-quaternary-500 mb-1">Expenses</div>
            <div className="flex items-center justify-center gap-1">
              <span className="text-xl font-semibold text-text-primary-900">
                {Math.round((liquidityScore.points_awarded / liquidityScore.max_points) * 100)}
              </span>
              {getTrendIcon(liquidityScore.points_awarded, liquidityScore.max_points)}
            </div>
          </div>
        </div>

        {/* Runway Summary */}
        <p className="text-sm text-text-secondary-700">
          At your current burn rate, you have approximately {runwayMonths} months of runway remaining.
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-text-quaternary-500">
          <span>Updated daily</span>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 px-4 py-2 bg-bg-brand-solid text-text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium cursor-pointer"
        >
          View details
          <svg className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Expanded Details Section */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-border-secondary">
          {/* WHAT WE'RE SEEING - Figma 2.5 */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-primary-900 mb-3">
              WHAT WE'RE SEEING
            </h3>
            <ul className="space-y-2">
              {Object.entries(category_scores).slice(0, 3).map(([key, cat]) => (
                <li key={key} className="flex items-start gap-2 text-sm text-text-secondary-700">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-text-brand-tertiary-600"></span>
                  <span>{cat.name}: {Math.round((cat.points_awarded / cat.max_points) * 100)}% of target</span>
                </li>
              ))}
            </ul>
          </div>

          {/* WHY THIS MATTERS NOW - Figma 2.6 */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-primary-900 mb-3">
              WHY THIS MATTERS NOW
            </h3>
            <div className="bg-bg-secondary-subtle dark:bg-bg-secondary rounded-lg p-4">
              <p className="text-sm text-text-secondary-700">
                With {runwayMonths} months of runway, your cash position is {runwayMonths >= 4 ? 'stable for the near term' : 'tight'}. 
                {runwayMonths >= 4 
                  ? " This gives you time to plan without immediate pressure. However, it's worth monitoring closely if you're expecting any large expenses or if revenue becomes uncertain."
                  : " Consider reviewing your expenses and following up on outstanding receivables to improve your position."
                }
              </p>
            </div>
          </div>

          {/* WHAT TO DO NEXT - Figma 2.7 */}
          {drivers.top_negative.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-primary-900 mb-3">
                WHAT TO DO NEXT
              </h3>
              <ol className="space-y-2">
                {drivers.top_negative.slice(0, 3).map((driver, index) => (
                  <li key={driver.metric_id} className="flex items-start gap-3 text-sm text-text-secondary-700">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-text-brand-tertiary-600/10 text-text-brand-tertiary-600 text-xs font-semibold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span>{driver.recommended_action}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Category Breakdown */}
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-primary-900 mb-4">
            SCORE BREAKDOWN
          </h3>
          <div className="space-y-3 mb-6">
            {Object.entries(category_scores).map(([key, cat]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm text-text-secondary-700 w-44 truncate">
                  {cat.name}
                </span>
                <div className="flex-1 h-2 bg-bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-text-brand-tertiary-600 transition-all duration-500"
                    style={{ width: `${(cat.points_awarded / cat.max_points) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-text-quaternary-500 w-14 text-right">
                  {Math.round(cat.points_awarded)}/{cat.max_points}
                </span>
              </div>
            ))}
          </div>

          {/* Key Drivers */}
          {(drivers.top_positive.length > 0 || drivers.top_negative.length > 0) && (
            <>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-primary-900 mb-3">
                KEY DRIVERS
              </h3>
              <div className="space-y-2 mb-6">
                {drivers.top_negative.slice(0, 3).map((driver) => (
                  <div
                    key={driver.metric_id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-red-500">↓</span>
                    <span className="text-text-secondary-700">{driver.label}</span>
                    <span className="text-text-quaternary-500 text-xs">
                      ({Math.round(driver.impact_points)} pts)
                    </span>
                  </div>
                ))}
                {drivers.top_positive.slice(0, 3).map((driver) => (
                  <div
                    key={driver.metric_id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-text-brand-tertiary-600">↑</span>
                    <span className="text-text-secondary-700">{driver.label}</span>
                    <span className="text-text-quaternary-500 text-xs">
                      ({Math.round(driver.impact_points)} pts)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Data Quality Warnings */}
          {data_quality.warnings.length > 0 && (
            <div className="bg-[#fef3c7] dark:bg-[#78350f]/20 border border-[#fbbf24] dark:border-[#fbbf24]/40 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[#d97706] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-[#92400e] dark:text-[#fbbf24]">
                  {data_quality.warnings[0]}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
