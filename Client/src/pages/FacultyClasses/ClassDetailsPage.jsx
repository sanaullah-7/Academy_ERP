/**
 * Purpose: Will define Class Details Page for the FacultyClasses area of the Academy frontend.
 * Module: FacultyClasses
 * Status: Implemented — branch-scoped enrollment student view.
 */

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Loader2, UsersRound } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { useBranch } from '../../hooks/useBranch.js'
import { batchService } from '../../services/batchService.js'
import { facultyService } from '../../services/facultyService.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'

export default function ClassDetailsPage() {
  const { batchId } = useParams()
  const { branch, branchId, scopeKey } = useBranch()
  const [result, setResult] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let active = true
    if (!branchId || !batchId) return () => { active = false }
    Promise.all([batchService.getById(batchId, { branchId }), facultyService.listClassStudents(batchId, { branchId })]).then(
      ([batch, students]) => { if (active) setResult({ batch, students, scopeKey, batchId, retryCount }) },
      error => { if (active) setResult({ error, scopeKey, batchId, retryCount }) },
    )
    return () => { active = false }
  }, [branchId, scopeKey, batchId, retryCount])

  const current = result?.scopeKey === scopeKey && result?.batchId === batchId && result?.retryCount === retryCount ? result : null

  return <DashboardLayout><div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
    <Button asChild variant="outline" className="self-start"><Link to={ROUTE_PATHS.FACULTY_BATCHES}><ArrowLeft size={16} aria-hidden="true" />Back to batches</Link></Button>
    <header><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold tracking-tight">Enrolled Students</h1><Badge variant="secondary">DEMO</Badge></div><p className="mt-2 text-muted-foreground">Only saved Active Enrollment → Student → Batch links in {branch?.name ?? 'the selected branch'} are shown.</p></header>
    {!current ? <div role="status" className="flex items-center gap-3 rounded-lg border p-8 text-muted-foreground"><Loader2 size={20} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />Loading enrolled students...</div>
      : current.error ? <div className="flex flex-col items-start gap-3 rounded-lg border p-8"><AlertCircle aria-hidden="true" className="text-destructive" /><p role="alert" className="text-destructive">{current.error.code === 'NOT_FOUND' ? 'This batch was not found in the selected branch.' : `Unable to load class students. ${current.error.message}`}</p><Button variant="outline" onClick={() => setRetryCount(value => value + 1)}>Retry</Button></div>
        : <Card className="min-w-0 overflow-hidden shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/20"><CardTitle className="flex flex-wrap items-center gap-2 text-base"><UsersRound size={18} aria-hidden="true" />{current.batch.name}<Badge variant="outline">{current.students.length} students</Badge></CardTitle><p className="text-sm text-muted-foreground">Course: {current.batch.courseName ?? 'Not available'} · {branch?.name}</p></CardHeader>
          <CardContent className="p-0">{current.students.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No Active enrollments are linked to this batch yet.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="sr-only">Students with Active enrollments in {current.batch.name}</caption><thead><tr className="border-b bg-muted/30 text-muted-foreground"><th scope="col" className="p-3">Student</th><th scope="col" className="p-3">Status</th><th scope="col" className="p-3">Admission reference</th></tr></thead><tbody className="divide-y">{current.students.map(student => <tr key={student.enrollmentId}><th scope="row" className="p-3 font-medium"><Link className="text-primary underline-offset-4 hover:underline" to={`/students/${encodeURIComponent(student.id)}`}>{student.name}</Link></th><td className="p-3"><Badge variant="secondary">{student.status}</Badge></td><td className="p-3">{student.admissionReference ?? 'Not linked'}</td></tr>)}</tbody></table></div>}</CardContent>
        </Card>}
  </div></DashboardLayout>
}
