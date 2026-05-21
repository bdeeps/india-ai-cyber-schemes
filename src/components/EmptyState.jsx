export default function EmptyState({ title, message, icon = 'search', suggestions = [], actionLabel, onAction }) {
  const icons = {
    search: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    ),
    empty: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    ),
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)] dark:shadow-none">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5">
        <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          {icons[icon] ?? icons.search}
        </svg>
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
      {message ? <p className="mt-1.5 max-w-md text-sm text-gray-700 dark:text-slate-400">{message}</p> : null}

      {suggestions.length > 0 && (
        <div className="mt-5 w-full max-w-md text-left">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Suggestions:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-slate-400">
            {suggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="focus-ring mt-5 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-800 transition hover:bg-primary-100 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/20"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
