import { FILTERS } from '../hooks/useFilteredSchemes'

const FILTER_OPTIONS = [
  { id: FILTERS.ALL, label: 'All' },
  { id: FILTERS.AI, label: 'AI' },
  { id: FILTERS.CYBERSECURITY, label: 'Cybersecurity' },
  { id: FILTERS.STATE, label: 'State' },
  { id: FILTERS.CENTRAL, label: 'Central' },
]

export default function FilterBar({ value, onChange, latestOnly, onLatestOnlyChange, resultCount }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Scheme category filters">
      {FILTER_OPTIONS.map((option, index) => {
        const isActive = value === option.id
        return (
          <button
            key={`filter-${option.id}-${index}`}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.id)}
            className={`focus-ring rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              isActive
                ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/30'
                : 'border border-gray-200 bg-white text-gray-700 hover:border-primary-400 hover:text-gray-900 dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)] dark:text-slate-400 dark:hover:border-primary-500/50 dark:hover:text-slate-200'
            }`}
          >
            {option.label}
          </button>
        )
      })}

      <label className="focus-ring ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)] dark:text-slate-400">
        <input
          type="checkbox"
          checked={latestOnly}
          onChange={(e) => onLatestOnlyChange(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-slate-600"
          aria-label="Show latest schemes only"
        />
        Latest only
      </label>

      <span className="w-full text-[11px] text-gray-500 sm:hidden dark:text-slate-500">
        <span className="font-semibold text-gray-700 dark:text-slate-300">{resultCount}</span> schemes found
      </span>
    </div>
  )
}
