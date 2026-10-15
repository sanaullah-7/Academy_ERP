/**
 * Purpose: Will define Sidebar for the Layout area of the Academy frontend.
 * Module: Layout
 * Status: Planned � functionality not implemented.
 */

// F00-003: Placeholder labels have no destinations or permission policy.
import {
  Archive, BookOpen, Building2, CalendarDays, ChartNoAxesCombined,
  ClipboardList, CreditCard, GraduationCap, LayoutDashboard,
  PanelsTopLeft, Settings2, Users, UsersRound, Wallet, X,
} from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'
import { Button } from '../ui/button.jsx'
import AcademyLogo from './AcademyLogo.jsx'
import { NavLink } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'

const navigationGroups = [
  { label: 'Academics', items: [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Admissions', icon: ClipboardList },
    { label: 'Students', icon: UsersRound },
    { label: 'Courses & Batches', icon: BookOpen },
    { label: 'Faculty & Classes', icon: GraduationCap },
  ] },
  { label: 'Operations', items: [
    { label: 'Fees', icon: CreditCard },
    { label: 'Finance', icon: Wallet },
    { label: 'Demo Classes', icon: CalendarDays },
    { label: 'Assets', icon: Archive },
    { label: 'Reports', icon: ChartNoAxesCombined },
  ] },
  { label: 'Administration', items: [
    { label: 'Branches', icon: Building2 },
    { label: 'Users', icon: Users },
    { label: 'Settings', icon: Settings2 },
  ] },
]

const modulePermissions = Object.freeze({
  Dashboard: PERMISSIONS.WORKSPACE_VIEW,
  Admissions: PERMISSIONS.ADMISSIONS_VIEW,
  Students: PERMISSIONS.STUDENTS_VIEW,
  'Courses & Batches': PERMISSIONS.COURSES_VIEW,
  'Faculty & Classes': PERMISSIONS.FACULTY_VIEW,
  'Demo Classes': PERMISSIONS.DEMO_CLASSES_VIEW,
  Assets: PERMISSIONS.ASSETS_VIEW,
  Reports: PERMISSIONS.REPORTS_VIEW,
  Branches: PERMISSIONS.BRANCHES_MANAGE,
  Users: PERMISSIONS.USERS_MANAGE,
  Settings: PERMISSIONS.SETTINGS_MANAGE,
})
const modulePaths = Object.freeze({
  Dashboard: ROUTE_PATHS.DASHBOARD,
  Admissions: ROUTE_PATHS.ADMISSIONS,
  Students: ROUTE_PATHS.STUDENTS,
  'Courses & Batches': ROUTE_PATHS.COURSES_BATCHES,
  'Faculty & Classes': ROUTE_PATHS.FACULTY_CLASSES,
  Fees: ROUTE_PATHS.FEES,
  Finance: ROUTE_PATHS.FINANCE,
  'Demo Classes': ROUTE_PATHS.DEMO_CLASSES,
  Assets: ROUTE_PATHS.ASSETS,
  Reports: ROUTE_PATHS.REPORTS,
  Branches: ROUTE_PATHS.BRANCHES,
  Users: ROUTE_PATHS.USERS,
  Settings: ROUTE_PATHS.SETTINGS,
})

let preservedSidebarScrollTop = 0

export default function Sidebar({ academyName, isCollapsed = false, onClose }) {
  const { can } = usePermissions()
  const navigationRef = useRef(null)
  useLayoutEffect(() => {
    if (navigationRef.current) navigationRef.current.scrollTop = preservedSidebarScrollTop
  }, [])
  return (
    <div className="workspace-sidebar" data-collapsed={isCollapsed}>
      <div className="workspace-brand">
        <span className="workspace-brand-mark shrink-0"><AcademyLogo /></span>
        <div className="workspace-sidebar-label min-w-0">
          <p className="workspace-brand-name truncate" title={academyName}>{academyName}</p>
          <p className="workspace-brand-caption">Management workspace</p>
        </div>
        {onClose && (
          <Button variant="outline" size="icon" className="workspace-icon-button ml-auto" onClick={onClose} aria-label="Close navigation">
            <X size={20} aria-hidden="true" />
          </Button>
        )}
      </div>
      <nav ref={navigationRef} onScroll={(event) => { preservedSidebarScrollTop = event.currentTarget.scrollTop }} className="workspace-navigation" aria-label="Application modules">
        <div className="workspace-nav-placeholder" title="Workspace">
          <PanelsTopLeft size={19} aria-hidden="true" />
          <span className="workspace-sidebar-label">Workspace</span>
        </div>
        {navigationGroups.map((group) => (
          <section key={group.label} aria-label={group.label} className="workspace-nav-group">
            <p className="workspace-group-label">{group.label}</p>
            <ul className="space-y-1">
              {group.items.map(({ label, icon: Icon }) => (
                <li key={label}>
                  {(!modulePermissions[label] || can(modulePermissions[label])) ? <NavLink to={modulePaths[label]} onClick={(event) => { if (event.currentTarget.getAttribute('aria-current') === 'page') event.preventDefault(); onClose?.() }} aria-label={label} title={label} className={({ isActive }) => isActive ? 'workspace-current' : 'workspace-nav-placeholder'}>
                    <Icon size={19} aria-hidden="true" />
                    <span className="workspace-sidebar-label">{label}</span>
                  </NavLink> : <button type="button" disabled className="workspace-nav-placeholder" aria-label={`${label} � coming soon`} title={`${label} � coming soon`}>
                    <Icon size={19} aria-hidden="true" />
                    <span className="workspace-sidebar-label">{label}</span>
                  </button>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </div>
  )
}
