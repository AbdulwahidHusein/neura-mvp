'use client'

interface DashboardErrorProps {
    onRetry?: () => void
    supportLink?: string
}

export function DashboardError({ onRetry, supportLink }: DashboardErrorProps) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            {/* Responsive: full width on mobile, max 768px on desktop */}
            <div className="w-full max-w-3xl bg-bg-primary border border-border-secondary rounded-2xl px-8 md:px-16 py-10 text-center shadow-lg">
                {/* Error Icon */}
                <div className="flex justify-center mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-text-primary-900 mb-3">
                    Unable to load dashboard
                </h2>

                {/* Description */}
                <p className="text-sm text-text-secondary-700 mb-8 leading-relaxed">
                    We couldn't connect to our servers. This is usually temporary — try again in a moment.
                </p>

                {/* Try Again Button */}
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-block rounded-lg bg-bg-brand-solid px-8 py-2.5 text-sm font-semibold text-text-white transition-colors hover:opacity-90 cursor-pointer mb-6"
                    >
                        Try again
                    </button>
                )}

                {/* Contact Support Link */}
                <p className="text-sm text-text-quaternary-500">
                    Still not working?{' '}
                    <a
                        href={supportLink || 'mailto:support@neura.com'}
                        className="text-text-brand-tertiary-600 hover:underline"
                    >
                        Contact Support
                    </a>
                </p>
            </div>
        </div>
    )
}
