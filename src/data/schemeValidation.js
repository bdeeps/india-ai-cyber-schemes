/** Collection-layer validation for verified government initiatives. */

export const EXCLUDED_SOURCE_URL_PATTERNS = [
  '/article/',
  '/news/',
  '/blog/',
  '/showcase/',
  '/top/',
  '/press/',
  '/media/',
  '/events/',
  '/announcement/',
  '/story/',
  '/updates/',
]

export const ALLOWED_SOURCE_HOSTS = [
  'meity.gov.in',
  'startupindia.gov.in',
  'dpiit.gov.in',
  'tdb.gov.in',
  'indiaai.gov.in',
  'cert-in.org.in',
  'mha.gov.in',
  'niti.gov.in',
  'nasscom.in',
  'cyseck.in',
]

export const PARTNER_ECOSYSTEM_HOSTS = ['nasscom.in', 'cyseck.in']

const REQUIRED_FIELDS = [
  'id',
  'title',
  'state',
  'category',
  'department',
  'description',
  'officialSource',
  'sourceUrl',
  'schemeType',
]

export const VALID_CATEGORIES = new Set([
  'policy',
  'grant',
  'incubator',
  'accelerator',
  'startup-program',
  'ai-initiative',
  'cybersecurity-initiative',
  'centre-of-excellence',
])

const VALID_SCHEME_TYPES = new Set(['Central', 'State'])

/** Categories that never have a direct public application page. */
const NON_APPLICABLE_APPLY_CATEGORIES = new Set(['policy', 'centre-of-excellence'])

const APPLY_URL_SIGNALS = [
  'apply',
  'register',
  'submit proposal',
  'open call',
  'apply now',
  'incubation apply',
  'incubation application',
  'funding application',
  'proposal submission',
]

const APPLY_PATH_SIGNALS = [
  'apply',
  'register',
  'login',
  'signup',
  'signin',
  'call-proposal',
  'call-for-proposal',
  'open-call',
  'submit',
  'proposal',
  'seedfund',
  'maarg',
  'compute',
  'ktechregistration',
  'applynow',
  'portal',
]

/** Official apply-portal hosts (including KSUM/Telangana portals linked from .gov.in pages). */
export const OFFICIAL_APPLY_HOSTS = [
  'startupmission.kerala.gov.in',
  'grants.startupmission.in',
  'leapx.startupmission.in',
  'startup.telangana.gov.in',
  'seedfund.startupindia.gov.in',
  'maarg.startupindia.gov.in',
  'registration.eitbt.karnataka.gov.in',
]

/** Government application portals — HTTP failures must not strip applyUrl. */
export const KNOWN_APPLICATION_PORTAL_ROOTS = [
  'eitbt.karnataka.gov.in',
  'startupindia.gov.in',
  'startupmission.kerala.gov.in',
  'startup.telangana.gov.in',
]

export function isKnownApplicationPortalHost(hostname) {
  const host = normalizeHost(hostname)
  return KNOWN_APPLICATION_PORTAL_ROOTS.some((root) => host === root || host.endsWith(`.${root}`))
}

export function isKnownApplicationPortalUrl(url) {
  return isKnownApplicationPortalHost(getHostname(url))
}

const REJECTED_APPLY_HOSTS = [
  'bit.ly',
  't.co',
  'goo.gl',
  'tinyurl.com',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'zfrmz.com',
  'forms.gle',
  'typeform.com',
  'jotform.com',
  'facebook.com',
  'fb.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'instagram.com',
  'tiktok.com',
  'youtube.com',
  'youtu.be',
]

export const VALID_SUBCATEGORIES = new Set(['ai-policy', 'cybersecurity-policy'])

function isHttpUrl(value) {
  return typeof value === 'string' && (value.startsWith('https://') || value.startsWith('http://'))
}

export function getHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

export function isPartnerEcosystemHost(hostname) {
  const host = hostname.replace(/^www\./, '').toLowerCase()
  return PARTNER_ECOSYSTEM_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`))
}

export function getSourceType(sourceUrl) {
  try {
    return isPartnerEcosystemHost(new URL(sourceUrl).hostname) ? 'partner' : 'government'
  } catch {
    return 'government'
  }
}

export function isAllowedSourceHost(hostname) {
  const host = hostname.replace(/^www\./, '').toLowerCase()
  if (host === 'gov.in' || host.endsWith('.gov.in')) return true
  if (host === 'nic.in' || host.endsWith('.nic.in')) return true
  if (host === 'cert-in.org.in' || host.endsWith('.cert-in.org.in')) return true
  return ALLOWED_SOURCE_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`))
}

export function isAllowedSourceUrl(sourceUrl) {
  if (!isHttpUrl(sourceUrl)) return false
  if (EXCLUDED_SOURCE_URL_PATTERNS.some((pattern) => sourceUrl.toLowerCase().includes(pattern))) {
    return false
  }
  return isAllowedSourceHost(getHostname(sourceUrl))
}

function hasRequiredFields(scheme) {
  return REQUIRED_FIELDS.every((field) => {
    const value = scheme[field]
    if (value === null || value === undefined) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
  })
}

function isNamedInitiative(scheme) {
  const title = scheme.title?.trim() ?? ''
  if (title.length < 8) return false
  const genericTitles = [
    'home',
    'overview',
    'department',
    'policies and guidelines',
    'recent orders',
    'indiaai portal',
  ]
  return !genericTitles.some((g) => title.toLowerCase() === g)
}

/** Root landing pages, awareness sites, and generic platform hubs — not named programs. */
function isPortalOrAwarenessSite(scheme) {
  const url = scheme.sourceUrl?.trim().toLowerCase() ?? ''
  const description = scheme.description?.toLowerCase() ?? ''
  const title = scheme.title?.toLowerCase() ?? ''

  let pathname = '/'
  try {
    const parsed = new URL(url)
    pathname = parsed.pathname.replace(/\/+$/, '') || '/'
  } catch {
    return true
  }

  const isRootLanding = pathname === '/' || pathname === ''
  const isAwarenessPlatform =
    (description.includes('awareness') || description.includes('learning platform')) &&
    (description.includes('platform') || description.includes('website') || isRootLanding)

  if (isAwarenessPlatform && isRootLanding) return true

  if (scheme.category === 'ai-initiative' && isRootLanding && title.includes('for ai')) return true

  if (
    scheme.category === 'cybersecurity-initiative' &&
    url.includes('cyseck.in/industry-and-startups') &&
    !title.includes('centre of excellence')
  ) {
    return true
  }

  return false
}

function normalizeHost(hostname) {
  return hostname.replace(/^www\./, '').toLowerCase()
}

function looksLikeApplyUrl(url) {
  const lower = url.toLowerCase()
  return (
    APPLY_URL_SIGNALS.some((signal) => lower.includes(signal.replace(/\s+/g, '')) || lower.includes(signal)) ||
    APPLY_PATH_SIGNALS.some((signal) => lower.includes(signal))
  )
}

/** Host is an official apply portal (*.gov.in, *.nic.in, or listed initiative portals). */
export function isOfficialApplyHost(hostname) {
  const host = normalizeHost(hostname)
  if (host.endsWith('.gov.in') || host.endsWith('.nic.in')) return true
  if (host.endsWith('.cert-in.org.in')) return true
  return OFFICIAL_APPLY_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`))
}

function isRejectedApplyHost(hostname) {
  const host = normalizeHost(hostname)
  return REJECTED_APPLY_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`))
}

/** Reject shortened links, social media, and known third-party form hosts. */
export function isRejectedApplyUrl(url) {
  if (!isHttpUrl(url)) return true

  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return true
  }

  const host = getHostname(url)
  if (!host || isRejectedApplyHost(host)) return true

  const lower = url.toLowerCase()
  if (REJECTED_APPLY_HOSTS.some((domain) => lower.includes(domain))) return true

  return parsed.protocol !== 'https:' && parsed.protocol !== 'http:'
}

function isGenericLandingApplyUrl(url) {
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname.replace(/\/+$/, '') || '/'
    const isRoot = pathname === '/'
    const host = getHostname(url)

    if (OFFICIAL_APPLY_HOSTS.includes(host)) return false
    if (host.endsWith('.startupindia.gov.in')) return false

    return isRoot && !looksLikeApplyUrl(url)
  } catch {
    return true
  }
}

function shouldBlockApplyForSchemeIdentity(scheme) {
  const id = scheme.id ?? ''
  const title = (scheme.title ?? '').toLowerCase()

  return (
    id.includes('cyber-swachhta') ||
    id.includes('cert') ||
    id.includes('csirt') ||
    id.includes('i4c') ||
    title.includes('policy') ||
    title.includes('framework') ||
    title.includes('mission.html')
  )
}

/** Apply URL path/host matches an application, registration, or proposal workflow. */
export function belongsToInitiativeWorkflow(url, scheme) {
  if (looksLikeApplyUrl(url)) return true

  const applyHost = getHostname(url)
  const sourceHost = getHostname(scheme.sourceUrl ?? '')

  if (OFFICIAL_APPLY_HOSTS.includes(applyHost)) return true
  if (applyHost.endsWith('.startupindia.gov.in')) return true

  if (scheme.category === 'grant' && rawUrlsMatch(url, scheme.sourceUrl)) return true

  if (sourceHost && applyHost === sourceHost && scheme.category !== 'policy') return true

  return false
}

function rawUrlsMatch(a, b) {
  if (!a || !b) return false
  return a.trim().replace(/\/+$/, '') === b.trim().replace(/\/+$/, '')
}

export function getApplyUrlRejectionReason(scheme) {
  if (NON_APPLICABLE_APPLY_CATEGORIES.has(scheme.category)) {
    return `category "${scheme.category}" does not accept apply URLs`
  }

  const raw = scheme.applyUrl
  if (raw === null || raw === undefined || raw === '') return null
  if (!isHttpUrl(raw)) return 'not a valid HTTP(S) URL'

  if (shouldBlockApplyForSchemeIdentity(scheme)) return 'policy or awareness initiative'

  if (isRejectedApplyUrl(raw)) return 'shortened, social, or third-party form link'

  const applyHost = getHostname(raw)
  if (!isOfficialApplyHost(applyHost)) return `host not official: ${applyHost}`

  if (isGenericLandingApplyUrl(raw)) return 'generic landing page without workflow path'

  if (!belongsToInitiativeWorkflow(raw, scheme)) return 'URL does not match initiative workflow'

  return null
}

/** Resolve applyUrl — only official workflow portals; never invent links. */
export function resolveApplyUrl(scheme) {
  const reason = getApplyUrlRejectionReason(scheme)
  if (reason !== null) return null
  return typeof scheme.applyUrl === 'string' ? scheme.applyUrl.trim() : null
}

/** Audit raw apply URLs before/after validation for reporting. */
export function auditApplyUrls(rawSchemes) {
  const validated = []
  const rejected = []

  for (const scheme of rawSchemes) {
    const raw = scheme.applyUrl
    if (raw === null || raw === undefined || raw === '') continue

    const reason = getApplyUrlRejectionReason(scheme)
    const entry = {
      id: scheme.id,
      title: scheme.title,
      applyUrl: raw.trim(),
    }

    if (reason) {
      rejected.push({ ...entry, reason })
    } else {
      validated.push(entry)
    }
  }

  return { validated, rejected }
}

export function normalizeSchemeRecord(scheme) {
  const normalized = {
    id: scheme.id,
    title: scheme.title?.trim(),
    state: scheme.state,
    stateId: scheme.stateId ?? null,
    category: scheme.category,
    department: scheme.department?.trim(),
    description: scheme.description?.trim(),
    officialSource: scheme.officialSource?.trim(),
    sourceUrl: scheme.sourceUrl?.trim(),
    applyUrl: resolveApplyUrl(scheme),
    applyStatus: scheme.applyStatus ?? null,
    launchYear: scheme.launchYear ?? null,
    schemeType: scheme.schemeType,
  }

  if (scheme.subcategory) {
    if (scheme.category === 'policy' && VALID_SUBCATEGORIES.has(scheme.subcategory)) {
      normalized.subcategory = scheme.subcategory
    }
  }

  return normalized
}

export function getSchemeValidationErrors(scheme) {
  const errors = []
  const normalized = normalizeSchemeRecord(scheme)

  if (!hasRequiredFields(normalized)) {
    errors.push('missing required fields')
  }

  if (!VALID_CATEGORIES.has(normalized.category)) {
    errors.push(`invalid category: ${normalized.category}`)
  }

  if (!VALID_SCHEME_TYPES.has(normalized.schemeType)) {
    errors.push(`invalid schemeType: ${normalized.schemeType}`)
  }

  if (!isNamedInitiative(normalized)) {
    errors.push('title is not a named initiative')
  }

  if (isPortalOrAwarenessSite(normalized)) {
    errors.push('source is a portal, awareness site, or generic platform page')
  }

  if (!isAllowedSourceUrl(normalized.sourceUrl)) {
    errors.push(`source URL not allowed: ${normalized.sourceUrl}`)
  }

  if (
    normalized.launchYear !== null &&
    (typeof normalized.launchYear !== 'number' || normalized.launchYear < 1990)
  ) {
    errors.push('launchYear must be a valid year or null')
  }

  if (normalized.description && normalized.description.length < 40) {
    errors.push('description too short')
  }

  return errors
}

export function isValidScheme(scheme) {
  return getSchemeValidationErrors(scheme).length === 0
}

export function dedupeSchemes(schemes) {
  const seenIds = new Set()
  const seenSourceUrls = new Set()
  const result = []

  for (const scheme of schemes) {
    const normalized = normalizeSchemeRecord(scheme)
    if (seenIds.has(normalized.id)) continue
    if (seenSourceUrls.has(normalized.sourceUrl)) continue
    seenIds.add(normalized.id)
    seenSourceUrls.add(normalized.sourceUrl)
    result.push(normalized)
  }

  return result
}

export function attachApplyReachabilityStatus(schemes, statusById = {}) {
  return schemes.map((scheme) => {
    const applyStatus = statusById[scheme.id] ?? scheme.applyStatus ?? null
    if (applyStatus === scheme.applyStatus) return scheme
    return { ...scheme, applyStatus }
  })
}

export function validateAndCleanSchemes(rawSchemes) {
  const deduped = dedupeSchemes(rawSchemes)
  return deduped.filter(isValidScheme)
}

export function buildCollectionSummary(schemes, removedCount = 0) {
  const countBy = (category) => schemes.filter((s) => s.category === category).length

  const withApplyUrl = schemes.filter((s) => s.applyUrl).length

  const sourceDomainsUsed = [
    ...new Set(schemes.map((s) => getHostname(s.sourceUrl)).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b))

  return {
    totalVerifiedSchemes: schemes.length,
    policies: countBy('policy'),
    grants: countBy('grant'),
    incubators: countBy('incubator'),
    accelerators: countBy('accelerator'),
    startupPrograms: countBy('startup-program'),
    aiInitiatives: countBy('ai-initiative'),
    cybersecurityInitiatives: countBy('cybersecurity-initiative'),
    centresOfExcellence: countBy('centre-of-excellence'),
    withApplyUrl,
    withoutApplyUrl: schemes.length - withApplyUrl,
    sourceDomainsUsed,
    removedEntriesCount: removedCount,
    centralCount: schemes.filter((s) => s.schemeType === 'Central').length,
    stateCount: schemes.filter((s) => s.schemeType === 'State').length,
  }
}
