/**
 * Purpose: Will define Branch Switcher for the Layout area of the Academy frontend.
 * Module: Layout
 * Status: Planned — functionality not implemented.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Building2, Check, ChevronDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { useBranch } from '../../hooks/useBranch.js'

// Keep keyboard focus through the dashboard's loading/content shell remounts.
let pendingBranchFocus = null
function setPendingBranchFocus(value) { pendingBranchFocus = value }

export default function BranchSwitcher() {
  const { error, user } = useAuth()
  const { branches, branchId, selectBranch } = useBranch()
  const [pending, setPending] = useState(false)

  const [open, setOpen] = useState(false)
  const root = useRef(null)
  useLayoutEffect(() => {
    if (pendingBranchFocus?.userId === user?.id && pendingBranchFocus.branchId === branchId) document.getElementById('active-demo-branch')?.focus()
  }, [branchId, user?.id])
  useEffect(() => {
    const clear = event => { if (event.type === 'pointerdown' || event.target.id !== 'active-demo-branch') pendingBranchFocus = null }
    document.addEventListener('pointerdown', clear)
    document.addEventListener('focusin', clear)
    return () => { document.removeEventListener('pointerdown', clear); document.removeEventListener('focusin', clear) }
  }, [])
  useEffect(() => {
    if (!open) return
    const close = event => { if (!root.current?.contains(event.target)) setOpen(false) }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [open])
  function focusOption(index) {
    requestAnimationFrame(() => {
      const options = root.current?.querySelectorAll('[role="option"]')
      options?.[(index + options.length) % options.length]?.focus()
    })
  }
  function openOptions(last = false) {
    setOpen(true)
    focusOption(last ? branches.length - 1 : Math.max(0, branches.findIndex(branch => branch.id === branchId)))
  }
  async function changeBranch(selectedId) {
    const restoreFocus = true
    setOpen(false)
    if (pending || selectedId === branchId) { document.getElementById('active-demo-branch')?.focus(); return }
    setPending(true)
    setPendingBranchFocus({ userId: user?.id, branchId: selectedId })
    const changed = await selectBranch(selectedId)
    if (!changed) setPendingBranchFocus(null)
    setPending(false)
    // Protected branch content remounts; return keyboard focus to its new switcher.
    if (restoreFocus) requestAnimationFrame(() => document.getElementById('active-demo-branch')?.focus())
  }

  return <div className="demo-branch-control" ref={root} onKeyDown={event => {
    if (event.key === 'Escape') { setOpen(false); document.getElementById('active-demo-branch')?.focus() }
    if (event.key === 'Tab') setOpen(false)
  }}>
    <button id="active-demo-branch" type="button" className="demo-branch-trigger"
      aria-label="Active branch" aria-haspopup="listbox" aria-expanded={open}
      aria-controls={open ? 'branch-options' : undefined}
      disabled={pending || branches.length < 2} aria-busy={pending}
      aria-describedby={error ? 'demo-branch-error' : undefined}
      onClick={() => open ? setOpen(false) : openOptions()}
      onKeyDown={event => { if (['ArrowDown','ArrowUp'].includes(event.key)) { event.preventDefault(); openOptions(event.key === 'ArrowUp') } }}>
      <Building2 size={14} aria-hidden="true" /><span>{branches.find(branch => branch.id === branchId)?.name ?? 'Select a branch'}</span><ChevronDown size={13} aria-hidden="true" />
    </button>
    {open && <div id="branch-options" role="listbox" aria-label="Available branches" className="demo-branch-options">
      <p className="demo-branch-heading" role="presentation">Switch campus</p>
      {branches.map((branch, index) => <button key={branch.id} type="button" role="option" tabIndex={-1}
        aria-selected={branch.id === branchId} className="demo-branch-option"
        onClick={() => void changeBranch(branch.id)}
        onKeyDown={event => {
          const next = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: branches.length - 1 }[event.key]
          if (next !== undefined) { event.preventDefault(); focusOption(next) }
        }}>
        <Building2 size={14} aria-hidden="true" /><span>{branch.name}</span>{branch.id === branchId && <Check size={14} aria-hidden="true" />}
      </button>)}
    </div>}
    {error && <span id="demo-branch-error" className="demo-branch-error" role="alert">{error}</span>}
  </div>
}
