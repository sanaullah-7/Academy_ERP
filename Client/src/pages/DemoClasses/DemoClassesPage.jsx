/**
 * Purpose: Demo Classes Management Page for prospective student trial sessions.
 * Module: DemoClasses (F08)
 * Status: Implemented — branch-scoped Demo Classes complete module.
 */

import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, UserPlus, Download } from 'lucide-react'
import { downloadCsv } from '../../utils/exportHelpers.js'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Input } from '../../components/ui/input.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx'
import DemoStats from '../../components/DemoClasses/DemoStats.jsx'
import DemoStudentsTable from '../../components/DemoClasses/DemoStudentsTable.jsx'
import DemoRegistrationForm from '../../components/DemoClasses/DemoRegistrationForm.jsx'
import DemoScheduleDialog from '../../components/DemoClasses/DemoScheduleDialog.jsx'
import DemoAttendanceDialog from '../../components/DemoClasses/DemoAttendanceDialog.jsx'
import ConvertToAdmissionDialog from '../../components/DemoClasses/ConvertToAdmissionDialog.jsx'
import DemoDetailsDialog from '../../components/DemoClasses/DemoDetailsDialog.jsx'

import { useBranch } from '../../hooks/useBranch.js'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'
import { demoClassService } from '../../services/demoClassService.js'
import { courseService } from '../../services/courseService.js'
import { batchService } from '../../services/batchService.js'
import { facultyService } from '../../services/facultyService.js'
import { studentService } from '../../services/studentService.js'

export default function DemoClassesPage() {
  const { branchId, branch, scopeKey } = useBranch()
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.DEMO_CLASSES_MANAGE)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Data
  const [demos, setDemos] = useState([])
  const [courses, setCourses] = useState([])
  const [batches, setBatches] = useState([])
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])

  // Dialog states
  const [dialog, setDialog] = useState(null)
  const [selectedDemo, setSelectedDemo] = useState(null)
  const [dialogBusy, setDialogBusy] = useState(false)
  const [dialogError, setDialogError] = useState('')
  const [conversionResult, setConversionResult] = useState(null)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    let active = true
    if (!branchId) return () => { active = false }

    Promise.all([
      demoClassService.list({ branchId }),
      courseService.list({ branchId }),
      batchService.list({ branchId }),
      facultyService.list({ branchId }),
      studentService.listDirectory({ branchId }).catch(() => []),
    ]).then(([demoList, courseList, batchList, teacherList, studentList]) => {
      if (!active) return
      setDemos(demoList || [])
      setCourses(courseList || [])
      setBatches(batchList || [])
      setTeachers(teacherList || [])
      setStudents(studentList || [])
      setLoading(false)
    }).catch(err => {
      if (!active) return
      setError(err?.message || 'Unable to load demo classes for this branch.')
      setLoading(false)
    })

    return () => { active = false }
  }, [branchId, scopeKey, refreshTrigger])

  // Handlers
  const handleRegister = async (record) => {
    setDialogBusy(true)
    setDialogError('')
    try {
      const created = await demoClassService.register(record, { branchId })
      setMessage(`Demo inquiry registered for ${created.studentName} (${created.demoId}).`)
      setDialog(null)
      setRefreshTrigger(x => x + 1)
    } catch (err) {
      setDialogError(err?.message || 'Failed to register demo inquiry.')
    } finally {
      setDialogBusy(false)
    }
  }

  const handleSchedule = async (record) => {
    if (!selectedDemo) return
    setDialogBusy(true)
    setDialogError('')
    try {
      const updated = await demoClassService.schedule(selectedDemo.id, record, { branchId })
      setMessage(`Demo session scheduled for ${updated.studentName} on ${record.classDate} at ${record.startTime}.`)
      setDialog(null)
      setSelectedDemo(null)
      setRefreshTrigger(x => x + 1)
    } catch (err) {
      setDialogError(err?.message || 'Failed to schedule demo class.')
    } finally {
      setDialogBusy(false)
    }
  }

  const handleAttendance = async (record) => {
    if (!selectedDemo) return
    setDialogBusy(true)
    setDialogError('')
    try {
      const updated = await demoClassService.recordAttendance(selectedDemo.id, record, { branchId })
      setMessage(`Attendance recorded as "${record.status}" for ${updated.studentName}.`)
      setDialog(null)
      setSelectedDemo(null)
      setRefreshTrigger(x => x + 1)
    } catch (err) {
      setDialogError(err?.message || 'Failed to record attendance.')
    } finally {
      setDialogBusy(false)
    }
  }

  const handleConvert = async (record) => {
    if (!selectedDemo) return
    setDialogBusy(true)
    setDialogError('')
    try {
      const result = await demoClassService.convertToAdmission(selectedDemo.id, record, { branchId })
      setConversionResult(result)
      setMessage(`Successfully converted ${selectedDemo.studentName} to Pending Admission (${result.admission?.admissionId || ''}).`)
      setRefreshTrigger(x => x + 1)
    } catch (err) {
      setDialogError(err?.message || 'Failed to convert demo to admission.')
    } finally {
      setDialogBusy(false)
    }
  }

  const handleCancelInquiry = async () => {
    if (!selectedDemo) return
    setDialogBusy(true)
    setDialogError('')
    try {
      await demoClassService.cancel(selectedDemo.id, { reason: cancelReason }, { branchId })
      setMessage(`Demo inquiry ${selectedDemo.demoId} cancelled.`)
      setDialog(null)
      setSelectedDemo(null)
      setCancelReason('')
      setRefreshTrigger(x => x + 1)
    } catch (err) {
      setDialogError(err?.message || 'Failed to cancel demo inquiry.')
    } finally {
      setDialogBusy(false)
    }
  }

  const openRegisterDialog = () => {
    setDialogError('')
    setDialog('register')
  }

  const openScheduleDialog = (item) => {
    setSelectedDemo(item)
    setDialogError('')
    setDialog('schedule')
  }

  const openAttendanceDialog = (item) => {
    setSelectedDemo(item)
    setDialogError('')
    setDialog('attendance')
  }

  const openConvertDialog = (item) => {
    setSelectedDemo(item)
    setDialogError('')
    setConversionResult(null)
    setDialog('convert')
  }

  const openViewDialog = (item) => {
    setSelectedDemo(item)
    setDialog('view')
  }

  const openCancelDialog = (item) => {
    setSelectedDemo(item)
    setCancelReason('')
    setDialogError('')
    setDialog('cancel')
  }

    const handleExportCsv = () => {
    const headers = [
      'Academy', 'Demo ID', 'Candidate Name', 'Guardian Contact',
      'Target Program', 'Trial Schedule', 'Hall / Venue', 'Faculty',
      'Remarks', 'Status', 'Admission ID'
    ]
    const rows = demos.map(d => [
      'The Scholar Coaching Academy',
      d.demoId,
      d.studentName,
      d.guardianContact,
      d.courseName,
      d.scheduledSession?.classDate || d.requestedDate,
      d.scheduledSession?.location || 'Trial Hall',
      d.scheduledSession?.teacherName || 'TBD',
      d.notes || '',
      d.status,
      d.convertedAdmissionDisplayId || '',
    ])
    downloadCsv(`${(branch?.name || 'campus').toLowerCase().replace(/\s+/g, '-')}-demo-attendees.csv`, headers, rows)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-200/60 pb-5">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <span>STUDENT ONBOARDING</span>
              <span className="text-primary font-bold">•</span>
              <span className="text-primary font-medium">{branch?.name || 'Main Campus'}</span>
              <span className="text-primary font-bold">•</span>
              <span className="text-primary font-medium">Session 2025–26</span>
            </div>
            <h1
              aria-label="Demo Classes Management — Demo Classes & Trial Sessions"
              className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
            >
              Demo Classes & Trial Sessions
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">
              Track prospective students attending free trial lectures and seamlessly transfer verified attendees into full admissions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium h-9 px-3.5 rounded-lg flex items-center gap-2 shadow-xs"
            >
              <Download size={15} className="text-slate-500" />
              <span>Export Attendee List</span>
            </Button>

            {canManage && (
              <Button
                onClick={openRegisterDialog}
                className="bg-[#940016] hover:bg-[#72000E] text-white text-xs font-medium h-9 px-4 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus size={15} />
                <span>+ Register Demo Student</span>
              </Button>
            )}
          </div>
        </header>

        {/* Feedback Banners */}
        {message && (
          <div
            role="status"
            className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            <span>{message}</span>
            <button
              onClick={() => setMessage('')}
              className="text-xs text-emerald-600 hover:text-emerald-900 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setRefreshTrigger(x => x + 1)}>
              Retry
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && demos.length === 0 ? (
          <div role="status" className="flex items-center justify-center gap-3 p-16 text-muted-foreground">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span className="text-sm font-medium">Loading branch demo registry...</span>
          </div>
        ) : (
          <>
            {/* KPI Summary Cards */}
            <DemoStats demos={demos} />

            {/* Registry Table & Filters */}
            <DemoStudentsTable
              demos={demos}
              courses={courses}
              batches={batches}
              canManage={canManage}
              branchName={branch?.name}
              onViewDetails={openViewDialog}
              onSchedule={openScheduleDialog}
              onAttendance={openAttendanceDialog}
              onConvert={openConvertDialog}
              onCancel={openCancelDialog}
            />
          </>
        )}

        {/* Dialogs */}
        <DemoRegistrationForm
          open={dialog === 'register'}
          onClose={() => setDialog(null)}
          onSubmit={handleRegister}
          courses={courses}
          batches={batches}
          students={students}
          busy={dialogBusy}
          error={dialogError}
        />

        <DemoScheduleDialog
          open={dialog === 'schedule'}
          onClose={() => { setDialog(null); setSelectedDemo(null) }}
          onSubmit={handleSchedule}
          demo={selectedDemo}
          teachers={teachers}
          busy={dialogBusy}
          error={dialogError}
        />

        <DemoAttendanceDialog
          open={dialog === 'attendance'}
          onClose={() => { setDialog(null); setSelectedDemo(null) }}
          onSubmit={handleAttendance}
          demo={selectedDemo}
          busy={dialogBusy}
          error={dialogError}
        />

        <ConvertToAdmissionDialog
          open={dialog === 'convert'}
          onClose={() => { setDialog(null); setSelectedDemo(null); setConversionResult(null) }}
          onSubmit={handleConvert}
          demo={selectedDemo}
          busy={dialogBusy}
          error={dialogError}
          conversionResult={conversionResult}
        />

        <DemoDetailsDialog
          open={dialog === 'view'}
          onClose={() => { setDialog(null); setSelectedDemo(null) }}
          demo={selectedDemo}
        />

        {/* Cancel Inquiry Dialog */}
        <Dialog open={dialog === 'cancel'} onOpenChange={(val) => { if (!val && !dialogBusy) setDialog(null) }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-destructive">
                Cancel Demo Inquiry
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel the demo inquiry for {selectedDemo?.studentName} ({selectedDemo?.demoId})?
              </DialogDescription>
            </DialogHeader>

            {dialogError && (
              <div role="alert" className="p-2.5 rounded-lg bg-destructive/10 text-xs text-destructive">
                {dialogError}
              </div>
            )}

            <div className="space-y-2 py-2">
              <label htmlFor="cancelReasonInput" className="block text-xs font-medium text-foreground">
                Cancellation Reason (Optional)
              </label>
              <Input
                id="cancelReasonInput"
                placeholder="e.g. Student enrolled elsewhere, schedule mismatch..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDialog(null)} disabled={dialogBusy}>
                Keep Inquiry
              </Button>
              <Button variant="destructive" onClick={handleCancelInquiry} disabled={dialogBusy}>
                {dialogBusy ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}