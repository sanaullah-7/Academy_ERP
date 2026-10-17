import { formatClassTime } from '../../utils/classTime.js'
import { useState, useMemo } from 'react'
import {
  Search, ArrowRight, GraduationCap, ExternalLink, User,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import DemoStatusBadge from './DemoStatusBadge.jsx'
import { downloadCsv } from '../../utils/exportHelpers.js'
import { exportTablePdf } from '../../utils/pdfHelpers.js'
import { TableToolbarActions } from '../Shared/TableUtilities.jsx'

function getCandidateAvatar(item) {
  const name = item.studentName || ''
  const parts = name.trim().split(/\s+/)
  const initials = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()

  const lower = name.toLowerCase()
  if (lower.includes('shahmeer') || lower.includes('aiman') || lower.includes('zainab')) {
    return { initials, style: 'bg-purple-100 text-purple-700 border border-purple-200/60' }
  }
  if (lower.includes('hina') || lower.includes('laiba') || lower.includes('hamza')) {
    return { initials, style: 'bg-[#940016] text-white font-bold' }
  }
  if (lower.includes('rehan') || lower.includes('bilal') || lower.includes('ali')) {
    return { initials, style: 'bg-blue-100 text-blue-700 border border-blue-200/60' }
  }
  if (lower.includes('daniyal') || lower.includes('tariq')) {
    return { initials, style: 'bg-slate-100 text-slate-500 border border-slate-200/60' }
  }

  const hash = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0)
  const styles = [
    'bg-purple-100 text-purple-700 border border-purple-200/60',
    'bg-[#940016] text-white font-bold',
    'bg-blue-100 text-blue-700 border border-blue-200/60',
    'bg-[#F9EBEE] text-[#940016] border border-[#f0d5d9]',
    'bg-slate-100 text-slate-600 border border-slate-200/60',
  ]
  return { initials, style: styles[hash % styles.length] }
}

function getStreamBadgeStyle(stream = '') {
  if (stream === 'Pre-Medical') return 'bg-blue-50/90 text-blue-700 border border-blue-200/60'
  if (stream === 'Pre-Engineering') return 'bg-blue-50/90 text-blue-700 border border-blue-200/60'
  if (stream === 'Computer Science') return 'bg-blue-50/90 text-blue-700 border border-blue-200/60'
  return 'bg-blue-50/90 text-blue-700 border border-blue-200/60'
}

function formatScheduleTime(item) {
  const date=item.scheduledSession?.classDate || item.requestedDate
  const start=item.scheduledSession?.startTime || item.requestedTime
  return date ? `${date} | ${formatClassTime(start)}` : 'Not scheduled'
}

export default function DemoStudentsTable({
  demos = [],
  courses = [],
  canManage = false,
  onViewDetails,
  onSchedule,
  onAttendance,
  onConvert,
  onDirectConvert,
  branchName = 'Campus',
}) {
  const [activeTab, setActiveTab] = useState('All')
  const [streamFilter, setStreamFilter] = useState('All')
  const [search, setSearch] = useState('')

  // Pagination states (default 10 rows per page to view full roster comfortably)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Compute tab counts
  const tabCounts = useMemo(() => {
    return {
      All: demos.length,
      Upcoming: demos.filter(d => d.status === 'Registered' || d.status === 'Scheduled').length,
      Attended: demos.filter(d => d.status === 'Attended').length,
      Converted: demos.filter(d => d.status === 'Converted').length,
      NoShow: demos.filter(d => d.status === 'Missed').length,
    }
  }, [demos])

  // Filtered dataset
  const filteredDemos = useMemo(() => {
    return demos.filter(item => {
      // Tab filter
      if (activeTab === 'Upcoming' && item.status !== 'Registered' && item.status !== 'Scheduled') return false
      if (activeTab === 'Attended' && item.status !== 'Attended') return false
      if (activeTab === 'Converted' && item.status !== 'Converted') return false
      if (activeTab === 'NoShow' && item.status !== 'Missed') return false

      // Academic stream filter
      const stream = (courses.find(course=>course.id===item.courseId)?.streamName || 'Unassigned')
      if (streamFilter !== 'All' && stream !== streamFilter) return false

      // Search keyword
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        const text = `${item.studentName} ${item.guardianContact} ${item.courseName} ${item.demoId} ${item.notes || ''}`.toLowerCase()
        if (!text.includes(q)) return false
      }

      return true
    })
  }, [demos, courses, activeTab, streamFilter, search])

  // Pagination calculations
  const totalRecords = filteredDemos.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endRecord = Math.min(currentPage * pageSize, totalRecords)

  const paginatedDemos = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredDemos.slice(start, start + pageSize)
  }, [filteredDemos, currentPage, pageSize])

  // CSV Export
  const handleExport = () => {
    const headers = [
      'Demo ID', 'Candidate Name', 'Guardian Contact', 'Academic Stream',
      'Target Program', 'Trial Schedule', 'Hall / Venue', 'Faculty',
      'Remarks', 'Status', 'Admission ID'
    ]
    const rows = filteredDemos.map(d => [
      d.demoId,
      d.studentName,
      d.guardianContact,
      (courses.find(course=>course.id===d.courseId)?.streamName || 'Unassigned'),
      d.courseName,
      formatScheduleTime(d),
      d.scheduledSession?.location || 'Trial Hall',
      d.scheduledSession?.teacherName || 'Not assigned',
      d.notes || '',
      d.status,
      d.convertedAdmissionDisplayId || '',
    ])
    downloadCsv(`${branchName.toLowerCase().replace(/\s+/g, '-')}-demo-attendees.csv`, headers, rows)
  }

  const handleExportPdf = () => {
    const headers = [
      'Demo ID', 'Candidate Name', 'Guardian Contact', 'Academic Stream',
      'Target Program', 'Trial Schedule', 'Hall / Venue', 'Faculty',
      'Status'
    ]
    const rows = filteredDemos.map(d => [
      d.demoId,
      d.studentName,
      d.guardianContact,
      (courses.find(course=>course.id===d.courseId)?.streamName || 'Unassigned'),
      d.courseName,
      formatScheduleTime(d),
      d.scheduledSession?.location || 'Trial Hall',
      d.scheduledSession?.teacherName || 'Not assigned',
      d.status,
    ])
    exportTablePdf({
      filename: `${branchName.toLowerCase().replace(/\s+/g, '-')}-demo-attendees.pdf`,
      title: 'Demo Classes & Trial Candidates Report',
      branchName: branchName || 'The Scholar Coaching Academy',
      headers,
      rows,
      filterSummary: `${filteredDemos.length} demo candidates matching filters`
    })
  }

  return (
    <div className="space-y-3">
      {/* Tab Segment Controls & Search/Stream Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 pt-0.5">
        {/* Left: Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs overflow-hidden">
          <button
            type="button"
            onClick={() => { setActiveTab('All'); setPage(1) }}
            className={`rounded-lg px-3 py-1.5 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'All'
                ? 'bg-[#940016] text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F9EBEE]/60'
            }`}
          >
            <span>All Candidates</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
              activeTab === 'All' ? 'bg-[#72000E] text-white' : 'bg-slate-200/70 text-slate-700'
            }`}>
              {tabCounts.All}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('Upcoming'); setPage(1) }}
            className={`rounded-lg px-3 py-1.5 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'Upcoming'
                ? 'bg-[#940016] text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F9EBEE]/60'
            }`}
          >
            <span>Upcoming / Registered</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
              activeTab === 'Upcoming' ? 'bg-[#72000E] text-white' : 'bg-blue-50 text-blue-700'
            }`}>
              {tabCounts.Upcoming}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('Attended'); setPage(1) }}
            className={`rounded-lg px-3 py-1.5 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'Attended'
                ? 'bg-[#940016] text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F9EBEE]/60'
            }`}
          >
            <span>Attended</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
              activeTab === 'Attended' ? 'bg-[#72000E] text-white' : 'bg-blue-50 text-blue-700'
            }`}>
              {tabCounts.Attended}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('Converted'); setPage(1) }}
            className={`rounded-lg px-3 py-1.5 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'Converted'
                ? 'bg-[#940016] text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F9EBEE]/60'
            }`}
          >
            <span>Converted</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
              activeTab === 'Converted' ? 'bg-[#72000E] text-white' : 'bg-blue-50 text-blue-700'
            }`}>
              {tabCounts.Converted}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('NoShow'); setPage(1) }}
            className={`rounded-lg px-3 py-1.5 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'NoShow'
                ? 'bg-[#940016] text-white shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#F9EBEE]/60'
            }`}
          >
            <span>No Show</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
              activeTab === 'NoShow' ? 'bg-[#72000E] text-white' : 'bg-blue-50 text-blue-700'
            }`}>
              {tabCounts.NoShow}
            </span>
          </button>
        </div>

        {/* Right: Search Input & Stream Select */}
        <div className="mobile-demo-filters flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              aria-label="Search demo records"
              placeholder="Search student name or phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-8 pr-2.5 h-9 w-52 sm:w-60 rounded-lg border border-slate-200/90 bg-slate-50/80 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#940016]"
            />
          </div>

          <select
            aria-label="Filter by stream"
            value={streamFilter}
            onChange={(e) => { setStreamFilter(e.target.value); setPage(1) }}
            className="h-9 rounded-lg border border-slate-200/90 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#940016] cursor-pointer"
          >
            <option value="All">All Streams</option>
            {[...new Set(courses.map(course=>course.streamName||'Unassigned'))].map(name=><option key={name}>{name}</option>)}
          </select>

          <TableToolbarActions showColumns={false} onPrint={() => window.print()} onExportCsv={handleExport} onExportPdf={handleExportPdf} />
        </div>
      </div>

      {/* Main Table Container (Spacious, beautifully aligned, zero overlapping) */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden w-full">
        {/* Desktop / Laptop Table View (lg:table with comfortable min-width & horizontal scroll if needed) */}
        <div className="hidden lg:block w-full overflow-x-auto">
          <table className="demo-registry-table w-full table-fixed text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold text-slate-700 tracking-normal dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
              <tr>
                <th scope="col" className="px-4 py-3 whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">CANDIDATE DETAILS</th>
                <th scope="col" className="px-3 py-3 whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">ACADEMIC STREAM</th>
                <th scope="col" className="px-3 py-3 whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">TARGET PROGRAM</th>
                <th scope="col" className="px-3 py-3 whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">TRIAL SCHEDULE &amp; HALL</th>
                <th scope="col" className="px-3 py-3 whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">TRIAL FACULTY</th>
                <th scope="col" className="px-3 py-3 whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">REMARKS / NOTES</th>
                <th scope="col" className="px-3 py-3 whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">STATUS</th>
                <th scope="col" className="px-4 py-3 text-right whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedDemos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-xs text-slate-500">
                    No candidate trial sessions found matching current filters.
                  </td>
                </tr>
              ) : (
                paginatedDemos.map((item) => {
                  const stream = (courses.find(course=>course.id===item.courseId)?.streamName || 'Unassigned')
                  const avatar = getCandidateAvatar(item)

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* CANDIDATE DETAILS with Initials Avatar Circle */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatar.style}`}>
                            {avatar.initials}
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => onViewDetails(item)}
                              className="w-full truncate text-xs font-bold text-slate-900 hover:text-primary text-left block leading-tight cursor-pointer"
                              title={item.studentName}
                            >
                              {item.studentName}
                            </button>
                            <span className="text-[11px] text-slate-500 font-mono tracking-tight block mt-0.5">
                              {item.guardianContact}
                            </span><span className="block truncate text-[10px] text-muted-foreground" title={`Guardian: ${item.guardianName} | Branch: ${branchName}`}>{item.guardianName} ? {branchName}</span>
                          </div>
                        </div>
                      </td>

                      {/* ACADEMIC STREAM */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${getStreamBadgeStyle(stream)}`}>
                          {stream}
                        </span>
                      </td>

                      {/* TARGET PROGRAM */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onViewDetails(item)}
                          className="block w-full truncate text-[11px] font-semibold text-primary hover:underline text-left cursor-pointer"
                          title={item.courseName}
                        >
                          {item.courseName}
                        </button><span className="mt-0.5 block truncate text-[10px] text-muted-foreground" title={item.batchName}>{item.batchName || 'Batch not selected'}</span>
                      </td>

                      {/* TRIAL SCHEDULE & HALL */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="text-xs font-semibold text-slate-900">
                          {formatScheduleTime(item)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.scheduledSession?.location || item.batchName || 'Room not configured'}
                        </div>
                      </td>

                      {/* TRIAL FACULTY */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <User className="size-3.5 text-[#940016] shrink-0" />
                          <span>
                            {item.scheduledSession?.teacherName || 'Not assigned'}
                          </span>
                        </div>
                      </td>

                      {/* REMARKS / NOTES */}
                      <td className="px-3 py-3.5 whitespace-nowrap max-w-[220px] truncate text-xs text-slate-500" title={item.notes || '—'}>
                        {item.notes || '—'}
                      </td>

                      {/* STATUS */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <DemoStatusBadge status={item.status} />
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {(item.status === 'Registered' || item.status === 'Scheduled') && canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => item.status==='Registered' ? onSchedule(item) : onAttendance(item)}
                                className="border border-slate-300 hover:bg-[#F9EBEE]/50 hover:text-[#940016] text-slate-700 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                              >
                                {item.status==='Registered'?'Schedule Trial':'Mark Attended'}
                              </button>
                              <button
                                type="button"
                                onClick={() => onDirectConvert ? onDirectConvert(item) : onConvert(item)}
                                className="bg-[#940016] hover:bg-[#72000E] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
                              >
                                <span>Convert</span>
                                <ArrowRight className="size-3.5" />
                              </button>
                            </>
                          )}

                          {item.status === 'Attended' && canManage && (
                            <button
                              type="button"
                              onClick={() => onDirectConvert ? onDirectConvert(item) : onConvert(item)}
                              className="bg-[#940016] hover:bg-[#72000E] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
                            >
                              <GraduationCap className="size-4" />
                              <span>Convert to Admission</span>
                            </button>
                          )}

                          {item.status === 'Converted' && (
                            <button
                              type="button"
                              onClick={() => onViewDetails(item)}
                              className="text-slate-800 hover:text-[#940016] font-mono text-xs font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer"
                            >
                              <span>{item.convertedAdmissionDisplayId || 'Admission linked'}</span>
                              <ExternalLink className="size-3.5 text-slate-500" />
                            </button>
                          )}

                          {(item.status === 'Missed' || item.status === 'Cancelled') && canManage && (
                            <button
                              type="button"
                              onClick={() => onSchedule(item)}
                              className="border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                            >
                              Reschedule Trial
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Card View (< 1024px) for 100% responsiveness */}
        <div className="block lg:hidden divide-y divide-slate-100 p-3 bg-white">
          {paginatedDemos.map((item) => {
            const avatar = getCandidateAvatar(item)
            return (
              <div key={`m-${item.id}`} className="py-3 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatar.style}`}>
                      {avatar.initials}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => onViewDetails(item)}
                        className="text-xs font-bold text-slate-900 text-left block"
                      >
                        {item.studentName}
                      </button>
                      <span className="text-[11px] text-slate-500 font-mono">{item.guardianContact}</span>
                    </div>
                  </div>
                  <DemoStatusBadge status={item.status} />
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600">
                  <p className="truncate"><strong>Program:</strong> {item.courseName}</p>
                  <p className="truncate"><strong>Field:</strong> {item.streamName || courses.find(course=>course.id===item.courseId)?.streamName || 'Unassigned'}</p>
                  <p className="truncate"><strong>Batch:</strong> {item.batchName || 'Not selected'}</p>
                  <p className="truncate"><strong>Branch:</strong> {branchName}</p>
                  <p className="truncate"><strong>Schedule:</strong> {formatScheduleTime(item)}</p>
                  <p className="truncate"><strong>Faculty:</strong> {item.scheduledSession?.teacherName || 'Not assigned'}</p>
                  <p className="truncate"><strong>Venue:</strong> {item.scheduledSession?.location || 'Not configured'}</p>
                </div>

                {item.notes && <p className="text-[11px] italic text-slate-500 truncate">{item.notes}</p>}

                {canManage && (
                  <div className="flex items-center gap-2 pt-1">
                    {item.status === 'Converted' ? <span className="text-xs font-medium text-primary">{item.convertedAdmissionDisplayId || 'Admission linked'}</span> : item.status === 'Attended' ? (
                      <button
                        type="button"
                        onClick={() => onDirectConvert ? onDirectConvert(item) : onConvert(item)}
                        className="w-full bg-[#940016] hover:bg-[#72000E] text-white text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <GraduationCap className="size-3.5" />
                        <span>Convert to Admission</span>
                      </button>
                    ) : item.status === 'Registered' || item.status === 'Scheduled' ? (
                      <div className="flex w-full items-center gap-2">
                        <button
                          type="button"
                          onClick={() => item.status==='Registered' ? onSchedule(item) : onAttendance(item)}
                          className="flex-1 border border-slate-300 hover:bg-[#F9EBEE]/50 hover:text-[#940016] text-slate-700 text-xs font-medium py-1.5 rounded-lg text-center transition-colors cursor-pointer"
                        >
                          {item.status==='Registered'?'Schedule Trial':'Mark Attended'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDirectConvert ? onDirectConvert(item) : onConvert(item)}
                          className="flex-1 bg-[#940016] hover:bg-[#72000E] text-white text-xs font-semibold py-1.5 rounded-lg text-center transition-colors shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Convert</span>
                          <ArrowRight className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSchedule(item)}
                        className="w-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium py-1.5 rounded-lg text-center cursor-pointer"
                      >
                        Reschedule Trial
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Pagination Bar Matching the User's Screenshot Exactly */}
        <div className="flex flex-row items-center justify-between px-4 py-2 bg-white border-t border-slate-200/80 text-xs text-slate-500">
          {/* Left: Rows per page & range */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setPage(1)
              }}
              className="h-7 rounded-md border border-[#940016]/30 bg-white px-2 text-xs font-medium text-slate-800 shadow-2xs focus:ring-1 focus:ring-[#940016] focus:outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-slate-600 font-medium ml-1 text-xs">
              {startRecord}–{endRecord} of {totalRecords}
            </span>
          </div>

          {/* Right: Page navigation buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="size-7 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-35 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setPage(pageNum)}
                className={`size-7 rounded-md text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                  pageNum === currentPage
                    ? 'bg-[#940016] text-white shadow-2xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-[#F9EBEE]/50'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
              className="size-7 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-35 disabled:pointer-events-none flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
