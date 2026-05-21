import { useMemo } from 'react'

export const FILTERS = {
  ALL: 'all',
  AI: 'ai',
  CYBERSECURITY: 'cybersecurity',
  STATE: 'state',
  CENTRAL: 'central',
  GRANTS: 'grants',
  INCUBATORS: 'incubators',
  ACCELERATORS: 'accelerators',
  STARTUP_PROGRAMS: 'startup-programs',
  POLICIES: 'policies',
  APPLY_AVAILABLE: 'apply-available',
}

export const SORT_OPTIONS = {
  LATEST: 'latest',
  OLDEST: 'oldest',
  TITLE_ASC: 'title-asc',
  TITLE_DESC: 'title-desc',
}

const CURRENT_YEAR = new Date().getFullYear()
export const LATEST_YEAR_THRESHOLD = CURRENT_YEAR - 2

const COUNTABLE_FILTERS = [
  FILTERS.GRANTS,
  FILTERS.INCUBATORS,
  FILTERS.ACCELERATORS,
  FILTERS.STARTUP_PROGRAMS,
  FILTERS.POLICIES,
  FILTERS.APPLY_AVAILABLE,
]

const CATEGORY_FILTER_IDS = new Set([
  FILTERS.AI,
  FILTERS.CYBERSECURITY,
  FILTERS.GRANTS,
  FILTERS.INCUBATORS,
  FILTERS.ACCELERATORS,
  FILTERS.STARTUP_PROGRAMS,
  FILTERS.POLICIES,
])

const SCOPE_FILTER_IDS = new Set([FILTERS.STATE, FILTERS.CENTRAL])

export const OPPORTUNITY_CATEGORIES = new Set([
  'grant',
  'incubator',
  'accelerator',
  'startup-program',
  'ai-initiative',
  'cybersecurity-initiative',
  'centre-of-excellence',
])

export function isPolicyScheme(scheme) {
  return scheme.category === 'policy'
}

export function hasPoliciesFilter(activeFilters) {
  return normalizeActiveFilters(activeFilters).has(FILTERS.POLICIES)
}

export function passesPolicyVisibility(scheme, includePolicies, activeFilters) {
  if (hasPoliciesFilter(activeFilters)) {
    return isPolicyScheme(scheme)
  }
  if (!includePolicies && isPolicyScheme(scheme)) {
    return false
  }
  return true
}

function normalizeActiveFilters(activeFilters) {
  if (!activeFilters || activeFilters.size === 0 || activeFilters.has(FILTERS.ALL)) {
    return new Set()
  }
  return new Set(activeFilters)
}

function matchesSearch(scheme, query) {
  if (!query) return true
  const haystack = [
    scheme.title,
    scheme.description,
    scheme.department,
    scheme.officialSource,
    scheme.sourceDomain,
    scheme.state,
    ...(scheme.tags ?? []),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

export function matchesCategoryFilter(scheme, filter) {
  switch (filter) {
    case FILTERS.AI:
      return scheme.category === 'ai-initiative'
    case FILTERS.CYBERSECURITY:
      return scheme.category === 'cybersecurity-initiative'
    case FILTERS.GRANTS:
      return scheme.category === 'grant'
    case FILTERS.INCUBATORS:
      return scheme.category === 'incubator'
    case FILTERS.ACCELERATORS:
      return scheme.category === 'accelerator'
    case FILTERS.STARTUP_PROGRAMS:
      return scheme.category === 'startup-program'
    case FILTERS.POLICIES:
      return scheme.category === 'policy'
    case FILTERS.APPLY_AVAILABLE:
      return scheme.applyUrl != null && scheme.applyUrl !== ''
    case FILTERS.STATE:
      return !scheme.isCentral
    case FILTERS.CENTRAL:
      return scheme.isCentral
    default:
      return true
  }
}

export function matchesActiveFilters(scheme, activeFilters) {
  const filters = normalizeActiveFilters(activeFilters)
  if (filters.size === 0) return true

  const categoryFilters = [...filters].filter((filter) => CATEGORY_FILTER_IDS.has(filter))
  const scopeFilters = [...filters].filter((filter) => SCOPE_FILTER_IDS.has(filter))
  const applyFilter = filters.has(FILTERS.APPLY_AVAILABLE)

  if (scopeFilters.length > 0 && !scopeFilters.some((filter) => matchesCategoryFilter(scheme, filter))) {
    return false
  }

  if (categoryFilters.length > 0 && !categoryFilters.some((filter) => matchesCategoryFilter(scheme, filter))) {
    return false
  }

  if (applyFilter && !matchesCategoryFilter(scheme, FILTERS.APPLY_AVAILABLE)) {
    return false
  }

  return true
}

function sortSchemes(schemes, sortBy) {
  const sorted = [...schemes]
  switch (sortBy) {
    case SORT_OPTIONS.OLDEST:
      return sorted.sort((a, b) => (a.launchYear ?? 0) - (b.launchYear ?? 0) || a.title.localeCompare(b.title))
    case SORT_OPTIONS.TITLE_ASC:
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case SORT_OPTIONS.TITLE_DESC:
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    case SORT_OPTIONS.LATEST:
    default:
      return sorted.sort((a, b) => (b.launchYear ?? 0) - (a.launchYear ?? 0) || a.title.localeCompare(b.title))
  }
}

export function filterSchemes(schemes, searchQuery, activeFilters, latestOnly, includePolicies) {
  const query = searchQuery.trim().toLowerCase()
  return schemes.filter((scheme) => {
    if (!passesPolicyVisibility(scheme, includePolicies, activeFilters)) return false
    if (!matchesSearch(scheme, query)) return false
    if (!matchesActiveFilters(scheme, activeFilters)) return false
    if (latestOnly && scheme.launchYear != null && scheme.launchYear < LATEST_YEAR_THRESHOLD) return false
    return true
  })
}

function buildSearchAndLatestPool(schemes, searchQuery, latestOnly) {
  const query = searchQuery.trim().toLowerCase()
  return schemes.filter((scheme) => {
    if (!matchesSearch(scheme, query)) return false
    if (latestOnly && scheme.launchYear != null && scheme.launchYear < LATEST_YEAR_THRESHOLD) return false
    return true
  })
}

function countForFilterOption(schemes, activeFilters, filterId, includePolicies) {
  const filters = normalizeActiveFilters(activeFilters)
  if (!filters.has(filterId)) filters.add(filterId)
  return schemes.filter((scheme) => {
    if (!passesPolicyVisibility(scheme, includePolicies, filters)) return false
    return matchesActiveFilters(scheme, filters)
  }).length
}

export function buildFilterCounts(opportunityPool, policyPool, activeFilters, includePolicies) {
  const counts = COUNTABLE_FILTERS.reduce((acc, filterId) => {
    const pool = filterId === FILTERS.POLICIES ? policyPool : opportunityPool
    acc[filterId] = countForFilterOption(pool, activeFilters, filterId, includePolicies)
    return acc
  }, {})
  return counts
}

export function toggleActiveFilter(activeFilters, filterId) {
  if (filterId === FILTERS.ALL) return new Set()

  const next = new Set(normalizeActiveFilters(activeFilters))
  if (next.has(filterId)) next.delete(filterId)
  else next.add(filterId)
  return next
}

export function isFilterActive(activeFilters, filterId) {
  if (filterId === FILTERS.ALL) {
    return !activeFilters || activeFilters.size === 0 || activeFilters.has(FILTERS.ALL)
  }
  return normalizeActiveFilters(activeFilters).has(filterId)
}

/** Sidebar badge: state opportunities only unless Include Policies is on. */
export function countSidebarOpportunitiesForRegion(
  region,
  searchQuery,
  activeFilters,
  latestOnly,
  includePolicies,
) {
  if (!region) return 0
  const filtered = filterSchemes(
    region.stateSchemes ?? [],
    searchQuery,
    activeFilters,
    latestOnly,
    includePolicies,
  )
  if (hasPoliciesFilter(activeFilters)) {
    return filtered.filter(isPolicyScheme).length
  }
  if (!includePolicies) {
    return filtered.filter((scheme) => !isPolicyScheme(scheme)).length
  }
  return filtered.length
}

/** @deprecated Use countSidebarOpportunitiesForRegion */
export const countVisibleStateSchemesForRegion = countSidebarOpportunitiesForRegion

export function useSidebarRegionCounts(
  directory,
  searchQuery,
  activeFilters,
  latestOnly,
  includePolicies,
) {
  return useMemo(() => {
    const counts = {}
    if (!directory) return counts

    for (const region of directory.regions ?? []) {
      counts[region.id] = countSidebarOpportunitiesForRegion(
        region,
        searchQuery,
        activeFilters,
        latestOnly,
        includePolicies,
      )
    }

    return counts
  }, [directory, searchQuery, activeFilters, latestOnly, includePolicies])
}

export function useFilteredSchemes(
  region,
  centralSchemes,
  searchQuery,
  activeFilters,
  sortBy,
  latestOnly,
  includePolicies = false,
) {
  return useMemo(() => {
    if (!region) {
      return {
        stateGrantSchemes: [],
        stateIncubatorSchemes: [],
        stateStartupPrograms: [],
        statePolicySchemes: [],
        stateAiSchemes: [],
        stateCybersecuritySchemes: [],
        centralSchemes: [],
        allSchemes: [],
        filterCounts: {},
        schemePool: [],
        policyCountInRegion: 0,
        visibleOpportunityCount: 0,
        policiesOnly: false,
      }
    }

    const stateSchemes = region.stateSchemes ?? []
    const schemePool = [...stateSchemes, ...(centralSchemes ?? [])]
    const searchAndLatestPool = buildSearchAndLatestPool(schemePool, searchQuery, latestOnly)
    const opportunityPool = searchAndLatestPool.filter((scheme) => !isPolicyScheme(scheme))
    const policyPool = searchAndLatestPool.filter(isPolicyScheme)
    const policiesOnly = hasPoliciesFilter(activeFilters)

    const filteredState = filterSchemes(stateSchemes, searchQuery, activeFilters, latestOnly, includePolicies)
    const filteredCentral = filterSchemes(centralSchemes ?? [], searchQuery, activeFilters, latestOnly, includePolicies)
    const filteredPool = filterSchemes(schemePool, searchQuery, activeFilters, latestOnly, includePolicies)

    const stateGrantSchemes = sortSchemes(
      filteredState.filter((scheme) => scheme.category === 'grant'),
      sortBy,
    )
    const stateIncubatorSchemes = sortSchemes(
      filteredState.filter(
        (scheme) =>
          scheme.category === 'incubator' ||
          scheme.category === 'accelerator' ||
          scheme.category === 'centre-of-excellence',
      ),
      sortBy,
    )
    const stateStartupPrograms = sortSchemes(
      filteredState.filter((scheme) => scheme.category === 'startup-program'),
      sortBy,
    )
    const statePolicySchemes = sortSchemes(
      filteredState.filter((scheme) => scheme.category === 'policy'),
      sortBy,
    )
    const stateAiSchemes = sortSchemes(
      filteredState.filter((scheme) => scheme.category === 'ai-initiative'),
      sortBy,
    )
    const stateCybersecuritySchemes = sortSchemes(
      filteredState.filter((scheme) => scheme.category === 'cybersecurity-initiative'),
      sortBy,
    )
    const central = sortSchemes(filteredCentral, sortBy)

    return {
      stateGrantSchemes,
      stateIncubatorSchemes,
      stateStartupPrograms,
      statePolicySchemes,
      stateAiSchemes,
      stateCybersecuritySchemes,
      centralSchemes: central,
      allSchemes: filteredPool,
      filterCounts: buildFilterCounts(opportunityPool, policyPool, activeFilters, includePolicies),
      schemePool: searchAndLatestPool,
      policyCountInRegion: policyPool.length,
      visibleOpportunityCount: filteredPool.filter((scheme) => !isPolicyScheme(scheme)).length,
      policiesOnly,
    }
  }, [region, centralSchemes, searchQuery, activeFilters, sortBy, latestOnly, includePolicies])
}

export function getActiveFilterLabel(activeFilters) {
  const filters = normalizeActiveFilters(activeFilters)
  if (filters.size === 0) return ''

  const labels = {
    [FILTERS.AI]: ' in AI',
    [FILTERS.CYBERSECURITY]: ' in Cybersecurity',
    [FILTERS.STATE]: ' in State Schemes',
    [FILTERS.CENTRAL]: ' in Central Schemes',
    [FILTERS.GRANTS]: ' in Grants',
    [FILTERS.INCUBATORS]: ' in Incubators',
    [FILTERS.ACCELERATORS]: ' in Accelerators',
    [FILTERS.STARTUP_PROGRAMS]: ' in Startup Programs',
    [FILTERS.POLICIES]: ' in Policies',
    [FILTERS.APPLY_AVAILABLE]: ' with Apply Available',
  }

  return [...filters].map((filter) => labels[filter] ?? '').join('')
}

export function buildResultsSummaryText({
  includePolicies,
  recordCount,
  opportunityCount,
  hiddenPolicyCount,
}) {
  if (includePolicies) {
    return `${recordCount} records found`
  }
  return `${opportunityCount} opportunities found • ${hiddenPolicyCount} policies hidden`
}
