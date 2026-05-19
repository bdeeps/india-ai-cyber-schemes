import { memo, useState } from 'react'

const CATEGORY_STYLES = {
  ai: {
    badge: 'bg-blue-100 text-blue-800 dark:bg-violet-500/15 dark:text-violet-300',
    accent: 'border-l-blue-600 dark:border-l-violet-500',
    label: 'AI',
    glow: 'card-glow-ai',
  },
  cybersecurity: {
    badge: 'bg-teal-100 text-teal-800 dark:bg-cyan-500/15 dark:text-cyan-300',
    accent: 'border-l-teal-600 dark:border-l-cyan-500',
    label: 'Cybersecurity',
    glow: 'card-glow-cyber',
  },
}

const DESCRIPTION_LIMIT = 160

function SchemeCard({ scheme, index = 0 }) {
  const [expanded, setExpanded] = useState(false)
  const style = CATEGORY_STYLES[scheme.category] ?? CATEGORY_STYLES.ai
  const isLong = scheme.description.length > DESCRIPTION_LIMIT
  const displayDescription =
    expanded || !isLong ? scheme.description : `${scheme.description.slice(0, DESCRIPTION_LIMIT).trim()}…`
  const sourceDomain = scheme.sourceDomain ?? scheme.sourceUrl

  return (
    <article
      className={`group animate-fade-in-up flex h-full flex-col rounded-xl border border-l-4 border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)] dark:shadow-sm dark:hover:shadow-lg ${style.accent} ${style.glow}`}
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms`, opacity: 0 }}
      aria-labelledby={`scheme-title-${scheme.id}`}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <h3
          id={`scheme-title-${scheme.id}`}
          className="flex-1 text-sm font-semibold leading-snug text-gray-900 sm:text-base dark:text-white"
        >
          {scheme.title}
        </h3>
        <div className="flex shrink-0 flex-wrap gap-1">
          <span className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            Verified Government Source
          </span>
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${style.badge}`}>{style.label}</span>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-gray-700 dark:bg-white/5 dark:text-slate-300">
          {scheme.launchYear}
        </span>
        <span
          className="max-w-full truncate rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-primary-500/10 dark:text-primary-300"
          title={scheme.department}
        >
          {scheme.department}
        </span>
        {scheme.isCentral ? (
          <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            Central Scheme
          </span>
        ) : (
          <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
            State Scheme
          </span>
        )}
      </div>

      <p className="mb-3 flex-1 text-sm leading-relaxed text-gray-700 dark:text-slate-400">{displayDescription}</p>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="focus-ring mb-3 self-start rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 transition hover:bg-blue-100 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/20"
        >
          {expanded ? 'Read less ↑' : 'Read more ↓'}
        </button>
      )}

      {scheme.tags?.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1" aria-label="Scheme tags">
          {scheme.tags.slice(0, 5).map((tag, tagIndex) => (
            <span
              key={`${scheme.id}-tag-${tagIndex}`}
              className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-white/5 dark:text-slate-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto space-y-3 border-t border-gray-200 pt-3 dark:border-[color:var(--app-border)]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-slate-500">
            Official Source
          </p>
          <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">{scheme.officialSource}</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-500">{sourceDomain}</p>
        </div>
        <a
          href={scheme.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-800 transition hover:bg-primary-100 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/20"
        >
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Official Source
        </a>
      </div>
    </article>
  )
}

export default memo(SchemeCard)
