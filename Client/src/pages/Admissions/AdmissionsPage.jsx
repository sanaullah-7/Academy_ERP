/**
 * Purpose: Will define Admissions Page for the Admissions area of the Academy frontend.
 * Module: Admissions
 * Status: Planned — functionality not implemented.
 */

import { useEffect, useState, useMemo, useRef } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Card, CardContent, CardHeader } from '../../components/ui/card.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Search, Filter, Plus, ClipboardList, Loader2, AlertCircle } from 'lucide-react'
import { admissionService } from '../../services/admissionService.js'
import { useBranch } from '../../hooks/useBranch.js'
import { Input } from '../../components/ui/input.jsx'
import { useLocation } from 'react-router-dom'

import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '../../components/ui/dialog.jsx'
import NewAdmissionForm from '../../components/Admissions/NewAdmissionForm.jsx'
import AdmissionActions from '../../components/Admissions/AdmissionActions.jsx'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'

export default function AdmissionsPage() {
  const { branchId } = useBranch()
  const { can } = usePermissions()
  const canCreate = can(PERMISSIONS.ADMISSIONS_CREATE)
  const newAdmissionTrigger = useRef(null)
  const { state: routeState } = useLocation()
  const [actionFeedback, setActionFeedback] = useState(null)
  const [successRecordId, setSuccessRecordId] = useState(routeState?.createdBranchId === branchId ? routeState.createdAdmissionInternalId : null)
  const [admissions, setAdmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [savePending, setSavePending] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [viewRequest, setViewRequest] = useState({ admissionId: null, request: 0 })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    let mounted = true
    async function fetchAdmissions() {
      if (!branchId) return
      setLoading(true)
      setError(null)
      try {
        const data = await admissionService.list({ branchId })
        if (mounted) setAdmissions(data)
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
      return matchSearch && matchStatus
    })
  }, [admissions, search, statusFilter])

  const successAdmission = admissions.find((admission) => admission.id === successRecordId)
  const openAdmission = (admissionId, event) => {
    const focusTarget = event.currentTarget
    focusTarget.focus()
    setViewRequest(current => ({ admissionId, request: current.request + 1, focusTarget }))
  }

  const renderStatusBadge = (status) => {
    if (status === 'Approved') return <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-0">Approved</Badge>
    return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Pending</Badge>
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
        <div className="flex justify-end">
          {canCreate && <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!savePending) setIsDialogOpen(open) }}>
            <DialogTrigger asChild>
              <Button ref={newAdmissionTrigger} className="shrink-0 gap-2">
                <Plus size={16} aria-hidden="true" />
                New Admission
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl p-0 max-h-[90vh] overflow-y-auto" showCloseButton={false}>
              <DialogTitle className="sr-only">New DEMO Admission</DialogTitle>
              <DialogDescription className="sr-only">Enter fictional applicant details to create a Pending admission and linked Provisional student in the selected branch.</DialogDescription>
              <NewAdmissionForm
                onPendingChange={setSavePending}
                onSuccess={(result) => {
                  setIsDialogOpen(false)
                  setActionFeedback(null)
                  setSuccessRecordId(result.id)
                  setRefreshTrigger(prev => prev + 1)
                }}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>}
        </div>
        {successAdmission && <p role="status" className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">DEMO admission {successAdmission.displayAdmissionId ?? successAdmission.admissionId} saved as Pending with a linked Provisional student.</p>}

        {actionFeedback && <p role="status" className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">{actionFeedback}</p>}

        <Card className="shadow-sm">
          <CardHeader className="p-4 border-b border-border/50 bg-muted/20">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  placeholder="Search name or ID..."
                  className="pl-9 bg-background"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search admissions"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={16} className="text-muted-foreground shrink-0" aria-hidden="true" />
                <select
                  className="flex h-9 w-full sm:w-40 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter by status"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 size={32} className="animate-spin mb-4" />
                <p>Loading admissions...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-destructive" role="alert">
                <AlertCircle size={32} className="mb-4" />
                <p>Failed to load admissions. Please try again.</p>
                <p className="mt-2 px-4 text-center text-sm">{error}</p>
              </div>
            ) : filteredAdmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="bg-muted p-4 rounded-full mb-4">
                  <ClipboardList size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">No admissions found</h3>
                <p className="text-muted-foreground max-w-sm">
                  {admissions.length === 0 ? "There are no admission applications in this branch yet." : "No admissions match your search criteria."}
                </p>
                {admissions.length > 0 && (
                  <Button variant="link" onClick={() => { setSearch(''); setStatusFilter('All'); }} className="mt-2">
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-2 py-3 sm:px-4 font-medium">Admission ID</th>
                      <th className="px-2 py-3 sm:px-4 font-medium">Student Name</th>
                      <th className="px-2 py-3 sm:px-4 font-medium hidden md:table-cell">Guardian</th>
                      <th className="px-2 py-3 sm:px-4 font-medium hidden sm:table-cell">Course</th>
                      <th className="px-2 py-3 sm:px-4 font-medium">Status</th>
                      <th className="px-2 py-3 sm:px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredAdmissions.map(adm => (
                      <tr key={adm.id} role="button" tabIndex={0} aria-label={`View admission ${adm.displayAdmissionId ?? adm.admissionId ?? adm.id} for ${adm.studentName}`}
                        className="cursor-pointer transition-colors hover:bg-muted/30 focus-visible:outline-2 focus-visible:outline-ring"
                        onClick={(event) => openAdmission(adm.id, event)}
                        onKeyDown={(event) => {
                          if (event.target !== event.currentTarget) return
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            openAdmission(adm.id, event)
                          }
                        }}>
                        <td className="px-2 py-3 sm:px-4 font-medium text-foreground whitespace-nowrap">{adm.displayAdmissionId ?? adm.admissionId ?? adm.id}</td>
                        <td className="px-2 py-3 sm:px-4 font-semibold">{adm.studentName}</td>
                        <td className="px-2 py-3 sm:px-4 text-muted-foreground hidden md:table-cell">{adm.guardianName}</td>
                        <td className="px-2 py-3 sm:px-4 text-muted-foreground hidden sm:table-cell">{adm.course}</td>
                        <td className="px-2 py-3 sm:px-4">{renderStatusBadge(adm.status)}</td>
                        <td className="px-2 py-3 sm:px-4 text-right" onClick={(event) => event.stopPropagation()}>
                          <AdmissionActions key={`${branchId}-${adm.id}`} admission={adm} branchId={branchId} savedFocusRef={newAdmissionTrigger}
                            viewRequest={viewRequest.admissionId === adm.id ? viewRequest.request : 0}
                            viewFocusTarget={viewRequest.admissionId === adm.id ? viewRequest.focusTarget : null}
                            onChanged={(message) => { setSuccessRecordId(null); setActionFeedback(message); setRefreshTrigger(prev => prev + 1) }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
