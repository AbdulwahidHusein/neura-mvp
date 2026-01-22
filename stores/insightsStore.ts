import { create } from 'zustand'
import { Insight } from '@/stores/overviewStore'

interface Pagination {
  total: number
  page: number
  limit: number
  total_pages: number
}

interface InsightsResponse {
  insights: Insight[]
  pagination: Pagination
  calculated_at: string | null
}

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000

interface InsightsStore {
  insights: Insight[]
  pagination: Pagination
  isLoading: boolean
  error: string | null
  currentPage: number
  severityFilter: string
  statusFilter: string
  lastFetched: number | null

  fetchInsights: (forceRefresh?: boolean) => Promise<void>
  setPage: (page: number) => void
  setSeverityFilter: (severity: string) => void
  setStatusFilter: (status: string) => void
  clearInsights: () => void
}

export const useInsightsStore = create<InsightsStore>((set, get) => ({
  insights: [],
  pagination: { total: 0, page: 1, limit: 10, total_pages: 0 },
  isLoading: false,
  error: null,
  currentPage: 1,
  severityFilter: 'all',
  statusFilter: 'all',
  lastFetched: null,

  fetchInsights: async (forceRefresh = false) => {
    const state = get()

    // Return cached data if still valid and not forcing refresh
    if (!forceRefresh && state.insights.length > 0 && state.lastFetched) {
      const age = Date.now() - state.lastFetched
      if (age < CACHE_TTL) {
        return // Use cached data
      }
    }

    set({ isLoading: true, error: null })
    try {
      const { apiRequest } = await import('@/lib/api/client')

      // Build query params
      const params = new URLSearchParams()
      params.set('page', String(state.currentPage))
      params.set('limit', '10')
      if (state.severityFilter !== 'all') {
        params.set('severity', state.severityFilter)
      }

      const response = await apiRequest<InsightsResponse>(`/api/insights/?${params.toString()}`)
      set({
        insights: response.insights,
        pagination: response.pagination,
        isLoading: false,
        lastFetched: Date.now(),
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load insights',
        isLoading: false
      })
    }
  },

  setPage: (page: number) => {
    set({ currentPage: page, lastFetched: null }) // Invalidate cache
    get().fetchInsights(true)
  },

  setSeverityFilter: (severity: string) => {
    set({ severityFilter: severity, currentPage: 1, lastFetched: null }) // Invalidate cache
    get().fetchInsights(true)
  },

  setStatusFilter: (status: string) => {
    set({ statusFilter: status })
  },

  clearInsights: () => set({
    insights: [],
    pagination: { total: 0, page: 1, limit: 10, total_pages: 0 },
    currentPage: 1,
    lastFetched: null,
  }),
}))

