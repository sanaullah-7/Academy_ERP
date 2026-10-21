/**
 * Purpose: Will define Auth Context for the contexts area of the Academy frontend.
 * Module: contexts
 * Status: Planned — functionality not implemented.
 */

// F00-005: Approved frontend demo implementation; not production authentication.
import { useEffect, useRef, useState } from 'react'
import { AuthContext } from './accessContexts.js'
import { authService } from '../services/authService.js'

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', session: null, error: '', revision: 0 })
  const sequence = useRef(0)
  useEffect(() => {
    const request = ++sequence.current
    authService.getSession().then((session) => {
      if (request === sequence.current) setState((previous) => ({ status: 'ready', session, error: '', revision: previous.revision + 1 }))
    }).catch((error) => {
      if (request === sequence.current) setState((previous) => ({ status: 'ready', session: null, error: error.message, revision: previous.revision + 1 }))
    })
    return () => { sequence.current += 1 }
  }, [])

  async function login(credentials) {
    const request = ++sequence.current
    setState((previous) => ({ ...previous, status: 'loading', session: null, error: '', revision: previous.revision + 1 }))
    try {
      const session = await authService.login(typeof credentials === 'string' ? { userId: credentials } : credentials)
      if (request === sequence.current) setState((previous) => ({ ...previous, status: 'ready', session, error: '' }))
      return request === sequence.current
    } catch (error) {
      if (request === sequence.current) setState((previous) => ({ ...previous, status: 'ready', session: null, error: error.message }))
      return false
    }
  }

  async function logout() {
    const request = ++sequence.current
    setState((previous) => ({ status: 'ready', session: null, error: '', revision: previous.revision + 1 }))
    try { await authService.logout() }
    catch (error) { if (request === sequence.current) setState((previous) => ({ ...previous, error: error.message })) }
  }

  async function selectBranch(branchId) {
    const userId = state.session?.user.id
    if (!userId) return false
    const request = ++sequence.current
    try {
      const session = await authService.selectBranch(userId, branchId)
      if (request === sequence.current) setState((previous) => ({ ...previous, session, error: '', revision: previous.revision + 1 }))
      return request === sequence.current
    } catch (error) {
      // Re-read canonical assignments after a rejected choice; stale access must not survive.
      let session = null
      try { session = await authService.getSession() } catch { /* Unreadable storage denies access. */ }
      if (request === sequence.current) setState((previous) => ({ ...previous, session, error: error.message, revision: previous.revision + 1 }))
      return false
    }
  }

  async function refreshSession() {
    const session = await authService.getSession()
    setState((previous) => ({ ...previous, status: 'ready', session, error: '', revision: previous.revision + 1 }))
    return session
  }

  const user = state.session?.user ?? null
  return <AuthContext.Provider value={{ user, status: state.status, error: state.error, branchId: state.session?.branchId ?? null, revision: state.revision, login, logout, selectBranch, refreshSession }}>{children}</AuthContext.Provider>
}
