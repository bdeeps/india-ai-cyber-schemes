import { execSync } from 'child_process'
import {
  auditApplyUrls,
  getHostname,
  getSchemeValidationErrors,
  isKnownApplicationPortalUrl,
} from '../src/data/schemeValidation.js'
import { STATES, UNION_TERRITORIES } from '../src/data/regions.js'
import { isPolicyScheme } from '../src/hooks/useFilteredSchemes.js'

/** Hosts where the site root is the official program portal (not a department homepage). */
const PROGRAM_PORTAL_HOSTS = new Set([
  'seedfund.startupindia.gov.in',
  'maarg.startupindia.gov.in',
  'csk.gov.in',
])

const POLICY_TITLE_PATTERN = /\b(policy|framework)\b/i
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

function normalizeUrl(url) {
  if (!url) return ''
  try {
    const parsed = new URL(url.trim())
    const path = parsed.pathname.replace(/\/+$/, '') || '/'
    return `${parsed.origin}${path}${parsed.hash}`.toLowerCase()
  } catch {
    return url.trim().toLowerCase()
  }
}

function isRootPathname(url) {
  try {
    const pathname = new URL(url).pathname.replace(/\/+$/, '') || '/'
    return pathname === '/' || pathname === '/en' || pathname === '/kn'
  } catch {
    return true
  }
}

function isHomepageSourceUrl(url) {
  const host = getHostname(url)
  if (!host || !isRootPathname(url)) return false
  return !PROGRAM_PORTAL_HOSTS.has(host)
}

function isMirrorApplyWithoutWorkflow(scheme) {
  if (!scheme.applyUrl || !scheme.sourceUrl) return false
  if (normalizeUrl(scheme.applyUrl) !== normalizeUrl(scheme.sourceUrl)) return false
  if (PROGRAM_PORTAL_HOSTS.has(getHostname(scheme.sourceUrl))) return false

  const lower = `${scheme.sourceUrl} ${scheme.applyUrl}`.toLowerCase()
  if (
    lower.includes('call-proposal') ||
    lower.includes('call-for-proposal') ||
    lower.includes('open-call')
  ) {
    return false
  }

  return true
}

async function fetchUrlStatus(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'IndiaAICyberSchemesQualityAudit/1.0' },
    })
    clearTimeout(timeout)
    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
    }
  } catch (error) {
    clearTimeout(timeout)
    try {
      const code = execSync(
        `curl -sL -o /dev/null -w "%{http_code}" --max-time 15 ${JSON.stringify(url)}`,
        { encoding: 'utf8' },
      ).trim()
      const status = Number(code)
      return {
        ok: status >= 200 && status < 400,
        status,
        finalUrl: url,
        via: 'curl',
      }
    } catch (curlError) {
      return {
        ok: false,
        status: 0,
        error: curlError.message || error.message,
      }
    }
  }
}

function findDuplicateEntries(schemes) {
  const bySource = new Map()
  const byTitleState = new Map()
  const duplicateEntries = []

  for (const scheme of schemes) {
    const sourceKey = normalizeUrl(scheme.sourceUrl)
    if (sourceKey) {
      if (!bySource.has(sourceKey)) bySource.set(sourceKey, [])
      bySource.get(sourceKey).push(scheme.id)
    }

    const titleKey = `${scheme.state}::${scheme.title.trim().toLowerCase()}`
    if (!byTitleState.has(titleKey)) byTitleState.set(titleKey, [])
    byTitleState.get(titleKey).push(scheme.id)
  }

  for (const [sourceUrl, ids] of bySource.entries()) {
    if (ids.length > 1) {
      duplicateEntries.push({ type: 'sourceUrl', sourceUrl, ids })
    }
  }

  for (const [titleState, ids] of byTitleState.entries()) {
    if (ids.length > 1) {
      duplicateEntries.push({ type: 'titleState', key: titleState, ids })
    }
  }

  return duplicateEntries
}

function findMisclassifiedEntries(schemes) {
  const misclassifiedEntries = []

  for (const scheme of schemes) {
    const title = scheme.title ?? ''
    const errors = getSchemeValidationErrors(scheme)

    if (scheme.category === 'policy' && !isPolicyScheme(scheme)) {
      misclassifiedEntries.push({
        id: scheme.id,
        title,
        category: scheme.category,
        reason: 'category is not "policy" but entry is policy document',
      })
    }

    if (scheme.category !== 'policy' && isPolicyScheme(scheme)) {
      misclassifiedEntries.push({
        id: scheme.id,
        title,
        category: scheme.category,
        reason: 'policy category used for non-policy initiative',
      })
    }

    if (scheme.category !== 'policy' && POLICY_TITLE_PATTERN.test(title)) {
      misclassifiedEntries.push({
        id: scheme.id,
        title,
        category: scheme.category,
        reason: 'title indicates policy document but category is an opportunity type',
      })
    }

    if (
      scheme.category === 'policy' &&
      scheme.subcategory &&
      !['ai-policy', 'cybersecurity-policy'].includes(scheme.subcategory)
    ) {
      misclassifiedEntries.push({
        id: scheme.id,
        title,
        category: scheme.category,
        reason: `unexpected policy subcategory: ${scheme.subcategory}`,
      })
    }

    if (scheme.category !== 'policy' && scheme.subcategory) {
      misclassifiedEntries.push({
        id: scheme.id,
        title,
        category: scheme.category,
        reason: 'subcategory set on non-policy entry',
      })
    }

    for (const error of errors) {
      misclassifiedEntries.push({
        id: scheme.id,
        title,
        category: scheme.category,
        reason: error,
      })
    }
  }

  const seen = new Set()
  return misclassifiedEntries.filter((entry) => {
    const key = `${entry.id}::${entry.reason}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function findInvalidApplyUrls(rawSchemes, verifiedSchemes) {
  const invalidApplyUrls = []
  const verifiedById = new Map(verifiedSchemes.map((scheme) => [scheme.id, scheme]))
  const { rejected } = auditApplyUrls(rawSchemes)

  for (const entry of rejected) {
    invalidApplyUrls.push({
      id: entry.id,
      title: entry.title,
      applyUrl: entry.applyUrl,
      reason: entry.reason,
    })
  }

  for (const scheme of verifiedSchemes) {
    if (isMirrorApplyWithoutWorkflow(scheme)) {
      invalidApplyUrls.push({
        id: scheme.id,
        title: scheme.title,
        applyUrl: scheme.applyUrl,
        reason: 'applyUrl mirrors source landing page without a distinct application workflow',
      })
    }
  }

  for (const raw of rawSchemes) {
    if (!raw.applyUrl) continue
    const verified = verifiedById.get(raw.id)
    if (verified?.applyUrl) continue
    const already = invalidApplyUrls.some((entry) => entry.id === raw.id)
    if (!already) {
      invalidApplyUrls.push({
        id: raw.id,
        title: raw.title,
        applyUrl: raw.applyUrl,
        reason: 'applyUrl removed during validation',
      })
    }
  }

  return invalidApplyUrls
}

function verifyDataStatusReasons(schemes) {
  const issues = []

  for (const region of [...STATES, ...UNION_TERRITORIES]) {
    const regionSchemes = schemes.filter(
      (scheme) => scheme.schemeType === 'State' && scheme.state === region.name,
    )
    const expected = deriveDataStatusReason(regionSchemes)
    const opportunities = regionSchemes.filter((scheme) => !isPolicyScheme(scheme))
    const categories = new Set(opportunities.map((scheme) => scheme.category))

    issues.push({
      state: region.name,
      expected: expected,
      schemeCount: regionSchemes.length,
      opportunityCount: opportunities.length,
      policyOnly: opportunities.length === 0 && regionSchemes.some(isPolicyScheme),
      categories: [...categories],
    })
  }

  return issues
}

export async function buildQualityAudit(rawSchemes, verifiedSchemes) {
  const brokenUrls = []
  const temporarilyUnreachableApplyUrls = []
  const homepageUrls = []
  const applyReachabilityStatus = {}

  const urlsToCheck = new Map()
  for (const scheme of verifiedSchemes) {
    for (const field of ['sourceUrl', 'applyUrl']) {
      const url = scheme[field]
      if (!url) continue
      if (!urlsToCheck.has(url)) urlsToCheck.set(url, [])
      urlsToCheck.get(url).push({ id: scheme.id, field })
    }
  }

  const urlList = [...urlsToCheck.keys()]
  for (let index = 0; index < urlList.length; index += 6) {
    const batch = urlList.slice(index, index + 6)
    const results = await Promise.all(
      batch.map(async (url) => ({ url, ...(await fetchUrlStatus(url)) })),
    )

    for (const result of results) {
      const refs = urlsToCheck.get(result.url)
      if (!result.ok || result.status >= 400) {
        for (const ref of refs) {
          const entry = {
            id: ref.id,
            field: ref.field,
            url: result.url,
            status: result.status,
            error: result.error ?? null,
            finalUrl: result.finalUrl ?? null,
          }

          if (ref.field === 'applyUrl' && isKnownApplicationPortalUrl(result.url)) {
            temporarilyUnreachableApplyUrls.push(entry)
            applyReachabilityStatus[ref.id] = 'temporarily_unreachable'
            continue
          }

          brokenUrls.push(entry)
        }
      }
    }
  }

  for (const scheme of verifiedSchemes) {
    if (isHomepageSourceUrl(scheme.sourceUrl)) {
      homepageUrls.push({
        id: scheme.id,
        title: scheme.title,
        url: scheme.sourceUrl,
        reason: 'sourceUrl is a root homepage path on a general government domain',
      })
    }
  }

  const duplicateEntries = findDuplicateEntries(verifiedSchemes)
  const invalidApplyUrls = findInvalidApplyUrls(rawSchemes, verifiedSchemes)
  const misclassifiedEntries = findMisclassifiedEntries(verifiedSchemes)
  verifyDataStatusReasons(verifiedSchemes)

  return {
    brokenUrls,
    duplicateEntries,
    homepageUrls,
    invalidApplyUrls,
    misclassifiedEntries,
    temporarilyUnreachableApplyUrls,
    applyReachabilityStatus,
  }
}
