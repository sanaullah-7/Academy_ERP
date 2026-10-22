/**
 * Purpose: Will define Theme Context for the contexts area of the Academy frontend.
 * Module: contexts
 * Status: Planned — functionality not implemented.
 */

import { useEffect, useState } from 'react'
import { ThemeContext } from './brandingContexts.js'
import useAcademy from '../hooks/useAcademy.js'
import { COLOR_MODE_KEY } from '../constants/storageKeys.js'

function readColorMode() {
  try { return window.localStorage.getItem(COLOR_MODE_KEY) === 'dark' ? 'dark' : 'light' }
  catch { return 'light' }
}

export function ThemeProvider({ children }) {
  const { branding, updateBranding } = useAcademy()
  const primaryColor = branding?.primaryColor || '#940016'
  const [colorMode, setColorMode] = useState(readColorMode)
  useEffect(() => {
    const root = document.documentElement
    const style = document.documentElement.style
    const activeColor = primaryColor === '#008378' ? '#940016' : primaryColor
    const darker = (activeColor === '#940016' || activeColor === '#008378')
      ? '#72000E'
      : '#' + activeColor.slice(1).match(/../g).map((hex) => Math.floor(parseInt(hex, 16) * 0.8).toString(16).padStart(2, '0')).join('')
    const themedTint = `color-mix(in srgb, ${activeColor} ${colorMode === 'dark' ? '18%' : '9%'}, ${colorMode === 'dark' ? '#111827' : '#ffffff'})`
    const sidebarBackground = colorMode === 'dark' && branding.sidebarBackground === '#FFFFFF' ? '#101827' : branding.sidebarBackground
    const sidebarText = colorMode === 'dark' && branding.sidebarText === '#111827' ? '#FFFFFF' : branding.sidebarText
    const sidebarIcon = colorMode === 'dark' && branding.sidebarIcon === '#111827' ? '#FFFFFF' : branding.sidebarIcon
    const tokens = {
      '--app-accent': activeColor,
      '--app-focus': darker,
      '--primary-hover': darker,
      '--primary': activeColor,
      '--ring': activeColor,
      '--app-sidebar-active': branding.sidebarActive,
      '--app-background': colorMode === 'dark' ? '#0b1220' : '#F7F8FC',
      '--app-surface': colorMode === 'dark' ? '#111827' : '#ffffff',
      '--app-foreground': colorMode === 'dark' ? '#ffffff' : '#0b1c30',
      '--app-muted': colorMode === 'dark' ? '#e5e7eb' : '#565e74',
      '--app-border': colorMode === 'dark' ? '#293548' : '#f0d5d9',
      '--app-hover': colorMode === 'dark' ? '#1f2937' : '#F9EBEE',
      '--app-sidebar-background': sidebarBackground,
      '--app-sidebar-text': sidebarText,
      '--app-sidebar-icon': sidebarIcon,
      '--background': colorMode === 'dark' ? '#0b1220' : '#F7F8FC',
      '--foreground': colorMode === 'dark' ? '#ffffff' : '#0b1c30',
      '--card': colorMode === 'dark' ? '#111827' : '#ffffff',
      '--card-foreground': colorMode === 'dark' ? '#ffffff' : '#0b1c30',
      '--muted': colorMode === 'dark' ? '#172033' : '#f8fafc',
      '--muted-foreground': colorMode === 'dark' ? '#e5e7eb' : '#565e74',
      '--border': colorMode === 'dark' ? '#293548' : '#f0d5d9',
      '--input': colorMode === 'dark' ? '#374151' : '#e2e8f0',
      '--secondary': themedTint,
      '--secondary-foreground': colorMode === 'dark' ? '#ffffff' : activeColor,
      '--accent': themedTint,
      '--accent-foreground': colorMode === 'dark' ? '#ffffff' : activeColor,
      '--chart-1': activeColor,
      '--dashboard-revenue': activeColor,
      '--sidebar-background': sidebarBackground,
      '--sidebar-foreground': sidebarText,
      '--sidebar-primary': branding.sidebarActive,
      '--sidebar-accent': `color-mix(in srgb, ${branding.sidebarActive} 14%, transparent)`,
      '--sidebar-accent-foreground': sidebarText,
      '--sidebar-border': colorMode === 'dark' ? '#293548' : '#f0d5d9',
      '--sidebar-ring': branding.sidebarActive,
    }
    const hadDarkClass = root.classList.contains('dark')
    const previousColorScheme = root.style.colorScheme
    const previous = Object.keys(tokens).map((key) => [key, style.getPropertyValue(key), style.getPropertyPriority(key)])
    Object.entries(tokens).forEach(([key, value]) => style.setProperty(key, value))
    root.classList.toggle('dark', colorMode === 'dark')
    root.style.colorScheme = colorMode
    return () => {
      previous.forEach(([key, value, priority]) => value ? style.setProperty(key, value, priority) : style.removeProperty(key))
      root.classList.toggle('dark', hadDarkClass)
      root.style.colorScheme = previousColorScheme
    }
  }, [branding.sidebarActive, branding.sidebarBackground, branding.sidebarIcon, branding.sidebarText, colorMode, primaryColor])
  const updateColorMode = (mode) => {
    const next = mode === 'dark' ? 'dark' : 'light'
    try { window.localStorage.setItem(COLOR_MODE_KEY, next) } catch { /* The UI can still switch for this session. */ }
    setColorMode(next)
  }
  return <ThemeContext.Provider value={{ colorMode, updateColorMode, toggleColorMode: () => updateColorMode(colorMode === 'dark' ? 'light' : 'dark'), primaryColor, updatePrimaryColor: (color) => updateBranding({ primaryColor: color }) }}>{children}</ThemeContext.Provider>
}
