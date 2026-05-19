export default function SchemeSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)] dark:shadow-none">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="skeleton-pulse h-4 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
        <div className="skeleton-pulse h-5 w-14 shrink-0 rounded bg-gray-200 dark:bg-white/10" />
      </div>
      <div className="mb-3 flex gap-2">
        <div className="skeleton-pulse h-4 w-12 rounded bg-gray-200 dark:bg-white/10" />
        <div className="skeleton-pulse h-4 w-20 rounded bg-gray-200 dark:bg-white/10" />
      </div>
      <div className="space-y-2">
        <div className="skeleton-pulse h-3 w-full rounded bg-gray-200 dark:bg-white/10" />
        <div className="skeleton-pulse h-3 w-5/6 rounded bg-gray-200 dark:bg-white/10" />
      </div>
    </div>
  )
}

export function SchemeSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <SchemeSkeleton key={`scheme-skeleton-${i}`} />
      ))}
    </div>
  )
}
