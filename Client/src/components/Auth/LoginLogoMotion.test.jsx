import { fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import LoginLogoMotion from './LoginLogoMotion.jsx'

const gsapMocks = vi.hoisted(() => {
  const timeline = {
    to: vi.fn().mockReturnThis(),
    eventCallback: vi.fn().mockReturnThis(),
    kill: vi.fn(),
  }
  return {
    timeline: vi.fn(() => timeline),
    to: vi.fn(() => ({ kill: vi.fn() })),
    killTweensOf: vi.fn(),
    timelineInstance: timeline,
  }
})

vi.mock('gsap', () => ({
  gsap: {
    timeline: gsapMocks.timeline,
    to: gsapMocks.to,
    killTweensOf: gsapMocks.killTweensOf,
  },
}))

vi.mock('../../hooks/useAcademy.js', () => ({
  default: () => ({ branding: { name: 'Demo Academy', logo: '/custom-logo.png' } }),
}))

vi.mock('three', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    WebGLRenderer: vi.fn(function () {
      this.domElement = document.createElement('canvas')
      this.setPixelRatio = vi.fn()
      this.setClearColor = vi.fn()
      this.setSize = vi.fn()
      this.render = vi.fn()
      this.dispose = vi.fn()
    }),
  }
})

function setLogoLoaded(image) {
  Object.defineProperty(image, 'naturalWidth', { configurable: true, value: 512 })
  fireEvent.load(image)
}

describe('LoginLogoMotion', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    })
    vi.mocked(THREE.WebGLRenderer).mockClear().mockImplementation(function () {
      this.domElement = document.createElement('canvas')
      this.setPixelRatio = vi.fn()
      this.setClearColor = vi.fn()
      this.setSize = vi.fn()
      this.render = vi.fn()
      this.dispose = vi.fn()
    })
    gsapMocks.timeline.mockClear().mockReturnValue(gsapMocks.timelineInstance)
    gsapMocks.to.mockClear()
    gsapMocks.killTweensOf.mockClear()
    gsapMocks.timelineInstance.to.mockClear()
    gsapMocks.timelineInstance.eventCallback.mockClear()
    gsapMocks.timelineInstance.kill.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('shows a static logo and skips WebGL when reduced motion is preferred', () => {
    window.matchMedia.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { container } = render(<LoginLogoMotion />)

    expect(container.querySelector('img')).toHaveAttribute('src', '/custom-logo.png')
    expect(THREE.WebGLRenderer).not.toHaveBeenCalled()
  })

  it('plays one 3D entry spin, then floats farther and faster, tilts, and cleans up', async () => {
    const { container, unmount } = render(<LoginLogoMotion />)
    const wrapper = container.firstElementChild
    vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, right: 224, bottom: 224, width: 224, height: 224,
    })
    setLogoLoaded(container.querySelector('img'))

    await waitFor(() => expect(container.querySelector('canvas')).toBeInTheDocument())
    const introCall = gsapMocks.to.mock.calls.find(([, options]) => options?.duration === 1.35)
    expect(introCall).toBeDefined()
    expect(introCall[1]).toEqual(expect.objectContaining({
      y: Math.PI * 2,
      duration: 1.35,
      ease: 'power2.inOut',
    }))
    expect(gsapMocks.timeline).toHaveBeenCalledWith({ repeat: -1, yoyo: true })
    expect(gsapMocks.timelineInstance.to).toHaveBeenCalledWith(
      expect.objectContaining({ y: -0.08 }),
      expect.objectContaining({ y: 0.08, duration: 1.55 }),
    )
    expect(wrapper).toHaveClass('overflow-hidden', 'rounded-[2rem]', 'bg-white')

    fireEvent.pointerMove(wrapper, { clientX: 224, clientY: 0 })
    expect(gsapMocks.killTweensOf).not.toHaveBeenCalled()
    introCall[1].onComplete()
    fireEvent.pointerMove(wrapper, { clientX: 224, clientY: 0 })
    expect(gsapMocks.to).toHaveBeenCalledWith(
      expect.objectContaining({ x: 0, y: 0 }),
      expect.objectContaining({ duration: 0.45, ease: 'power2.out' }),
    )
    fireEvent.pointerLeave(wrapper)
    expect(gsapMocks.killTweensOf).toHaveBeenCalled()

    const renderer = vi.mocked(THREE.WebGLRenderer).mock.results[0].value
    unmount()
    expect(gsapMocks.timelineInstance.kill).toHaveBeenCalled()
    expect(renderer.dispose).toHaveBeenCalled()
  })

  it('uses DOM spin and float motion when WebGL initialization fails', async () => {
    vi.mocked(THREE.WebGLRenderer).mockImplementationOnce(() => {
      throw new Error('WebGL unavailable')
    })
    const { container } = render(<LoginLogoMotion />)
    setLogoLoaded(container.querySelector('img'))

    await waitFor(() => expect(THREE.WebGLRenderer).toHaveBeenCalled())
    expect(container.querySelector('canvas')).not.toBeInTheDocument()
    expect(container.querySelector('img')).not.toHaveStyle({ visibility: 'hidden' })
    expect(gsapMocks.timeline).toHaveBeenCalledWith({ repeat: -1, yoyo: true })
    expect(gsapMocks.to).toHaveBeenCalledWith(
      container.querySelector('img'),
      expect.objectContaining({ rotationY: 360, duration: 1.35 }),
    )
  })

  it('falls back to the bundled academy logo if the configured logo fails', () => {
    const { container } = render(<LoginLogoMotion />)
    fireEvent.error(container.querySelector('img'))

    expect(container.querySelector('img').getAttribute('src')).toContain('tsa-logo.png')
  })
})
