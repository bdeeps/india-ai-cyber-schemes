import { FILTERS, buildResultsSummaryText, isFilterActive, toggleActiveFilter } from '../hooks/useFilteredSchemes'

const PRIMARY_FILTER_OPTIONS = [
  { id: FILTERS.ALL, label: 'All' },
  { id: FILTERS.AI, label: 'AI' },
  { id: FILTERS.CYBERSECURITY, label: 'Cybersecurity' },
  { id: FILTERS.STATE, label: 'State' },
  { id: FILTERS.CENTRAL, label: 'Central' },
]

const INCLUDE_POLICIES_TOOLTIP =
  'Policies are hidden by default to focus on actionable schemes, grants, incubators, accelerators and application opportunities.'

function PolicyInfoTooltip() {
  return (
    <span className="group/info relative inline-flex shrink-0">
      <button
        type="button"
        className="focus-ring inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-300"
        aria-label={INCLUDE_POLICIES_TOOLTIP}
        title={INCLUDE_POLICIES_TOOLTIP}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 hidden w-56 -translate-x-1/2 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-left text-[10px] leading-snug font-normal text-gray-700 shadow-md group-hover/info:block group-focus-within/info:block dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)] dark:text-slate-300"
      >
        {INCLUDE_POLICIES_TOOLTIP}
      </span>
    </span>
  )
}

const CATEGORY_FILTER_OPTIONS = [
  { id: FILTERS.GRANTS, label: 'Grants', countKey: FILTERS.GRANTS },
  { id: FILTERS.INCUBATORS, label: 'Incubators', countKey: FILTERS.INCUBATORS },
  { id: FILTERS.ACCELERATORS, label: 'Accelerators', countKey: FILTERS.ACCELERATORS },
  { id: FILTERS.STARTUP_PROGRAMS, label: 'Startup Programs', countKey: FILTERS.STARTUP_PROGRAMS },
  { id: FILTERS.POLICIES, label: 'Policies', countKey: FILTERS.POLICIES },
  { id: FILTERS.APPLY_AVAILABLE, label: 'Apply Available', countKey: FILTERS.APPLY_AVAILABLE },
]

const FILTER_CHIP_ACTIVE =
  'bg-primary-600 text-white shadow-md shadow-primary-600/30 ring-2 ring-primary-500/40 dark:bg-primary-500 dark:ring-primary-400/30'
const FILTER_CHIP_INACTIVE =
  'border border-gray-200 bg-white text-gray-800 hover:border-primary-400 hover:bg-primary-50 hover:text-gray-900 dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)] dark:text-slate-200 dark:hover:border-primary-500/50 dark:hover:bg-primary-500/10'

function FilterButton({ option, isActive, onClick, count }) {
  const showCount = typeof count === 'number' && option.countKey
  const label = showCount ? `${option.label} (${count})` : option.label

  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={`focus-ring inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 sm:min-h-[46px] ${
        isActive ? FILTER_CHIP_ACTIVE : FILTER_CHIP_INACTIVE
      }`}
    >
      {label}
    </button>
  )
}

export default function FilterBar({
  activeFilters,
  onChange,
  latestOnly,
  onLatestOnlyChange,
  includePolicies,
  onIncludePoliciesChange,
  opportunityCount = 0,
  recordCount = 0,
  hiddenPolicyCount = 0,
  filterCounts = {},
  onClearAll,
  canClearAll = false,
}) {
  const handleToggle = (filterId) => {
    onChange(toggleActiveFilter(activeFilters, filterId))
  }

  const resultsSummary = buildResultsSummaryText({
    includePolicies,
    recordCount,
    opportunityCount,
    hiddenPolicyCount,
  })

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Scheme category filters">
        {PRIMARY_FILTER_OPTIONS.map((option) => (
          <FilterButton
            key={option.id}
            option={option}
            isActive={isFilterActive(activeFilters, option.id)}
            onClick={() => handleToggle(option.id)}
          />
        ))}

        <div className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)]">
          <label className="focus-ring inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={includePolicies}
              onChange={(e) => onIncludePoliciesChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600"
              aria-label="Include policy entries in listings"
            />
            Include Policies
          </label>
          <PolicyInfoTooltip />
        </div>

        <label className="focus-ring ml-auto inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)] dark:text-slate-300">
          <input
            type="checkbox"
            checked={latestOnly}
            onChange={(e) => onLatestOnlyChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600"
            aria-label="Show latest schemes only"
          />
          Latest only
        </label>

        <button
          type="button"
          onClick={onClearAll}
          disabled={!canClearAll}
          className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-400 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)] dark:text-slate-400 dark:hover:border-primary-500/50 dark:hover:text-slate-200"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Scheme program filters">
        {CATEGORY_FILTER_OPTIONS.map((option) => (
          <FilterButton
            key={option.id}
            option={option}
            isActive={isFilterActive(activeFilters, option.id)}
            onClick={() => handleToggle(option.id)}
            count={filterCounts[option.countKey]}
          />
        ))}

        <p className="hidden text-sm text-gray-600 sm:ml-auto sm:block dark:text-slate-400">{resultsSummary}</p>
      </div>

      <p className="text-sm text-gray-600 sm:hidden dark:text-slate-400">{resultsSummary}</p>
    </div>
  )
}
