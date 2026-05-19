import { useCallback, useMemo, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import SortControls from '../components/SortControls'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import HomePage from '../pages/HomePage'
import EmptyState from '../components/EmptyState'
import { SchemeSkeletonGrid } from '../components/SchemeSkeleton'
import { FILTERS, SORT_OPTIONS, useFilteredSchemes } from '../hooks/useFilteredSchemes'
import { useRegionLoading } from '../hooks/useRegionLoading'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { useSchemesData } from '../hooks/useSchemesData'
import { getTotalUniqueSchemes } from '../services/schemeService'

function RegionContent({ region, filtered, searchQuery, filter, latestOnly, isInitialLoading }) {
  const isRegionLoading = useRegionLoading()
  const isLoading = isInitialLoading || isRegionLoading

  return (
    <div className={isLoading ? '' : 'content-enter'}>
      <HomePage
        region={region}
        stateAiSchemes={filtered.stateAiSchemes}
        stateCybersecuritySchemes={filtered.stateCybersecuritySchemes}
        centralSchemes={filtered.centralSchemes}
        allSchemes={filtered.allSchemes}
        searchQuery={searchQuery}
        filter={filter}
        isLoading={isLoading}
        latestOnly={latestOnly}
      />
    </div>
  )
}

function LoadingShell({ onMenuToggle, mobileMenuOpen }) {
  return (
    <div className="app-shell flex flex-col overflow-hidden">
      <Navbar onMenuToggle={onMenuToggle} totalSchemes={null} mobileMenuOpen={mobileMenuOpen} isLoading />
      <div className="flex min-h-0 flex-1">
        <aside
          style={{ width: 'var(--sidebar-width)' }}
          className="hidden shrink-0 flex-col border-r border-gray-200 bg-white dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-surface)] lg:flex"
          aria-hidden="true"
        >
          <div className="border-b border-gray-200 p-4 dark:border-[color:var(--app-border)]">
            <div className="skeleton-pulse h-4 w-24 rounded bg-gray-200 dark:bg-white/10" />
            <div className="skeleton-pulse mt-2 h-3 w-16 rounded bg-gray-200 dark:bg-white/10" />
          </div>
          <div className="space-y-2 p-3">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={`sidebar-skeleton-${i}`} className="skeleton-pulse h-8 w-full rounded-lg bg-gray-200 dark:bg-white/10" />
            ))}
          </div>
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-20 shrink-0 border-b border-gray-200 bg-white px-3 py-2 dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-surface)] sm:px-5">
            <div className="skeleton-pulse h-9 w-full rounded-lg bg-gray-200 dark:bg-white/10" />
          </div>
          <main className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4" aria-busy="true" aria-label="Loading verified government schemes">
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-card)]">
                <div className="skeleton-pulse h-3 w-20 rounded bg-gray-200 dark:bg-white/10" />
                <div className="skeleton-pulse mt-2 h-7 w-56 max-w-full rounded bg-gray-200 dark:bg-white/10" />
              </div>
              <SchemeSkeletonGrid count={6} />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default function MainLayout() {
  const { directory, isLoading, error } = useSchemesData()
  const mainRef = useRef(null)
  const [selectedRegionId, setSelectedRegionId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState(FILTERS.ALL)
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.LATEST)
  const [latestOnly, setLatestOnly] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const { country, states, unionTerritories } = directory ?? {
    country: 'India',
    states: [],
    unionTerritories: [],
  }

  const defaultRegionId = directory?.states?.[0]?.id ?? ''
  const activeRegionId = selectedRegionId || defaultRegionId

  const selectedRegion = useMemo(
    () => directory?.regions.find((r) => r.id === activeRegionId) ?? null,
    [directory, activeRegionId],
  )

  const filtered = useFilteredSchemes(selectedRegion, directory?.centralSchemes ?? [], searchQuery, filter, sortBy, latestOnly)
  const totalSchemes = directory ? getTotalUniqueSchemes(directory) : null

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  useEscapeKey(closeSidebar, sidebarOpen)

  const handleSelectRegion = useCallback((regionId) => {
    setSelectedRegionId(regionId)
    setSidebarOpen(false)
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const toggleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => !prev)
  }, [])

  if (isLoading) {
    return <LoadingShell onMenuToggle={() => setSidebarOpen(true)} mobileMenuOpen={sidebarOpen} />
  }

  if (error) {
    return (
      <div className="app-shell flex flex-col overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} totalSchemes={0} mobileMenuOpen={sidebarOpen} />
        <main className="flex flex-1 items-center justify-center p-6">
          <EmptyState
            icon="empty"
            title="Unable to load schemes"
            message={`Failed to load verified government data: ${error}. Please refresh the page.`}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell flex flex-col overflow-hidden">
      <Navbar
        onMenuToggle={() => setSidebarOpen(true)}
        totalSchemes={totalSchemes}
        mobileMenuOpen={sidebarOpen}
      />

      <div className="flex min-h-0 flex-1">
        <Sidebar
          country={country}
          states={states}
          unionTerritories={unionTerritories}
          selectedRegionId={activeRegionId}
          onSelectRegion={handleSelectRegion}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          collapsed={sidebarCollapsed}
          onCollapse={toggleSidebarCollapse}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-20 shrink-0 border-b border-gray-200 bg-white px-3 py-2 dark:border-[color:var(--app-border)] dark:bg-[color:var(--app-surface)] sm:px-5">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <SearchBar value={searchQuery} onChange={setSearchQuery} />
                </div>
                <SortControls value={sortBy} onChange={setSortBy} resultCount={filtered.allSchemes.length} />
              </div>
              <FilterBar
                value={filter}
                onChange={setFilter}
                latestOnly={latestOnly}
                onLatestOnlyChange={setLatestOnly}
                resultCount={filtered.allSchemes.length}
              />
            </div>
          </div>

          <main
            ref={mainRef}
            id="main-content"
            className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth px-3 py-3 sm:px-5 sm:py-4"
            tabIndex={-1}
          >
            <RegionContent
              key={activeRegionId}
              region={selectedRegion}
              filtered={filtered}
              searchQuery={searchQuery}
              filter={filter}
              latestOnly={latestOnly}
              isInitialLoading={false}
            />
            <Footer />
          </main>

          <BackToTop scrollRef={mainRef} />
        </div>
      </div>
    </div>
  )
}
