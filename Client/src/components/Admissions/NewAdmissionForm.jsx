import { useEffect, useRef, useState } from 'react'
import { CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Input } from '../../components/ui/input.jsx'
import { Loader2 } from 'lucide-react'
import { admissionService } from '../../services/admissionService.js'
import { useBranch } from '../../hooks/useBranch.js'
import { courseService } from '../../services/courseService.js'
import { batchService } from '../../services/batchService.js'

export default function NewAdmissionForm({ onSuccess, onCancel, onPendingChange, admission }) {
  const { branchId, scopeKey } = useBranch()
  const [references, setReferences] = useState(null)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let active = true
    Promise.all([courseService.list({ branchId }), batchService.list({ branchId })]).then(
      ([courses, batches]) => { if (active) setReferences({ scopeKey, retry, courses, batches }) },
      error => { if (active) setReferences({ scopeKey, retry, error: error.message }) },
    )
    return () => { active = false }
  }, [branchId, scopeKey, retry])
  const currentReferences = references && references.scopeKey === scopeKey && references.retry === retry ? references : null

  const [formData, setFormData] = useState({
    studentName: admission?.studentName ?? '',
    dob: admission?.dob ?? '',
    guardianName: admission?.guardianName ?? '',
    contact: admission?.contact ?? '',
    course: admission?.course ?? '',
    courseId: admission?.courseId ?? null,
    preferredBatchId: admission?.preferredBatchId ?? null,
    previousSchool: admission?.previousSchool ?? '',
    notes: admission?.notes ?? ''
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const inFlight = useRef(false)

  const validate = () => {
    const newErrors = {}
    if (!formData.studentName.trim()) newErrors.studentName = 'Student name is required'
    if (!formData.dob.trim()) newErrors.dob = 'Date of birth is required'
    if (!formData.guardianName.trim()) newErrors.guardianName = 'Guardian name is required'
    if (!formData.contact.trim()) newErrors.contact = 'Contact number is required'
    if (!formData.course.trim() || (!admission && !formData.courseId)) newErrors.course = 'Course selection is required'
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }
  const selectCourse = e => {
    const course = currentReferences?.courses.find(item => item.id === e.target.value)
    if (!course) return
    setFormData(prev => ({ ...prev, course: course.name, courseId: course.id, preferredBatchId: null }))
    setErrors(prev => ({ ...prev, course: null }))
  }
  const selectedCourse = currentReferences?.courses?.find(course => course.id === formData.courseId)
  const batches = currentReferences?.batches?.filter(batch => batch.courseId === formData.courseId) ?? []

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (inFlight.current) return
    if (!currentReferences || currentReferences.error) return
    setSubmitError(null)

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      e.currentTarget.querySelector(`[name="${Object.keys(validationErrors)[0]}"]`)?.focus()
      return
    }

    inFlight.current = true
    setSubmitting(true)
    onPendingChange?.(true)
    try {
      if (!branchId) throw new Error('No active branch selected.')
      // Changed to use createWithStudent so atomic creation happens
      const result = admission
        ? await admissionService.update(admission.id, formData, { branchId })
        : await admissionService.createWithStudent(formData, { branchId })
      if (onSuccess) onSuccess(result)
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit application.')
      setSubmitting(false)
      inFlight.current = false
    } finally {
      onPendingChange?.(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      <CardHeader className="border-b border-border/50 bg-muted/20">
        <CardTitle className="text-lg">{admission ? 'Edit Application Details' : 'Application Details'}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <p className="col-span-full text-sm text-muted-foreground">DEMO only: use fictional details. {admission ? 'Updates saved admission and its linked Provisional student;' : 'Saves one Pending admission and linked Provisional student;'} no enrollment or fees.</p>
        {submitError && (
          <div className="col-span-full p-3 bg-destructive/10 text-destructive text-sm rounded-md" role="alert">
            {submitError}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="studentName" className="text-sm font-medium leading-none">
            Student Full Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            placeholder="e.g. Demo Student"
            className={errors.studentName ? 'border-destructive' : ''}
            required
            aria-describedby={errors.studentName ? "studentName-error" : undefined}
            aria-invalid={!!errors.studentName}
          />
          {errors.studentName && <p id="studentName-error" className="text-sm text-destructive">{errors.studentName}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="dob" className="text-sm font-medium leading-none">
            Date of Birth <span className="text-destructive">*</span>
          </label>
          <Input
            id="dob"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            className={errors.dob ? 'border-destructive' : ''}
            required
            aria-describedby={errors.dob ? "dob-error" : undefined}
            aria-invalid={!!errors.dob}
          />
          {errors.dob && <p id="dob-error" className="text-sm text-destructive">{errors.dob}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="guardianName" className="text-sm font-medium leading-none">
            Guardian / Father Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="guardianName"
            name="guardianName"
            value={formData.guardianName}
            onChange={handleChange}
            placeholder="e.g. Demo Guardian"
            className={errors.guardianName ? 'border-destructive' : ''}
            required
            aria-describedby={errors.guardianName ? "guardianName-error" : undefined}
            aria-invalid={!!errors.guardianName}
          />
          {errors.guardianName && <p id="guardianName-error" className="text-sm text-destructive">{errors.guardianName}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="contact" className="text-sm font-medium leading-none">
            Contact Number <span className="text-destructive">*</span>
          </label>
          <Input
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="e.g. 03001234567"
            className={errors.contact ? 'border-destructive' : ''}
            required
            aria-describedby={errors.contact ? "contact-error" : undefined}
            aria-invalid={!!errors.contact}
          />
          {errors.contact && <p id="contact-error" className="text-sm text-destructive">{errors.contact}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="course" className="text-sm font-medium leading-none">
            Desired Course / Program <span className="text-destructive">*</span>
          </label>
          <select
            id="course"
            name="course"
            value={formData.courseId ?? (admission?.course ? '__legacy__' : '')}
            onChange={selectCourse}
            disabled={!currentReferences || !!currentReferences.error || submitting}
            className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.course ? 'border-destructive' : ''}`}
            required
            aria-describedby={errors.course ? "course-error" : undefined}
            aria-invalid={!!errors.course}
          >
            <option value="" disabled>Select a course</option>
            {admission?.course && !formData.courseId && <option value="__legacy__">Legacy (unresolved): {admission.course}</option>}
            {formData.courseId && !selectedCourse && <option value={formData.courseId}>Unresolved course: {formData.course}</option>}
            {currentReferences?.courses?.map(course => <option key={course.id} value={course.id}>{course.name}</option>)}
          </select>
          {errors.course && <p id="course-error" className="text-sm text-destructive">{errors.course}</p>}
          {!currentReferences && <p role="status" className="text-sm text-muted-foreground">Loading courses and batches...</p>}
          {currentReferences?.error && <div role="alert" className="text-sm text-destructive">Unable to load selections. {currentReferences.error}<Button type="button" variant="outline" onClick={() => setRetry(n => n + 1)}>Retry selections</Button></div>}
          {currentReferences?.courses?.length === 0 && <p className="text-sm text-muted-foreground">No saved courses in this branch.</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="preferredBatchId" className="text-sm font-medium">Preferred Batch <span className="font-normal text-muted-foreground">(Optional)</span></label>
          <select id="preferredBatchId" name="preferredBatchId" value={formData.preferredBatchId ?? ''} onChange={e => setFormData(prev => ({ ...prev, preferredBatchId: e.target.value || null }))}
            disabled={!selectedCourse || submitting} aria-describedby="batch-help" className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60">
            <option value="">No batch selected</option>
            {formData.preferredBatchId && !batches.some(batch => batch.id === formData.preferredBatchId) && <option value={formData.preferredBatchId}>Unresolved batch: {formData.preferredBatchId}</option>}
            {batches.map(batch => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
          </select>
          <p id="batch-help" className="text-xs text-muted-foreground">{!selectedCourse ? 'Choose a saved course to select a batch.' : batches.length === 0 ? 'No saved batches for this course. Batch selection is optional.' : 'Only batches for this course and branch are shown. No enrollment is created.'}</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="previousSchool" className="text-sm font-medium leading-none">
            Previous School / Academy <span className="text-muted-foreground font-normal">(Optional)</span>
          </label>
          <Input
            id="previousSchool"
            name="previousSchool"
            value={formData.previousSchool}
            onChange={handleChange}
            placeholder="e.g. City School"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="notes" className="text-sm font-medium leading-none">
            Additional Notes <span className="text-muted-foreground font-normal">(Optional)</span>
          </label>
          <Input
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any extra information..."
          />
        </div>

      </CardContent>
      <CardFooter className="border-t border-border/50 bg-muted/20 p-4 flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting || !currentReferences || !!currentReferences.error} className="min-w-32">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            admission ? 'Save Changes' : 'Submit Application'
          )}
        </Button>
      </CardFooter>
    </form>
  )
}
