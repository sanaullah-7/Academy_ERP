/**
 * Purpose: Will define Students Table for the Students area of the Academy frontend.
 * Module: Students
 * Status: Planned — functionality not implemented.
 */


import { generatePath, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import StudentActions from './StudentActions.jsx'

export default function StudentsTable({
  students,
  branchId,
  onUpdated,
  onDeleted,
  selection = null,
  isVisible = () => true,
  highlightStudentId = null,
}) {
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

  const { isSelected, toggleSelect, toggleSelectAll, isAllSelected } = selection || {}

  return <div className="overflow-x-auto min-h-[220px] pb-20 -mb-20">
    <table className="w-full table-fixed text-left text-xs">
    <caption className="sr-only">Saved DEMO students in the selected branch</caption>
    <thead className="hidden bg-slate-50/90 border-b border-slate-200 text-xs font-bold text-slate-700 tracking-wide dark:bg-slate-800/90 dark:border-slate-700 dark:text-slate-200 sm:table-header-group"><tr>
      {selection && (
        <th scope="col" className="w-10 px-3 py-2 text-center">
          <input
            type="checkbox"
            aria-label="Select all students"
            checked={isAllSelected ?? false}
            onChange={toggleSelectAll}
            className="size-3.5 rounded border-gray-300 text-[#940016] focus:ring-[#940016] cursor-pointer"
          />
        </th>
      )}
      {isVisible('serial') && <th scope="col" className="w-16 px-3 py-2 font-bold text-slate-700 dark:text-slate-200">No.</th>}
      {isVisible('name') && <th scope="col" className="w-[22%] px-3 py-2 font-bold text-slate-700 dark:text-slate-200">Student</th>}
      {isVisible('status') && <th scope="col" className="w-28 px-3 py-2 font-bold text-slate-700 dark:text-slate-200">Status</th>}
      {isVisible('course') && <th scope="col" className="w-[20%] px-3 py-2 font-bold text-slate-700 dark:text-slate-200">Course</th>}
      {isVisible('batch') && <th scope="col" className="w-[18%] px-3 py-2 font-bold text-slate-700 dark:text-slate-200">Batch</th>}
      {isVisible('admission') && <th scope="col" className="w-28 px-3 py-2 font-bold text-slate-700 dark:text-slate-200">Admission</th>}
      {isVisible('actions') && <th scope="col" className="w-20 px-3 py-2 font-bold text-slate-700 dark:text-slate-200 text-right">Actions</th>}
    </tr></thead>
    <tbody className="divide-y divide-border/50">{students.map(student => {
      const selected = isSelected ? isSelected(student.id) : false
      const isHighlighted = highlightStudentId && student.id === highlightStudentId
      return (
        <tr
          key={student.id}
          ref={el => {
            if (el && isHighlighted) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }}
          role="link"
          tabIndex={0}
          aria-label={`View student ${student.name}`}
          className={`grid grid-cols-2 gap-x-3 p-3 cursor-pointer transition-colors hover:bg-[#F9EBEE]/25 focus-visible:outline-2 focus-visible:outline-ring sm:table-row sm:p-0 ${
            isHighlighted ? 'bg-[#F9EBEE]/60 ring-2 ring-primary/50 shadow-xs' : selected ? 'bg-[#F9EBEE]/40' : ''
          }`}
          onClick={() => openStudent(student)}
          onKeyDown={(event) => rowKeyDown(event, student)}
        >
          {selection && (
            <td className="p-2 sm:table-cell sm:px-3 sm:py-2 text-center" onClick={e => e.stopPropagation()}>
              <input
                type="checkbox"
                aria-label={`Select student ${student.name}`}
                checked={selected}
                onChange={() => toggleSelect(student.id)}
                className="size-3.5 rounded border-gray-300 text-[#940016] focus:ring-[#940016] cursor-pointer"
              />
            </td>
          )}
          {isVisible('serial') && <td className="block min-w-0 p-2 text-muted-foreground tabular-nums sm:table-cell sm:px-3 sm:py-2 text-xs font-medium">{student.displaySerial}</td>}
          {isVisible('name') && <th scope="row" className="block min-w-0 break-words p-2 font-semibold text-foreground [overflow-wrap:anywhere] sm:table-cell sm:px-3 sm:py-2 text-xs sm:text-sm">{student.name}</th>}
          {isVisible('status') && (
            <td className="block min-w-0 p-2 sm:table-cell sm:px-3 sm:py-2">
              <span className="mr-2 text-xs text-muted-foreground sm:hidden">Status</span>
              {student.status === 'Provisional' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/70 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  <span className="size-1.5 rounded-full bg-blue-600" />
                  Provisional
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  <span className="size-1.5 rounded-full bg-emerald-600" />
                  {student.status ?? 'Active'}
                </span>
              )}
            </td>
          )}
          {isVisible('course') && <td className="block min-w-0 break-words p-2 sm:table-cell sm:px-3 sm:py-2 text-xs text-muted-foreground"><span className="mr-1 text-xs text-muted-foreground sm:hidden">Course:</span>{student.courseName ?? 'Not linked'}</td>}
          {isVisible('batch') && <td className="block min-w-0 break-words p-2 sm:table-cell sm:px-3 sm:py-2 text-xs text-muted-foreground"><span className="mr-1 text-xs text-muted-foreground sm:hidden">Batch:</span>{student.batchName ?? 'Not selected'}</td>}
          {isVisible('admission') && <td className="block min-w-0 break-words p-2 text-muted-foreground sm:table-cell sm:px-3 sm:py-2 text-xs font-mono"><span className="mr-1 text-xs sm:hidden">Admission:</span>{admissionRef(student)}</td>}
          {isVisible('actions') && <td className="block justify-self-end p-1 sm:table-cell sm:px-2 sm:py-2 text-right"><StudentActions student={student} branchId={branchId} onUpdated={onUpdated} onDeleted={onDeleted} /></td>}
        </tr>
      )
    })}</tbody>
    </table>
  </div>
}
