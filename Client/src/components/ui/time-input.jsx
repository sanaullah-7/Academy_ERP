import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { formatTime, toTime24 } from '../../utils/timeFormat.js'
import { cn } from '@/lib/utils'

const suggestedTimes = Array.from({ length: 96 }, (_, index) => {
  const value = `${String(Math.floor(index / 4)).padStart(2, '0')}:${String(index % 4 * 15).padStart(2, '0')}`
  return { value, label: formatTime(value) }
})

export function TimePicker({ value = '', onChange, className, disabled, readOnly, id, name, required, ...props }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [draft, setDraft] = useState(null)
  const [menu, setMenu] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const listRef = useRef(null)
  const listId = `${inputId}-suggestions`
  const isOpen = Boolean(menu)

  useLayoutEffect(() => {
    if (!isOpen) return
    const panel = panelRef.current
    panel?.showPopover?.()
    listRef.current?.focus({ preventScroll: true })
    return () => panel?.hidePopover?.()
  }, [isOpen])

  useLayoutEffect(() => {
    const list = listRef.current
    const item = document.getElementById(`${listId}-${activeIndex}`)
    if (!isOpen || !list || !item) return
    const top = item.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop
    if (top < list.scrollTop) list.scrollTop = top
    else if (top + item.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = top + item.offsetHeight - list.clientHeight
  }, [isOpen, activeIndex, listId])

  useEffect(() => {
    if (!isOpen) return
    const outside = event => { if (!rootRef.current?.contains(event.target)) setMenu(null) }
    const scrolled = event => { if (!panelRef.current?.contains(event.target)) setMenu(null) }
    const resized = () => setMenu(null)
    // Handle Escape before modal document listeners so only this menu closes.
    const escape = event => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      setMenu(null)
      triggerRef.current?.focus({ preventScroll: true })
    }
    window.addEventListener('keydown', escape, true)
    document.addEventListener('pointerdown', outside, true)
    document.addEventListener('focusin', outside)
    document.addEventListener('scroll', scrolled, true)
    window.addEventListener('resize', resized)
    window.visualViewport?.addEventListener('resize', resized)
    return () => {
      document.removeEventListener('pointerdown', outside, true)
      document.removeEventListener('focusin', outside)
      document.removeEventListener('scroll', scrolled, true)
      window.removeEventListener('resize', resized)
      window.removeEventListener('keydown', escape, true)
      window.visualViewport?.removeEventListener('resize', resized)
    }
  }, [isOpen])
  const formatted = formatTime(value, '')
  const current = draft?.source === value ? draft : { text: formatted ? formatted.split(' ')[0] : '', period: formatted ? formatted.split(' ')[1] : 'AM' }
  function update(text, period) {
    const next = toTime24(text, period)
    setDraft({ source: next, text, period: next ? formatTime(next).split(' ')[1] : period })
    onChange?.({ target: { value: next, name }, currentTarget: { value: next, name } })
  }
  function openMenu() {
    if (disabled || readOnly) return
    if (isOpen) { setMenu(null); return }
    const rect = rootRef.current.getBoundingClientRect()
    const viewport = window.visualViewport
    const topEdge = (viewport?.offsetTop ?? 0) + 8
    const bottomEdge = (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight) - 8
    const viewportWidth = viewport?.width ?? window.innerWidth
    const below = bottomEdge - rect.bottom - 6
    const above = rect.top - topEdge - 6
    const flip = below < 240 && above > below
    const height = Math.min(280, bottomEdge - topEdge, Math.max(100, flip ? above : below))
    const width = Math.min(Math.max(rect.width, 216), viewportWidth - 16)
    const left = Math.max(8, Math.min(rect.left, viewportWidth - width - 8))
    const top = Math.max(topEdge, Math.min(flip ? rect.top - height - 6 : rect.bottom + 6, bottomEdge - height))
    const match = suggestedTimes.findIndex(time => time.value === value)
    const minutes = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value)
    setActiveIndex(match >= 0 ? match : minutes ? Math.min(95, Math.round((Number(minutes[1]) * 60 + Number(minutes[2])) / 15)) : current.period === 'PM' ? 48 : 0)
    setMenu({ left, top, width, height })
  }
  function selectSuggested(next) {
    const [clock, period] = formatTime(next).split(' ')
    update(clock, period)
    setMenu(null)
    document.getElementById(inputId)?.focus({ preventScroll: true })
  }
  function menuKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation(); setMenu(null); triggerRef.current?.focus(); return
    }
    if (event.key === 'Tab') { setMenu(null); triggerRef.current?.focus(); return }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectSuggested(suggestedTimes[activeIndex].value); return }
    const next = event.key === 'ArrowDown' ? Math.min(95, activeIndex + 1) : event.key === 'ArrowUp' ? Math.max(0, activeIndex - 1) : event.key === 'Home' ? 0 : event.key === 'End' ? 95 : event.key === 'PageDown' ? Math.min(95, activeIndex + 8) : event.key === 'PageUp' ? Math.max(0, activeIndex - 8) : null
    if (next != null) { event.preventDefault(); setActiveIndex(next) }
  }
  return <span ref={rootRef} className={cn('inline-flex min-h-10 w-full min-w-0 items-center rounded-lg border border-input bg-card text-sm text-foreground shadow-xs focus-within:border-ring focus-within:ring-1 focus-within:ring-ring', className)}>
    <input {...props} id={inputId} name={name} required={required} disabled={disabled} readOnly={readOnly} type="text" inputMode="text" placeholder="h:mm" pattern="(0?[1-9]|1[0-2]):[0-5][0-9]([ ]*[AaPp][Mm])?" title="Enter h:mm AM/PM, or h:mm and choose AM/PM" data-slot="input" value={current.text} onChange={event => update(event.target.value, current.period)} onFocus={event => { setMenu(null); props.onFocus?.(event) }} onKeyDown={event => { props.onKeyDown?.(event); if (!event.defaultPrevented && event.key === 'ArrowDown') { event.preventDefault(); openMenu() } }} onBlur={event => {
      const next = toTime24(current.text, current.period)
      if (next) {
        const [text, period] = formatTime(next).split(' ')
        setDraft({ source: next, text, period })
      }
      props.onBlur?.(event)
    }} className="min-w-0 flex-1 rounded-l-[inherit] bg-transparent px-2 py-1.5 outline-none disabled:cursor-not-allowed disabled:opacity-50"/>
    <span className="relative inline-flex h-full min-h-9 w-14 shrink-0 items-center border-l border-input bg-muted/20">
      <select style={{ backgroundImage: 'none', paddingLeft: 8, paddingRight: 18, fontSize: 12 }} aria-label="AM/PM" aria-controls={inputId} disabled={disabled || readOnly} value={current.period} onChange={event => update(current.text.replace(/\s*(AM|PM)$/i, '').trim(), event.target.value)} className="h-full min-h-9 w-full appearance-none bg-transparent pl-2 pr-5 text-[11px] font-semibold outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"><option value="AM">AM</option><option value="PM">PM</option></select>
      <ChevronDown size={11} aria-hidden="true" className="pointer-events-none absolute right-1.5 text-muted-foreground"/>
    </span>
    <button ref={triggerRef} type="button" aria-label="Suggested times" aria-haspopup="listbox" aria-controls={isOpen ? listId : undefined} aria-expanded={isOpen} title="Suggested times (15-minute intervals)" disabled={disabled || readOnly} onClick={openMenu} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); openMenu() } }} className="inline-flex min-h-9 w-8 shrink-0 self-stretch items-center justify-center rounded-r-[inherit] border-l border-input bg-primary/5 text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
      <ChevronDown size={14} aria-hidden="true" className={cn('transition-transform', isOpen && 'rotate-180')}/>
    </button>
    {menu && <div ref={panelRef} popover={typeof HTMLElement.prototype.showPopover === 'function' ? 'manual' : undefined} onKeyDown={menuKeyDown} className="z-[100] overflow-hidden rounded-xl border border-primary/15 bg-card text-foreground shadow-[0_10px_30px_rgba(15,23,42,0.16)]" style={{ position: 'fixed', inset: 'auto', margin: 0, left: menu.left, top: menu.top, width: menu.width, maxHeight: menu.height }}>
      <div className="flex h-10 items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-3"><span className="text-[11px] font-semibold">Suggested times</span><span className="text-[10px] text-muted-foreground">Every 15 min</span></div>
      <div ref={listRef} id={listId} role="listbox" aria-label="Suggested times" aria-activedescendant={`${listId}-${activeIndex}`} tabIndex={-1} className="overflow-y-auto overscroll-contain p-1 outline-none" style={{ maxHeight: menu.height - 40 }}>
        {suggestedTimes.map((time, index) => <div key={time.value} id={`${listId}-${index}`} role="option" aria-selected={time.value === value} onPointerDown={event => event.preventDefault()} onClick={() => selectSuggested(time.value)} className={cn('flex min-h-9 cursor-pointer items-center justify-between rounded-lg px-2.5 text-xs tabular-nums transition-colors', activeIndex === index ? 'bg-primary/10 font-semibold text-primary' : 'hover:bg-muted/60', time.value === value && 'font-semibold text-primary')}>
          <span>{time.label}</span>{time.value === value && <Check size={13} aria-hidden="true"/>}
        </div>)}
      </div>
    </div>}

  </span>
}

// Compatibility for existing consumers; all type=time Inputs use the same picker.
export { TimePicker as TimeInput }

