import EmptyState from '../components/EmptyState'
import SchemeSection from '../components/SchemeSection'
import { SchemeSkeletonGrid } from '../components/SchemeSkeleton'
import { FILTERS } from '../hooks/useFilteredSchemes'

const FILTER_LABELS = {
  [FILTERS.ALL]: '',
  [FILTERS.AI]: ' in AI',
  [FILTERS.CYBERSECURITY]: ' in Cybersecurity',
  [FILTERS.STATE]: ' in State Schemes',
  [FILTERS.CENTRAL]: ' in Central Schemes',
}

export default function HomePage({
  region,
  stateAiSchemes,
  stateCybersecuritySchemes,
  centralSchemes,
  allSchemes,
  searchQuery,
  filter,
  isLoading,
  latestOnly,
}) {
  if (!region) {
    return (
      <EmptyState
        icon="empty"
        title="Select a region"
        message="Choose a state or union territory from the sidebar to browse cybersecurity and AI schemes."
      />
    )
  }

  const regionLabel = region.type === 'ut' ? 'Union Territory' : 'State'
  const stateSchemeTotal = stateAiSchemes.length + stateCybersecuritySchemes.length

  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading schemes">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)]">
          <div className="skeleton-pulse h-3 w-20 rounded bg-gray-200 dark:bg-white/10" />
          <div className="skeleton-pulse mt-2 h-7 w-56 max-w-full rounded bg-gray-200 dark:bg-white/10" />
        </div>
        <SchemeSkeletonGrid count={6} />
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-2">
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)] dark:shadow-none">
        <div className="card-shine pointer-events-none absolute inset-0" />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary-700 dark:text-primary-400">
            Selected {regionLabel}
          </p>
          <h1 className="mt-0.5 text-xl font-bold text-gray-900 sm:text-2xl dark:text-white">{region.name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-slate-400">
            <span>
              <strong className="text-gray-700 dark:text-slate-200">{allSchemes.length}</strong> shown
            </span>
            <span>
              <strong className="text-gray-700 dark:text-slate-200">{stateSchemeTotal}</strong> state
            </span>
            <span>
              <strong className="text-gray-700 dark:text-slate-200">{centralSchemes.length}</strong> central
            </span>
            {latestOnly && <span className="text-primary-700 dark:text-primary-400">Latest only</span>}
          </div>
        </div>
      </div>

      {allSchemes.length === 0 ? (
        <EmptyState
          title="No schemes found"
          message={
            searchQuery
              ? `No results for "${searchQuery}"${FILTER_LABELS[filter] ?? ''}. Try adjusting your search, filters, or turn off "Latest schemes only".`
              : `No schemes match the current filters${FILTER_LABELS[filter] ?? ''}. Try selecting a different filter or disable "Latest schemes only".`
          }
        />
      ) : (
        <div className="space-y-6">
          {stateSchemeTotal === 0 && (
            <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-[color:var(--app-border)] dark:bg-white/5 dark:text-slate-400">
              No verified state-specific initiatives found
            </p>
          )}
          <SchemeSection
            title="State AI Schemes"
            schemes={stateAiSchemes}
            startIndex={0}
            accentClass="bg-blue-100 text-blue-800 dark:bg-violet-500/15 dark:text-violet-300"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />

          <SchemeSection
            title="State Cybersecurity Schemes"
            schemes={stateCybersecuritySchemes}
            startIndex={stateAiSchemes.length}
            accentClass="bg-teal-100 text-teal-800 dark:bg-cyan-500/15 dark:text-cyan-300"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />

          <SchemeSection
            title="Central Government Initiatives"
            schemes={centralSchemes}
            startIndex={stateAiSchemes.length + stateCybersecuritySchemes.length}
            accentClass="bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
              </svg>
            }
          />
        </div>
      )}
    </div>
  )
}
