import { memo } from 'react'
import SchemeCard from './SchemeCard'

function SchemeSection({ title, icon, schemes, accentClass, startIndex = 0 }) {
  if (schemes.length === 0) return null

  const sectionId = `section-${title.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <section className="space-y-3" aria-labelledby={sectionId}>
      <div className="flex items-center gap-2.5">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentClass}`} aria-hidden="true">
          {icon}
        </span>
        <div>
          <h2 id={sectionId} className="text-sm font-bold text-gray-900 sm:text-base dark:text-white">
            {title}
          </h2>
          <p className="text-[11px] text-gray-500 dark:text-slate-500">{schemes.length} schemes</p>
        </div>
      </div>

      <div className="grid auto-rows-fr grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {schemes.map((scheme, i) => (
          <SchemeCard key={`${scheme.id}-${startIndex + i}`} scheme={scheme} index={startIndex + i} />
        ))}
      </div>
    </section>
  )
}

export default memo(SchemeSection)
