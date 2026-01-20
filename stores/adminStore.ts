import { create } from 'zustand'

// Types
export interface OrganizationSummary {
  id: string
  name: string
  user_email: string
  created_at: string
  sync_status: 'IDLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  sync_step: string | null
  last_sync_error: string | null
  has_xero_connection: boolean
  last_sync_at: string | null
}

export interface AdminDashboardStats {
  total_organizations: number
  active_xero_connections: number
  syncs_in_progress: number
  failed_syncs: number
}

export interface FeedbackItem {
  id: string
  insight_id: string
  insight_type: string
  insight_title: string
  is_helpful: boolean
  comment: string | null
  user_id: string
  organization_id: string
  created_at: string
}

export interface OverallFeedbackStats {
  total_feedback: number
  helpful_count: number
  not_helpful_count: number
  helpful_percentage: number
}

export interface UserSummary {
  id: string
  email: string
  role: 'user' | 'admin'
  organization_name: string | null
  created_at: string
}

// Store
interface AdminStore {
  // Stats (lightweight, fetch once)
  stats: AdminDashboardStats | null
  
  // Paginated data
  organizations: { items: OrganizationSummary[]; total: number; loaded: boolean }
  feedback: { items: FeedbackItem[]; total: number; loaded: boolean; stats: OverallFeedbackStats | null }
  users: { items: UserSummary[]; total: number; loaded: boolean }
  
  // Loading states
  isLoading: { stats: boolean; orgs: boolean; feedback: boolean; users: boolean }
  
  // Actions
  fetchStats: () => Promise<void>
  fetchOrganizations: (limit?: number, offset?: number) => Promise<void>
  fetchFeedback: (limit?: number, offset?: number) => Promise<void>
  fetchUsers: (limit?: number, offset?: number) => Promise<void>
  updateUserRole: (userId: string, role: 'admin' | 'user') => Promise<boolean>
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  stats: null,
  organizations: { items: [], total: 0, loaded: false },
  feedback: { items: [], total: 0, loaded: false, stats: null },
  users: { items: [], total: 0, loaded: false },
  isLoading: { stats: false, orgs: false, feedback: false, users: false },

  fetchStats: async () => {
    if (get().stats) return // Already loaded
    set(s => ({ isLoading: { ...s.isLoading, stats: true } }))
    try {
      const { apiRequest } = await import('@/lib/api/client')
      const data = await apiRequest<{ stats: AdminDashboardStats }>('/api/admin/dashboard')
      set(s => ({ stats: data.stats, isLoading: { ...s.isLoading, stats: false } }))
    } catch {
      set(s => ({ isLoading: { ...s.isLoading, stats: false } }))
    }
  },

  fetchOrganizations: async (limit = 50, offset = 0) => {
    if (get().organizations.loaded && offset === 0) return // Already loaded first page
    set(s => ({ isLoading: { ...s.isLoading, orgs: true } }))
    try {
      const { apiRequest } = await import('@/lib/api/client')
      const data = await apiRequest<{ organizations: OrganizationSummary[]; total: number }>(
        `/api/admin/organizations?limit=${limit}&offset=${offset}`
      )
      set(s => ({
        organizations: { items: data.organizations, total: data.total, loaded: true },
        isLoading: { ...s.isLoading, orgs: false },
      }))
    } catch {
      set(s => ({ isLoading: { ...s.isLoading, orgs: false } }))
    }
  },

  fetchFeedback: async (limit = 20, offset = 0) => {
    set(s => ({ isLoading: { ...s.isLoading, feedback: true } }))
    try {
      const { apiRequest } = await import('@/lib/api/client')
      const [listData, summaryData] = await Promise.all([
        apiRequest<{ feedback: FeedbackItem[]; total: number }>(`/api/feedback/admin?limit=${limit}&offset=${offset}`),
        !get().feedback.stats ? apiRequest<{ overall_stats: OverallFeedbackStats }>('/api/feedback/admin/summary') : Promise.resolve(null),
      ])
      set(s => ({
        feedback: {
          items: listData.feedback,
          total: listData.total,
          loaded: true,
          stats: summaryData?.overall_stats ?? s.feedback.stats,
        },
        isLoading: { ...s.isLoading, feedback: false },
      }))
    } catch {
      set(s => ({ isLoading: { ...s.isLoading, feedback: false } }))
    }
  },

  fetchUsers: async (limit = 50, offset = 0) => {
    if (get().users.loaded && offset === 0) return // Already loaded first page
    set(s => ({ isLoading: { ...s.isLoading, users: true } }))
    try {
      const { apiRequest } = await import('@/lib/api/client')
      const data = await apiRequest<{ users: UserSummary[]; total: number }>(`/api/admin/users?limit=${limit}&offset=${offset}`)
      set(s => ({
        users: { items: data.users, total: data.total ?? data.users.length, loaded: true },
        isLoading: { ...s.isLoading, users: false },
      }))
    } catch {
      set(s => ({ isLoading: { ...s.isLoading, users: false } }))
    }
  },

  updateUserRole: async (userId: string, role: 'admin' | 'user') => {
    try {
      const { apiRequest } = await import('@/lib/api/client')
      await apiRequest(`/api/admin/users/${userId}/role?role=${role}`, { method: 'POST' })
      set(s => ({ users: { ...s.users, items: s.users.items.map(u => u.id === userId ? { ...u, role } : u) } }))
      return true
    } catch {
      return false
    }
  },
}))
