import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

describe('TSA Mobile App Icons & Web Manifest', () => {
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  const publicDir = path.resolve(currentDir, '../../public')
  const indexHtmlPath = path.resolve(currentDir, '../../index.html')

  it('contains valid manifest.webmanifest with official TSA icons', () => {
    const manifestPath = path.join(publicDir, 'manifest.webmanifest')
    expect(fs.existsSync(manifestPath)).toBe(true)

    const raw = fs.readFileSync(manifestPath, 'utf8')
    const manifest = JSON.parse(raw)

    expect(manifest.name).toBe('The Scholar Coaching Academy')
    expect(manifest.short_name).toBe('TSA ERP')
    expect(manifest.theme_color).toBe('#7A1529')
    expect(manifest.display).toBe('standalone')
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4)

    // Verify each referenced icon file exists on disk
    manifest.icons.forEach(icon => {
      const relPath = icon.src.replace(/^\//, '')
      const fullPath = path.join(publicDir, relPath)
      expect(fs.existsSync(fullPath)).toBe(true)
      const stat = fs.statSync(fullPath)
      expect(stat.size).toBeGreaterThan(1000)
    })
  })

  it('has apple touch icon and favicons present in public directory', () => {
    const appleIcon = path.join(publicDir, 'apple-touch-icon.png')
    const faviconIco = path.join(publicDir, 'favicon.ico')
    const favicon32 = path.join(publicDir, 'favicon-32x32.png')

    expect(fs.existsSync(appleIcon)).toBe(true)
    expect(fs.existsSync(faviconIco)).toBe(true)
    expect(fs.existsSync(favicon32)).toBe(true)
  })

  it('index.html links manifest, theme-color and TSA icons', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf8')
    expect(html).toContain('rel="manifest"')
    expect(html).toContain('href="/manifest.webmanifest"')
    expect(html).toContain('name="theme-color"')
    expect(html).toContain('content="#7A1529"')
    expect(html).toContain('apple-touch-icon')
    expect(html).toContain('/favicon.ico')
    expect(html).not.toContain('vite.svg')
  })
})
