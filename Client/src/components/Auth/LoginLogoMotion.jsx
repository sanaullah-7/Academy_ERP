import { useEffect, useRef, useState } from 'react'
import useAcademy from '../../hooks/useAcademy.js'
import tsaLogo from '../../assets/images/tsa-logo.png'

export default function LoginLogoMotion() {
  const { branding } = useAcademy()
  const [failedLogo, setFailedLogo] = useState(null)
  const [loadedSource, setLoadedSource] = useState('')
  const [reducedMotion, setReducedMotion] = useState(false)
  const wrapperRef = useRef(null)
  const imageRef = useRef(null)
  const animationRef = useRef(null)
  const source = branding?.logo && failedLogo !== branding.logo ? branding.logo : tsaLogo

  useEffect(() => {
    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mediaQuery) return
    const updatePreference = () => setReducedMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener?.('change', updatePreference)
    return () => mediaQuery.removeEventListener?.('change', updatePreference)
  }, [])

  useEffect(() => {
    const wrapper = wrapperRef.current
    const image = imageRef.current
    if (reducedMotion || loadedSource !== source || !image?.naturalWidth || !wrapper) return

    let disposed = false
    let renderer
    let geometry
    let material
    let texture
    let logo
    let gsap
    let intro
    let float
    let observer
    let resize
    let cleaned = false

    const cleanup = () => {
      if (cleaned) return
      cleaned = true
      disposed = true
      observer?.disconnect()
      if (resize && !observer) window.removeEventListener('resize', resize)
      float?.kill()
      intro?.kill()
      if (gsap && logo) gsap.killTweensOf(logo.rotation)
      if (gsap) gsap.killTweensOf(image)
      if (animationRef.current?.target === logo || animationRef.current?.target === image) animationRef.current = null
      geometry?.dispose()
      material?.dispose()
      texture?.dispose()
      renderer?.dispose()
      renderer?.domElement.remove()
      image.style.visibility = ''
    }

    async function initialize() {
      const [THREE, gsapModule] = await Promise.all([import('three'), import('gsap')])
      if (disposed) return
      gsap = gsapModule.gsap

      const startDomFallback = () => {
        image.style.visibility = ''
        image.style.transformStyle = 'preserve-3d'
        animationRef.current = { target: image, render: () => {}, gsap, interactive: false, dom: true }
        float = gsap.timeline({ repeat: -1, yoyo: true })
          .to(image, { y: 10, duration: 1.55, ease: 'sine.inOut' })
        intro = gsap.to(image, {
          rotationY: 360,
          transformPerspective: 900,
          duration: 1.35,
          ease: 'power2.inOut',
          onComplete: () => {
            if (animationRef.current?.target === image) animationRef.current.interactive = true
          },
        })
      }

      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
      } catch {
        startDomFallback()
        return
      }

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
      camera.position.z = 3.3
      geometry = new THREE.PlaneGeometry(2, 2)
      texture = new THREE.Texture(image)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.needsUpdate = true
      material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
      logo = new THREE.Mesh(geometry, material)
      scene.add(logo)

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setClearColor(0x000000, 0)
      renderer.domElement.className = 'pointer-events-none absolute inset-0 size-full'
      renderer.domElement.setAttribute('aria-hidden', 'true')
      wrapper.appendChild(renderer.domElement)

      const render = () => renderer.render(scene, camera)
      resize = () => {
        const { width, height } = wrapper.getBoundingClientRect()
        if (!width || !height) return
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        render()
      }

      resize()
      image.style.visibility = 'hidden'
      observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
      observer?.observe(wrapper)
      if (!observer) window.addEventListener('resize', resize)

      logo.position.y = -0.08
      float = gsap.timeline({ repeat: -1, yoyo: true })
        .to(logo.position, { y: 0.08, duration: 1.55, ease: 'sine.inOut' })
      float.eventCallback('onUpdate', render)
      animationRef.current = { target: logo, render, gsap, interactive: false, dom: false }

      intro = gsap.to(logo.rotation, {
        y: Math.PI * 2,
        duration: 1.35,
        ease: 'power2.inOut',
        onUpdate: render,
        onComplete: () => {
          if (animationRef.current?.target === logo) animationRef.current.interactive = true
        },
      })
    }

    void initialize().catch(error => {
      if (!disposed) {
        console.error('Login logo animation failed to initialize.', error)
        cleanup()
      }
    })

    return cleanup
  }, [loadedSource, reducedMotion, source])

  function animateTilt(event, reset = false) {
    const animation = animationRef.current
    if (!animation?.interactive || reducedMotion) return
    const { target, render, gsap, dom } = animation
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = reset ? 0 : ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.3
    const y = reset ? 0 : -((event.clientY - bounds.top) / bounds.height - 0.5) * 0.3
    const tiltTarget = dom ? target : target.rotation
    gsap.killTweensOf(tiltTarget)
    gsap.to(tiltTarget, dom
      ? { rotationX: y * 57.3, rotationY: x * 57.3, duration: 0.45, ease: 'power2.out' }
      : { x: y, y: x, duration: 0.45, ease: 'power2.out', onUpdate: render })
  }

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto h-48 w-48 cursor-pointer overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_45px_rgba(39,4,15,0.22)] sm:h-64 sm:w-64"
      onPointerMove={event => animateTilt(event)}
      onPointerLeave={event => animateTilt(event, true)}
    >
      <img
        ref={imageRef}
        src={source}
        alt=""
        className="h-full w-full rounded-[2rem] object-contain"
        onLoad={() => setLoadedSource(source)}
        onError={() => {
          if (branding?.logo && source === branding.logo) {
            setLoadedSource('')
            setFailedLogo(source)
          }
        }}
      />
    </div>
  )
}
