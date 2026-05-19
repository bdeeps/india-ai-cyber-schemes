import { SORT_OPTIONS } from '../hooks/useFilteredSchemes'

const OPTIONS = [
  { id: SORT_OPTIONS.LATEST, label: 'Latest first' },
  { id: SORT_OPTIONS.OLDEST, label: 'Oldest first' },
  { id: SORT_OPTIONS.TITLE_ASC, label: 'Title A–Z' },
  { id: SORT_OPTIONS.TITLE_DESC, label: 'Title Z–A' },
]

export default function SortControls({ value, onChange, resultCount }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <p className="hidden whitespace-nowrap text-[11px] text-gray-500 sm:block dark:text-slate-500">
        <span className="font-semibold text-gray-700 dark:text-slate-300">{resultCount}</span> found
      </p>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Sort schemes"
        className="focus-ring rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)] dark:text-slate-300"
      >
        {OPTIONS.map((opt, index) => (
          <option key={`sort-${opt.id}-${index}`} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
