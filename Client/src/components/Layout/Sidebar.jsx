import { preloadRoute } from '../../routes/routeModules.js'
import {
  ScrollText, Archive, BookOpen, Building2, CalendarDays, ChartNoAxesCombined,
  ClipboardList, CreditCard, GraduationCap, LayoutDashboard,
  Settings2, Users, UsersRound, Wallet, X, UserRound,
} from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from '../ui/button.jsx'
import { usePermissions } from '../../hooks/usePermissions.js'
import { visibleModules } from '../../constants/moduleAccess.js'
import { ROLES } from '../../constants/roles.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import AcademyLogo from './AcademyLogo.jsx'

const icons = Object.freeze({
  dashboard: LayoutDashboard, admissions: ClipboardList, students: UsersRound,
  courses: BookOpen, faculty: GraduationCap, fees: CreditCard, finance: Wallet,
  demoClasses: CalendarDays, assets: Archive, reports: ChartNoAxesCombined,
  audit: ScrollText, branches: Building2, users: Users, settings: Settings2,
  myProfile: UserRound,
})

function formatAcademyName(name) {
  if (!name || name === 'The Scholar Coaching Academy') {
    return <><span className="font-extrabold" style={{ color: 'var(--app-sidebar-active)' }}>The Scholar</span>{' '}<span className="font-bold">Coaching Academy</span></>
  }
  const words = name.split(' ')
  if (words.length > 1) {
    const half = Math.ceil(words.length / 2)
    return <><span className="font-extrabold" style={{ color: 'var(--app-sidebar-active)' }}>{words.slice(0, half).join(' ')}</span>{' '}<span className="font-bold">{words.slice(half).join(' ')}</span></>
  }
  return <span className="font-extrabold" style={{ color: 'var(--app-sidebar-active)' }}>{name}</span>
}

let preservedSidebarScrollTop = 0

export default function Sidebar({ academyName, isCollapsed = false, onClose }) {
  const { can, hasRole } = usePermissions()
  const isTeacher = hasRole(ROLES.TEACHER)
  const navigationRef = useRef(null)
  const baseModules = visibleModules(can, { includeNested: false })
  const modules = isTeacher
    ? [...baseModules, { id: 'myProfile', group: 'Academics', label: 'My Profile', path: ROUTE_PATHS.MY_PROFILE }]
    : baseModules
  const navigationGroups = ['Academics', 'Operations', 'Administration']
    .map(label => ({ label, items: modules.filter(module => module.group === label) }))
    .filter(group => group.items.length)

  useLayoutEffect(() => {
    if (navigationRef.current) navigationRef.current.scrollTop = preservedSidebarScrollTop
  }, [])

  return (
    <div className="app-sidebar" data-collapsed={isCollapsed}>
      <div className="app-brand">
        <span className="app-brand-mark shrink-0"><AcademyLogo /></span>
        <div className="app-sidebar-label min-w-0"><p className="app-brand-name truncate" title={academyName}>{formatAcademyName(academyName)}</p></div>
        {onClose && <Button variant="outline" size="icon" className="app-icon-button app-mobile-close" onClick={onClose} aria-label="Close navigation"><X size={18} aria-hidden="true" /></Button>}
      </div>
      <nav ref={navigationRef} onScroll={event => { preservedSidebarScrollTop = event.currentTarget.scrollTop }} className="app-navigation" aria-label="Application modules">
        {navigationGroups.map(group => (
          <section key={group.label} aria-label={group.label} className="app-nav-group">
            <p className="app-group-label">{group.label}</p>
            <ul className="space-y-1">
              {group.items.map(({ id, label, path }) => {
                const Icon = icons[id]
                return <li key={label}>
                  <NavLink onMouseEnter={() => preloadRoute(path)} onFocus={() => preloadRoute(path)} to={path} onClick={event => { if (event.currentTarget.getAttribute('aria-current') === 'page') event.preventDefault(); onClose?.() }} aria-label={label} title={label} className={({ isActive }) => isActive ? 'app-current' : 'app-nav-placeholder'}>
                    <Icon size={19} aria-hidden="true" /><span className="app-sidebar-label">{label}</span>
                  </NavLink>
                </li>
              })}
            </ul>
          </section>
        ))}
      </nav>
    </div>
  )
}
