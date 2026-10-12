/**
 * Purpose: Will define Students Table for the Students area of the Academy frontend.
 * Module: Students
 * Status: Planned — functionality not implemented.
 */

import { Badge } from '../ui/badge.jsx'
import { generatePath, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import StudentActions from './StudentActions.jsx'

export default function StudentsTable({ students, branchId, onUpdated }) {
  const navigate = useNavigate()
  const openStudent = (student) => navigate(generatePath(ROUTE_PATHS.STUDENT_PROFILE, { studentId: student.id }))
  const admissionRef = student => student.admission?.displayAdmissionId ?? student.admissionDisplaySerialId ?? student.admissionDisplayId ?? 'Not linked'
  const rowKeyDown = (event, student) => {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openStudent(student)
    }
  }
  return <div className="overflow-x-auto">
    <table className="w-full table-fixed text-left text-sm">
    <caption className="sr-only">Saved DEMO students in the selected branch</caption>
    <thead className="hidden bg-muted/50 text-muted-foreground sm:table-header-group"><tr>
      <th scope="col" className="w-16 p-3 font-medium">No.</th>
      <th scope="col" className="w-[22%] p-3 font-medium">Student</th>
      <th scope="col" className="w-28 p-3 font-medium">Status</th>
      <th scope="col" className="w-[20%] p-3 font-medium">Course</th>
      <th scope="col" className="w-[18%] p-3 font-medium">Batch</th>
      <th scope="col" className="w-28 p-3 font-medium">Admission</th>
      <th scope="col" className="w-16 p-3 font-medium"><span className="sr-only">Actions</span></th>
    </tr></thead>
    <tbody className="divide-y divide-border/50">{students.map(student => <tr key={student.id} role="link" tabIndex={0} aria-label={`View student ${student.name}`}
      className="grid grid-cols-2 gap-x-3 p-3 cursor-pointer transition-colors hover:bg-muted/30 focus-visible:outline-2 focus-visible:outline-ring sm:table-row sm:p-0"
      onClick={() => openStudent(student)} onKeyDown={(event) => rowKeyDown(event, student)}>
      <td className="block min-w-0 p-2 text-muted-foreground tabular-nums sm:table-cell sm:p-3">{student.displaySerial}</td>
      <th scope="row" className="block min-w-0 break-words p-2 font-semibold [overflow-wrap:anywhere] sm:table-cell sm:p-3">{student.name}</th>
      <td className="block min-w-0 p-2 sm:table-cell sm:p-3"><span className="mr-2 text-xs text-muted-foreground sm:hidden">Status</span><Badge variant={student.status === 'Provisional' ? 'outline' : 'secondary'}>{student.status ?? 'Active'}</Badge></td>
      <td className="block min-w-0 break-words p-2 sm:table-cell sm:p-3"><span className="mr-1 text-xs text-muted-foreground sm:hidden">Course:</span>{student.courseName ?? 'Not linked'}</td>
      <td className="block min-w-0 break-words p-2 sm:table-cell sm:p-3"><span className="mr-1 text-xs text-muted-foreground sm:hidden">Batch:</span>{student.batchName ?? 'Not selected'}</td>
      <td className="block min-w-0 break-words p-2 text-muted-foreground sm:table-cell sm:p-3"><span className="mr-1 text-xs sm:hidden">Admission:</span>{admissionRef(student)}</td>
      <td className="block justify-self-end p-1 sm:table-cell sm:p-1"><StudentActions student={student} branchId={branchId} onUpdated={onUpdated} /></td>
    </tr>)}</tbody>
    </table>
  </div>
}
