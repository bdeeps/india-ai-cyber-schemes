export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-6 border-t border-gray-200 py-4 dark:border-[color:var(--app-border)]">
      <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
            India Cybersecurity &amp; AI Schemes Directory
          </p>
          <p className="text-[11px] text-gray-500 dark:text-slate-500">28 States &amp; 8 Union Territories</p>
        </div>
        <div className="text-[11px] text-gray-500 dark:text-slate-500">
          <p>Developed for India Digital Innovation</p>
          <p className="tabular-nums">&copy; {year}</p>
        </div>
      </div>
    </footer>
  )
}
