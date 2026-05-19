import { Logo } from './Logo'
import ThemeToggle from './ThemeToggle'

export default function Navbar({ onMenuToggle, totalSchemes, mobileMenuOpen, isLoading = false }) {
  return (
    <header className="z-30 flex h-[var(--navbar-height)] shrink-0 items-center border-b border-gray-200 bg-white px-3 dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-surface)] sm:px-5">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-100 lg:hidden dark:border-[color:var(--app-border)] dark:text-slate-300 dark:hover:bg-white/5"
            aria-label="Open regions menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="regions-sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Logo className="shrink-0" />

          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-gray-900 dark:text-white sm:text-base">
              India Cybersecurity &amp; AI Schemes
            </h1>
            <p className="hidden text-xs text-gray-500 sm:block dark:text-slate-400">Official Government Directory</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 sm:px-3 dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)]"
            aria-label={isLoading ? 'Loading scheme count' : `${totalSchemes?.toLocaleString() ?? 0} verified schemes`}
          >
            {isLoading ? (
              <span className="skeleton-pulse inline-block h-4 w-8 rounded bg-gray-200 dark:bg-white/10" aria-hidden="true" />
            ) : (
              <span className="text-xs font-bold tabular-nums text-primary-700 dark:text-primary-400">
                {totalSchemes?.toLocaleString() ?? 0}
              </span>
            )}
            <span className="hidden text-xs text-gray-500 sm:inline dark:text-slate-400">Verified</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
