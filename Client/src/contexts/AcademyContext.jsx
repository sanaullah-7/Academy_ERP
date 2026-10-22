/**
 * Purpose: Will define Academy Context for the contexts area of the Academy frontend.
 * Module: contexts
 * Status: Planned — functionality not implemented.
 */

import { useEffect, useRef, useState } from 'react'
import { AcademyContext } from './brandingContexts.js'
import { BranchContext } from './accessContexts.js'
import { brandingService } from '../services/brandingService.js'
import { DEFAULT_BRANDING } from '../mock/mockBranding.js'
import { useContext } from 'react'
import { MOCK_BRANDING_KEY } from '../constants/storageKeys.js'

export function AcademyProvider({ children }) {
  const branchId = useContext(BranchContext)?.branchId ?? null
  const [state, setState] = useState(() => {
    try { return { branding: brandingService.get(branchId), error: null } }
    catch (error) { return { branding: { ...DEFAULT_BRANDING }, error } }
  })
  const currentBranding = useRef(state.branding)
  useEffect(() => {
    function syncBranding() {
      try {
        const branding = brandingService.get(branchId)
        currentBranding.current = branding
        setState({ branding, error: null })
      } catch (error) { setState(previous => ({ ...previous, error })) }
    }
    syncBranding()
    const onStorage = event => { if (event.key === MOCK_BRANDING_KEY || event.key === null) syncBranding() }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [branchId])
  function updateBranding(changes) {
    try {
      // Merge against the last successful save, including React-batched updates.
      const branding = brandingService.save({ ...currentBranding.current, ...changes }, branchId)
      currentBranding.current = branding
      setState({ branding, error: null })
      return true
    } catch (error) {
      setState((previous) => ({ ...previous, error }))
      return false
    }
  }
  return <AcademyContext.Provider value={{ ...state, updateBranding }}>{children}</AcademyContext.Provider>
}
