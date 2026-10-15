/**
 * Purpose: Will define Theme Context for the contexts area of the Academy frontend.
 * Module: contexts
 * Status: Planned — functionality not implemented.
 */

import { useEffect } from 'react'
import { ThemeContext } from './brandingContexts.js'
import useAcademy from '../hooks/useAcademy.js'

export function ThemeProvider({ children }) {
  const { branding, updateBranding } = useAcademy()
  const primaryColor = branding?.primaryColor || '#940016'
  useEffect(() => {
    const style = document.documentElement.style
    const activeColor = primaryColor === '#008378' ? '#940016' : primaryColor
    const darker = (activeColor === '#940016' || activeColor === '#008378')
      ? '#72000E'
      : '#' + activeColor.slice(1).match(/../g).map((hex) => Math.floor(parseInt(hex, 16) * 0.8).toString(16).padStart(2, '0')).join('')
    const tokens = {
      '--workspace-accent': activeColor,
      '--workspace-focus': darker,
      '--primary-hover': darker,
      '--primary': activeColor,
      '--ring': activeColor,
    }
    const previous = Object.keys(tokens).map((key) => [key, style.getPropertyValue(key), style.getPropertyPriority(key)])
    Object.entries(tokens).forEach(([key, value]) => style.setProperty(key, value))
    return () => previous.forEach(([key, value, priority]) => value ? style.setProperty(key, value, priority) : style.removeProperty(key))
  }, [primaryColor])
  return <ThemeContext.Provider value={{ primaryColor, updatePrimaryColor: (color) => updateBranding({ primaryColor: color }) }}>{children}</ThemeContext.Provider>
}
