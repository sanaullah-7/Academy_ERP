/**
 * Purpose: Will define Student Profile Page for the Students area of the Academy frontend.
 * Module: Students
 * Status: Implemented — branch-scoped read-only details and saved enrollment history.
 */

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Loader2, UserRound, Pencil, GraduationCap, CreditCard, CalendarCheck } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import StudentEditDialog from '../../components/Students/StudentEditDialog.jsx'
import { useBranch } from '../../hooks/useBranch.js'
import { useAuth } from '../../hooks/useAuth.js'
import { studentService } from '../../services/studentService.js'
import { canAccess, PERMISSIONS } from '../../constants/permissions.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import { financialService } from '../../services/financialService.js'

function ProfileCard({ title, icon: Icon, children }) {
  return <Card className="min-w-0 shadow-sm"><CardHeader className="border-b border-border/50 bg-muted/20"><CardTitle className="flex items-center gap-2 text-base"><Icon size={18} aria-hidden="true" />{title}</CardTitle></CardHeader><CardContent className="p-5">{children}</CardContent></Card>
}

function Detail({ label, children }) {
  return <div className="min-w-0"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-1 break-words font-medium">{children || 'Not available'}</dd></div>
}

export default function StudentProfilePage() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { branch, branchId, scopeKey } = useBranch()
  const { user } = useAuth()
  const [result, setResult] = useState(null)
  const [retry, setRetry] = useState(0)
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    if (!branchId || !studentId) return () => { active = false }
    Promise.all([studentService.getProfile(studentId, { branchId }), financialService.overview({ branchId })]).then(
      ([student, financial]) => { if (active) setResult({ scopeKey, studentId, retry, student, financial }) },
      error => { if (active) setResult({ scopeKey, studentId, retry, error }) },
    )
    return () => { active = false }
  }, [branchId, scopeKey, studentId, retry])

  const current = result?.scopeKey === scopeKey && result?.studentId === studentId && result?.retry === retry ? result : null
  const student = current?.student?.branchId === branchId ? current.student : null
  const error = current?.error ?? (current?.student && !student ? { code: 'NOT_FOUND' } : null)
  const canEdit = canAccess(PERMISSIONS.STUDENTS_EDIT, user, branchId)
  const sortedEnrollments = [...(student?.enrollments ?? [])].sort((a, b) => Date.parse(b.enrolledAt) - Date.parse(a.enrolledAt))
  const studentChallans = (current?.financial?.challans ?? []).filter(item => item.studentId === studentId)

  function saved(updated) {
    setMessage(`${updated.name} ka profile save ho gaya.`)
    setEditing(false)
    setRetry(value => value + 1)
  }

  return <DashboardLayout><div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button variant="outline" onClick={() => navigate(ROUTE_PATHS.STUDENTS)}><ArrowLeft size={16} aria-hidden="true" />Back to Students</Button>
      {student && canEdit && <Button onClick={() => setEditing(true)}><Pencil size={16} aria-hidden="true" />Edit Student</Button>}
    </div>
    {message && <p role="status" className="rounded-md bg-primary/10 p-3 text-sm">{message}</p>}
    {!current ? <div role="status" className="flex items-center gap-3 rounded-lg border p-8 text-muted-foreground"><Loader2 size={20} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />Loading student...</div>
      : error ? <div className="flex flex-col items-start gap-3 rounded-lg border p-8"><AlertCircle aria-hidden="true" className="text-destructive" /><p role="alert" className="text-destructive">{error.code === 'NOT_FOUND' ? 'This student was not found in the selected branch.' : `Unable to load student profile. ${error.message}`}</p><Button variant="outline" onClick={() => setRetry(value => value + 1)}>Retry</Button></div>
        : <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ProfileCard title="Student details" icon={UserRound}>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Detail label="Student Name">{student.name}</Detail>
              <Detail label="Status"><Badge variant={student.status === 'Provisional' ? 'outline' : 'secondary'}>{student.status ?? 'Active'}</Badge></Detail>
              <Detail label="Date of Birth">{student.dateOfBirth}</Detail>
              <Detail label="Student Number">{student.studentNumber}</Detail>
            </dl>
          </ProfileCard>
          <ProfileCard title="Guardian" icon={UserRound}>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Detail label="Guardian Name">{student.guardianName}</Detail>
              <Detail label="Guardian Contact">{student.guardianContact}</Detail>
            </dl>
          </ProfileCard>
          <ProfileCard title="Academic details" icon={GraduationCap}>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Detail label="Course">{student.courseName}</Detail>
              <Detail label="Batch">{student.batchName}</Detail>
              <Detail label="Branch">{branch?.name}</Detail>
              <Detail label="Admission Reference">{student.admission?.displayAdmissionId ?? student.admissionDisplaySerialId ?? student.admissionDisplayId ?? 'Not linked'}</Detail>
              <Detail label="Admission Status">{student.admissionStatus}</Detail>
            </dl>
          </ProfileCard>
          <ProfileCard title="Enrollment history" icon={GraduationCap}>
            {sortedEnrollments.length === 0 ? <p className="text-sm text-muted-foreground">No enrollment history.</p> : <div className="space-y-3">
              {sortedEnrollments.map(enrollment => <article key={enrollment.id} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-medium">{enrollment.courseName}</h3><Badge variant="secondary">{enrollment.status}</Badge></div>
                <dl className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <Detail label="Batch">{enrollment.batchName}</Detail><Detail label="Enrolled">{enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : null}</Detail><Detail label="Branch">{branch?.name}</Detail>
                </dl>
              </article>)}
            </div>}
          </ProfileCard>
          <ProfileCard title="Fees" icon={CreditCard}>{studentChallans.length === 0 ? <p className="text-sm text-muted-foreground">No saved challans.</p> : <div className="space-y-2">{studentChallans.map(item => <article className="rounded-md border p-3 text-sm" key={item.id}><div className="flex justify-between gap-2"><strong>{item.reference}</strong><Badge variant="secondary">{item.status}</Badge></div><p className="mt-1 text-muted-foreground">{item.description} · PKR {item.amount.toLocaleString('en-PK')}</p><p className="text-muted-foreground">Paid PKR {item.paidAmount.toLocaleString('en-PK')} · Due PKR {item.balance.toLocaleString('en-PK')}</p></article>)}</div>}</ProfileCard>
          <ProfileCard title="Attendance" icon={CalendarCheck}><p className="text-sm text-muted-foreground">No attendance records available yet.</p></ProfileCard>
        </div>}
    {student && editing && <StudentEditDialog open={editing} student={student} branchId={branchId} onOpenChange={setEditing} onSaved={saved} />}
  </div></DashboardLayout>
}
