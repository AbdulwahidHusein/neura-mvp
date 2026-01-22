'use client'

import { useState } from 'react'
import { apiRequest } from '@/lib/api/client'

interface XeroConnectModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function XeroConnectModal({ isOpen, onClose }: XeroConnectModalProps) {
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    try {
      setConnecting(true)
      // Fetch the authorization URL from backend (same logic as settings page)
      const response = await apiRequest<{ authorization_url: string; state: string }>('/integrations/xero/connect')
      // Redirect to Xero authorization page
      window.location.href = response.authorization_url
    } catch (err) {
      setConnecting(false)
      // Error will be handled by backend redirect
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-[440px] bg-bg-primary border border-border-secondary rounded-2xl flex flex-col shadow-xl"
      >
        {/* Content wrapper with padding */}
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-text-brand-tertiary-600/10">
              <svg
                className="h-6 w-6 text-text-brand-tertiary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-text-quaternary-500 hover:text-text-primary-900 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Title & Subtitle */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary-900">Connect to Xero</h2>
            <p className="mt-1.5 text-base text-text-secondary-700">
              Securely connect your Xero to generate cash insights.
            </p>
          </div>

          {/* WHAT HAPPENS Section */}
          <div className="mb-7">
            <h3 className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-text-quaternary-500">
              WHAT HAPPENS
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-text-brand-tertiary-600">
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[15px] text-text-secondary-700">
                  We read your Xero data to generate insights.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-text-brand-tertiary-600">
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[15px] text-text-secondary-700">
                  We don't change anything in Xero.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-text-brand-tertiary-600">
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[15px] text-text-secondary-700">
                  Disconnect anytime.
                </span>
              </li>
            </ul>
          </div>

          {/* WHAT WE ACCESS Section */}
          <div className="mb-7">
            <h3 className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-text-quaternary-500">
              WHAT WE ACCESS
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-text-brand-tertiary-600/30 bg-text-brand-tertiary-600/10 px-3.5 py-1.5 text-[15px] font-medium text-text-brand-tertiary-600">
                Bank transactions
              </span>
              <span className="rounded-full border border-text-brand-tertiary-600/30 bg-text-brand-tertiary-600/10 px-3.5 py-1.5 text-[15px] font-medium text-text-brand-tertiary-600">
                Invoices
              </span>
              <span className="rounded-full border border-text-brand-tertiary-600/30 bg-text-brand-tertiary-600/10 px-3.5 py-1.5 text-[15px] font-medium text-text-brand-tertiary-600">
                Bills
              </span>
              <span className="rounded-full border border-text-brand-tertiary-600/30 bg-text-brand-tertiary-600/10 px-3.5 py-1.5 text-[15px] font-medium text-text-brand-tertiary-600">
                Contacts
              </span>
            </div>
          </div>

          {/* Connect Button */}
          <div className="space-y-3">
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full rounded-full bg-brand-solid px-6 py-3.5 text-base font-semibold text-text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {connecting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </span>
              ) : (
                'Connect Xero'
              )}
            </button>
            <p className="text-center text-sm text-text-quaternary-500">
              Estimated time: 30–60 seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
