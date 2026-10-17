import { useBranch } from '../../hooks/useBranch.js'
import { useEffect, useState } from 'react'
import { AlertCircle, GraduationCap, Loader2, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'
import { facultyService } from '../../services/facultyService.js'

function BatchStudentsContent({ open, onClose, teacher, branchId, initialBatchId, subjectId, subjectName, subjectOnly = false }) {
  const { branch } = useBranch()
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId || '')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const batches = teacher?.assignedBatches || []
  const effectiveBatchId = selectedBatchId || initialBatchId || batches[0]?.id || ''

  useEffect(() => {
    let active = true
    if (!open || !effectiveBatchId || !branchId) return

    Promise.resolve().then(() => {
      if (active) {
        setLoading(true)
        setError('')
      }
    })

    facultyService
      .listClassStudents(effectiveBatchId, { branchId, subjectId: subjectOnly ? (subjectId || '__unconfigured_subject__') : undefined })
      .then((res) => {
        if (active) {
          setStudents(res || [])
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Unable to load batch students.')
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [open, effectiveBatchId, branchId, subjectId, subjectOnly])

  if (!teacher) return null

  return (
    <Dialog open={open} onOpenChange={(openState) => { if (!openState) onClose() }}>
      <DialogContent className="max-w-2xl p-6 bg-white rounded-2xl shadow-2xl border border-border/80">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F9EBEE] text-[#940016]">
              <Users size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                Batch Students — {teacher.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {subjectOnly ? `Active students enrolled in ${subjectName || 'this subject'} only.` : "Active students enrolled in this instructor's assigned batches."}
                <span className="mt-1 block">Branch: {branch?.name || 'Not configured'}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {batches.length > 0 ? (
          <div className="mt-3 space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-700 shrink-0">
                Select Batch:
              </label>
              <select
                value={effectiveBatchId}
                disabled={subjectOnly}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="h-8 rounded-lg border border-input bg-background px-3 text-xs shadow-xs focus:ring-1 focus:ring-ring"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.courseName || 'Course'})
                  </option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground ml-auto">
                {students.length} Enrolled
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-xs text-muted-foreground">
                <Loader2 size={16} className="animate-spin text-[#940016]" />
                <span>Loading enrolled students...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            ) : students.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                {subjectOnly ? 'No active students enrolled in this subject and batch.' : 'No active students currently enrolled in this batch.'}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border/80 max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-border/60 text-slate-700 font-semibold sticky top-0">
                    <tr>
                      <th className="px-3.5 py-2">Student Name</th>
                      <th className="px-3.5 py-2">Admission No.</th>
                      <th className="px-3.5 py-2">Batch</th>
                      <th className="px-3.5 py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {students.map((student) => (
                      <tr key={student.enrollmentId || student.id} className="hover:bg-slate-50/60">
                        <td className="px-3.5 py-2.5 font-medium text-slate-900">
                          {student.name}
                        </td>
                        <td className="px-3.5 py-2.5 text-muted-foreground font-mono">
                          {student.admissionReference || '—'}
                        </td>
                        <td className="px-3.5 py-2.5 text-muted-foreground">
                          {batches.find((b) => b.id === selectedBatchId)?.name || 'Batch'}
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="size-1 rounded-full bg-emerald-600" />
                            {student.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="py-10 text-center text-xs text-muted-foreground border border-dashed rounded-xl mt-4">
            <GraduationCap size={28} className="mx-auto text-muted-foreground/60 mb-2" />
            <p className="font-semibold text-slate-800">No Batches Assigned</p>
            <p className="mt-1 text-muted-foreground">
              This instructor does not have any active batches assigned yet.
            </p>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-border/60 mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs px-3"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function BatchStudentsModal(props) {
  return <BatchStudentsContent key={`${props.open}-${props.branchId}-${props.teacher?.id}-${props.initialBatchId || ''}`} {...props} />
}
