import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, BookOpenCheck, CheckCheck, FileText, GraduationCap, Trash2, Wallet } from 'lucide-react'
import { ROLES } from '../../constants/roles.js'
import { useBranch } from '../../hooks/useBranch.js'
import { notificationService, NOTIFICATION_CHANGED_EVENT } from '../../services/notificationService.js'
import { Button } from '../ui/button.jsx'

const iconFor = type => type === 'class_assigned' ? BookOpenCheck : type === 'challan_created' ? FileText : type === 'salary_payment' ? Wallet : GraduationCap
const timeLabel = value => new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

export default function NotificationCenter() {
  const { branchId, roles, scopeKey } = useBranch()
  const [open, setOpen] = useState(false), [items, setItems] = useState([])
  const rootRef = useRef(null)
  const hidden = roles.includes(ROLES.OWNER)
  const load = useCallback(async () => setItems(branchId ? await notificationService.list({ branchId }) : []), [branchId])

  useEffect(() => {
    let active = true
    notificationService.list({ branchId }).then(next => { if (active) setItems(next) })
    return () => { active = false }
  }, [branchId, scopeKey])
  useEffect(() => {
    const refresh = () => void load()
    window.addEventListener(NOTIFICATION_CHANGED_EVENT, refresh); window.addEventListener('storage', refresh)
    return () => { window.removeEventListener(NOTIFICATION_CHANGED_EVENT, refresh); window.removeEventListener('storage', refresh) }
  }, [load])
  useEffect(() => {
    if (!open) return undefined
    const close = event => { if (!rootRef.current?.contains(event.target)) setOpen(false) }
    const escape = event => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', close); document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape) }
  }, [open])

  if (hidden || !branchId) return null
  const unread = items.filter(item => !item.readAt).length
  return <div ref={rootRef} className="relative">
    <Button variant="ghost" size="icon" className="app-icon-button app-compact-control relative" onClick={() => setOpen(value => !value)} aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={open}>
      <Bell size={19} aria-hidden="true" />
      {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex min-w-4 h-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">{unread > 99 ? '99+' : unread}</span>}
    </Button>
    {open && <section role="dialog" aria-label="Notifications" className="absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div><h2 className="text-sm font-bold">Notifications</h2><p className="text-[11px] text-muted-foreground">Current branch activity</p></div>
        {unread > 0 && <Button variant="ghost" className="h-8 gap-1.5 px-2 text-xs" onClick={async () => { await notificationService.markAllRead({ branchId }); await load() }}><CheckCheck size={14}/>Mark all read</Button>}
      </div>
      <div className="max-h-[min(28rem,70vh)] overflow-y-auto">
        {!items.length ? <div className="px-6 py-12 text-center"><Bell className="mx-auto mb-3 text-muted-foreground/50" size={30}/><p className="text-sm font-semibold">You are all caught up</p><p className="mt-1 text-xs text-muted-foreground">New branch activity will appear here.</p></div> : items.map(item => {
          const Icon = iconFor(item.type)
          return <article key={item.id} className={`group flex gap-3 border-b border-border/70 px-4 py-3 last:border-0 ${item.readAt ? 'bg-card' : 'bg-primary/5'}`}>
            <button className="flex min-w-0 flex-1 gap-3 text-left" onClick={async () => { if (!item.readAt) await notificationService.markRead(item.id, { branchId }); await load() }}>
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon size={17}/></span>
              <span className="min-w-0"><span className="flex items-center gap-2 text-sm font-semibold">{item.title}{!item.readAt && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread"/>}</span><span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{item.message}</span><span className="mt-1 block text-[10px] text-muted-foreground">{item.actorName} · {timeLabel(item.createdAt)}</span></span>
            </button>
            <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground opacity-60 hover:text-destructive group-hover:opacity-100" aria-label={`Delete ${item.title}`} onClick={async () => { await notificationService.remove(item.id, { branchId }); await load() }}><Trash2 size={14}/></Button>
          </article>
        })}
      </div>
    </section>}
  </div>
}
