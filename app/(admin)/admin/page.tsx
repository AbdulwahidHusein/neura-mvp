'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAdminStore, OrganizationSummary, FeedbackItem, UserSummary } from '@/stores/adminStore'
import { Skeleton } from '@/components/Skeleton'

type TabId = 'organizations' | 'feedback' | 'users'

// Reusable components
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    IDLE: 'bg-utility-gray-200 text-text-secondary-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    COMPLETED: 'bg-bg-success-secondary text-icon-success',
    FAILED: 'bg-bg-error-secondary text-icon-error',
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status] || styles.IDLE}`}>{status}</span>
}

function StatCard({ label, value, subtext }: { label: string; value: number | string; subtext?: string }) {
  return (
    <div className="rounded-xl border border-border-secondary bg-bg-secondary p-4">
      <p className="text-sm text-text-quaternary-500">{label}</p>
      <p className="text-2xl font-semibold text-text-primary-900 mt-1">{value}</p>
      {subtext && <p className="text-xs text-icon-error mt-1">{subtext}</p>}
    </div>
  )
}

function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null
  return (
    <div className="px-4 py-3 border-t border-border-secondary flex items-center justify-between">
      <p className="text-sm text-text-quaternary-500">Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="px-3 py-1.5 text-sm rounded-lg border border-border-secondary text-text-secondary-700 hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1.5 text-sm rounded-lg border border-border-secondary text-text-secondary-700 hover:bg-bg-secondary disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
      </div>
    </div>
  )
}

// Row components
function OrganizationRow({ org }: { org: OrganizationSummary }) {
  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'
  return (
    <tr className="border-b border-border-secondary hover:bg-bg-secondary transition-colors">
      <td className="py-3 px-4">
        <p className="text-sm font-medium text-text-primary-900">{org.name}</p>
        <p className="text-xs text-text-quaternary-500">{org.user_email}</p>
      </td>
      <td className="py-3 px-4"><StatusBadge status={org.sync_status} /></td>
      <td className="py-3 px-4"><span className={`text-sm ${org.has_xero_connection ? 'text-icon-success' : 'text-text-quaternary-500'}`}>{org.has_xero_connection ? 'Connected' : 'Not connected'}</span></td>
      <td className="py-3 px-4 text-sm text-text-secondary-700">{formatDate(org.last_sync_at)}</td>
      <td className="py-3 px-4 text-sm text-text-quaternary-500">{formatDate(org.created_at)}</td>
    </tr>
  )
}

function FeedbackRow({ feedback }: { feedback: FeedbackItem }) {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(feedback.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  return (
    <>
      <tr className="border-b border-border-secondary hover:bg-bg-secondary transition-colors cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <svg className={`h-4 w-4 text-text-quaternary-500 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <div>
              <p className="text-sm font-medium text-text-primary-900 truncate max-w-[280px]">{feedback.insight_title}</p>
              <p className="text-xs text-text-quaternary-500">{feedback.insight_type}</p>
            </div>
          </div>
        </td>
        <td className="py-3 px-4">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${feedback.is_helpful ? 'bg-bg-success-secondary text-icon-success' : 'bg-bg-error-secondary text-icon-error'}`}>
            {feedback.is_helpful ? 'Helpful' : 'Not Helpful'}
          </span>
        </td>
        <td className="py-3 px-4">{feedback.comment ? <p className="text-sm text-text-secondary-700 truncate max-w-[220px]">{feedback.comment}</p> : <span className="text-sm text-text-quaternary-500 italic">No comment</span>}</td>
        <td className="py-3 px-4 text-sm text-text-quaternary-500">{date}</td>
      </tr>
      {expanded && (
        <tr className="bg-bg-secondary">
          <td colSpan={4} className="px-4 py-4">
            <div className="ml-6 space-y-3">
              <div><p className="text-xs font-semibold text-text-quaternary-500 uppercase mb-1">Insight Title</p><p className="text-sm text-text-primary-900">{feedback.insight_title}</p></div>
              <div><p className="text-xs font-semibold text-text-quaternary-500 uppercase mb-1">Comment</p>{feedback.comment ? <p className="text-sm text-text-secondary-700 bg-bg-primary rounded-lg p-3 border border-border-secondary">{feedback.comment}</p> : <p className="text-sm text-text-quaternary-500 italic">No comment</p>}</div>
              <div className="flex gap-6 pt-2 border-t border-border-secondary text-xs text-text-tertiary-600">
                <span>ID: {feedback.insight_id}</span>
                <span>Org: {feedback.organization_name}</span>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function UserRow({ user, onRoleChange }: { user: UserSummary; onRoleChange: (role: 'admin' | 'user') => void }) {
  const [updating, setUpdating] = useState(false)
  const toggle = async () => { setUpdating(true); await onRoleChange(user.role === 'admin' ? 'user' : 'admin'); setUpdating(false) }
  return (
    <tr className="border-b border-border-secondary hover:bg-bg-secondary transition-colors">
      <td className="py-3 px-4"><p className="text-sm font-medium text-text-primary-900">{user.email}</p></td>
      <td className="py-3 px-4"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-utility-gray-200 text-text-secondary-700'}`}>{user.role === 'admin' ? 'Admin' : 'User'}</span></td>
      <td className="py-3 px-4 text-sm text-text-secondary-700">{user.organization_name || '-'}</td>
      <td className="py-3 px-4">
        <button onClick={toggle} disabled={updating} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${user.role === 'admin' ? 'border border-border-secondary text-text-secondary-700 hover:bg-bg-secondary' : 'bg-brand-solid text-text-white hover:opacity-90'}`}>
          {updating ? '...' : user.role === 'admin' ? 'Demote' : 'Make Admin'}
        </button>
      </td>
    </tr>
  )
}

// Main page
export default function AdminDashboardPage() {
  const { stats, organizations, feedback, users, isLoading, fetchStats, fetchOrganizations, fetchFeedback, fetchUsers, updateUserRole } = useAdminStore()
  const [tab, setTab] = useState<TabId>('organizations')
  const [orgPage, setOrgPage] = useState(1)
  const [feedbackPage, setFeedbackPage] = useState(1)
  const [userPage, setUserPage] = useState(1)
  const limit = 20

  // Fetch stats once on mount
  useEffect(() => { fetchStats() }, [fetchStats])

  // Fetch tab data only when tab is active
  useEffect(() => {
    if (tab === 'organizations' && !organizations.loaded) fetchOrganizations(limit, 0)
    if (tab === 'feedback') fetchFeedback(limit, (feedbackPage - 1) * limit)
    if (tab === 'users' && !users.loaded) fetchUsers(limit, 0)
  }, [tab, feedbackPage, organizations.loaded, users.loaded, fetchOrganizations, fetchFeedback, fetchUsers])

  if (isLoading.stats && !stats) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div></div>

  const tabClass = (t: TabId) => `pb-3 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-brand-solid text-brand-600' : 'border-transparent text-text-quaternary-500 hover:text-text-secondary-700'}`

  return (
    <div className="space-y-8">
      {/* Back to overview */}
      <Link
        href="/overview"
        className="inline-flex items-center gap-2 text-sm text-text-quaternary-500 hover:text-text-primary-900 transition-colors cursor-pointer"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to overview
      </Link>

      <div>
        <h1 className="text-display-xs font-bold text-text-primary-900">Admin Dashboard</h1>
        <p className="text-text-quaternary-500 mt-1">Platform overview and management</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Organizations" value={stats.total_organizations} />
          <StatCard label="Xero Connected" value={stats.active_xero_connections} />
          <StatCard label="Syncs Running" value={stats.syncs_in_progress} />
          <StatCard label="Failed Syncs" value={stats.failed_syncs} subtext={stats.failed_syncs > 0 ? 'Needs attention' : undefined} />
        </div>
      )}

      <div className="border-b border-border-secondary">
        <nav className="flex gap-8">
          <button onClick={() => setTab('organizations')} className={tabClass('organizations')}>Organizations</button>
          <button onClick={() => setTab('feedback')} className={tabClass('feedback')}>Feedback</button>
          <button onClick={() => setTab('users')} className={tabClass('users')}>Users</button>
        </nav>
      </div>

      {/* Organizations Tab */}
      {tab === 'organizations' && (
        <div className="rounded-xl border border-border-secondary bg-bg-primary overflow-hidden">
          {isLoading.orgs ? <div className="p-8"><Skeleton className="h-48" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-secondary">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-quaternary-500 uppercase">Organization</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-quaternary-500 uppercase">Sync Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-quaternary-500 uppercase">Xero</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-quaternary-500 uppercase">Last Sync</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-quaternary-500 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.items.map(org => <OrganizationRow key={org.id} org={org} />)}
                  {organizations.items.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-text-quaternary-500">No organizations found</td></tr>}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={orgPage} totalPages={Math.ceil(organizations.total / limit)} onPageChange={p => { setOrgPage(p); fetchOrganizations(limit, (p - 1) * limit) }} />
        </div>
      )}

      {/* Feedback Tab */}
      {tab === 'feedback' && (
        <div className="space-y-6">
          {feedback.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Feedback" value={feedback.stats.total_feedback} />
              <StatCard label="Helpful" value={feedback.stats.helpful_count} />
              <StatCard label="Not Helpful" value={feedback.stats.not_helpful_count} />
              <StatCard label="Helpful Rate" value={`${feedback.stats.helpful_percentage}%`} />
            </div>
          )}
          <div className="rounded-xl border border-border-secondary bg-bg-primary overflow-hidden">
            {isLoading.feedback ? <div className="p-8"><Skeleton className="h-48" /></div> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-bg-secondary">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-medium text-text-quaternary-500 uppercase">Insight <span className="normal-case font-normal text-text-tertiary-600">(click to expand)</span></th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-text-quaternary-500 uppercase">Rating</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-text-quaternary-500 uppercase">Comment</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-text-quaternary-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedback.items.map(f => <FeedbackRow key={f.id} feedback={f} />)}
                    {feedback.items.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-text-quaternary-500">No feedback yet</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination page={feedbackPage} totalPages={Math.ceil(feedback.total / limit)} onPageChange={setFeedbackPage} />
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="rounded-xl border border-border-secondary bg-bg-primary overflow-hidden">
          {isLoading.users ? <div className="p-8"><Skeleton className="h-48" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-secondary">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-quaternary-500 uppercase">Email</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-quaternary-500 uppercase">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-quaternary-500 uppercase">Organization</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-text-quaternary-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.items.map(u => <UserRow key={u.id} user={u} onRoleChange={role => updateUserRole(u.id, role)} />)}
                  {users.items.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-text-quaternary-500">No users found</td></tr>}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={userPage} totalPages={Math.ceil(users.total / limit)} onPageChange={p => { setUserPage(p); fetchUsers(limit, (p - 1) * limit) }} />
        </div>
      )}
    </div>
  )
}
