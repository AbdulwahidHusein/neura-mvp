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

interface InsightsStore {
  insights: Insight[]
  pagination: Pagination
  isLoading: boolean
  error: string | null
  currentPage: number
  severityFilter: string
  statusFilter: string
  
  fetchInsights: (page?: number, severity?: string) => Promise<void>
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

  fetchInsights: async (page?: number, severity?: string) => {
    const currentPage = page ?? get().currentPage
    const severityFilter = severity ?? get().severityFilter
    
    set({ isLoading: true, error: null })
    try {
      const { apiRequest } = await import('@/lib/api/client')
      
      // Build query params - fetch 10 per page from backend
      const params = new URLSearchParams()
      params.set('page', String(currentPage))
      params.set('limit', '10')
      if (severityFilter !== 'all') {
        params.set('severity', severityFilter)
      }
      
      const response = await apiRequest<InsightsResponse>(`/api/insights/?${params.toString()}`)
      set({ 
        insights: response.insights, 
        pagination: response.pagination,
        currentPage,
        isLoading: false 
      })
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to load insights', 
        isLoading: false 
      })
    }
  },

  setPage: (page: number) => {
    set({ currentPage: page })
    get().fetchInsights(page)
  },

  setSeverityFilter: (severity: string) => {
    set({ severityFilter: severity, currentPage: 1 })
    get().fetchInsights(1, severity)
  },

  setStatusFilter: (status: string) => {
    set({ statusFilter: status })
  },

  clearInsights: () => set({ 
    insights: [], 
    pagination: { total: 0, page: 1, limit: 10, total_pages: 0 },
    currentPage: 1,
  }),
}))
