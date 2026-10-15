/**
 * Purpose: Will define Branch Switcher for the Layout area of the Academy frontend.
 * Module: Layout
 * Status: Planned — functionality not implemented.
 */

import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import { useBranch } from '../../hooks/useBranch.js'

export default function BranchSwitcher() {
  const { error } = useAuth()
  const { branches, branchId, selectBranch } = useBranch()
  const [pending, setPending] = useState(false)

  async function changeBranch(event) {
    const selectedId = event.target.value
    const restoreFocus = document.activeElement === event.target
    if (pending || selectedId === branchId) return
    setPending(true)
    await selectBranch(selectedId)
    setPending(false)
    // Protected branch content remounts; return keyboard focus to its new switcher.
    if (restoreFocus) requestAnimationFrame(() => document.getElementById('active-demo-branch')?.focus())
  }

  return <div className="demo-branch-control">
    <label className="sr-only" htmlFor="active-demo-branch">Active demo branch</label>
    <select id="active-demo-branch" className="demo-select demo-branch-select" value={branchId ?? ''}
      disabled={pending || branches.length < 2} onChange={changeBranch}
      aria-describedby={error ? 'demo-branch-error' : undefined} aria-busy={pending}>
      {!branchId && <option value="" disabled>{branches.length ? 'Select a branch' : 'No authorized branches'}</option>}
      {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
    </select>
    {error && <span id="demo-branch-error" className="demo-branch-error" role="alert">{error}</span>}
  </div>
}
