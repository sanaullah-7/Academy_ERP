/**
 * Purpose: Will define Student Actions for the Students area of the Academy frontend.
 * Module: Students
 * Status: Planned — functionality not implemented.
 */

import { useRef, useState } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '../ui/button.jsx'
import StudentEditDialog from './StudentEditDialog.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { canAccess, PERMISSIONS } from '../../constants/permissions.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'

export default function StudentActions({ student, branchId, onUpdated, suffix = 'desktop' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const trigger = useRef(null)
  const canEdit = canAccess(PERMISSIONS.STUDENTS_EDIT, user, branchId)
  const [editing, setEditing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  function view() {
    setMenuOpen(false)
    navigate(generatePath(ROUTE_PATHS.STUDENT_PROFILE, { studentId: student.id }))
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
      </div>}
    </div>
    {editing && <StudentEditDialog key={`${student.id}-${suffix}`} open={editing} student={student} branchId={branchId} onOpenChange={setEditing} onSaved={updated => { setEditing(false); onUpdated(updated) }} />}
  </div>
}
