'use client'

import { Insight } from '@/stores/overviewStore'
import { formatDateWithAt } from '@/lib/utils/formatDate'

interface WatchCardProps {
  insight: Insight
  isExpanded: boolean
  onExpand: () => void
  onResolve: () => void
  onFeedback: (isPositive: boolean) => void
  calculatedAt: string | null
  isLoading?: boolean
}

export default function WatchCard({
  insight,
  isExpanded,
  onExpand,
  onResolve,
  onFeedback,
  calculatedAt,
  isLoading = false,
}: WatchCardProps) {
  // Extract timeframe from supporting numbers (e.g., "Days until tight ~12")
  const timeframe = insight.supporting_numbers.find(n => 
    n.label.toLowerCase().includes('day') || n.label.toLowerCase().includes('timeframe')
  )

  // Extract financial detail badge (e.g., "+$2,400 vs average")
  const financialDetail = insight.supporting_numbers.find(n => 
    n.label.toLowerCase().includes('vs') || 
    n.label.toLowerCase().includes('average') ||
    n.label.toLowerCase().includes('change') ||
    n.label.toLowerCase().includes('difference')
  )

  // Determine INPUTS USED based on insight type and data notes
  const getInputsUsed = (): string[] => {
    const inputs: string[] = []
    const insightType = insight.insight_type.toLowerCase()
    const dataNotes = (insight.data_notes || '').toLowerCase()

    // Always include bank transactions for cash-related insights
    if (insightType.includes('cash') || insightType.includes('runway') || insightType.includes('squeeze')) {
      inputs.push('Bank transactions')
    }

    // Add based on insight type
    if (insightType.includes('receivable') || dataNotes.includes('invoice')) {
      inputs.push('Invoices')
    }
    if (insightType.includes('expense') || insightType.includes('bill') || dataNotes.includes('bill')) {
      inputs.push('Bills')
    }
    if (insightType.includes('profitability') || dataNotes.includes('trial balance')) {
      inputs.push('Trial Balance')
    }

    // Default inputs if none found
    if (inputs.length === 0) {
      inputs.push('Bank transactions', 'Invoices', 'Bills')
    }

    return inputs
  }

  const inputsUsed = getInputsUsed()

  return (
    <div className="rounded-md border border-border-secondary bg-bg-secondary-subtle dark:bg-bg-secondary p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-[#f59e0b] px-2 py-0.5 text-xs font-semibold text-white">
              WATCH
            </span>
            <span className="rounded-full border border-border-secondary bg-bg-secondary-subtle dark:bg-bg-secondary px-2 py-0.5 text-xs text-text-primary-900">
              {insight.confidence_level === 'high' ? 'High' : insight.confidence_level === 'medium' ? 'Medium' : 'Low'} confidence
            </span>
          </div>
          <h3 className="mb-1 break-words text-sm font-semibold text-text-primary-900">{insight.title}</h3>
          {financialDetail && (
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-border-secondary bg-bg-secondary-subtle dark:bg-bg-secondary px-2 py-0.5 text-xs font-medium text-text-primary-900">
                <span>💰</span>
                <span>{typeof financialDetail.value === 'number' 
                  ? `${financialDetail.value >= 0 ? '+' : ''}$${Math.abs(financialDetail.value).toLocaleString()} vs average`
                  : `${financialDetail.value} vs average`}
                </span>
              </span>
            </div>
          )}
          <p className="mb-3 break-words text-sm leading-relaxed text-text-secondary-700">{insight.summary}</p>
          
          {!isExpanded && (
            <button
              onClick={onExpand}
              className="flex items-center gap-1 text-sm text-text-brand-tertiary-600 hover:underline cursor-pointer"
            >
              How we worked this out
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {timeframe && (
            <div className="flex items-center gap-1.5 text-sm text-text-quaternary-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{typeof timeframe.value === 'number' ? `~${timeframe.value} days` : timeframe.value}</span>
            </div>
          )}
          <button
            onClick={onResolve}
            disabled={isLoading}
            className="rounded-md border border-border-secondary bg-bg-secondary-subtle dark:bg-bg-secondary px-3 py-1.5 text-sm font-medium text-text-primary-900 transition-colors hover:bg-bg-secondary whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resolving...' : 'Resolve'}
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onFeedback(true)}
              className="rounded p-1 text-text-quaternary-500 hover:text-text-primary-900 hover:bg-bg-secondary transition-colors cursor-pointer"
              title="Helpful"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
              </svg>
            </button>
            <button
              onClick={() => onFeedback(false)}
              className="rounded p-1 text-text-quaternary-500 hover:text-text-primary-900 hover:bg-bg-secondary transition-colors cursor-pointer"
              title="Not helpful"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-border-secondary pt-4">
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-primary-900">
              WHAT WE'RE SEEING
            </h4>
            <ul className="space-y-1 text-sm leading-relaxed text-text-secondary-700">
              {insight.why_it_matters.split('\n').map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-text-primary-900"></span>
                  <span className="break-words">{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-primary-900">
              INPUTS USED
            </h4>
            <div className="flex flex-wrap gap-2">
              {inputsUsed.map((input, i) => (
                <span
                  key={i}
                  className="rounded-md border border-border-secondary/40 bg-white dark:bg-bg-secondary-subtle px-2 py-1 text-xs font-medium text-text-primary-900"
                >
                  {input}
                </span>
              ))}
            </div>
          </div>

          {/* Data Notes Warning */}
          {insight.data_notes && (
            <div className="rounded-md bg-[#fef3c7] dark:bg-[#78350f]/20 border border-[#fbbf24] dark:border-[#fbbf24]/40 p-3">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 shrink-0 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-[#92400e] dark:text-[#fbbf24]">{insight.data_notes}</p>
              </div>
            </div>
          )}

          {insight.supporting_numbers.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-primary-900">
                KEY NUMBERS
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {insight.supporting_numbers.map((num, i) => (
                  <div key={i}>
                    <div className="text-xs text-text-quaternary-500">{num.label}</div>
                    <div className="text-sm font-semibold text-text-primary-900">{num.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border-secondary pt-4 text-xs text-text-quaternary-500">
            <span>Based on last 90 days</span>
            <span>Updated {formatDateWithAt(calculatedAt)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
