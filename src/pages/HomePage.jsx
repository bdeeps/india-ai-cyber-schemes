import EmptyState from '../components/EmptyState'
import SchemeSection from '../components/SchemeSection'
import { SchemeSkeletonGrid } from '../components/SchemeSkeleton'

const NO_RESULTS_SUGGESTIONS = [
  'Clear filters',
  'Try another state',
  'Enable Include Policies or use Policies filter',
  'Remove Apply Available filter',
  'Remove category filters',
]

export default function HomePage({
  region,
  stateGrantSchemes,
  stateIncubatorSchemes,
  stateStartupPrograms,
  statePolicySchemes,
  stateAiSchemes,
  stateCybersecuritySchemes,
  centralSchemes,
  allSchemes,
  isLoading,
  latestOnly,
  includePolicies,
  policiesOnly = false,
  onResetAll,
}) {
  if (!region) {
    return (
      <EmptyState
        icon="empty"
        title="Select a region"
        message="Choose a state or union territory from the sidebar to browse government schemes and initiatives."
      />
    )
  }

  const regionLabel = region.type === 'ut' ? 'Union Territory' : 'State'
  const stateSchemeTotal =
    stateGrantSchemes.length +
    stateIncubatorSchemes.length +
    stateStartupPrograms.length +
    statePolicySchemes.length +
    stateAiSchemes.length +
    stateCybersecuritySchemes.length

  const grantStart = 0
  const incubatorStart = grantStart + stateGrantSchemes.length
  const startupStart = incubatorStart + stateIncubatorSchemes.length
  const policyStart = startupStart + stateStartupPrograms.length
  const aiStart = policyStart + statePolicySchemes.length
  const cyberStart = aiStart + stateAiSchemes.length
  const centralStart = cyberStart + stateCybersecuritySchemes.length

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
            {includePolicies && <span className="text-primary-700 dark:text-primary-400">Policies included</span>}
          </div>
        </div>
      </div>

      {allSchemes.length === 0 ? (
        <EmptyState
          title="No matching initiatives found"
          suggestions={NO_RESULTS_SUGGESTIONS}
          actionLabel="Reset Filters"
          onAction={onResetAll}
        />
      ) : (
        <div className="space-y-6">
          {stateSchemeTotal === 0 && centralSchemes.length === 0 && (
            <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-[color:var(--app-border)] dark:bg-white/5 dark:text-slate-400">
              No verified state-specific initiatives found for {region.name}
            </p>
          )}

          <SchemeSection
            title="State Grants & Funding"
            schemes={stateGrantSchemes}
            startIndex={grantStart}
            accentClass="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          <SchemeSection
            title="State Incubators & Accelerators"
            schemes={stateIncubatorSchemes}
            startIndex={incubatorStart}
            accentClass="bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />

          <SchemeSection
            title="State Startup Programs"
            schemes={stateStartupPrograms}
            startIndex={startupStart}
            accentClass="bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          />

          {(includePolicies || policiesOnly) && statePolicySchemes.length > 0 && (
            <SchemeSection
              title="State Policies"
              schemes={statePolicySchemes}
              startIndex={policyStart}
              accentClass="bg-slate-100 text-slate-800 dark:bg-slate-500/15 dark:text-slate-300"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
          )}

          <SchemeSection
            title="State AI Schemes"
            schemes={stateAiSchemes}
            startIndex={aiStart}
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
            startIndex={cyberStart}
            accentClass="bg-teal-100 text-teal-800 dark:bg-cyan-500/15 dark:text-teal-300"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />

          <SchemeSection
            title="Central Government Initiatives"
            schemes={centralSchemes}
            startIndex={centralStart}
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
