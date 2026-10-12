/**
 * Purpose: Will define mock Auth for the mock area of the Academy frontend.
 * Module: mock
 * Status: Planned — functionality not implemented.
 */

// F00-005: Approved frontend demo implementation; not production authentication.
import { MOCK_SESSION_KEY } from '../constants/storageKeys.js'
import { DEMO_USERS, getAuthorizedBranches } from './authFixtures.js'

export function validateMockSession(value) {
  if (!value || value.version !== 1 || typeof value.userId !== 'string') return null
  const user = DEMO_USERS.find((candidate) => candidate.id === value.userId && candidate.enabled)
  if (!user) return null
  const branches = getAuthorizedBranches(user)
  const branchId = branches.length === 1 ? branches[0].id : branches.some((branch) => branch.id === value.branchId) ? value.branchId : null
  return { user, branchId }
}

export function readMockSession() {
  try {
    const raw = window.localStorage.getItem(MOCK_SESSION_KEY)
    if (!raw) return null
    let session
    try { session = validateMockSession(JSON.parse(raw)) } catch { session = null }
    if (!session) window.localStorage.removeItem(MOCK_SESSION_KEY)
    return session
  } catch { throw new Error('Browser storage is unavailable. Please try the demo again when storage is enabled.') }
}

export function saveMockSession(session) {
  try {
    window.localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify({ version: 1, userId: session.user.id, branchId: session.branchId }))
  } catch { throw new Error('The demo session could not be saved. Please enable browser storage.') }
}

export function clearMockSession() {
  try { window.localStorage.removeItem(MOCK_SESSION_KEY) }
  catch { throw new Error('Saved demo session could not be cleared. Enable browser storage before refreshing.') }
}
