import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical } from 'lucide-react'

export default function DemoRowActions({ item, canManage, onView, onAttendance, onConvert, onCancel, onDelete }) {
  const [position, setPosition] = useState(null)
  const trigger = useRef(null)
  const menu = useRef(null)
  const id = useId()
  const linked = item.status === 'Converted' || Boolean(item.convertedAdmissionId)
  const actions = [{ label: 'View Details', run: onView }]
  if (canManage) {
    if (['Registered', 'Scheduled', 'Missed', 'Attended'].includes(item.status)) actions.push({ label: item.status === 'Attended' ? 'Update Attendance' : 'Mark Attended', run: onAttendance })
    if (['Registered', 'Scheduled', 'Attended'].includes(item.status)) actions.push({ label: 'Convert to Admission', run: onConvert })
    if (!linked && item.status !== 'Cancelled') actions.push({ label: 'Cancel Inquiry', run: onCancel })
    actions.push({ label: 'Delete', run: onDelete, disabled: linked, danger: true })
  }

  useEffect(() => {
    if (!position) return
    menu.current?.querySelector('button:not(:disabled)')?.focus({ preventScroll: true })
    const close = event => {
      if (!menu.current?.contains(event.target) && !trigger.current?.contains(event.target)) setPosition(null)
    }
    const dismiss = () => setPosition(null)
    document.addEventListener('pointerdown', close)
    window.addEventListener('resize', dismiss)
    window.addEventListener('wheel', dismiss, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', close)
      window.removeEventListener('resize', dismiss)
      window.removeEventListener('wheel', dismiss)
    }
  }, [position])

  const closeWithFocus = () => { setPosition(null); trigger.current?.focus() }
  return <>
    <button ref={trigger} type="button" aria-label={`Actions for ${item.studentName}`} aria-haspopup="menu" aria-expanded={Boolean(position)} aria-controls={position ? id : undefined}
      className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-white text-slate-600 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-primary"
      onClick={() => {
        const rect = trigger.current.getBoundingClientRect()
        setPosition(position ? null : { right: Math.max(8, window.innerWidth - rect.right), ...(rect.bottom + 250 > window.innerHeight ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }) })
      }}><MoreVertical size={17} aria-hidden="true" /></button>
    {position && createPortal(<div ref={menu} id={id} role="menu" aria-label={`Actions for ${item.studentName}`}
      style={{ position: 'fixed', zIndex: 100, ...position, maxWidth: 'calc(100vw - 16px)' }}
      className="rounded-xl border border-border bg-white p-1 shadow-lg"
      onKeyDown={event => {
        const buttons = [...menu.current.querySelectorAll('button:not(:disabled)')]
        const index = buttons.indexOf(document.activeElement)
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault()
          buttons[event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus()
        }
        if (event.key === 'Escape') { event.preventDefault(); closeWithFocus() }
        if (event.key === 'Tab') closeWithFocus()
      }}>
      {actions.map(action => <button key={action.label} role="menuitem" type="button" disabled={action.disabled}
        title={action.disabled ? 'Linked admission: this demo inquiry cannot be deleted.' : undefined}
        className={`flex w-full items-center whitespace-nowrap rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50 focus:bg-slate-50 disabled:opacity-40 ${action.danger ? 'text-destructive' : 'text-slate-700'}`}
        onClick={() => { closeWithFocus(); action.run?.(item) }}>{action.label}</button>)}
    </div>, document.body)}
  </>
}

