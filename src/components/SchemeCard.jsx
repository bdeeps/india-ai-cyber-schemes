import { memo, useState } from 'react'

const CATEGORY_STYLES = {
  'ai-initiative': {
    badge: 'bg-blue-100 text-blue-800 dark:bg-violet-500/15 dark:text-violet-300',
    accent: 'border-l-blue-600 dark:border-l-violet-500',
    label: 'AI',
    glow: 'card-glow-ai',
  },
  'cybersecurity-initiative': {
    badge: 'bg-teal-100 text-teal-800 dark:bg-cyan-500/15 dark:text-cyan-300',
    accent: 'border-l-teal-600 dark:border-l-cyan-500',
    label: 'Cybersecurity',
    glow: 'card-glow-cyber',
  },
  grant: {
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    accent: 'border-l-emerald-600 dark:border-l-emerald-500',
    label: 'Grant',
    glow: '',
  },
  incubator: {
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300',
    accent: 'border-l-indigo-600 dark:border-l-indigo-500',
    label: 'Incubator',
    glow: '',
  },
  accelerator: {
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300',
    accent: 'border-l-indigo-600 dark:border-l-indigo-500',
    label: 'Accelerator',
    glow: '',
  },
  'startup-program': {
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300',
    accent: 'border-l-orange-600 dark:border-l-orange-500',
    label: 'Startup Program',
    glow: '',
  },
  policy: {
    badge: 'bg-slate-100 text-slate-800 dark:bg-slate-500/15 dark:text-slate-300',
    accent: 'border-l-slate-600 dark:border-l-slate-500',
    label: 'Policy',
    glow: '',
  },
  'centre-of-excellence': {
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300',
    accent: 'border-l-purple-600 dark:border-l-purple-500',
    label: 'Centre of Excellence',
    glow: '',
  },
}

const SOURCE_BADGE_STYLES = {
  government: {
    badge: 'border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300',
    label: 'Government Verified',
  },
  partner: {
    badge: 'border-purple-200 bg-purple-100 text-purple-800 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300',
    label: 'Partner Ecosystem',
  },
}

const PARTNER_HOSTS = ['nasscom.in', 'cyseck.in']

function getSourceHostname(scheme) {
  const raw = scheme.sourceDomain ?? scheme.sourceUrl ?? ''
  try {
    return new URL(raw.includes('://') ? raw : `https://${raw}`).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return String(raw).replace(/^www\./, '').toLowerCase()
  }
}

function getSourceBadgeType(scheme) {
  const host = getSourceHostname(scheme)
  const isPartner = PARTNER_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`))
  return isPartner ? 'partner' : 'government'
}

const DESCRIPTION_LIMIT = 160

function SchemeCard({ scheme, index = 0 }) {
  const [expanded, setExpanded] = useState(false)
  const style = CATEGORY_STYLES[scheme.category] ?? CATEGORY_STYLES['ai-initiative']
  const sourceBadge = SOURCE_BADGE_STYLES[getSourceBadgeType(scheme)]
  const isLong = scheme.description.length > DESCRIPTION_LIMIT
  const displayDescription =
    expanded || !isLong ? scheme.description : `${scheme.description.slice(0, DESCRIPTION_LIMIT).trim()}…`
  const sourceDomain = scheme.sourceDomain ?? scheme.sourceUrl
  const hasApplyUrl = typeof scheme.applyUrl === 'string' && scheme.applyUrl.trim().length > 0

  return (
    <article
      className={`group animate-fade-in-up flex h-full flex-col rounded-xl border border-l-4 border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)] dark:shadow-sm dark:hover:shadow-lg ${style.accent} ${style.glow}`}
      style={{ animationDelay: `${Math.min(index * 40, 320)}ms`, opacity: 0 }}
      aria-labelledby={`scheme-title-${scheme.id}`}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3
            id={`scheme-title-${scheme.id}`}
            className="text-sm font-semibold leading-snug text-gray-900 sm:text-base dark:text-white"
          >
            {scheme.title}
          </h3>
          <span
            className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sourceBadge.badge}`}
          >
            {sourceBadge.label}
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <p className="max-w-[11rem] truncate text-right text-[10px] text-gray-500 dark:text-slate-500" title={sourceDomain}>
            {sourceDomain}
          </p>
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${style.badge}`}>{style.label}</span>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-gray-700 dark:bg-white/5 dark:text-slate-300">
          {scheme.launchYear ?? '—'}
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
          {scheme.tags.slice(0, 5).map((tag) => (
            <span
              key={`${scheme.id}-tag-${tag}`}
              className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-white/5 dark:text-slate-500"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto space-y-3 border-t border-gray-200 pt-3 dark:border-[color:var(--app-border)]">
        {hasApplyUrl ? (
          <a
            href={scheme.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 dark:border-emerald-500/40 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            Apply Now
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-400 px-3 py-2 text-xs font-semibold text-white opacity-60 dark:border-slate-600 dark:bg-slate-600 dark:text-slate-200"
          >
            Application Not Available
          </button>
        )}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-slate-500">
            Official Source
          </p>
          <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">{scheme.officialSource}</p>
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
