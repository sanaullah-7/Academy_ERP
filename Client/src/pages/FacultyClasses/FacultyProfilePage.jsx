/**
 * Purpose: Will define Faculty Profile Page for the FacultyClasses area of the Academy frontend.
 * Module: FacultyClasses
 * Status: Implemented — branch-scoped read-only faculty profile.
 */

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, BookOpen, CalendarDays, GraduationCap, Loader2, UserRound } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { useBranch } from '../../hooks/useBranch.js'
import { facultyService } from '../../services/facultyService.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'

function ProfileCard({ title, icon: Icon, children }) {
  return <Card className="min-w-0 shadow-sm"><CardHeader className="border-b border-border/50 bg-muted/20"><CardTitle className="flex items-center gap-2 text-base"><Icon size={18} aria-hidden="true" />{title}</CardTitle></CardHeader><CardContent className="p-5">{children}</CardContent></Card>
}

function Detail({ label, value }) {
  return <div className="min-w-0"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-1 break-words font-medium">{value || 'Not available'}</dd></div>
}

export default function FacultyProfilePage() {
  const { teacherId } = useParams()
  const { branch, branchId, scopeKey } = useBranch()
  const [result, setResult] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let active = true
    if (!branchId || !teacherId) return () => { active = false }
    facultyService.getById(teacherId, { branchId }).then(
      teacher => { if (active) setResult({ teacher, scopeKey, teacherId, retryCount }) },
      error => { if (active) setResult({ error, scopeKey, teacherId, retryCount }) },
    )
    return () => { active = false }
  }, [branchId, scopeKey, teacherId, retryCount])

  const current = result?.scopeKey === scopeKey && result?.teacherId === teacherId && result?.retryCount === retryCount ? result : null
  const teacher = current?.teacher

  return <DashboardLayout><div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
    <Button asChild variant="outline" className="self-start"><Link to={ROUTE_PATHS.FACULTY_CLASSES}><ArrowLeft size={16} aria-hidden="true" />Back to Faculty</Link></Button>
    <header><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight">Faculty Profile</h1><Badge variant="secondary">DEMO</Badge></div><p className="mt-2 text-muted-foreground">{branch?.name ?? 'Selected branch'} faculty details.</p></header>
    {!current ? <div role="status" className="flex items-center gap-3 rounded-lg border p-8 text-muted-foreground"><Loader2 size={20} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />Loading faculty...</div>
      : current.error ? <div className="flex flex-col items-start gap-3 rounded-lg border p-8"><AlertCircle aria-hidden="true" className="text-destructive" /><p role="alert" className="text-destructive">{current.error.code === 'NOT_FOUND' ? 'Faculty record was not found in the selected branch.' : `Unable to load faculty profile. ${current.error.message}`}</p><Button variant="outline" onClick={() => setRetryCount(value => value + 1)}>Retry</Button></div>
        : <div className="grid gap-5 lg:grid-cols-2">
          <ProfileCard title="Teacher details" icon={UserRound}><dl className="grid gap-4 sm:grid-cols-2"><Detail label="Name" value={teacher.name} /><Detail label="Role" value="Teacher" /><Detail label="Account status" value={teacher.accountStatus} /><Detail label="Branch" value={branch?.name} /><Detail label="Contact details" value={teacher.contact} /></dl></ProfileCard>
          <ProfileCard title="Professional details" icon={GraduationCap}><p className="text-sm text-muted-foreground">Qualifications, specialization and employment details are not present in the current DEMO profile records.</p></ProfileCard>
          <ProfileCard title="Assigned subjects" icon={BookOpen}><p className="text-sm text-muted-foreground">No saved subject assignments. Subject records and assignment relationships are not available yet.</p></ProfileCard>
          <ProfileCard title="Assigned batches" icon={GraduationCap}><p className="text-sm text-muted-foreground">No saved teacher-batch assignments. Batch membership is not inferred from course or enrollment data.</p></ProfileCard>
          <ProfileCard title="Class schedule" icon={CalendarDays}><p className="text-sm text-muted-foreground">No saved class sessions are available. Schedule display awaits the shared F04 Batch Timetable contract.</p></ProfileCard>
          <ProfileCard title="Class students" icon={UserRound}><p className="text-sm text-muted-foreground">Teacher access to class student lists is unavailable until verified teaching assignments and their authorization rules exist.</p></ProfileCard>
        </div>}
  </div></DashboardLayout>
}
