import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import useAcademy from '../../hooks/useAcademy.js'

export default function AcademyLogo() {
  const { branding } = useAcademy()
  const [failedLogo, setFailedLogo] = useState(null)
  // Adjacent academy text supplies the accessible name; this image is decorative.
  return branding.logo && failedLogo !== branding.logo
    ? <img src={branding.logo} alt="" className="h-6 w-6 object-contain" onError={() => setFailedLogo(branding.logo)} />
    : <GraduationCap size={22} aria-hidden="true" data-academy-logo="fallback" />
}
