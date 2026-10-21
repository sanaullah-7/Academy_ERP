import { useEffect, useRef } from 'react'

export default function LoginAtmosphere({ variant = 'panel' }) {
  const mountRef = useRef(null)
  const isPage = variant === 'page'

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let stopped = false
    let renderer
    let frame
    let observer
    const disposables = []

    async function initialize() {
      const THREE = await import('three')
      if (stopped) return

      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
      } catch {
        return
      }

      renderer.setClearColor(0x000000, 0)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
      renderer.domElement.className = 'absolute inset-0 size-full'
      renderer.domElement.setAttribute('aria-hidden', 'true')
      mount.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100)
      camera.position.z = 7

      const positions = []
      const colors = []
      const palette = (isPage
        ? ['#9d1532', '#d96a82', '#d5a562']
        : ['#ffffff', '#ffb8c7', '#f15b78'])
        .map(color => new THREE.Color(color))

      const particleCount = isPage ? 280 : 210
      for (let index = 0; index < particleCount; index += 1) {
        if (isPage) {
          positions.push(
            (((index * 83) % 281) / 280 - 0.5) * 11.5,
            (((index * 137) % 277) / 276 - 0.5) * 6.4,
            (((index * 43) % 97) / 97 - 0.5) * 2.2,
          )
        } else {
          const radius = 0.35 + ((index * 47) % 199) / 52
          const arm = index % 3
          const angle = radius * 1.7 + arm * ((Math.PI * 2) / 3) + ((index * 29) % 31) / 24
          const spread = (((index * 71) % 101) / 100 - 0.5) * (0.24 + radius * 0.12)
          positions.push(
            Math.cos(angle) * radius + spread,
            Math.sin(angle) * radius * 0.58 + spread,
            (((index * 43) % 97) / 97 - 0.5) * 1.4,
          )
        }
        const color = palette[index % palette.length]
        colors.push(color.r, color.g, color.b)
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
      const material = new THREE.PointsMaterial({
        size: isPage ? 0.042 : 0.055,
        transparent: true,
        opacity: isPage ? 0.58 : 0.68,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
      const galaxy = new THREE.Points(geometry, material)
      galaxy.rotation.z = -0.28
      galaxy.position.set(isPage ? 0 : 0.7, isPage ? 0 : 0.1, 0)
      scene.add(galaxy)
      disposables.push(geometry, material)

      let pageOrbits
      if (isPage) {
        pageOrbits = new THREE.Group()
        const orbitStyles = [
          { radiusX: 5.15, radiusY: 2.6, color: '#9d1532', opacity: 0.2, rotation: -0.12 },
          { radiusX: 4.15, radiusY: 2.05, color: '#d96a82', opacity: 0.16, rotation: 0.18 },
          { radiusX: 3.2, radiusY: 1.55, color: '#d5a562', opacity: 0.14, rotation: -0.32 },
        ]

        orbitStyles.forEach(style => {
          const points = new THREE.EllipseCurve(0, 0, style.radiusX, style.radiusY, 0, Math.PI * 2)
            .getPoints(180)
            .map(point => new THREE.Vector3(point.x, point.y, 0))
          const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points)
          const orbitMaterial = new THREE.LineBasicMaterial({
            color: style.color,
            transparent: true,
            opacity: style.opacity,
            blending: THREE.NormalBlending,
          })
          const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial)
          orbit.rotation.z = style.rotation
          pageOrbits.add(orbit)
          disposables.push(orbitGeometry, orbitMaterial)
        })

        pageOrbits.position.z = -0.7
        scene.add(pageOrbits)
      }

      const haloGeometry = new THREE.TorusGeometry(2.2, 0.012, 8, 110)
      const haloMaterial = new THREE.MeshBasicMaterial({
        color: isPage ? '#b33a55' : '#ff94aa',
        transparent: true,
        opacity: isPage ? 0.09 : 0.18,
      })
      const halo = new THREE.Mesh(haloGeometry, haloMaterial)
      halo.scale.y = 0.48
      halo.rotation.z = -0.32
      halo.position.set(isPage ? -0.9 : 0.7, isPage ? 0.25 : 0.1, -0.4)
      if (isPage) halo.scale.multiplyScalar(1.35)
      scene.add(halo)
      disposables.push(haloGeometry, haloMaterial)

      const resize = () => {
        const { width, height } = mount.getBoundingClientRect()
        if (!width || !height) return
        renderer.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }
      resize()
      observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
      observer?.observe(mount)
      if (!observer) window.addEventListener('resize', resize)

      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      const render = time => {
        galaxy.rotation.z = isPage ? Math.sin(time * 0.00008) * 0.012 : -0.28 + time * 0.000025
        halo.rotation.z = -0.32 - time * 0.000012
        galaxy.position.x = isPage ? Math.sin(time * 0.00012) * 0.08 : 0.7
        galaxy.position.y = (isPage ? 0 : 0.1) + Math.sin(time * 0.00045) * 0.08
        if (isPage) material.opacity = 0.54 + Math.sin(time * 0.0007) * 0.09
        if (pageOrbits) {
          pageOrbits.rotation.z = Math.sin(time * 0.00006) * 0.035
          pageOrbits.position.y = Math.cos(time * 0.0001) * 0.05
        }
        renderer.render(scene, camera)
        if (!reducedMotion) frame = requestAnimationFrame(render)
      }
      frame = requestAnimationFrame(render)

      if (!observer) disposables.push({ dispose: () => window.removeEventListener('resize', resize) })
    }

    void initialize()

    return () => {
      stopped = true
      if (frame) cancelAnimationFrame(frame)
      observer?.disconnect()
      disposables.forEach(item => item.dispose())
      renderer?.dispose()
      renderer?.domElement.remove()
    }
  }, [isPage])

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className={isPage
        ? 'absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(157,21,50,0.09),transparent_27%),radial-gradient(circle_at_86%_78%,rgba(213,165,98,0.1),transparent_30%),radial-gradient(circle_at_70%_15%,rgba(217,106,130,0.07),transparent_24%)]'
        : 'absolute inset-0 bg-[radial-gradient(circle_at_78%_26%,rgba(255,185,202,0.16),transparent_30%),radial-gradient(circle_at_22%_78%,rgba(255,255,255,0.08),transparent_34%)]'} />
      <div ref={mountRef} className={isPage ? 'absolute inset-0 opacity-75 mix-blend-multiply' : 'absolute inset-0 opacity-70 mix-blend-screen'} />
      {!isPage && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#640012]/10 to-[#300616]/35" />}
    </div>
  )
}
