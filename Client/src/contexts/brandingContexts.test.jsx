import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AcademyProvider } from './AcademyContext.jsx'
import { ThemeProvider } from './ThemeContext.jsx'
import useAcademy from '../hooks/useAcademy.js'
import useTheme from '../hooks/useTheme.js'
import AcademyLogo from '../components/Layout/AcademyLogo.jsx'
import { COLOR_MODE_KEY, MOCK_BRANDING_KEY } from '../constants/storageKeys.js'

function Probe() {
  const { branding, error, updateBranding } = useAcademy()
  const { colorMode, primaryColor, toggleColorMode, updatePrimaryColor } = useTheme()
  return <><p>{branding.name}</p><p>{primaryColor}</p><p>{error?.code}</p><AcademyLogo />
    <button onClick={() => updateBranding({ name: 'Fictional Academy', logo: '/images/example.png' })}>Brand</button>
    <button onClick={() => updatePrimaryColor('#123ABC')}>Color</button>
    <button onClick={() => updatePrimaryColor('#FFFFFF')}>Invalid color</button>
    <button onClick={toggleColorMode}>{colorMode === 'dark' ? 'Use light mode' : 'Use dark mode'}</button></>
}
function BatchedUpdates() {
  const { branding, updateBranding } = useAcademy()
  const { updatePrimaryColor } = useTheme()
  return <><p>{branding.name}</p><button onClick={() => {
    updateBranding({ name: 'Batched Academy' })
    updatePrimaryColor('#123ABC')
  }}>Update together</button></>
}
const tree = <AcademyProvider><ThemeProvider><Probe /></ThemeProvider></AcademyProvider>

describe('shared academy and theme providers', () => {
  it('preserves both changes when academy and theme update in one React event', () => {
    render(<AcademyProvider><ThemeProvider><BatchedUpdates /></ThemeProvider></AcademyProvider>)
    fireEvent.click(screen.getByText('Update together'))
    expect(screen.getByText('Batched Academy')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(MOCK_BRANDING_KEY)).branding).toMatchObject({ name: 'Batched Academy', primaryColor: '#123ABC' })
  })
  it('provides TSA defaults, decorative fallback and sidebar colors', () => {
    const { container } = render(tree)
    expect(screen.getByText('The Scholar Coaching Academy')).toBeInTheDocument()
    expect(container.querySelector('[data-academy-logo="fallback"]')).toBeInTheDocument()
    expect(document.documentElement.style.getPropertyValue('--workspace-accent')).toBe('#940016')
    expect(document.documentElement.style.getPropertyValue('--workspace-focus')).toBe('#72000E')
    expect(document.documentElement.style.getPropertyValue('--workspace-sidebar-text')).toBe('#111827')
    expect(document.documentElement.style.getPropertyValue('--workspace-sidebar-icon')).toBe('#111827')
  })
  it('persists an accessible dark mode and restores light mode', () => {
    render(tree)
    fireEvent.click(screen.getByRole('button', { name: 'Use dark mode' }))
    expect(document.documentElement).toHaveClass('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(document.documentElement.style.getPropertyValue('--workspace-background')).toBe('#0b1220')
    expect(localStorage.getItem(COLOR_MODE_KEY)).toBe('dark')
    fireEvent.click(screen.getByRole('button', { name: 'Use light mode' }))
    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem(COLOR_MODE_KEY)).toBe('light')
  })
  it('shares updates, restores persisted branding on remount, and handles broken logos', () => {
    const view = render(tree)
    fireEvent.click(screen.getByText('Brand'))
    fireEvent.click(screen.getByText('Color'))
    expect(document.documentElement.style.getPropertyValue('--workspace-accent')).toBe('#123ABC')
    const image = view.container.querySelector('img')
    expect(image).toHaveAttribute('alt', '')
    fireEvent.error(image)
    expect(view.container.querySelector('[data-academy-logo="fallback"]')).toBeInTheDocument()
    view.unmount()
    render(tree)
    expect(screen.getByText('Fictional Academy')).toBeInTheDocument()
    expect(screen.getByText('#123ABC')).toBeInTheDocument()
  })
  it('falls back without deleting corrupted branding', () => {
    localStorage.setItem(MOCK_BRANDING_KEY, 'broken')
    render(tree)
    expect(screen.getByText('The Scholar Coaching Academy')).toBeInTheDocument()
    expect(screen.getByText('CORRUPTED_BRANDING')).toBeInTheDocument()
    expect(localStorage.getItem(MOCK_BRANDING_KEY)).toBe('broken')
  })
  it('rejects inaccessible updates and keeps existing theme', () => {
    render(tree)
    fireEvent.click(screen.getByText('Invalid color'))
    expect(screen.getByText('INVALID_BRANDING')).toBeInTheDocument()
    expect(screen.getByText('#940016')).toBeInTheDocument()
  })
  it('retains current branding when persistence fails', () => {
    render(tree)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    fireEvent.click(screen.getByText('Brand'))
    expect(screen.getByText('The Scholar Coaching Academy')).toBeInTheDocument()
    expect(screen.getByText('STORAGE_WRITE_FAILED')).toBeInTheDocument()
  })
  it('restores previous inline theme tokens on unmount', () => {
    document.documentElement.style.setProperty('--workspace-accent', '#111111')
    const view = render(tree)
    view.unmount()
    expect(document.documentElement.style.getPropertyValue('--workspace-accent')).toBe('#111111')
    document.documentElement.style.removeProperty('--workspace-accent')
  })
})
