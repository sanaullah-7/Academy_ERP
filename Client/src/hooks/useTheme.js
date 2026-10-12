/**
 * Purpose: Will define use Theme for the hooks area of the Academy frontend.
 * Module: hooks
 * Status: Planned — functionality not implemented.
 */

import { useContext } from 'react'
import { ThemeContext } from '../contexts/brandingContexts.js'

export default function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme requires ThemeProvider.')
  return context
}
