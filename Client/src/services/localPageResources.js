import { MOCK_DATABASE_KEY, MOCK_ORGANIZATION_KEY, MOCK_SESSION_KEY } from '../constants/storageKeys.js'

// Transient presentation snapshots, never a second source of truth. Existing services
// still revalidate/reload on mount. Any saved-data/session change drops ALL snapshots.
const resources = new Map()
let signature = null
let version = 0
const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Karachi' })
export function clearPageResources() { resources.clear(); signature = null; version += 1 }
export function capturePageVersion() {
  try {
    const next = [MOCK_DATABASE_KEY, MOCK_ORGANIZATION_KEY, MOCK_SESSION_KEY].map(key => localStorage.getItem(key))
    next.push(day.format(new Date()), new Date().toISOString().slice(0, 10))
    if (!next[2]) { clearPageResources(); return null }
    if (!signature || next.some((value, index) => value !== signature[index])) {
      resources.clear(); signature = next; version += 1
    }
    return version
  } catch { clearPageResources(); return null } // Real services keep their storage errors.
}
export function peekPageResource(key, overrides) {
  if (capturePageVersion() === null || !resources.has(key)) return null
  const value = structuredClone(resources.get(key))
  return overrides ? { ...value, ...overrides } : value
}
export function rememberPageResource(key, value, startedVersion) {
  if (startedVersion !== null && capturePageVersion() === startedVersion) {
    if (resources.size >= 24 && !resources.has(key)) resources.delete(resources.keys().next().value)
    resources.set(key, structuredClone(value))
  }
  return value
}

// Reuse the same bounded, canonical-version cache for expensive authorized reads.
// Callers must enforce authorization before entering this helper.
export async function readPageResource(key, load) {
  const cached = peekPageResource(key)
  if (cached !== null) return cached
  const startedVersion = capturePageVersion()
  const value = await load()
  return rememberPageResource(key, value, startedVersion)
}
