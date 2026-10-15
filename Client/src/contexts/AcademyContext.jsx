/**
 * Purpose: Will define Academy Context for the contexts area of the Academy frontend.
 * Module: contexts
 * Status: Planned — functionality not implemented.
 */

import { useRef, useState } from 'react'
import { AcademyContext } from './brandingContexts.js'
import { brandingService } from '../services/brandingService.js'
import { DEFAULT_BRANDING } from '../mock/mockBranding.js'

export function AcademyProvider({ children }) {
  const [state, setState] = useState(() => {
    try { return { branding: brandingService.get(), error: null } }
    catch (error) { return { branding: { ...DEFAULT_BRANDING }, error } }
  })
  const currentBranding = useRef(state.branding)
  function updateBranding(changes) {
    try {
      // Merge against the last successful save, including React-batched updates.
      const branding = brandingService.save({ ...currentBranding.current, ...changes })
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
