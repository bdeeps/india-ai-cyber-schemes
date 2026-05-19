import { useMemo } from 'react'

export const FILTERS = {
  ALL: 'all',
  AI: 'ai',
  CYBERSECURITY: 'cybersecurity',
  STATE: 'state',
  CENTRAL: 'central',
}

export const SORT_OPTIONS = {
  LATEST: 'latest',
  OLDEST: 'oldest',
  TITLE_ASC: 'title-asc',
  TITLE_DESC: 'title-desc',
}

const CURRENT_YEAR = new Date().getFullYear()
export const LATEST_YEAR_THRESHOLD = CURRENT_YEAR - 2

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

function matchesCategoryFilter(scheme, filter) {
  switch (filter) {
    case FILTERS.AI:
      return scheme.category === 'ai'
    case FILTERS.CYBERSECURITY:
      return scheme.category === 'cybersecurity'
    case FILTERS.STATE:
      return !scheme.isCentral
    case FILTERS.CENTRAL:
      return scheme.isCentral
    default:
      return true
  }
}

function sortSchemes(schemes, sortBy) {
  const sorted = [...schemes]
  switch (sortBy) {
    case SORT_OPTIONS.OLDEST:
      return sorted.sort((a, b) => a.launchYear - b.launchYear || a.title.localeCompare(b.title))
    case SORT_OPTIONS.TITLE_ASC:
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case SORT_OPTIONS.TITLE_DESC:
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    case SORT_OPTIONS.LATEST:
    default:
      return sorted.sort((a, b) => b.launchYear - a.launchYear || a.title.localeCompare(b.title))
  }
}

function filterSchemes(schemes, searchQuery, filter, latestOnly) {
  const query = searchQuery.trim().toLowerCase()
  return schemes.filter((scheme) => {
    if (!matchesSearch(scheme, query)) return false
    if (!matchesCategoryFilter(scheme, filter)) return false
    if (latestOnly && scheme.launchYear < LATEST_YEAR_THRESHOLD) return false
    return true
  })
}

export function useFilteredSchemes(region, centralSchemes, searchQuery, filter, sortBy, latestOnly) {
  return useMemo(() => {
    if (!region) {
      return {
        stateAiSchemes: [],
        stateCybersecuritySchemes: [],
        centralSchemes: [],
        allSchemes: [],
      }
    }

    const stateSchemes = [...region.stateAiSchemes, ...region.stateCybersecuritySchemes]
    const filteredState = filterSchemes(stateSchemes, searchQuery, filter, latestOnly)
    const filteredCentral = filterSchemes(centralSchemes ?? [], searchQuery, filter, latestOnly)

    const stateAiSchemes = sortSchemes(
      filteredState.filter((s) => s.category === 'ai'),
      sortBy,
    )
    const stateCybersecuritySchemes = sortSchemes(
      filteredState.filter((s) => s.category === 'cybersecurity'),
      sortBy,
    )
    const central = sortSchemes(filteredCentral, sortBy)

    return {
      stateAiSchemes,
      stateCybersecuritySchemes,
      centralSchemes: central,
      allSchemes: [...stateAiSchemes, ...stateCybersecuritySchemes, ...central],
    }
  }, [region, centralSchemes, searchQuery, filter, sortBy, latestOnly])
}
