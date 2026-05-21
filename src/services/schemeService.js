import { VERIFIED_SCHEMES } from '../data/verifiedSchemes.js'
import { isAllowedSourceUrl, getSourceType } from '../data/schemeValidation.js'
import { STATES, UNION_TERRITORIES, CENTRAL_GOVERNMENT, ALLOWED_SOURCE_DOMAINS } from '../data/regions.js'

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
  return isAllowedSourceUrl(sourceUrl)
}

function isHttpUrl(value) {
  return typeof value === 'string' && (value.startsWith('https://') || value.startsWith('http://'))
}

function isValidSchemeRecord(scheme) {
  const sourceOk = scheme.sourceUrl === null || (isHttpUrl(scheme.sourceUrl) && isAllowedSource(scheme.sourceUrl))
  const applyOk = scheme.applyUrl === null || scheme.applyUrl === undefined || isHttpUrl(scheme.applyUrl)
  return sourceOk && applyOk
}

function getValidSchemes(schemes) {
  return schemes.filter(isValidSchemeRecord)
}

function enrichScheme(scheme) {
  return {
    ...scheme,
    sourceDomain: getSourceDomain(scheme.sourceUrl),
    sourceType: getSourceType(scheme.sourceUrl),
    isCentral: isCentralScheme(scheme),
    schemeLevel: isCentralScheme(scheme) ? 'central' : 'state',
  }
}

function stateSchemesForRegion(regionDef, schemes) {
  return schemes
    .filter((scheme) => !isCentralScheme(scheme) && scheme.state === regionDef.name)
    .map(enrichScheme)
}

function buildCentralSchemes(schemes) {
  return schemes.filter(isCentralScheme).map(enrichScheme)
}

function buildRegion(regionDef, schemes) {
  const stateSchemes = stateSchemesForRegion(regionDef, schemes)
  const stateGrantSchemes = stateSchemes.filter((scheme) => scheme.category === 'grants')
  const stateIncubatorSchemes = stateSchemes.filter((scheme) => scheme.category === 'incubators' || scheme.category === 'accelerators')
  const stateStartupPrograms = stateSchemes.filter((scheme) => scheme.category === 'startup-programs')
  const stateAiSchemes = stateSchemes.filter((scheme) => scheme.category === 'ai')
  const stateCybersecuritySchemes = stateSchemes.filter((scheme) => scheme.category === 'cybersecurity')

  return {
    ...regionDef,
    stateSchemes,
    stateGrantSchemes,
    stateIncubatorSchemes,
    stateStartupPrograms,
    stateAiSchemes,
    stateCybersecuritySchemes,
    stateSchemeCount: stateSchemes.length,
    schemeCount: stateSchemes.length,
  }
}

function buildDirectory(validSchemes) {
  const centralSchemes = buildCentralSchemes(validSchemes)
  const centralAiSchemes = centralSchemes.filter((s) => s.category === 'ai')
  const centralCybersecuritySchemes = centralSchemes.filter((s) => s.category === 'cybersecurity')

  const states = STATES.map((region) => buildRegion(region, validSchemes))
  const unionTerritories = UNION_TERRITORIES.map((region) => buildRegion(region, validSchemes))
  const regions = [...states, ...unionTerritories]

  return {
    country: 'India',
    states,
    unionTerritories,
    regions,
    centralSchemes,
    centralAiSchemes,
    centralCybersecuritySchemes,
    verifiedSchemes: validSchemes.map(enrichScheme),
    meta: {
      totalRegions: regions.length,
      stateCount: states.length,
      utCount: unionTerritories.length,
      totalVerifiedSchemes: validSchemes.length,
      centralSchemeCount: centralSchemes.length,
      stateSchemeCount: validSchemes.length - centralSchemes.length,
      sources: ALLOWED_SOURCE_DOMAINS,
    },
  }
}

/** Loads the static verified schemes dataset (no network fetch). */
export function fetchSchemesDirectory() {
  return Promise.resolve().then(() => {
    const validSchemes = getValidSchemes(VERIFIED_SCHEMES)
    return buildDirectory(validSchemes)
  })
}

export function getRegionById(directory, id) {
  return directory?.regions.find((r) => r.id === id) ?? null
}

export function getRegionSchemeCount(region) {
  if (!region) return 0
  return region.stateSchemeCount ?? 0
}

export function getTotalUniqueSchemes(directory) {
  return directory?.meta?.totalVerifiedSchemes ?? 0
}
