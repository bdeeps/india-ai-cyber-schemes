import { writeFileSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
  attachApplyReachabilityStatus,
  getHostname,
  validateAndCleanSchemes,
} from '../src/data/schemeValidation.js'
import { STATES, UNION_TERRITORIES } from '../src/data/regions.js'
import {
  FILTERS,
  buildFilterCounts,
  countSidebarOpportunitiesForRegion,
  filterSchemes,
  isPolicyScheme,
} from '../src/hooks/useFilteredSchemes.js'
import { buildQualityAudit } from './datasetQualityAudit.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const AUDIT_PATH = join(ROOT, 'src/data/datasetAudit.json')
const VERIFIED_SCHEMES_PATH = join(ROOT, 'src/data/verifiedSchemes.js')

const REQUIRED_APPLY_URLS = {
  'kerala-idea-grant-ksum': 'https://grants.startupmission.in',
  'telangana-tspark-grants': 'https://startup.telangana.gov.in/portal/user/signup',
  'kerala-acceleration-programme': 'https://leapx.startupmission.in/applynow',
  'karnataka-elevate-2025':
    'https://registration.eitbt.karnataka.gov.in/ktechregistration/dist/#/auth/login',
}

const DEFAULT_UI_FILTER_STATE = {
  searchQuery: '',
  activeFilters: new Set(),
  latestOnly: false,
  includePolicies: false,
}

function countByCategory(schemes, category) {
  return schemes.filter((scheme) => scheme.category === category).length
}

function buildSummary(schemes) {
  const sourceDomainsUsed = [
    ...new Set(schemes.map((scheme) => getHostname(scheme.sourceUrl)).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b))

  const withApplyUrl = schemes.filter((scheme) => scheme.applyUrl).length
  const totalSchemes = schemes.length
  const policyRecords = countByCategory(schemes, 'policy')
  const opportunitySchemes = totalSchemes - policyRecords
  const opportunityPercentage = totalSchemes > 0 ? (opportunitySchemes / totalSchemes) * 100 : 0
  const policyPercentage = totalSchemes > 0 ? (policyRecords / totalSchemes) * 100 : 0

  return {
    totalSchemes,
    totalCentralSchemes: schemes.filter((scheme) => scheme.schemeType === 'Central').length,
    totalStateSchemes: schemes.filter((scheme) => scheme.schemeType === 'State').length,
    opportunitySchemes,
    policyRecords,
    opportunityPercentage: Math.round(opportunityPercentage * 100) / 100,
    policyPercentage: Math.round(policyPercentage * 100) / 100,
    policies: policyRecords,
    grants: countByCategory(schemes, 'grant'),
    incubators: countByCategory(schemes, 'incubator'),
    accelerators: countByCategory(schemes, 'accelerator'),
    startupPrograms: countByCategory(schemes, 'startup-program'),
    aiInitiatives: countByCategory(schemes, 'ai-initiative'),
    cybersecurityInitiatives: countByCategory(schemes, 'cybersecurity-initiative'),
    centreOfExcellence: countByCategory(schemes, 'centre-of-excellence'),
    withApplyUrl,
    withoutApplyUrl: schemes.length - withApplyUrl,
    sourceDomainsUsed,
  }
}

function enrichSchemeForUi(scheme) {
  return {
    ...scheme,
    isCentral: scheme.schemeType === 'Central',
  }
}

function buildSidebarCounts(schemes, uiState) {
  const { searchQuery, activeFilters, latestOnly, includePolicies } = uiState
  const counts = {}
  const centralSchemes = schemes
    .filter((scheme) => scheme.schemeType === 'Central')
    .map(enrichSchemeForUi)

  for (const region of [...STATES, ...UNION_TERRITORIES]) {
    const stateSchemes = schemes
      .filter((scheme) => scheme.schemeType === 'State' && scheme.state === region.name)
      .map(enrichSchemeForUi)

    counts[region.name] = countSidebarOpportunitiesForRegion(
      { id: region.id, stateSchemes },
      centralSchemes,
      searchQuery,
      activeFilters,
      latestOnly,
      includePolicies,
    )
  }

  return counts
}

function buildUiSummary(schemes) {
  const uiState = DEFAULT_UI_FILTER_STATE
  const { searchQuery, activeFilters, latestOnly, includePolicies } = uiState

  const visibleDefault = filterSchemes(
    schemes.map(enrichSchemeForUi),
    searchQuery,
    activeFilters,
    latestOnly,
    includePolicies,
  )
  const opportunityPool = schemes.filter((scheme) => !isPolicyScheme(scheme))
  const policyPool = schemes.filter(isPolicyScheme)

  return {
    visibleOpportunities: visibleDefault.filter((scheme) => !isPolicyScheme(scheme)).length,
    visiblePolicies: visibleDefault.filter(isPolicyScheme).length,
    hiddenPolicies: policyPool.length,
    sidebarCounts: buildSidebarCounts(schemes.map(enrichSchemeForUi), uiState),
    filterCounts: buildFilterCounts(opportunityPool, policyPool, activeFilters, includePolicies),
    sidebarCountLogic:
      'State/UT sidebar counts: filtered state schemes only (excludes central). Excludes policy unless Include Policies is enabled.',
  }
}

function deriveDataStatusReason(schemes) {
  const opportunities = schemes.filter((scheme) => !isPolicyScheme(scheme))

  if (schemes.length === 0) {
    return 'No verified state opportunities found.'
  }

  if (opportunities.length === 0) {
    return 'Only policy-level information available.'
  }

  const categories = new Set(opportunities.map((scheme) => scheme.category))
  const hasGrantsIncubatorsAccelerators =
    categories.has('grant') || categories.has('incubator') || categories.has('accelerator')
  const hasAiCyber =
    categories.has('ai-initiative') || categories.has('cybersecurity-initiative')
  const hasOtherPrograms =
    categories.has('startup-program') || categories.has('centre-of-excellence')

  if (hasGrantsIncubatorsAccelerators || hasOtherPrograms) {
    return 'Verified opportunities available.'
  }

  if (hasAiCyber) {
    return 'Verified AI/cyber initiatives available.'
  }

  return 'No verified state opportunities found.'
}

function toAuditScheme(scheme) {
  const entry = {
    id: scheme.id,
    title: scheme.title,
    category: scheme.category,
    schemeType: scheme.schemeType,
    department: scheme.department,
    officialSource: scheme.officialSource,
    sourceUrl: scheme.sourceUrl,
    applyUrl: scheme.applyUrl ?? null,
    applyStatus: scheme.applyStatus ?? null,
  }

  if (scheme.subcategory) entry.subcategory = scheme.subcategory

  return entry
}

function buildRegions(schemes) {
  const regions = [...STATES, ...UNION_TERRITORIES]
    .map((region) => {
      const regionSchemes = schemes
        .filter((scheme) => scheme.schemeType === 'State' && scheme.state === region.name)
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(toAuditScheme)

      return {
        state: region.name,
        totalSchemes: regionSchemes.length,
        dataStatusReason: deriveDataStatusReason(
          schemes.filter((scheme) => scheme.schemeType === 'State' && scheme.state === region.name),
        ),
        schemes: regionSchemes,
      }
    })
    .sort((a, b) => a.state.localeCompare(b.state))

  return regions
}

function verifyRequiredApplyUrls(schemes) {
  const failures = []

  for (const [id, expectedUrl] of Object.entries(REQUIRED_APPLY_URLS)) {
    const scheme = schemes.find((entry) => entry.id === id)
    if (!scheme) {
      failures.push(`${id}: scheme not found`)
      continue
    }
    if (!scheme.applyUrl) {
      failures.push(`${id}: applyUrl is null`)
      continue
    }
    if (scheme.applyUrl.replace(/\/+$/, '') !== expectedUrl.replace(/\/+$/, '')) {
      failures.push(`${id}: expected ${expectedUrl}, got ${scheme.applyUrl}`)
    }
  }

  if (failures.length > 0) {
    throw new Error(`Required apply URL verification failed:\n${failures.join('\n')}`)
  }
}

function buildVerifiedSchemesExports(summary, generatedAt, applyReachabilityStatus) {
  const statusBlock = JSON.stringify(applyReachabilityStatus, null, 2)

  return `const DATASET_BASELINE_COUNT = ${summary.totalSchemes}

/** Apply portal reachability from last quality audit — regenerate: npm run generate:dataset */
const APPLY_REACHABILITY_STATUS = ${statusBlock}

const VALIDATED_SCHEMES = validateAndCleanSchemes(RAW_SCHEMES)

export const VERIFIED_SCHEMES = attachApplyReachabilityStatus(
  VALIDATED_SCHEMES,
  APPLY_REACHABILITY_STATUS,
)

export const CENTRAL_SCHEMES = VERIFIED_SCHEMES.filter((scheme) => scheme.schemeType === 'Central')
export const STATE_SCHEMES = VERIFIED_SCHEMES.filter((scheme) => scheme.schemeType === 'State')

/** Generated from VERIFIED_SCHEMES — regenerate: npm run generate:dataset */
export const DATASET_SUMMARY = ${JSON.stringify({ generatedAt, ...summary }, null, 2)}

export const COLLECTION_META = {
  collectedAt: DATASET_SUMMARY.generatedAt,
  regionsSearched: 36,
  centralSchemeCount: DATASET_SUMMARY.totalCentralSchemes,
  stateSchemeCount: DATASET_SUMMARY.totalStateSchemes,
  totalSchemeCount: DATASET_SUMMARY.totalSchemes,
  categoryCounts: {
    policy: DATASET_SUMMARY.policies,
    grant: DATASET_SUMMARY.grants,
    incubator: DATASET_SUMMARY.incubators,
    accelerator: DATASET_SUMMARY.accelerators,
    'startup-program': DATASET_SUMMARY.startupPrograms,
    'ai-initiative': DATASET_SUMMARY.aiInitiatives,
    'cybersecurity-initiative': DATASET_SUMMARY.cybersecurityInitiatives,
    'centre-of-excellence': DATASET_SUMMARY.centreOfExcellence,
  },
  applyLinkCounts: {
    withApplyUrl: DATASET_SUMMARY.withApplyUrl,
    withoutApplyUrl: DATASET_SUMMARY.withoutApplyUrl,
  },
  sourceDomainsUsed: DATASET_SUMMARY.sourceDomainsUsed,
  removedEntriesCount: DATASET_BASELINE_COUNT - VERIFIED_SCHEMES.length,
  allowedDomains: ['*.gov.in', '*.nic.in', ...ALLOWED_SOURCE_HOSTS],
}
`
}

function patchVerifiedSchemesExports(summary, generatedAt, applyReachabilityStatus) {
  const source = readFileSync(VERIFIED_SCHEMES_PATH, 'utf8')
  const markerMatch = source.match(/\nconst DATASET_BASELINE_COUNT = \d+\n/)
  const marker = markerMatch?.[0]
  if (!marker) {
    throw new Error('Could not locate export block in verifiedSchemes.js')
  }
  const markerIndex = source.indexOf(marker)

  if (markerIndex === -1) {
    throw new Error('Could not locate export block in verifiedSchemes.js')
  }

  const nextSource =
    source.slice(0, markerIndex) + '\n' + buildVerifiedSchemesExports(summary, generatedAt, applyReachabilityStatus)
  writeFileSync(VERIFIED_SCHEMES_PATH, nextSource, 'utf8')
}

function loadRawSchemes() {
  const source = readFileSync(VERIFIED_SCHEMES_PATH, 'utf8')
  const match = source.match(/const RAW_SCHEMES = (\[[\s\S]*?\n\])/)
  if (!match) {
    throw new Error('Could not parse RAW_SCHEMES from verifiedSchemes.js')
  }
  return Function(`"use strict"; return (${match[1]})`)()
}

async function main() {
  const rawSchemes = loadRawSchemes()
  const validatedSchemes = validateAndCleanSchemes(rawSchemes)
  verifyRequiredApplyUrls(validatedSchemes)

  const generatedAt = new Date().toISOString()
  const qualityAudit = await buildQualityAudit(rawSchemes, validatedSchemes)
  const schemes = attachApplyReachabilityStatus(
    validatedSchemes,
    qualityAudit.applyReachabilityStatus ?? {},
  )

  const summary = buildSummary(schemes)
  const uiSummary = buildUiSummary(schemes)
  const regions = buildRegions(schemes)
  const audit = {
    generatedFrom: 'VERIFIED_SCHEMES',
    generatedAt,
    summary,
    uiSummary,
    qualityAudit,
    regions,
    schemes: schemes.map(toAuditScheme),
  }

  writeFileSync(AUDIT_PATH, `${JSON.stringify(audit, null, 2)}\n`, 'utf8')
  patchVerifiedSchemesExports(summary, generatedAt, qualityAudit.applyReachabilityStatus ?? {})

  console.log('Updated total counts:')
  console.log('- totalSchemes:', summary.totalSchemes)
  console.log('- opportunitySchemes:', summary.opportunitySchemes)
  console.log('- policyRecords:', summary.policyRecords)
  console.log('- opportunityPercentage:', summary.opportunityPercentage)
  console.log('- policyPercentage:', summary.policyPercentage)
  console.log('- policies:', summary.policies)
  console.log('- withApplyUrl:', summary.withApplyUrl)
  console.log('- withoutApplyUrl:', summary.withoutApplyUrl)
  console.log('- visibleOpportunities (default UI):', uiSummary.visibleOpportunities)
  console.log('- visiblePolicies (default UI):', uiSummary.visiblePolicies)
  console.log('- hiddenPolicies (default UI):', uiSummary.hiddenPolicies)
  console.log('\nSidebar count logic:', uiSummary.sidebarCountLogic)
  console.log('- Arunachal Pradesh (sidebar):', uiSummary.sidebarCounts['Arunachal Pradesh'])
  console.log('- Karnataka (sidebar):', uiSummary.sidebarCounts.Karnataka)
  console.log('\nPolicy filter in uiSummary.filterCounts:', uiSummary.filterCounts[FILTERS.POLICIES])
  console.log('\nQuality audit:')
  console.log('- brokenUrls:', qualityAudit.brokenUrls.length)
  console.log('- homepageUrls:', qualityAudit.homepageUrls.length)
  console.log('- duplicateEntries:', qualityAudit.duplicateEntries.length)
  console.log('- invalidApplyUrls:', qualityAudit.invalidApplyUrls.length)
  console.log('- misclassifiedEntries:', qualityAudit.misclassifiedEntries.length)
  console.log(
    '- temporarilyUnreachableApplyUrls:',
    qualityAudit.temporarilyUnreachableApplyUrls?.length ?? 0,
  )
  console.log('\nFiles overwritten:')
  console.log('- src/data/datasetAudit.json')
  console.log('- src/data/verifiedSchemes.js (exports)')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
