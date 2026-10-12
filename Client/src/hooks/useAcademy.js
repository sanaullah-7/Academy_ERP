/**
 * Purpose: Will define use Academy for the hooks area of the Academy frontend.
 * Module: hooks
 * Status: Planned — functionality not implemented.
 */

import { useContext } from 'react'
import { AcademyContext } from '../contexts/brandingContexts.js'

export default function useAcademy() {
  const context = useContext(AcademyContext)
  if (!context) throw new Error('useAcademy requires AcademyProvider.')
  return context
}
