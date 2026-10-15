import { Button } from '../ui/button.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog.jsx'
import DemoStatusBadge from './DemoStatusBadge.jsx'
import { Calendar, Clock, MapPin, Sparkles, User, UserCheck, Phone, History, FileText, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/routePaths.js'

export default function DemoDetailsDialog({ open, onClose, demo = null }) {
  const navigate = useNavigate()

  if (!demo) return null

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose() }}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2 mr-6">
            <DialogTitle className="text-xl font-bold">
              Demo Inquiry: {demo.demoId}
            </DialogTitle>
            <DemoStatusBadge status={demo.status} />
          </div>
          <DialogDescription>
            Detailed inquiry record and session audit history for {demo.studentName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2 text-sm">
          {/* Student & Guardian Info */}
          <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-border/70 bg-card p-4 shadow-xs">
            <div>
              <p className="text-xs uppercase font-medium text-muted-foreground flex items-center gap-1">
                <User size={14} /> Student Applicant
              </p>
              <p className="text-base font-semibold text-foreground mt-1">{demo.studentName}</p>
              {demo.studentId && (
                <span className="inline-block text-xs text-primary bg-[#F9EBEE] px-2 py-0.5 rounded mt-1 font-medium">
                  Existing Student Link
                </span>
              )}
            </div>

            <div>
              <p className="text-xs uppercase font-medium text-muted-foreground flex items-center gap-1">
                <Phone size={14} /> Guardian & Contact
              </p>
              <p className="text-base font-semibold text-foreground mt-1">{demo.guardianName}</p>
              <p className="text-sm text-muted-foreground">{demo.guardianContact}</p>
            </div>

            <div>
              <p className="text-xs uppercase font-medium text-muted-foreground">Course & Batch</p>
              <p className="font-medium text-foreground mt-1">{demo.courseName}</p>
              <p className="text-xs text-muted-foreground">{demo.batchName || 'No specific batch preferred'}</p>
            </div>

            <div>
              <p className="text-xs uppercase font-medium text-muted-foreground">Registration Inquiry</p>
              <p className="font-medium text-foreground mt-1">Requested: {demo.requestedDate}</p>
              <p className="text-xs text-muted-foreground">
                Slot: {demo.requestedTime || 'Flexible'} · Registered: {demo.createdAt}
              </p>
            </div>

            {demo.notes && (
              <div className="sm:col-span-2 pt-2 border-t border-border/50">
                <p className="text-xs uppercase font-medium text-muted-foreground flex items-center gap-1">
                  <FileText size={14} /> Inquiry Notes
                </p>
                <p className="text-sm text-muted-foreground mt-1 italic">"{demo.notes}"</p>
              </div>
            )}
          </div>

          {/* Scheduled Session Info */}
          <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-2">
            <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
              <Calendar size={15} className="text-primary" />
              Scheduled Trial Class Session
            </h4>

            {demo.scheduledSession ? (
              <div className="grid gap-3 sm:grid-cols-2 pt-1 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Date & Timing</p>
                  <p className="font-semibold text-foreground">
                    {demo.scheduledSession.classDate}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock size={13} /> {demo.scheduledSession.startTime} – {demo.scheduledSession.endTime}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Room / Location</p>
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    <MapPin size={15} className="text-primary" />
                    {demo.scheduledSession.location}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Assigned Teacher</p>
                  <p className="font-semibold text-foreground">
                    {demo.scheduledSession.teacherName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Scheduled By</p>
                  <p className="font-medium text-muted-foreground">
                    {demo.scheduledSession.scheduledByName || 'Staff'} on {demo.scheduledSession.scheduledAt?.slice(0, 10)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic py-1">
                No session scheduled yet. This inquiry is pending schedule confirmation.
              </p>
            )}
          </div>

          {/* Attendance Record */}
          {demo.attendance && (
            <div className="rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-2">
              <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
                <UserCheck size={15} className="text-emerald-600" />
                Attendance Verification
              </h4>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div>
                  <p className="text-sm">
                    Status: <strong className={demo.attendance.status === 'Present' ? 'text-emerald-700' : 'text-amber-700'}>{demo.attendance.status}</strong>
                  </p>
                  {demo.attendance.remarks && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Remarks: "{demo.attendance.remarks}"
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>Verified by: {demo.attendance.markedByName || 'Staff'}</p>
                  <p>{demo.attendance.markedAt?.slice(0, 16).replace('T', ' ')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Converted Admission Banner */}
          {demo.convertedAdmissionId && (
            <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase font-bold text-purple-900 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-purple-600" /> Converted to Admission
                </p>
                <p className="text-sm text-purple-950 mt-1">
                  Linked Admission: <strong>{demo.convertedAdmissionDisplayId || demo.convertedAdmissionId}</strong>
                </p>
                <p className="text-xs text-purple-800">
                  Converted on {demo.convertedAt?.slice(0, 10)}. Admission is in Pending status awaiting review.
                </p>
              </div>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => {
                  onClose()
                  navigate(ROUTE_PATHS.ADMISSIONS, {
                    state: { highlightAdmissionId: demo.convertedAdmissionId }
                  })
                }}
              >
                <span>View Admission</span>
                <ArrowRight size={15} />
              </Button>
            </div>
          )}

          {/* Auditable Status History Timeline */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5">
              <History size={15} /> Auditable Status History
            </h4>
            <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3 max-h-48 overflow-y-auto">
              {demo.statusHistory?.map((event, idx) => (
                <div key={event.id || idx} className="flex items-start justify-between gap-3 text-xs border-b border-border/40 pb-2 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">
                      <span className="text-muted-foreground">{event.fromStatus || 'None'}</span> &rarr; <span className="font-semibold text-primary">{event.toStatus}</span>
                    </p>
                    {event.reason && (
                      <p className="text-muted-foreground italic">"{event.reason}"</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 text-muted-foreground">
                    <p className="font-medium">{event.actorName || event.actorUserId || 'Staff'}</p>
                    <p>{event.occurredAt?.slice(0, 16).replace('T', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}