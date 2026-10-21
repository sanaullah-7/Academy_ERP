import Pagination from '../../components/Shared/Pagination.jsx'
import { ADMISSION_PERIODS, admissionDay, matchesAdmissionPeriod } from '../../utils/admissionPeriod.js'
import { capturePageVersion, peekPageResource, rememberPageResource } from '../../services/localPageResources.js'
import { useTableSelection, useColumnVisibility } from '../../hooks/useTableUtilities.js'
/**
 * Purpose: Will define Admissions Page for the Admissions area of the Academy frontend.
 * Module: Admissions
 * Status: Planned — functionality not implemented.
 */

import { useEffect, useState, useMemo, useRef } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Card, CardContent, CardHeader } from '../../components/ui/card.jsx'

import { Button } from '../../components/ui/button.jsx'
import { Search, Filter, Plus, ClipboardList, Loader2, AlertCircle } from 'lucide-react'
import { admissionService } from '../../services/admissionService.js'
import { useBranch } from '../../hooks/useBranch.js'
import { Input } from '../../components/ui/input.jsx'
import { useLocation, useNavigate } from 'react-router-dom'
import AdmissionActions from '../../components/Admissions/AdmissionActions.jsx'
import NewAdmissionForm from '../../components/Admissions/NewAdmissionForm.jsx'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'
import {
  TableToolbarActions,
  BulkActionBar,
} from '../../components/Shared/TableUtilities.jsx'
import { downloadCsv } from '../../utils/exportHelpers.js'
import { exportTablePdf } from '../../utils/pdfHelpers.js'

const admissionColumns = [
  { key: 'admissionId', label: 'Admission ID', required: true },
  { key: 'studentName', label: 'Student Name', required: true },
  { key: 'guardian', label: 'Guardian' },
  { key: 'course', label: 'Course' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', required: true },
]

export default function AdmissionsPage() {
  const { branchId, currentBranch } = useBranch()
  const { can } = usePermissions()
  const canCreate = can(PERMISSIONS.ADMISSIONS_CREATE)
  const newAdmissionTrigger = useRef(null)
  const newAdmissionSection = useRef(null)
  const { state: routeState } = useLocation()
  const navigate=useNavigate()
  const [actionFeedback, setActionFeedback] = useState(null)
  const [successRecordId, setSuccessRecordId] = useState(routeState?.createdBranchId === branchId ? routeState.createdAdmissionInternalId : null)
  const [admissions, setAdmissions] = useState(() => peekPageResource('admissions') ?? [])
  const [loading, setLoading] = useState(() => !peekPageResource('admissions'))
  const [error, setError] = useState(null)

  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [formVersion, setFormVersion] = useState(0)
  const [viewRequest, setViewRequest] = useState({ admissionId: null, request: 0 })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [period, setPeriod] = useState('All')
  const [range, setRange] = useState({ start: '', end: '' })
  const [today, setToday] = useState(() => admissionDay(new Date()))
  const [rows, setRows] = useState(10)
  const [pagination, setPagination] = useState({ key: '', page: 1 })

  useEffect(() => {
    const timer = window.setInterval(() => setToday(admissionDay(new Date())), 60000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    let mounted = true
    const loadVersion = capturePageVersion()
    async function fetchAdmissions() {
      if (!branchId) return
      setLoading(!peekPageResource('admissions'))
      setError(null)
      try {
        const data = await admissionService.list({ branchId })
        if (mounted) setAdmissions(rememberPageResource('admissions', data, loadVersion))
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchAdmissions()
    return () => { mounted = false }
  }, [branchId, refreshTrigger])

  const filteredAdmissions = useMemo(() => {
    return admissions.filter(adm => {
      const matchSearch = search.trim() === '' ||
        adm.studentName.toLowerCase().includes(search.toLowerCase()) ||
        (adm.displayAdmissionId ?? adm.admissionId ?? adm.id).toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'All' || adm.status === statusFilter
      return adm.branchId === branchId && matchSearch && matchStatus && matchesAdmissionPeriod(adm.createdAt, period, range, today)
    })
  }, [admissions, branchId, search, statusFilter, period, range, today])

  const columnVisibility = useColumnVisibility(admissionColumns, 'admissions')
  const pageKey = JSON.stringify([branchId, search, statusFilter, period, range.start, range.end, today, rows])
  const page = Math.min(pagination.key === pageKey ? pagination.page : 1, Math.max(1, Math.ceil(filteredAdmissions.length / rows)))
  const pageAdmissions = useMemo(() => filteredAdmissions.slice((page - 1) * rows, page * rows), [filteredAdmissions, page, rows])
  const selection = useTableSelection(filteredAdmissions, adm => adm.id, pageAdmissions)
  const updateFilter = callback => { selection.clearSelection(); setPagination({ key: '', page: 1 }); callback() }
  const invalidRange = period === 'Custom' && range.start && range.end && range.start > range.end

  function handleExportCsv() {
    const scope = selection.getExportScope()
    const targetAdmissions = scope.items
    const headers = ['Admission ID', 'Student Name', 'Guardian Name', 'Course', 'Status', 'Applied Date']
    const rows = targetAdmissions.map(a => [
      a.displayAdmissionId ?? a.admissionId ?? a.id,
      a.studentName,
      a.guardianName ?? '',
      a.course ?? '',
      a.status ?? 'Pending',
      a.createdAt ? new Date(a.createdAt).toISOString().slice(0, 10) : ''
    ])
    downloadCsv(`tsa-admissions-${branchId || 'branch'}-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
  }

  function handleExportPdf() {
    const scope = selection.getExportScope()
    const targetAdmissions = scope.items
    const headers = ['Admission ID', 'Student Name', 'Guardian Name', 'Course', 'Status', 'Applied Date']
    const rows = targetAdmissions.map(a => [
      a.displayAdmissionId ?? a.admissionId ?? a.id,
      a.studentName,
      a.guardianName ?? '',
      a.course ?? '',
      a.status ?? 'Pending',
      a.createdAt ? new Date(a.createdAt).toISOString().slice(0, 10) : ''
    ])
    exportTablePdf({
      filename: `tsa-admissions-report-${branchId || 'branch'}-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'Admissions Applications Report',
      branchName: currentBranch?.name || 'The Scholar Coaching Academy',
      headers,
      rows,
      filterSummary: scope.summary,
    })
  }

  const successAdmission = admissions.find((admission) => admission.id === successRecordId)
  const openAdmission = (admissionId, event) => {
    const focusTarget = event.currentTarget
    focusTarget?.focus?.({ preventScroll: true })
    setViewRequest(current => ({ admissionId, request: current.request + 1, focusTarget }))
  }
  const focusNewAdmission = () => {
    newAdmissionSection.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    newAdmissionSection.current?.focus({ preventScroll: true })
  }
  useEffect(() => {
    if (!routeState?.focusNewAdmission || !canCreate) return
    const frame = requestAnimationFrame(() => {
      newAdmissionSection.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
      newAdmissionSection.current?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [routeState?.focusNewAdmission, canCreate])

  const renderStatusBadge = (status, isEnrolled = false) => {
    if (status === 'Approved') return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        <span className="size-1.5 rounded-full bg-emerald-600" />
        Approved
        {isEnrolled && <span className="text-[10px] text-emerald-600/90 font-medium">· Enrolled</span>}
      </span>
    )
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        <span className="size-1.5 rounded-full bg-amber-500" />
        Pending
      </span>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Student Admissions</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage branch applications, admission reviews, and enrollment workflows.</p>
          </div>
          {canCreate && (
            <Button ref={newAdmissionTrigger} className="shrink-0 gap-2 shadow-sm" onClick={focusNewAdmission}>
              <Plus size={16} aria-hidden="true" />
              New Admission
            </Button>
          )}
        </div>
        {successAdmission && (
          <p role="status" className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-sm font-medium">
            {successAdmission.status === 'Approved'
              ? `Admission ${successAdmission.displayAdmissionId ?? successAdmission.admissionId} confirmed, student enrolled as Active, and official challan issued.`
              : `DEMO admission ${successAdmission.displayAdmissionId ?? successAdmission.admissionId} saved as Pending with a linked Provisional student.`}
          </p>
        )}

        {actionFeedback && <p role="status" className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-sm font-medium">{actionFeedback}</p>}

        <Card className="overflow-hidden shadow-sm border border-border/80">
          <CardHeader className="p-3.5 border-b border-border/60 bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-0 w-full sm:w-40 sm:flex-1 sm:max-w-56">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder="Search name or ID..."
                  className="pl-9 h-9 text-xs bg-background"
                  value={search}
                  onChange={(e) => updateFilter(() => setSearch(e.target.value))}
                  aria-label="Search admissions"
                />
              </div>
              <div role="group" aria-label="Admission reporting period" className="grid w-full shrink-0 grid-cols-6 overflow-hidden rounded-lg border border-foreground/70 bg-card sm:w-auto">
                {ADMISSION_PERIODS.map(value => <button key={value} type="button" aria-pressed={period === value} onClick={() => updateFilter(() => setPeriod(value))} className={`min-w-0 border-r border-primary/15 px-2 py-2 text-[10px] transition-colors last:border-r-0 sm:px-2.5 sm:text-[11px] ${period === value ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'}`}>{value}</button>)}
              </div>
              <p className="sr-only">Application date, Asia/Karachi. Weekly periods run Monday to Sunday.</p>
              <div className="flex flex-wrap items-center gap-2 w-full sm:ml-auto sm:w-auto justify-end">
                <div className="hidden sm:flex items-center rounded-lg border border-border/60 bg-background p-0.5">
                  {['All', 'Pending', 'Approved'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => updateFilter(() => setStatusFilter(st))}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${statusFilter === st ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <div className="flex sm:hidden items-center gap-2 w-full">
                  <Filter size={15} className="text-muted-foreground shrink-0" aria-hidden="true" />
                  <select
                    className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-1.5 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    value={statusFilter}
                    onChange={(e) => updateFilter(() => setStatusFilter(e.target.value))}
                    aria-label="Filter by status"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>
                <TableToolbarActions
                  onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                  columns={admissionColumns}
                  visibleColumns={columnVisibility.visibleColumns}
                  onToggleColumn={columnVisibility.toggleColumn}
                  onResetColumns={columnVisibility.resetColumns}
                  onExportPdf={handleExportPdf}
                  onExportCsv={handleExportCsv}
                  onPrint={() => window.print()}
                  exportScopeSummary={selection.getExportScope().summary}
                />
              </div>
            </div>
            {period === 'Custom' && <div className="flex flex-wrap items-end gap-3">
              <label className="grid gap-1 text-xs text-muted-foreground">Start date<Input type="date" aria-label="Admission start date" value={range.start} max={range.end || undefined} onChange={event => updateFilter(() => setRange(current => ({ ...current, start: event.target.value })))} className="h-9 w-full sm:w-44" /></label>
              <label className="grid gap-1 text-xs text-muted-foreground">End date<Input type="date" aria-label="Admission end date" value={range.end} min={range.start || undefined} onChange={event => updateFilter(() => setRange(current => ({ ...current, end: event.target.value })))} className="h-9 w-full sm:w-44" /></label>
              <p role={invalidRange ? 'alert' : undefined} className={`text-xs ${invalidRange ? 'text-destructive' : 'text-muted-foreground'}`}>{invalidRange ? 'End date must be on or after start date.' : !range.start || !range.end ? 'Select both dates to show matching applications.' : 'Includes both start and end dates.'}</p>
            </div>}
          </CardHeader>
          <CardContent className="p-0">
            {selection.selectedCount > 0 && (
              <div className="px-3.5 pt-3">
                <BulkActionBar
                  selectedCount={selection.selectedCount}
                  totalCount={filteredAdmissions.length}
                  onClear={selection.clearSelection}
                  onSelectAllMatching={selection.selectAllMatching}
                  isAllMatchingSelected={selection.isAllMatchingSelected}
                  onExportCsv={handleExportCsv}
                  onExportPdf={handleExportPdf}
                  deleteDisabledMessage="Admission applications are permanent historical records and cannot be bulk deleted"
                />
              </div>
            )}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 size={28} className="animate-spin mb-3 text-primary" />
                <p className="text-sm">Loading admissions...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-destructive" role="alert">
                <AlertCircle size={28} className="mb-3" />
                <p className="font-semibold text-sm">Failed to load admissions. Please try again.</p>
                <p className="mt-1 px-4 text-center text-xs">{error}</p>
              </div>
            ) : filteredAdmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="bg-muted p-3.5 rounded-full mb-3">
                  <ClipboardList size={26} className="text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold mb-1">No admissions found</h3>
                <p className="text-muted-foreground text-xs max-w-sm">
                  {admissions.length === 0 ? "There are no admission applications in this branch yet." : "No admissions match your search criteria."}
                </p>
                {admissions.length > 0 && (
                  <Button variant="link" size="sm" onClick={() => updateFilter(() => { setSearch(''); setStatusFilter('All'); setPeriod('All'); setRange({ start: '', end: '' }); })} className="mt-2 text-xs">
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold text-slate-700 tracking-wide dark:bg-slate-800/90 dark:border-slate-700 dark:text-slate-200">
                    <tr>
                      <th scope="col" className="w-10 px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          aria-label="Select all admissions"
                          checked={selection.isAllSelected}
                          onChange={selection.toggleSelectAll}
                          className="size-3.5 rounded border-gray-300 text-[#940016] focus:ring-[#940016] cursor-pointer"
                        />
                      </th>
                      {columnVisibility.isVisible('admissionId') && <th className="px-3 py-2 font-bold text-slate-700 dark:text-slate-200">Admission ID</th>}
                      {columnVisibility.isVisible('studentName') && <th className="px-3 py-2 font-bold text-slate-700 dark:text-slate-200">Student Name</th>}
                      {columnVisibility.isVisible('guardian') && <th className="px-3 py-2 font-bold text-slate-700 dark:text-slate-200 hidden md:table-cell">Guardian</th>}
                      {columnVisibility.isVisible('course') && <th className="px-3 py-2 font-bold text-slate-700 dark:text-slate-200 hidden sm:table-cell">Course</th>}
                      {columnVisibility.isVisible('status') && <th className="px-3 py-2 font-bold text-slate-700 dark:text-slate-200">Status</th>}
                      {columnVisibility.isVisible('actions') && <th className="px-3 py-2 font-bold text-slate-700 dark:text-slate-200 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {pageAdmissions.map(adm => {
                      const isSelected = selection.isSelected(adm.id)
                      return (
                        <tr
                          key={adm.id}
                          role="button"
                          tabIndex={0}
                          aria-label={`View admission ${adm.displayAdmissionId ?? adm.admissionId ?? adm.id} for ${adm.studentName}`}
                          className={`cursor-pointer transition-colors hover:bg-[#F9EBEE]/25 outline-none focus:outline-none ${isSelected ? 'bg-[#F9EBEE]/40' : ''}`}
                          onClick={(event) => openAdmission(adm.id, event)}
                          onKeyDown={(event) => {
                            if (event.target !== event.currentTarget) return
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              openAdmission(adm.id, event)
                            }
                          }}
                        >
                          <td className="w-10 px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              aria-label={`Select admission ${adm.displayAdmissionId ?? adm.admissionId ?? adm.id}`}
                              checked={isSelected}
                              onChange={() => selection.toggleSelect(adm.id)}
                              className="size-3.5 rounded border-gray-300 text-[#940016] focus:ring-[#940016] cursor-pointer"
                            />
                          </td>
                          {columnVisibility.isVisible('admissionId') && <td className="px-3 py-2 font-semibold text-primary whitespace-nowrap text-xs">{adm.displayAdmissionId ?? adm.admissionId ?? adm.id}</td>}
                          {columnVisibility.isVisible('studentName') && <td className="px-3 py-2 font-semibold text-foreground text-xs sm:text-sm">{adm.studentName}</td>}
                          {columnVisibility.isVisible('guardian') && <td className="px-3 py-2 text-muted-foreground hidden md:table-cell text-xs">{adm.guardianName}</td>}
                          {columnVisibility.isVisible('course') && <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell text-xs">{adm.course}</td>}
                          {columnVisibility.isVisible('status') && <td className="px-3 py-2">{renderStatusBadge(adm.status, adm.isEnrolled)}</td>}
                          {columnVisibility.isVisible('actions') && (
                            <td className="px-3 py-2 text-right" onClick={(event) => event.stopPropagation()}>
                              <AdmissionActions key={`${branchId}-${adm.id}`} admission={adm} branchId={branchId} savedFocusRef={newAdmissionTrigger}
                                viewRequest={viewRequest.admissionId === adm.id ? viewRequest.request : 0}
                                viewFocusTarget={viewRequest.admissionId === adm.id ? viewRequest.focusTarget : null}
                                onChanged={(message) => { setSuccessRecordId(null); setActionFeedback(message); setRefreshTrigger(prev => prev + 1) }} />
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && !error && <Pagination label="Admissions" page={page} rows={rows} total={filteredAdmissions.length} onPage={value => setPagination({ key: pageKey, page: value })} onRows={value => { setRows(value); setPagination({ key: '', page: 1 }) }} />}
          </CardContent>
        </Card>
        {canCreate && <section ref={newAdmissionSection} tabIndex={-1} aria-labelledby="new-student-admission-heading" className="scroll-mt-4 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <h2 id="new-student-admission-heading" className="mb-3 text-lg font-bold sm:text-xl text-foreground">New Student Admission</h2>
          {routeState?.prefillAdmission && (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-900 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>
                  Direct Conversion Active: Candidate <strong>{routeState.prefillAdmission.studentName}</strong> details prefilled from Demo Class. Adjust any fields below and confirm enrollment.
                </span>
              </div>
            </div>
          )}
          <NewAdmissionForm key={`${branchId}-${formVersion}`} admission={routeState?.prefillAdmission} onSuccess={(result) => {
            if(routeState?.prefillAdmission?.demoId) navigate('/admissions',{replace:true,state:null})
            setActionFeedback(null)
            setSuccessRecordId(result.id)
            setRefreshTrigger(previous => previous + 1)
            setFormVersion(previous => previous + 1)
          }} />
        </section>}
      </div>
    </DashboardLayout>
  )
}
