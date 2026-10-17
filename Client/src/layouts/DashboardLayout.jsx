/**
 * Purpose: Will define Dashboard Layout for the layouts area of the Academy frontend.
 * Module: layouts
 * Status: Planned — functionality not implemented.
 */

// F00-003: Presentation-only shell. Module access and business workflows are deferred.
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import useAcademy from '../hooks/useAcademy.js'
import Sidebar from '../components/Layout/Sidebar.jsx'
import Header from '../components/Layout/Header.jsx'
import PageHeader from '../components/Layout/PageHeader.jsx'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../components/ui/dialog.jsx'

export default function DashboardLayout({ children, academyName, title = 'Workspace', description }) {
  const { pathname } = useLocation()
  const { branding } = useAcademy()
  const displayName = academyName ?? branding.name
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)
  const routeTitle = pathname === '/dashboard' ? 'Dashboard'
    : pathname === '/admissions/new' ? 'New Admission'
      : pathname.startsWith('/admissions') ? 'Admissions'
        : pathname.startsWith('/students/') ? 'Student Profile'
          : pathname === '/students' ? 'Students'
            : pathname.startsWith('/courses-batches') ? 'Courses & Batches'
              : pathname.startsWith('/faculty') ? 'Faculty & Classes'
                : pathname === '/fees' ? 'Fees'
                  : pathname === '/finance' ? 'Finance'
                    : pathname === '/demo-classes' ? 'Demo Classes'
                      : pathname === '/assets' ? 'Assets'
                        : pathname === '/reports' ? 'Reports'
                          : pathname === '/branches' ? 'Branches'
                            : pathname === '/users' ? 'Users'
                              : pathname === '/settings' ? 'Settings'
                                : pathname === '/workspace' ? 'Workspace' : title
  const displayTitle = title === 'Workspace' ? routeTitle : title

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)')
    const closeOnDesktop = () => {
      if (desktop.matches) setIsNavigationOpen(false)
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  return (
    <Dialog open={isNavigationOpen} onOpenChange={setIsNavigationOpen}>
      <div className="workspace-shell" data-collapsed={isCollapsed}>
        <a className="workspace-skip-link" href="#workspace-content">Skip to content</a>
        <aside className="workspace-desktop-sidebar" aria-label="Workspace sidebar">
          <Sidebar academyName={displayName} isCollapsed={isCollapsed} />
        </aside>
        <DialogContent
          variant="navigation"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Workspace navigation</DialogTitle>
          <DialogDescription className="sr-only">Navigate the workspace. ERP modules are coming soon.</DialogDescription>
          <Sidebar academyName={displayName} onClose={() => setIsNavigationOpen(false)} />
        </DialogContent>
        <div className="workspace-body">
          <Header
            isCollapsed={isCollapsed}
            onToggleSidebar={() => setIsCollapsed((value) => !value)}
            onOpenNavigation={() => setIsNavigationOpen(true)}
          />
          <main id="workspace-content" className="workspace-content" data-page={routeTitle} tabIndex={-1}>
          <PageHeader title={displayTitle} description={description} />
            {children}
          </main>
        </div>
      </div>
    </Dialog>
  )
}
