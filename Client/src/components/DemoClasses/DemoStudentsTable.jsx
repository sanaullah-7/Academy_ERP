import { formatClassTime } from '../../utils/classTime.js'
import { useState, useMemo } from 'react'
import {
  Search,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import CustomSelect from '../ui/CustomSelect.jsx'
import DemoRowActions from './DemoRowActions.jsx'
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
  onAttendance,
  onConvert,
  onDirectConvert,
  onCancel,
  onDelete,
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
      <div className="demo-filter-bar flex min-w-0 flex-col gap-2 rounded-xl border border-primary/20 bg-white/80 p-2 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Status Filter Tabs */}
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto p-0.5 text-[11px] no-scrollbar">
          <button
            type="button"
            onClick={() => { setActiveTab('All'); setPage(1) }}
            className={`shrink-0 rounded-lg border border-primary/15 px-2 py-1.5 font-medium flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'All'
                ? 'bg-[#940016] text-white shadow-2xs font-semibold'
                : 'text-slate-600 bg-primary/[0.02] hover:text-primary hover:bg-primary/5'
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
            className={`shrink-0 rounded-lg border border-primary/15 px-2 py-1.5 font-medium flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'Upcoming'
                ? 'bg-[#940016] text-white shadow-2xs font-semibold'
                : 'text-slate-600 bg-primary/[0.02] hover:text-primary hover:bg-primary/5'
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
            className={`shrink-0 rounded-lg border border-primary/15 px-2 py-1.5 font-medium flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'Attended'
                ? 'bg-[#940016] text-white shadow-2xs font-semibold'
                : 'text-slate-600 bg-primary/[0.02] hover:text-primary hover:bg-primary/5'
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
            className={`shrink-0 rounded-lg border border-primary/15 px-2 py-1.5 font-medium flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'Converted'
                ? 'bg-[#940016] text-white shadow-2xs font-semibold'
                : 'text-slate-600 bg-primary/[0.02] hover:text-primary hover:bg-primary/5'
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
            className={`shrink-0 rounded-lg border border-primary/15 px-2 py-1.5 font-medium flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'NoShow'
                ? 'bg-[#940016] text-white shadow-2xs font-semibold'
                : 'text-slate-600 bg-primary/[0.02] hover:text-primary hover:bg-primary/5'
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
              className="pl-8 pr-2.5 h-9 w-48 rounded-lg border border-primary/15 bg-slate-50/80 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#940016]"
            />
          </div>

          <CustomSelect
            aria-label="Filter by stream"
            value={streamFilter}
            onChange={value => { setStreamFilter(value); setPage(1) }}
            options={[{ value: 'All', label: 'All Streams' }, ...[...new Set(courses.map(course => course.streamName || 'Unassigned'))].map(name => ({ value: name, label: name }))]}
            className="min-w-28 max-w-36 rounded-lg border-primary/20 bg-white"
            menuWidthClass="min-w-full max-w-[240px]"
          />

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
                <th scope="col" className="px-3 py-3 whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">TRIAL DATE</th>
                <th scope="col" className="px-3 py-3 whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">REMARKS / NOTES</th>
                <th scope="col" className="px-3 py-3 whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">STATUS</th>
                <th scope="col" className="px-4 py-3 text-right whitespace-nowrap font-bold text-slate-700 dark:text-slate-200">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedDemos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-500">
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

                      {/* TRIAL DATE */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <div className="text-xs font-semibold text-slate-900">
                          {item.scheduledSession?.classDate || item.requestedDate || 'Not set'}
                        </div>
                      </td>


                      <td className="px-3 py-3.5 whitespace-nowrap truncate text-xs text-slate-500" title={item.notes || '—'}>
                        {item.notes || '—'}
                      </td>

                      {/* STATUS */}
                      <td className="px-3 py-3.5 whitespace-nowrap">
                        <DemoStatusBadge status={item.status} />
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <DemoRowActions item={item} canManage={canManage} onView={onViewDetails} onAttendance={onAttendance} onConvert={onDirectConvert || onConvert} onCancel={onCancel} onDelete={onDelete} />
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
                  <p className="truncate"><strong>Trial Date:</strong> {item.scheduledSession?.classDate || item.requestedDate || 'Not set'}</p>
                </div>

                {item.notes && <p className="text-[11px] italic text-slate-500 truncate">{item.notes}</p>}

                <div className="flex justify-end"><DemoRowActions item={item} canManage={canManage} onView={onViewDetails} onAttendance={onAttendance} onConvert={onDirectConvert || onConvert} onCancel={onCancel} onDelete={onDelete} /></div>

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
