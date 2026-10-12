/**
 * Purpose: Will define Header for the Layout area of the Academy frontend.
 * Module: Layout
 * Status: Planned — functionality not implemented.
 */

// F00-003: Topbar controls affect the sidebar only; no account or branch actions.
import { ChevronRight, Menu, PanelLeftClose, PanelLeftOpen, PanelsTopLeft } from 'lucide-react'
import { Button } from '../ui/button.jsx'
import { Badge } from '../ui/badge.jsx'
import { DialogTrigger } from '../ui/dialog.jsx'
import DemoSessionControls from '../Auth/DemoSessionControls.jsx'
import useAcademy from '../../hooks/useAcademy.js'

export default function Header({ title, isCollapsed, onToggleSidebar, onOpenNavigation }) {
  const { branding } = useAcademy()
  return (
    <header className="workspace-topbar">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Button variant="outline" size="icon" className="workspace-icon-button workspace-desktop-toggle" onClick={onToggleSidebar} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!isCollapsed}>
          {isCollapsed ? <PanelLeftOpen size={20} aria-hidden="true" /> : <PanelLeftClose size={20} aria-hidden="true" />}
        </Button>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="workspace-icon-button workspace-mobile-toggle" onClick={onOpenNavigation} aria-label="Open navigation">
            <Menu size={20} aria-hidden="true" />
          </Button>
        </DialogTrigger>
        <div className="workspace-breadcrumb" aria-label="Current location">
          <span className="workspace-breadcrumb-parent truncate" title={branding.name}>{branding.name}</span>
          <ChevronRight className="workspace-breadcrumb-parent" size={14} aria-hidden="true" />
          <span className="truncate">{title === 'Workspace' ? 'Home' : title}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="secondary" className="workspace-preview-badge hidden sm:inline-flex"><PanelsTopLeft size={14} aria-hidden="true" /> Preview</Badge>
        <DemoSessionControls />
      </div>
    </header>
  )
}
