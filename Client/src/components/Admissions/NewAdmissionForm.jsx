import { useEffect, useRef, useState } from 'react'
import { BookOpenCheck, CheckCircle2, GraduationCap, IdCard, Loader2, MapPin, ReceiptText, UserRound, UsersRound } from 'lucide-react'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { admissionService } from '../../services/admissionService.js'
import { academicService } from '../../services/academicService.js'
import { courseService } from '../../services/courseService.js'
import { batchService } from '../../services/batchService.js'
import { classScheduleService } from '../../services/classScheduleService.js'
import { useBranch } from '../../hooks/useBranch.js'

const selectClass = 'h-12 w-full rounded-md border border-transparent bg-blue-50/70 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60'
const money = value => new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(value)

export default function NewAdmissionForm({ onSuccess, onCancel, onPendingChange, admission }) {
  const { branchId, scopeKey } = useBranch()
  const [references, setReferences] = useState(null)
  const [retry, setRetry] = useState(0)
  const [formData, setFormData] = useState({
    studentName: admission?.studentName ?? '', dob: admission?.dob ?? '', guardianName: admission?.guardianName ?? '', contact: admission?.contact ?? '',
    studentPhone: admission?.studentPhone ?? '', identityNumber: admission?.identityNumber ?? '', gender: admission?.gender ?? '', residenceType: admission?.residenceType ?? '', address: admission?.address ?? '',
    streamId: admission?.streamId ?? null, course: admission?.course ?? '', courseId: admission?.courseId ?? null, preferredBatchId: admission?.preferredBatchId ?? null, subjectIds: admission?.subjectIds ?? [],
    previousSchool: admission?.previousSchool ?? '', notes: admission?.notes ?? '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const inFlight = useRef(false)

  useEffect(() => {
    let active = true
    Promise.all([courseService.list({ branchId }), batchService.list({ branchId }), classScheduleService.list({ branchId }).catch(() => [])]).then(async ([courses, batches, classes]) => {
      let master = { streams: [], subjects: [] }
      try { master = await academicService.overview({ branchId }) } catch { /* Legacy course/batch reads remain usable. */ }
      if (active) setReferences({ ...master, courses, batches, classes, scopeKey, retry })
    }, error => { if (active) setReferences({ scopeKey, retry, error: error.message }) })
    return () => { active = false }
  }, [branchId, scopeKey, retry])
  const current = references?.scopeKey === scopeKey && references?.retry === retry ? references : null
  const streams = current?.streams?.filter(item => item.active) ?? []
  const courses = (current?.courses ?? []).filter(item => item.active !== false && (!formData.streamId || item.streamId === formData.streamId))
  const selectedCourse = current?.courses?.find(item => item.id === formData.courseId)
  const batches = (current?.batches ?? []).filter(item => item.courseId === formData.courseId && item.active !== false)
  const subjects = (current?.subjects ?? []).filter(item => item.courseId === formData.courseId && item.active)
  const selectedSubjects = subjects.filter(item => formData.subjectIds.includes(item.id))
  const selectedBatch = batches.find(item => item.id === formData.preferredBatchId)
  const classFor = subject => (current?.classes ?? []).filter(item => item.batchId === formData.preferredBatchId && item.subject.trim().toLocaleLowerCase() === subject.name.trim().toLocaleLowerCase()).sort((a, b) => `${a.classDate}T${a.startTime}`.localeCompare(`${b.classDate}T${b.startTime}`))[0]
  const selectedClasses = selectedSubjects.map(classFor).filter(Boolean)
  const scheduleConflicts = selectedClasses.filter((item, index) => selectedClasses.some((other, otherIndex) => otherIndex > index && item.classDate === other.classDate && item.startTime < other.endTime && item.endTime > other.startTime))
  const totalFee = (() => {
    if (!selectedCourse) return null
    if (selectedCourse.pricingMode === 'course') return Number.isFinite(selectedCourse.feeAmount) ? selectedCourse.feeAmount : null
    if (selectedCourse.pricingMode === 'subjects') return selectedSubjects.length && selectedSubjects.every(item => Number.isFinite(item.feeAmount)) ? selectedSubjects.reduce((sum, item) => sum + item.feeAmount, 0) : null
    return null
  })()

  const change = event => { const { name, value } = event.target; setFormData(previous => ({ ...previous, [name]: value })); if (errors[name]) setErrors(previous => ({ ...previous, [name]: null })) }
  const chooseStream = streamId => setFormData(previous => ({ ...previous, streamId, course: '', courseId: null, preferredBatchId: null, subjectIds: [] }))
  const chooseCourse = courseId => { const course = current?.courses?.find(item => item.id === courseId); if (course) setFormData(previous => ({ ...previous, streamId: course.streamId ?? previous.streamId, course: course.name, courseId: course.id, preferredBatchId: null, subjectIds: [] })) }
  const toggleSubject = id => setFormData(previous => ({ ...previous, subjectIds: previous.subjectIds.includes(id) ? previous.subjectIds.filter(item => item !== id) : [...previous.subjectIds, id] }))
  const validate = () => {
    const next = {}
    if (!formData.studentName.trim()) next.studentName = 'Student name is required'
    if (!formData.dob.trim()) next.dob = 'Date of birth is required'
    if (!formData.guardianName.trim()) next.guardianName = 'Guardian name is required'
    if (!formData.contact.trim()) next.contact = 'Contact number is required'
    if (!formData.course.trim() || (!admission && !formData.courseId)) next.course = 'Course selection is required'
    return next
  }
  async function submit(event) {
    event.preventDefault(); if (inFlight.current || !current || current.error) return
    const validation = validate(); setErrors(validation)
    if (Object.keys(validation).length) { event.currentTarget.querySelector(`[name="${Object.keys(validation)[0]}"]`)?.focus(); return }
    inFlight.current = true; setSubmitting(true); setSubmitError(''); onPendingChange?.(true)
    try {
      if (!branchId) throw new Error('No active branch selected.')
      // Changed to use createWithStudent so atomic creation happens.
      const result = admission ? await admissionService.update(admission.id, formData, { branchId }) : await admissionService.createWithStudent(formData, { branchId })
      onSuccess?.(result)
    } catch (error) { setSubmitError(error.message || 'Failed to submit application.'); inFlight.current = false; setSubmitting(false) } finally { onPendingChange?.(false) }
  }

  return <form onSubmit={submit} noValidate aria-busy={submitting} className="bg-slate-50/70">
    <div className="grid min-w-0 items-start gap-5 p-3 sm:p-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-6">
      <div className="min-w-0 space-y-5">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionTitle icon={IdCard} title="1. Student & Guardian Information" subtitle="Verified details for the admission register" badge="Required" />
          <div className="grid gap-5 p-5 md:grid-cols-2">
            {submitError&&<p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive md:col-span-2">{submitError}</p>}
            <Field label="Student Full Name" required error={errors.studentName}><IconInput icon={UserRound} id="studentName" name="studentName" value={formData.studentName} onChange={change} /></Field>
            <Field label="Guardian / Father Name" required error={errors.guardianName}><IconInput icon={UsersRound} id="guardianName" name="guardianName" value={formData.guardianName} onChange={change} /></Field>
            <Field label="Student Phone (WhatsApp)"><Input className="h-12 border-transparent bg-blue-50/70" id="studentPhone" name="studentPhone" value={formData.studentPhone} onChange={change} /></Field>
            <Field label="Guardian Contact Number (SMS Alerts)" required error={errors.contact}><Input className="h-12 border-transparent bg-blue-50/70" id="contact" name="contact" value={formData.contact} onChange={change} /></Field>
            <Field label="CNIC / B-Form No."><Input className="h-12 border-transparent bg-blue-50/70" id="identityNumber" name="identityNumber" value={formData.identityNumber} onChange={change} /></Field>
            <Field label="Date of Birth" required error={errors.dob}><Input className="h-12 border-transparent bg-blue-50/70" id="dob" name="dob" type="date" value={formData.dob} onChange={change} /></Field>
            <Field label="Gender"><select className={selectClass} id="gender" name="gender" value={formData.gender} onChange={change}><option value="">Select gender</option><option>Male</option><option>Female</option><option>Other</option></select></Field>
            <Field label="Residence"><select className={selectClass} id="residenceType" name="residenceType" value={formData.residenceType} onChange={change}><option value="">Select residence</option><option>Day Scholar</option><option>Hostel</option></select></Field>
            <Field label="Permanent Address / City" wide><IconInput icon={MapPin} id="address" name="address" value={formData.address} onChange={change} /></Field>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={GraduationCap} title="2. Academic Field, Target Course & Batch" subtitle="Saved active configuration from Courses & Batches" badge="Step 2 of 3" inset />
          {!current&&<p role="status" className="py-8 text-center text-sm text-muted-foreground">Loading academic configuration...</p>}
          {current?.error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{current.error} <Button type="button" size="sm" variant="outline" onClick={()=>setRetry(value=>value+1)}>Retry selections</Button></p>}
          {!current?.error&&<div className="space-y-5 pt-5">
            <Picker label="Academic Stream / Field" empty="No active streams configured." columns="four">{streams.map(stream=><Choice key={stream.id} selected={formData.streamId===stream.id} onClick={()=>chooseStream(stream.id)}>{stream.name}</Choice>)}</Picker>
            <div><p className="mb-2 text-sm font-semibold">Target Course / Program</p><select aria-label="Desired Course / Program" name="course" className="sr-only" disabled={!current} value={formData.courseId ?? (admission?.course&&!formData.courseId?'__legacy__':'')} onChange={event=>chooseCourse(event.target.value)}><option value="">Select configured course</option>{admission?.course&&!formData.courseId&&<option value="__legacy__">Legacy (unresolved): {admission.course}</option>}{formData.courseId&&!current?.courses?.some(course=>course.id===formData.courseId)&&<option value={formData.courseId}>Unresolved course: {formData.course}</option>}{courses.map(course=><option key={course.id} value={course.id}>{course.name}</option>)}</select><div className="grid overflow-hidden rounded-xl bg-blue-50 p-1 sm:grid-cols-2 xl:grid-cols-4">{courses.map(course=><button type="button" key={course.id} onClick={()=>chooseCourse(course.id)} className={`min-h-11 rounded-lg px-3 text-sm font-medium transition ${formData.courseId===course.id?'bg-white text-primary shadow-sm font-bold':'text-slate-600 hover:bg-white/60'}`}>{course.name}</button>)}</div>{current&&courses.length===0&&<span className="text-xs text-muted-foreground">No active course is configured for this stream.</span>}{errors.course&&<span className="text-xs text-destructive">{errors.course}</span>}</div>
            <label className="grid gap-2 text-sm font-semibold">Preferred Batch <span className="font-normal text-muted-foreground">(Optional)</span><select aria-label="Preferred Batch" className={selectClass} disabled={!selectedCourse} value={formData.preferredBatchId??''} onChange={event=>setFormData(previous=>({...previous,preferredBatchId:event.target.value||null}))}><option value="">No batch selected</option>{formData.preferredBatchId&&!batches.some(batch=>batch.id===formData.preferredBatchId)&&<option value={formData.preferredBatchId}>Unresolved batch: {formData.preferredBatchId}</option>}{batches.map(batch=><option key={batch.id} value={batch.id} disabled={batch.capacity!=null&&batch.remainingSeats===0}>{batch.name}</option>)}</select></label>
            <Picker label="Assigned Batch Timing" empty={formData.courseId?'No active batches configured for this course.':'Choose a course first.'}>{batches.map(batch=>{const selected=formData.preferredBatchId===batch.id;return <button type="button" key={batch.id} disabled={batch.capacity!=null&&batch.remainingSeats===0} onClick={()=>setFormData(previous=>({...previous,preferredBatchId:batch.id}))} className={`relative min-h-20 rounded-xl border p-3 pr-10 text-left transition-colors disabled:opacity-50 ${selected?'border-blue-200 bg-blue-100':'border-transparent bg-blue-50 hover:border-blue-200'}`}><span className={`absolute right-3 top-3 size-5 rounded-full border ${selected?'border-primary bg-primary shadow-[inset_0_0_0_4px_white]':'border-slate-400 bg-white'}`} aria-hidden="true"/><span className="block font-semibold">{batch.name}</span><span className="mt-1 block text-xs text-slate-600">{batch.startTime&&batch.endTime?`${batch.startTime} – ${batch.endTime}`:'Timing not configured'}</span><span className="block text-xs text-primary">{batch.remainingSeats==null?'Capacity not configured':`${batch.remainingSeats} seats left`}</span></button>})}</Picker>
          </div>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={BookOpenCheck} title="3. Subject Selection & Faculty Mapping" subtitle="Subjects saved against the selected course" badge={`${formData.subjectIds.length} Selected`} inset />
          <div className="grid gap-3 pt-5 sm:grid-cols-2">{!formData.courseId?<p className="text-sm text-muted-foreground sm:col-span-2">Choose a configured course first.</p>:subjects.length===0?<p className="text-sm text-muted-foreground sm:col-span-2">No active subjects configured for this course.</p>:subjects.map(subject=>{const scheduled=classFor(subject);return <button type="button" key={subject.id} onClick={()=>toggleSubject(subject.id)} className={`flex min-h-20 items-start gap-3 rounded-xl border p-3 text-left transition ${formData.subjectIds.includes(subject.id)?'border-primary bg-blue-50':'border-transparent bg-blue-50/70 hover:border-blue-200'}`}><span className={`mt-1 grid size-5 shrink-0 place-items-center rounded border ${formData.subjectIds.includes(subject.id)?'border-primary bg-primary text-white':'border-slate-400 bg-white'}`}>{formData.subjectIds.includes(subject.id)?'✓':''}</span><span className="min-w-0 flex-1"><strong className="block text-sm">{subject.name}</strong><small className="mt-1 block truncate text-xs text-slate-500">{scheduled?`${scheduled.teacherName} · ${scheduled.location} · ${scheduled.classDate} ${scheduled.startTime}`:'Faculty / class schedule unavailable'}</small></span><span className="shrink-0 text-right text-sm font-bold">{Number.isFinite(subject.feeAmount)?money(subject.feeAmount):'Fee unavailable'}</span></button>})}</div>
          <div className={`mt-5 rounded-xl p-4 text-sm ${scheduleConflicts.length?'bg-red-50 text-red-700':'bg-blue-50 text-slate-600'}`}>{!selectedBatch ? 'Choose a batch to see any matching saved single-date class details.' : selectedClasses.length === 0 ? `No saved single-date classes match the selected subjects in ${selectedBatch.name}.` : scheduleConflicts.length ? `${scheduleConflicts.length} real saved class overlap detected for the selected batch and subjects.` : `No clashes detected across ${selectedClasses.length} matching saved single-date ${selectedClasses.length===1?'class':'classes'}.`}</div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Previous School / Academy"><Input name="previousSchool" value={formData.previousSchool} onChange={change} /></Field><Field label="Additional Notes"><Input name="notes" value={formData.notes} onChange={change} /></Field></div>
        </section>
      </div>

      <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-4">
        <div className="flex items-center gap-2 border-b pb-4"><ReceiptText className="text-primary"/><h2 className="text-xl font-bold">Challan Summary</h2></div>
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Fee preview only. Pending admissions cannot issue an official challan or record payment.</p>
        <Summary label="Student" value={formData.studentName||'Not entered'} />
        <Summary label="Course" value={selectedCourse?.name||'Not selected'} />
        <Summary label="Batch" value={selectedBatch?.name||'Not selected'} />
        <Summary label="Selected subjects" value={selectedSubjects.length?selectedSubjects.map(item=>item.name).join(', '):'None selected'} />
        <div className="my-4 border-t" />
        <Summary label="Configured fee" value={totalFee==null?'Not configured':money(totalFee)} strong />
        <Summary label="Approved concession" value="No approved concession" />
        <Summary label="Net payable preview" value={totalFee==null?'Unavailable':money(totalFee)} strong />
        <Summary label="Planned initial payment" value="Not recorded before enrollment" />
        <Summary label="Payment mode" value="Choose in Fees after challan issuance" />
        <Summary label="Verified payments" value="Not available before enrollment" />
        <Summary label="Remaining balance" value={totalFee==null?'Unavailable':money(totalFee)} />
        <p className="mt-4 text-xs text-slate-500">Installment schedules and SMS delivery are not configured. After approval and enrollment, use Fees to issue a challan and collect verified payments.</p>
        <div className="mt-5 grid gap-2"><Button type="submit" disabled={submitting||!current||!!current.error}>{submitting?<><Loader2 className="animate-spin"/>Saving...</>:admission?'Save Changes':'Submit Application'}</Button>{onCancel&&<Button type="button" variant="outline" disabled={submitting} onClick={onCancel}>Cancel</Button>}</div>
      </aside>
    </div>
  </form>
}

function SectionTitle({ icon: Icon, title, subtitle, badge, inset=false }) { return <div className={`flex items-center gap-3 border-b ${inset?'pb-4':'px-5 py-5'}`}><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-primary"><Icon size={22}/></span><span className="min-w-0"><strong className="block text-base sm:text-xl">{title}</strong><small className="block text-slate-500">{subtitle}</small></span><span className="ml-auto hidden whitespace-nowrap text-xs font-semibold text-primary sm:block">{badge}</span></div> }
function Field({ label, required=false, error='', wide=false, children }) { return <label className={`grid gap-2 text-sm font-semibold text-slate-900 ${wide?'md:col-span-2':''}`}>{label}{required&&<span className="sr-only"> required</span>}{children}{error&&<span className="text-xs text-destructive">{error}</span>}</label> }
function IconInput({ icon: Icon, ...props }) { return <span className="relative"><Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/><Input {...props} className="h-12 border-transparent bg-blue-50/70 pl-10" /></span> }
function Picker({ label, empty, children, columns='three' }) { const items = Array.isArray(children)?children:[children]; return <div><p className="mb-2 text-sm font-semibold">{label}</p><div className={`grid gap-3 sm:grid-cols-2 ${columns==='four'?'xl:grid-cols-4':'xl:grid-cols-3'}`}>{items.filter(Boolean).length?children:<p className="text-sm text-muted-foreground sm:col-span-2">{empty}</p>}</div></div> }
function Choice({ selected, disabled=false, onClick, children }) { return <button type="button" disabled={disabled} onClick={onClick} className={`min-h-20 rounded-xl border p-3 text-left transition-colors disabled:opacity-50 ${selected?'border-primary bg-primary text-white':'border-transparent bg-blue-50 hover:border-blue-200'}`}>{children}{selected&&<CheckCircle2 className="ml-auto mt-1" size={18}/>}</button> }
function Summary({ label, value, strong=false }) { return <div className="flex items-start justify-between gap-3 py-2"><span className="text-sm text-slate-500">{label}</span><span className={`max-w-[55%] text-right text-sm ${strong?'font-bold text-primary':'font-semibold text-slate-900'}`}>{value}</span></div> }
