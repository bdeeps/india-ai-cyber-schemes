export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <label htmlFor="scheme-search" className="sr-only">
        Search schemes by title, department, tags, or official source
      </label>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-slate-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        id="scheme-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search schemes..."
        className="focus-ring w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-500 dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)] dark:text-slate-100 dark:placeholder:text-slate-500"
      />
    </div>
  )
}
