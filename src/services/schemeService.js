import { VERIFIED_SCHEMES } from '../data/verifiedSchemes.js'
import { STATES, UNION_TERRITORIES, CENTRAL_GOVERNMENT, ALLOWED_SOURCE_DOMAINS, isOfficialHostname } from '../data/regions.js'

export function getSourceDomain(sourceUrl) {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, '')
  } catch {
    return sourceUrl
  }
}

export function isCentralScheme(scheme) {
  return scheme.state === CENTRAL_GOVERNMENT || scheme.stateId === null
}

export function isAllowedSource(sourceUrl) {
  try {
    const hostname = new URL(sourceUrl).hostname
    return isOfficialHostname(hostname)
  } catch {
    return false
  }
}

function enrichScheme(scheme) {
  return {
    ...scheme,
    sourceDomain: getSourceDomain(scheme.sourceUrl),
    isCentral: isCentralScheme(scheme),
    schemeLevel: isCentralScheme(scheme) ? 'central' : 'state',
  }
}

function stateSchemesForRegion(regionId) {
  return VERIFIED_SCHEMES.filter((scheme) => !isCentralScheme(scheme) && scheme.stateId === regionId).map(enrichScheme)
}

function buildCentralSchemes() {
  return VERIFIED_SCHEMES.filter(isCentralScheme).map(enrichScheme)
}

function buildRegion(regionDef, centralSchemes) {
  const stateSchemes = stateSchemesForRegion(regionDef.id)
  const stateAiSchemes = stateSchemes.filter((s) => s.category === 'ai')
  const stateCybersecuritySchemes = stateSchemes.filter((s) => s.category === 'cybersecurity')

  return {
    ...regionDef,
    stateAiSchemes,
    stateCybersecuritySchemes,
    stateSchemeCount: stateSchemes.length,
    schemeCount: stateSchemes.length + centralSchemes.length,
  }
}

function buildDirectory() {
  const centralSchemes = buildCentralSchemes()
  const centralAiSchemes = centralSchemes.filter((s) => s.category === 'ai')
  const centralCybersecuritySchemes = centralSchemes.filter((s) => s.category === 'cybersecurity')

  const states = STATES.map((region) => buildRegion(region, centralSchemes))
  const unionTerritories = UNION_TERRITORIES.map((region) => buildRegion(region, centralSchemes))
  const regions = [...states, ...unionTerritories]

  return {
    country: 'India',
    states,
    unionTerritories,
    regions,
    centralSchemes,
    centralAiSchemes,
    centralCybersecuritySchemes,
    verifiedSchemes: VERIFIED_SCHEMES.map(enrichScheme),
    meta: {
      totalRegions: regions.length,
      stateCount: states.length,
      utCount: unionTerritories.length,
      totalVerifiedSchemes: VERIFIED_SCHEMES.length,
      centralSchemeCount: centralSchemes.length,
      stateSchemeCount: VERIFIED_SCHEMES.length - centralSchemes.length,
      sources: ALLOWED_SOURCE_DOMAINS,
    },
  }
}

/** Loads the static verified schemes dataset (no network fetch). */
export function fetchSchemesDirectory() {
  return Promise.resolve().then(() => {
    const invalid = VERIFIED_SCHEMES.filter((s) => !isAllowedSource(s.sourceUrl))
    if (invalid.length > 0) {
      throw new Error(`Unverified source URLs found: ${invalid.map((s) => s.id).join(', ')}`)
    }
    return buildDirectory()
  })
}

export function getRegionById(directory, id) {
  return directory?.regions.find((r) => r.id === id) ?? null
}

export function getRegionSchemeCount(region) {
  if (!region) return 0
  return region.schemeCount ?? region.stateSchemeCount ?? 0
}

export function getTotalUniqueSchemes(directory) {
  return directory?.meta?.totalVerifiedSchemes ?? 0
}
