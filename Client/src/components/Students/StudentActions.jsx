/**
 * Purpose: Will define Student Actions for the Students area of the Academy frontend.
 * Module: Students
 * Status: Planned — functionality not implemented.
 */

import { useRef, useState } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '../ui/button.jsx'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog.jsx'
import StudentEditDialog from './StudentEditDialog.jsx'
import { admissionService } from '../../services/admissionService.js'
import { useAuth } from '../../hooks/useAuth.js'
import { canAccess, PERMISSIONS } from '../../constants/permissions.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'

export default function StudentActions({ student, branchId, onUpdated, onDeleted, suffix = 'desktop' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const trigger = useRef(null)
  const canEdit = canAccess(PERMISSIONS.STUDENTS_EDIT, user, branchId)
  const canDelete = canAccess(PERMISSIONS.ADMISSIONS_DELETE, user, branchId) && Boolean(student.admission?.id)
  const [editing, setEditing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deletePending, setDeletePending] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  function view() {
    setMenuOpen(false)
    navigate(generatePath(ROUTE_PATHS.STUDENT_PROFILE, { studentId: student.id }))
  }
  async function remove() {
    if (deletePending || !student.admission?.id) return
    setDeletePending(true); setDeleteError('')
    try {
      await admissionService.delete(student.admission.id, { branchId })
      setDeleting(false); onDeleted?.(student)
    } catch (failure) { setDeleteError(failure.message) }
    finally { setDeletePending(false) }
  }

  return <div onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
    <div className="relative inline-block">
      <Button ref={trigger} variant="ghost" size="icon" aria-label={`Actions for ${student.name}`} aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)} onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          setMenuOpen(true)
        }
      }}><MoreHorizontal size={20} aria-hidden="true" /></Button>
      {menuOpen && <div role="menu" aria-label={`Student actions for ${student.name}`} className="absolute right-0 z-20 mt-1 min-w-40 rounded-lg border border-border bg-card p-1 shadow-lg" onKeyDown={event => {
        if (event.key === 'Escape') {
          event.preventDefault()
          setMenuOpen(false)
          trigger.current?.focus()
        }
      }}>
        <button type="button" role="menuitem" className="flex min-h-11 w-full items-center rounded-md px-3 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring" onClick={view}>View Profile</button>
        {canEdit && <button type="button" role="menuitem" className="flex min-h-11 w-full items-center rounded-md px-3 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring" onClick={() => { setMenuOpen(false); setEditing(true) }}>Edit Student</button>}
        {canDelete && <button type="button" role="menuitem" className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-sm text-destructive hover:bg-destructive/10 focus-visible:outline-2 focus-visible:outline-ring" onClick={() => { setMenuOpen(false); setDeleteError(''); setDeleting(true) }}><Trash2 size={16} aria-hidden="true" />Delete Student</button>}
      </div>}
    </div>
    {editing && <StudentEditDialog key={`${student.id}-${suffix}`} open={editing} student={student} branchId={branchId} onOpenChange={setEditing} onSaved={updated => { setEditing(false); onUpdated(updated) }} />}
    <Dialog open={deleting} onOpenChange={open => { if (!deletePending) { setDeleting(open); if (!open) setDeleteError('') } }}><DialogContent className="max-w-md"><DialogTitle>Delete {student.name}?</DialogTitle><DialogDescription>This permanently deletes the verified linked admission, student, enrollment, challan and receipts. Unrelated records remain unchanged.</DialogDescription>{deleteError&&<p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{deleteError}</p>}<div className="flex justify-end gap-2"><Button variant="outline" disabled={deletePending} onClick={()=>setDeleting(false)}>Cancel</Button><Button variant="destructive" disabled={deletePending} onClick={remove}>{deletePending?'Deleting…':'Delete Student'}</Button></div></DialogContent></Dialog>
  </div>
}
