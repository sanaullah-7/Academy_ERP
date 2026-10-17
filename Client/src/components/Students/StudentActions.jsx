import { useEffect, useRef, useState } from 'react'
import { generatePath, useNavigate } from 'react-router-dom'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '../ui/button.jsx'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog.jsx'
import StudentEditDialog from './StudentEditDialog.jsx'
import { studentService } from '../../services/studentService.js'
import { useAuth } from '../../hooks/useAuth.js'
import { canAccess, PERMISSIONS } from '../../constants/permissions.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'

export default function StudentActions({ student, branchId, onUpdated, onDeleted, suffix = 'desktop' }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const trigger = useRef(null)
  const containerRef = useRef(null)
  const canEdit = canAccess(PERMISSIONS.STUDENTS_EDIT, user, branchId)
  const canDelete = canAccess(PERMISSIONS.ADMISSIONS_DELETE, user, branchId)
  const [editing, setEditing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [, setPlacement] = useState('bottom')
  const [deleting, setDeleting] = useState(false)
  const [deletePending, setDeletePending] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Close dropdown on click outside
  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  function toggleMenu() {
    if (!menuOpen && trigger.current) {
      const rect = trigger.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      // If within 160px from the bottom, flip menu upwards
      setPlacement(spaceBelow < 160 ? 'top' : 'bottom')
    }
    setMenuOpen(v => !v)
  }

  function view() {
    setMenuOpen(false)
    navigate(generatePath(ROUTE_PATHS.STUDENT_PROFILE, { studentId: student.id }))
  }

  async function remove() {
    if (deletePending) return
    setDeletePending(true)
    setDeleteError('')
    try {
      await studentService.delete(student.id, { branchId })
      setDeleting(false)
      onDeleted?.(student)
    } catch (failure) {
      setDeleteError(failure.message)
    } finally {
      setDeletePending(false)
    }
  }

  return (
    <div ref={containerRef} onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()} className="relative inline-block text-left">
      <Button
        ref={trigger}
        variant="ghost"
        size="icon"
        className="size-7 rounded-md hover:bg-slate-100 hover:text-[#940016]"
        aria-label={`Actions for ${student.name}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={toggleMenu}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            toggleMenu()
          }
        }}
      >
        <MoreHorizontal size={16} aria-hidden="true" />
      </Button>

      {menuOpen && (
        <div
          role="menu"
          aria-label={`Student actions for ${student.name}`}
          className="absolute right-0 top-full mt-1.5 z-50 w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-xl"
          onKeyDown={event => {
            if (event.key === 'Escape') {
              event.preventDefault()
              setMenuOpen(false)
              trigger.current?.focus()
            }
          }}
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-[#F9EBEE]/60 hover:text-[#940016] focus-visible:outline-2 focus-visible:outline-ring transition-colors"
            onClick={view}
          >
            View Profile
          </button>
          {canEdit && (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-[#F9EBEE]/60 hover:text-[#940016] focus-visible:outline-2 focus-visible:outline-ring transition-colors"
              onClick={() => {
                setMenuOpen(false)
                setEditing(true)
              }}
            >
              Edit Student
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-ring transition-colors"
              onClick={() => {
                setMenuOpen(false)
                setDeleteError('')
                setDeleting(true)
              }}
            >
              <Trash2 size={13} aria-hidden="true" />
              Delete Student
            </button>
          )}
        </div>
      )}

      {editing && (
        <StudentEditDialog
          key={`${student.id}-${suffix}`}
          open={editing}
          student={student}
          branchId={branchId}
          onOpenChange={setEditing}
          onSaved={updated => {
            setEditing(false)
            onUpdated(updated)
          }}
        />
      )}

      <Dialog
        open={deleting}
        onOpenChange={open => {
          if (!deletePending) {
            setDeleting(open)
            if (!open) setDeleteError('')
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogTitle>Delete {student.name}?</DialogTitle>
          <DialogDescription>
            This permanently deletes the verified linked admission, student, enrollment, challan and receipts. Unrelated records remain unchanged.
          </DialogDescription>
          {deleteError && (
            <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {deleteError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" disabled={deletePending} onClick={() => setDeleting(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" disabled={deletePending} onClick={remove}>
              {deletePending ? 'Deleting…' : 'Delete Student'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
