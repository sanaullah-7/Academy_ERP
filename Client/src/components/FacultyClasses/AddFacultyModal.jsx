import { academicService } from '../../services/academicService.js'
import { useEffect, useRef, useState } from 'react'
import { AlertCircle, BookOpen, Check, ChevronDown, Loader2, UserPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog.jsx'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { facultyService } from '../../services/facultyService.js'

export default function AddFacultyModal({ open, onClose, branchId, onFacultyAdded, teacher = null }) {
  const [name, setName] = useState(teacher?.name || '')
  const [qualifications, setQualifications] = useState(teacher?.qualifications || '')
  const [specialization, setSpecialization] = useState(teacher?.specialization || '')
  const [department, setDepartment] = useState(teacher?.department || '')
  const [contact, setContact] = useState(teacher?.contact || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [subjectData, setSubjectData] = useState(null)
  const [subjectError, setSubjectError] = useState('')
  const [subjectOpen, setSubjectOpen] = useState(false)
  const subjectRoot = useRef(null)
  useEffect(() => {
    if (!open || !branchId) return
    let live = true
    const load = () => academicService.overview({branchId}).then(value=>{if(live){setSubjectData(value);setSubjectError('')}},err=>{if(live)setSubjectError(err.message)})
    void load()
    window.addEventListener('focus',load)
    window.addEventListener('storage',load)
    return () => {live=false;window.removeEventListener('focus',load);window.removeEventListener('storage',load)}
  }, [open, branchId])
  useEffect(() => {
    if (!subjectOpen) return
    const close = event => {if(!subjectRoot.current?.contains(event.target))setSubjectOpen(false)}
    document.addEventListener('pointerdown',close)
    return () => document.removeEventListener('pointerdown',close)
  }, [subjectOpen])
  const savedSubjects = (subjectData?.subjects || []).filter(subject=>subject.active!==false && subjectData.courses.some(course=>course.id===subject.courseId&&course.active!==false))
  const options = [...new Set(savedSubjects.map(subject=>subject.name))]
  const legacySubject = teacher?.specialization && !options.includes(teacher.specialization) ? teacher.specialization : null
  const subjectOptions = legacySubject ? [legacySubject,...options] : options
  const focusSubject = index => requestAnimationFrame(()=>{
    const nodes=subjectRoot.current?.querySelectorAll('[role="option"]')
    if(nodes?.length)nodes[(index+nodes.length)%nodes.length]?.focus()
  })


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmedName = name.trim()
    const trimmedContact = contact.trim()

    if (!trimmedName) {
      setError('Please provide the faculty member full name.')
      return
    }
    if (!trimmedContact) {
      setError('Please provide a valid contact number.')
      return
    }

    if (!teacher && !options.includes(specialization)) {
      setError('Select a saved primary subject. Create subjects in Courses & Batches first.')
      return
    }
    setSubmitting(true)
    try {
      const created = await (teacher ? (record,query)=>facultyService.updateTeacher(teacher.id,record,query) : facultyService.createTeacher)(
        {
          name: trimmedName,
          qualifications: qualifications.trim() || `${specialization} Specialist`,
          specialization,
          department: department.trim() || `${specialization} Department`,
          contact: trimmedContact,
          enabled: true,
        },
        { branchId }
      )
      onFacultyAdded?.(created)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to add faculty member.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(openState) => { if (!openState && !submitting) onClose() }}>
      <DialogContent className="max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-border/80">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#F9EBEE] text-[#940016]">
              <UserPlus size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                {teacher ? 'Edit Faculty Member' : 'Add Faculty Member'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Register a qualified teaching instructor for this campus.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Instructor Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Prof. Tariq Mahmood"
              className="mt-1 h-9 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Primary Subject <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1" ref={subjectRoot} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setSubjectOpen(false);subjectRoot.current?.querySelector('[aria-haspopup]')?.focus()}}}>
                <button type="button" aria-label="Primary Subject" aria-haspopup="listbox" aria-expanded={subjectOpen}
                  disabled={!subjectData || !!subjectError || !subjectOptions.length}
                  onClick={()=>{setSubjectOpen(value=>!value);focusSubject(Math.max(0,subjectOptions.indexOf(specialization)))}}
                  onKeyDown={event=>{if(event.key==='ArrowDown'){event.preventDefault();setSubjectOpen(true);focusSubject(0)}}}
                  className="flex h-9 w-full min-w-0 items-center gap-2 rounded-lg border border-input bg-card px-2.5 text-left text-xs shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60">
                  <BookOpen size={14} className="shrink-0 text-primary"/><span className="min-w-0 flex-1 truncate">{specialization || (!subjectData ? 'Loading subjects...' : 'Select subject')}</span><ChevronDown size={13} className="shrink-0 text-muted-foreground"/>
                </button>
                {subjectOpen && <div role="listbox" aria-label="Saved primary subjects" className="absolute left-0 top-full z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-lg border border-border bg-card p-0.5 shadow-lg">
                  {subjectOptions.map((subject,index)=><button key={subject} type="button" role="option" aria-selected={specialization===subject} tabIndex={-1}
                    onKeyDown={event=>{if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){event.preventDefault();focusSubject(event.key==='Home'?0:event.key==='End'?subjectOptions.length-1:index+(event.key==='ArrowDown'?1:-1))}if(event.key==='Tab')setSubjectOpen(false)}}
                    onClick={()=>{setSpecialization(subject);setSubjectOpen(false);subjectRoot.current?.querySelector('[aria-haspopup]')?.focus()}}
                    className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[11px] leading-4 outline-none hover:bg-accent focus-visible:bg-accent aria-selected:bg-primary/10 aria-selected:text-primary">
                    <span className="min-w-0 flex-1"><span className="block truncate font-medium">{subject}</span><small className="block truncate text-[9px] text-muted-foreground">{subject===legacySubject?'Existing profile value':[...new Set(savedSubjects.filter(item=>item.name===subject).map(item=>subjectData.courses.find(course=>course.id===item.courseId)?.name))].join(', ')}</small></span>{specialization===subject&&<Check size={13} className="shrink-0"/>}
                  </button>)}
                </div>}
                {subjectError&&<p role="alert" className="mt-1 text-[10px] text-destructive">{subjectError}</p>}
                {subjectData&&!subjectOptions.length&&<p className="mt-1 text-[10px] text-muted-foreground">Create an active subject in Courses &amp; Batches first.</p>}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Qualifications
              </label>
              <Input
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="e.g. M.Phil Chemistry"
                className="mt-1 h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Department / Role
              </label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Senior Lecturer"
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g. 0301-4455667"
                className="mt-1 h-9 text-xs"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
              className="h-8 text-xs px-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="h-8 text-xs px-4 bg-[#940016] text-white hover:bg-[#7a0012] gap-1.5 shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={13} />
                  {teacher ? 'Save Instructor' : 'Add Instructor'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
