import { useState } from 'react'
import useAcademy from '../../hooks/useAcademy.js'
import tsaLogo from '../../assets/images/tsa-logo.png'

export default function AcademyLogo({ className = 'h-[40em] w-[500px]' }) {
  const { branding } = useAcademy()
  const [failedLogo, setFailedLogo] = useState(null)
  const isCustomLogo = Boolean(branding?.logo && failedLogo !== branding.logo)
  const activeSrc = isCustomLogo ? branding.logo : tsaLogo

  return (
    <img
      src={activeSrc}
      alt=""
      className={`${className} object-contain rounded`}
      data-academy-logo="fallback"
      onError={() => {
        if (branding?.logo && failedLogo !== branding.logo) {
          setFailedLogo(branding.logo)
        }
      }}
    />
  )
}
