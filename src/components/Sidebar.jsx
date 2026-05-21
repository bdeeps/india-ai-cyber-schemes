import { Logo } from './Logo'

function RegionButton({ region, isSelected, onSelect, collapsed, visibleCount = 0 }) {
  const count = visibleCount

  if (collapsed) {
    return (
      <li role="none">
        <button
          type="button"
          role="option"
          aria-selected={isSelected}
          aria-label={`${region.name}, ${count} schemes`}
          title={`${region.name} (${count})`}
          onClick={() => onSelect(region.id)}
          className={`focus-ring mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-[10px] font-bold transition-all duration-200 ${
            isSelected
              ? 'sidebar-active text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200'
          }`}
        >
          {region.shortName}
        </button>
      </li>
    )
  }

  return (
    <li role="none">
      <button
        type="button"
        role="option"
        aria-selected={isSelected}
        onClick={() => onSelect(region.id)}
        className={`focus-ring flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${
          isSelected
            ? 'sidebar-active font-medium text-white'
            : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-white/5'
        }`}
      >
        <span className="truncate pr-2">{region.name}</span>
        <span
          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
            isSelected
              ? 'bg-white/20 text-white'
              : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-slate-400'
          }`}
          aria-hidden="true"
        >
          {count}
        </span>
      </button>
    </li>
  )
}

function RegionGroup({ title, regions, selectedRegionId, onSelectRegion, collapsed, regionCounts }) {
  if (collapsed) {
    return (
      <ul role="listbox" aria-label={`${title} list`} className="space-y-1">
        {regions.map((region, index) => (
          <RegionButton
            key={`${region.id}-${index}`}
            region={region}
            isSelected={region.id === selectedRegionId}
            onSelect={onSelectRegion}
            collapsed
            visibleCount={regionCounts[region.id] ?? 0}
          />
        ))}
      </ul>
    )
  }

  return (
    <div>
      <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-slate-500">
        {title} ({regions.length})
      </p>
      <ul role="listbox" aria-label={`${title} list`} className="space-y-0.5">
        {regions.map((region, index) => (
          <RegionButton
            key={`${region.id}-${index}`}
            region={region}
            isSelected={region.id === selectedRegionId}
            onSelect={onSelectRegion}
            collapsed={false}
            visibleCount={regionCounts[region.id] ?? 0}
          />
        ))}
      </ul>
    </div>
  )
}

export default function Sidebar({
  country,
  states,
  unionTerritories,
  selectedRegionId,
  onSelectRegion,
  isOpen,
  onClose,
  collapsed,
  onCollapse,
  regionCounts = {},
}) {
  const sidebarWidth = collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden dark:bg-black/60"
          style={{ top: 'var(--navbar-height)' }}
          onClick={onClose}
          aria-label="Close regions menu"
        />
      )}

      <aside
        id="regions-sidebar"
        aria-label="Regions navigation"
        style={{ width: sidebarWidth }}
        className={`fixed top-[var(--navbar-height)] z-50 flex h-[calc(100dvh-var(--navbar-height))] shrink-0 flex-col border-r border-gray-200 bg-white transition-[width] duration-300 ease-in-out dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-surface)] lg:static lg:z-auto lg:h-auto lg:self-stretch ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-2 py-2 dark:border-[color:var(--app-border)]">
          {!collapsed && (
            <div className="flex min-w-0 items-center gap-2 px-1">
              <Logo />
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-gray-900 dark:text-white">{country}</p>
                <p className="text-[10px] text-gray-500 dark:text-slate-500">36 regions</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onCollapse}
            className="focus-ring ml-auto hidden h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:border-[color:var(--app-border)] dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white lg:inline-flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
            </svg>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-100 dark:border-[color:var(--app-border)] dark:text-slate-400 dark:hover:bg-white/5 lg:hidden"
            aria-label="Close regions menu"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="scrollbar-thin min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-2 py-2">
          <RegionGroup
            title="States"
            regions={states}
            selectedRegionId={selectedRegionId}
            onSelectRegion={onSelectRegion}
            collapsed={collapsed}
            regionCounts={regionCounts}
          />
          {!collapsed && <div className="mx-2 border-t border-gray-200 dark:border-[color:var(--app-border)]" />}
          <RegionGroup
            title="Union Territories"
            regions={unionTerritories}
            selectedRegionId={selectedRegionId}
            onSelectRegion={onSelectRegion}
            collapsed={collapsed}
            regionCounts={regionCounts}
          />
        </nav>
      </aside>
    </>
  )
}
