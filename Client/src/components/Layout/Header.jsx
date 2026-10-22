/**
 * Purpose: Will define Header for the Layout area of the Academy frontend.
 * Module: Layout
 * Status: Planned — functionality not implemented.
 */

// F00-003: Topbar controls affect the sidebar only; no account or branch actions.
import { useEffect, useState } from 'react'
import { Maximize, Menu, Minimize, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react'
import { Button } from '../ui/button.jsx'
import { DialogTrigger } from '../ui/dialog.jsx'
import DemoSessionControls from '../Auth/DemoSessionControls.jsx'
import GlobalSearch from './GlobalSearch.jsx'
import NotificationCenter from './NotificationCenter.jsx'

export default function Header({ isCollapsed, onToggleSidebar, onOpenNavigation }) {
  const [searchOpen,setSearchOpen]=useState(false)
  const [isFullscreen,setIsFullscreen]=useState(Boolean(document.fullscreenElement))
  useEffect(()=>{const openSearch=event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();setSearchOpen(true)}};window.addEventListener('keydown',openSearch);return()=>window.removeEventListener('keydown',openSearch)},[])
  useEffect(()=>{const syncFullscreen=()=>setIsFullscreen(Boolean(document.fullscreenElement));document.addEventListener('fullscreenchange',syncFullscreen);return()=>document.removeEventListener('fullscreenchange',syncFullscreen)},[])
  async function toggleFullscreen(){if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}
  return (
    <header className="app-topbar">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Button variant="ghost" size="icon" className="app-icon-button app-compact-control app-desktop-toggle" onClick={onToggleSidebar} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!isCollapsed}>
          {isCollapsed ? <PanelLeftOpen size={20} aria-hidden="true" /> : <PanelLeftClose size={20} aria-hidden="true" />}
        </Button>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="app-icon-button app-mobile-toggle" onClick={onOpenNavigation} aria-label="Open navigation">
            <Menu size={20} aria-hidden="true" />
          </Button>
        </DialogTrigger>
        <button type="button" aria-label="Open global search" onClick={()=>setSearchOpen(true)} className="flex h-10 w-full max-w-sm items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-card">
          <Search size={18} aria-hidden="true"/><span className="hidden sm:inline">Search students, courses, batches…</span><span className="sm:hidden">Search</span><kbd className="ml-auto hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] md:inline">Ctrl K</kbd>
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <NotificationCenter />
        <Button variant="ghost" size="icon" className="app-icon-button app-compact-control" onClick={()=>void toggleFullscreen()} aria-label={isFullscreen?'Exit full screen':'Enter full screen'} title={isFullscreen?'Exit full screen':'Enter full screen'}>
          {isFullscreen?<Minimize size={19} aria-hidden="true"/>:<Maximize size={19} aria-hidden="true"/>}
        </Button>
        <DemoSessionControls />
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen}/>
    </header>
  )
}
