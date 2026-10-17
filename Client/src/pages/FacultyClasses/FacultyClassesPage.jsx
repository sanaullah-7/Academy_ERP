import { useTableSelection } from '../../hooks/useTableUtilities.js'
import BatchStudentsModal from '../../components/FacultyClasses/BatchStudentsModal.jsx'
import { selectedClassStatus } from '../../utils/selectedClassStatus.js'
import { classTimeLabel } from '../../utils/classTime.js'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx'
import { shiftDistribution } from '../../utils/shiftDistribution.js'
import { classScheduleService, resolveDailyClasses } from '../../services/classScheduleService.js'
/**
 * Purpose: Faculty & Classes management page for The Scholar Coaching Academy (TSA) ERP.
 * Module: FacultyClasses
 * Status: Implemented — Lovable-aligned 2-column layout with roster, circular toolbar actions, bulk selection, instructor timetable, shift distribution, and live assignment sync.
 */

import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  DoorOpen,
  Edit2,
  GraduationCap,
  LayoutGrid,
  Loader2,
  MoreVertical,
  Phone,
  Printer,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  Plus,
  UsersRound,
  MessageSquare,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'
import { useBranch } from '../../hooks/useBranch.js'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'
import { academicService } from '../../services/academicService.js'
import { facultyService } from '../../services/facultyService.js'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import AssignFacultyModal from '../../components/CoursesBatches/AssignFacultyModal.jsx'
import AddFacultyModal from '../../components/FacultyClasses/AddFacultyModal.jsx'
import { downloadCsv } from '../../utils/exportHelpers.js'
import { exportTablePdf } from '../../utils/pdfHelpers.js'
import {
  TableToolbarActions,
  BulkActionBar,
} from '../../components/Shared/TableUtilities.jsx'

const tabs = [
  ['Directory', ROUTE_PATHS.FACULTY_CLASSES],
  ['Subject assignments', ROUTE_PATHS.FACULTY_SUBJECTS],
  ['Batch assignments', ROUTE_PATHS.FACULTY_BATCHES],
  ['Class schedule', ROUTE_PATHS.CLASS_SCHEDULE],
]

function ModuleNav({ section }) {
  const activePath =
    section === 'subjects'
      ? ROUTE_PATHS.FACULTY_SUBJECTS
      : section === 'batches'
      ? ROUTE_PATHS.FACULTY_BATCHES
      : section === 'schedule'
      ? ROUTE_PATHS.CLASS_SCHEDULE
      : ROUTE_PATHS.FACULTY_CLASSES
  return (
    <nav
      aria-label="Faculty and classes views"
      className="flex gap-1.5 overflow-x-auto rounded-lg border border-border/70 bg-muted/40 p-1"
    >
      {tabs.map(([label, path]) => (
        <Link
          key={path}
          to={path}
          aria-current={activePath === path ? 'page' : undefined}
          className={`shrink-0 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all ${
            activePath === path
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}

function SectionCard({ title, icon: Icon, actions, children }) {
  return (
    <Card className="min-w-0 shadow-xs border border-border/80">
      <CardHeader className="border-b border-border/60 bg-slate-50/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Icon size={17} className="text-primary" aria-hidden="true" />
            {title}
          </CardTitle>
          {actions}
        </div>
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  )
}

function State({ loading, error, retry, children }) {
  if (loading) {
    return (
      <div
        role="status"
        className="flex items-center gap-3 rounded-xl border border-border/80 bg-card p-10 text-muted-foreground"
      >
        <Loader2
          size={22}
          aria-hidden="true"
          className="animate-spin text-[#940016] motion-reduce:animate-none"
        />
        <span className="text-sm font-medium">Loading Faculty &amp; Classes...</span>
      </div>
    )
  }
  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-8">
        <AlertCircle aria-hidden="true" size={24} className="text-destructive" />
        <p role="alert" className="text-sm font-medium text-destructive">
          Unable to load this view. {error}
        </p>
        <Button variant="outline" size="sm" onClick={retry}>
          Retry
        </Button>
      </div>
    )
  }
  return children
}

// Curated metadata enrichment for realistic demo teachers matching approved Lovable design
const TEACHER_ENRICHMENT = {
  'teacher-irfan': {
    displayName: 'Dr. Irfan',
    qualification: 'MBBS, Gold Medalist',
    subject: 'Biology',
    department: 'Senior Biology Specialist',
    contact: '0300-5544332',
    coursesText: 'MDCAT 2026, FSc Pre-Medical',
    shiftsText: 'Morning A, Evening A',
    defaultReach: 240,
    defaultWeeklyHours: 16.5,
    syllabusPace: 88,
    slots: [
      {
        id: 'slot-1',
        course: 'MDCAT 2026',
        batch: 'Morning A',
        subject: 'Biology (Cell Biology & Genetics)',
        room: 'Room 201',
        days: 'Mon - Fri',
        time: '08:00 AM - 09:15 AM',
        students: 120,
      },
      {
        id: 'slot-2',
        course: 'FSc Pre-Medical',
        batch: 'Evening A',
        subject: 'Biology (Physiology)',
        room: 'Room 102',
        days: 'Mon - Fri',
        time: '03:45 PM - 05:00 PM',
        students: 120,
      },
    ],
  },
  'teacher-naeem': {
    displayName: 'Prof. M. Naeem',
    qualification: 'M.Phil Chemistry',
    subject: 'Chemistry',
    department: 'Chemistry Department Lead',
    contact: '0301-4455667',
    coursesText: 'MDCAT 2026, ETEA Crash',
    shiftsText: 'Morning A, Evening A, Crash 1',
    defaultReach: 310,
    defaultWeeklyHours: 18.5,
    syllabusPace: 82,
    slots: [
      {
        id: 'slot-3',
        course: 'MDCAT Morning A',
        batch: 'Morning A',
        subject: 'Chemistry (Organic Foundations)',
        room: 'Room 201',
        days: 'Mon - Fri',
        time: '09:15 AM - 10:30 AM',
        students: 120,
      },
      {
        id: 'slot-4',
        course: 'MDCAT Evening A',
        batch: 'Evening A',
        subject: 'Inorganic & Numerical Chemistry',
        room: 'Hall 1',
        days: 'Mon - Fri',
        time: '05:15 PM - 06:30 PM',
        students: 115,
      },
      {
        id: 'slot-5',
        course: 'ETEA Crash Course',
        batch: 'Crash 1',
        subject: 'High-Yield Concept Blitz',
        room: 'Room 104',
        days: 'Tue, Thu, Sat',
        time: '06:45 PM - 08:00 PM',
        students: 75,
      },
    ],
  },
  'teacher-bilal': {
    displayName: 'Engr. Bilal Khan',
    qualification: 'GIKI Alumnus',
    subject: 'Physics',
    department: 'Physics Department Lead',
    contact: '0312-9876543',
    coursesText: 'MDCAT, ECAT Engineering',
    shiftsText: 'Evening A, Weekend Int.',
    defaultReach: 195,
    defaultWeeklyHours: 15.0,
    syllabusPace: 79,
    slots: [
      {
        id: 'slot-6',
        course: 'ECAT Engineering',
        batch: 'Evening A',
        subject: 'Physics (Mechanics & Electromagnetism)',
        room: 'Room 202',
        days: 'Mon - Fri',
        time: '03:45 PM - 05:00 PM',
        students: 110,
      },
      {
        id: 'slot-7',
        course: 'MDCAT Regular',
        batch: 'Weekend Int.',
        subject: 'Modern Physics & Nuclear',
        room: 'Hall 2',
        days: 'Sat, Sun',
        time: '09:00 AM - 12:00 PM',
        students: 85,
      },
    ],
  },
  'teacher-danyal': {
    displayName: 'Sir Danyal',
    qualification: 'MA English',
    subject: 'English & Reasoning',
    department: 'English & Reasoning Lead',
    contact: '0333-5566778',
    coursesText: 'MDCAT, ETEA Crash',
    shiftsText: 'All MDCAT Batches',
    defaultReach: 420,
    defaultWeeklyHours: 20.0,
    syllabusPace: 91,
    slots: [
      {
        id: 'slot-8',
        course: 'MDCAT 2026',
        batch: 'Morning All',
        subject: 'English & Logical Reasoning',
        room: 'Auditorium',
        days: 'Mon - Thu',
        time: '11:00 AM - 12:15 PM',
        students: 220,
      },
      {
        id: 'slot-9',
        course: 'ETEA Crash',
        batch: 'Evening Combined',
        subject: 'Vocabulary & Fast Grammar',
        room: 'Auditorium',
        days: 'Fri - Sun',
        time: '04:00 PM - 05:30 PM',
        students: 200,
      },
    ],
  },
  'teacher-tariq': {
    displayName: 'Sir Tariq',
    qualification: 'M.Sc Mathematics',
    subject: 'Mathematics',
    department: 'Mathematics Department',
    contact: '0345-1122334',
    coursesText: 'ECAT 2026, FSc Pre-Engineering',
    shiftsText: 'Morning B, Evening B',
    defaultReach: 180,
    defaultWeeklyHours: 14.0,
    syllabusPace: 85,
    slots: [
      {
        id: 'slot-10',
        course: 'ECAT 2026',
        batch: 'Morning B',
        subject: 'Calculus & Analytic Geometry',
        room: 'Room 203',
        days: 'Mon - Fri',
        time: '10:30 AM - 11:45 AM',
        students: 95,
      },
      {
        id: 'slot-11',
        course: 'FSc Pre-Engineering',
        batch: 'Evening B',
        subject: 'Algebra & Trigonometry',
        room: 'Room 202',
        days: 'Mon - Fri',
        time: '05:30 PM - 06:45 PM',
        students: 85,
      },
    ],
  },
  'demo-teacher': {
    displayName: 'Demo Teacher',
    qualification: 'Faculty Member',
    subject: 'General Faculty',
    department: 'Faculty Department',
    contact: '0300-1122334',
    coursesText: 'Foundation Course',
    shiftsText: 'Morning Shift',
    defaultReach: 60,
    defaultWeeklyHours: 8.0,
    syllabusPace: 75,
    slots: [
      {
        id: 'slot-12',
        course: 'Foundation Course',
        batch: 'Morning Regular',
        subject: 'General Academic Review',
        room: 'Room 101',
        days: 'Mon - Fri',
        time: '11:00 AM - 12:15 PM',
        students: 60,
      },
    ],
  },
}

function enrichTeacher(rawTeacher) {
  if (!rawTeacher) return null
  const meta = TEACHER_ENRICHMENT[rawTeacher.id] || {}
  const rawName = rawTeacher.name || ''

  // Infer subject if not set
  let inferredSubject = rawTeacher.specialization || meta.subject || ''
  if (!inferredSubject) {
    if (rawName.includes('(Bio)') || rawName.includes('Bio')) inferredSubject = 'Biology'
    else if (rawName.includes('(Chem)') || rawName.includes('Chem')) inferredSubject = 'Chemistry'
    else if (rawName.includes('(Phys)') || rawName.includes('Phys')) inferredSubject = 'Physics'
    else if (rawName.includes('(Math)') || rawName.includes('Math')) inferredSubject = 'Mathematics'
    else if (rawName.includes('(CS)') || rawName.includes('English')) inferredSubject = 'English & Reasoning'
    else inferredSubject = 'General Faculty'
  }

  // Display name: for demo-teacher, keep exact 'Demo Teacher'; for others strip parenthesis
  let cleanName =
    rawTeacher.id === 'demo-teacher'
      ? 'Demo Teacher'
      : meta.displayName || rawName.replace(/\s*\([A-Za-z0-9\s]+\)$/, '')

  const qualification =
    rawTeacher.qualifications ||
    meta.qualification ||
    (rawTeacher.id === 'demo-teacher' ? 'Faculty Member' : 'Qualified Instructor')
  const department = rawTeacher.department || meta.department || `${inferredSubject} Department`
  const contact = rawTeacher.contact || meta.contact || '0300-0000000'

  // Construct real slots from live assignments and single-date sessions if present, else fallback to enriched template
  const realAssignments = rawTeacher.assignments || []
  const realSessions = rawTeacher.sessions || []

  const assignmentSlots = realAssignments.map((a) => ({
    id: a.id,
    assignmentId: a.id,
    batchId: a.batchId,
    courseId: a.courseId,
    subjectId: a.subjectId,
    course: a.courseName || 'Course',
    batch: a.batchName || 'Batch',
    subject: a.subjectName || 'Subject',
    room: a.room || 'Not configured',
    days: Array.isArray(a.days) ? a.days.join(', ') : (a.days || 'Regular'),
    time: classTimeLabel(a.startTime, a.endTime),
    startTime: a.startTime,
    endTime: a.endTime,
    students: a.subjectStudentCount ?? 0,
    isReal: true,
  }))

  const sessionSlots = realSessions.map((s) => ({
    id: s.id,
    assignmentId: s.id,
    classId: s.id,
    batchId: s.batchId,
    courseId: s.courseId,
    subjectId: s.subjectId,
    course: s.courseName || 'Class Session',
    batch: s.batchName || 'Session',
    subject: s.subject || 'Subject',
    room: s.location || 'Not configured',
    days: s.classDate || 'Today',
    time: classTimeLabel(s.startTime, s.endTime),
    startTime: s.startTime,
    endTime: s.endTime,
    students: s.subjectStudentCount ?? 0,
    isReal: true,
    isSession: true,
  }))

  let slots = [...assignmentSlots, ...sessionSlots]
  if (slots.length === 0 && meta.slots) {
    slots = meta.slots
  }

  const coursesList = rawTeacher.assignedBatches?.map((b) => b.courseName).filter(Boolean) || []
  const coursesText =
    coursesList.length > 0 ? [...new Set(coursesList)].join(', ') : meta.coursesText || 'MDCAT 2026'

  const batchesList = rawTeacher.assignedBatches?.map((b) => b.name).filter(Boolean) || []
  const shiftsText =
    batchesList.length > 0 ? batchesList.join(', ') : meta.shiftsText || 'Morning A, Evening A'

  const studentReach = rawTeacher.studentReach ?? 0
  const weeklyHours = rawTeacher.weeklyHours ?? 0
  const batchCount = rawTeacher.assignedBatches?.length ?? 0

  return {
    ...rawTeacher,
    displayName: cleanName,
    qualification,
    subject: inferredSubject,
    department,
    contact,
    coursesText,
    shiftsText,
    studentReach,
    weeklyHours,
    batchCount,
    // No completed-topic/lecture records exist yet; schedule time is not syllabus completion.
    syllabusPace: null,
    slots,
  }
}

export default function FacultyClassesPage({ section = 'directory' }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { branchId, branch, scopeKey } = useBranch()
  const { can } = usePermissions()
  const canManage = can(PERMISSIONS.CLASSES_MANAGE) || can(PERMISSIONS.COURSES_MANAGE)

  const [result, setResult] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  // Filters and Selection
  const [search, setSearch] = useState('')
  const [activeSubject, setActiveSubject] = useState('All Faculty')
  const [handledNavigation, setHandledNavigation] = useState(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState(() => location.state?.teacherId || null)
  const [selectedSlotId, setSelectedSlotId] = useState(() => location.state?.assignmentId || location.state?.classId || null)

  const [shiftClock,setShiftClock] = useState(()=>new Date())
  useEffect(()=>{const timer=window.setInterval(()=>setShiftClock(new Date()),60000);return()=>window.clearInterval(timer)},[])
  const [editingFaculty,setEditingFaculty]=useState(null)
  const [deletingFaculty,setDeletingFaculty]=useState(null)
  const [deletingAssignment,setDeletingAssignment]=useState(null)
  const [facultyError,setFacultyError]=useState('')
  const [deleteBusy,setDeleteBusy]=useState(false)
  // Modals state
  const [addFacultyOpen, setAddFacultyOpen] = useState(false)
  const [batchStudentsConfig, setBatchStudentsConfig] = useState(null)
  const [assignModalConfig, setAssignModalConfig] = useState(null)

  useEffect(() => {
    let active = true
    if (!branchId) return () => { active = false }

    const load = async () => {
      const [teachers, overview, savedSessions] = await Promise.all([
        facultyService.list({ branchId }),
        // Keep explicit dated classes alongside the recurring faculty timetable.
        academicService.overview({ branchId }).catch(() => ({ courses: [], batches: [], subjects: [] })),
        classScheduleService.list({branchId}),
      ])
      const courses = overview.courses || []
      const batches = overview.batches || []
      const subjects = overview.subjects || []
      const sessions = await Promise.all(savedSessions.map(async session => ({ ...session, subjectStudentCount: session.subjectId ? (await facultyService.listClassStudents(session.batchId, { branchId, subjectId: session.subjectId })).length : 0 })))

      const batchAssignments =
        section === 'batches' ? await facultyService.listBatchAssignments({ branchId }) : null
      const subjectAssignments =
        section === 'subjects' ? await facultyService.listSubjectAssignments({ branchId }) : null
      return { teachers, courses, batches, subjects, sessions, streams:overview.streams||[], batchAssignments, subjectAssignments }
    }

    load().then(
      (data) => {
        if (active) setResult({ scopeKey, retryCount, section, data })
      },
      (error) => {
        if (active) setResult({ scopeKey, retryCount, section, error: error.message })
      }
    )

    return () => {
      active = false
    }
  }, [branchId, scopeKey, retryCount, section])

  const current =
    result?.scopeKey === scopeKey && result.retryCount === retryCount && result.section === section
      ? result
      : null
  const data = current?.data

  // Enriched teachers list
  const enrichedTeachers = useMemo(() => {
    if (!data?.teachers) return []
    return data.teachers.map((t) => {
      const teacherSessions = (data.sessions || []).filter(
        (s) => s.teacherId === t.id && (!branchId || s.branchId === branchId)
      )
      return enrichTeacher({ ...t, sessions: teacherSessions })
    })
  }, [data, branchId])

  // Synchronize selection when navigated from dashboard or when location.state is present.
  // Resolve once data is ready so subsequent manual selections remain independent.
  if (location.state && handledNavigation !== location.state && enrichedTeachers.length) {
    const navState = location.state
    setHandledNavigation(navState)

    let targetTeacher = null
    if (navState.teacherId) {
      targetTeacher = enrichedTeachers.find((t) => t.id === navState.teacherId)
    }
    if (!targetTeacher && navState.assignmentId) {
      targetTeacher = enrichedTeachers.find((t) =>
        (t.assignments || []).some((a) => a.id === navState.assignmentId) ||
        (t.slots || []).some((s) => s.assignmentId === navState.assignmentId || s.id === navState.assignmentId)
      )
    }
    if (!targetTeacher && navState.classId) {
      targetTeacher = enrichedTeachers.find((t) =>
        (t.slots || []).some((s) => s.id === navState.classId || s.assignmentId === navState.classId)
      )
    }
    if (!targetTeacher && navState.teacherName) {
      const cleanTargetName = navState.teacherName.toLowerCase().replace(/\s*\([a-z0-9\s]+\)$/, '').trim()
      targetTeacher = enrichedTeachers.find((t) =>
        t.name?.toLowerCase().includes(cleanTargetName) ||
        t.displayName?.toLowerCase().includes(cleanTargetName)
      )
    }
    if (!targetTeacher && navState.subject) {
      const subLower = navState.subject.toLowerCase()
      targetTeacher = enrichedTeachers.find((t) =>
        t.subject?.toLowerCase().includes(subLower) ||
        (t.slots || []).some((s) => s.subject?.toLowerCase().includes(subLower))
      )
    }

    if (targetTeacher) {
      setSelectedTeacherId(targetTeacher.id)
      setActiveSubject('All Faculty')
    }

    const slotId = navState.assignmentId || navState.classId
    if (slotId) {
      setSelectedSlotId(slotId)
    }
  }

  // Saved subject IDs preserve course relationships, including same-name subjects.
  const subjectFilters = useMemo(() => {
    const subjects = (data?.subjects || []).filter(subject => subject.active !== false && data?.courses?.some(course => course.id === subject.courseId && course.active !== false))
    return [{ id: 'All Faculty', label: 'All Faculty' }, ...subjects.map(subject => ({
      id: subject.id,
      label: subjects.filter(other => other.name === subject.name).length > 1 ? `${subject.name} - ${data.courses.find(course => course.id === subject.courseId)?.name}` : subject.name,
    }))]
  }, [data])
  const selectedSubject = subjectFilters.some(subject => subject.id === activeSubject) ? activeSubject : 'All Faculty'
  const subjectPillCounts = useMemo(() => Object.fromEntries(subjectFilters.map(subject => [subject.id, subject.id === 'All Faculty' ? enrichedTeachers.length : enrichedTeachers.filter(teacher => teacher.assignments?.some(assignment => assignment.subjectId === subject.id)).length])), [subjectFilters, enrichedTeachers])

  // Filtered teachers for roster
  const visibleTeachers = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return enrichedTeachers.filter((teacher) => {
      const matchesSearch =
        !needle ||
        teacher.name.toLowerCase().includes(needle) ||
        teacher.displayName.toLowerCase().includes(needle) ||
        teacher.subject.toLowerCase().includes(needle) ||
        teacher.coursesText.toLowerCase().includes(needle) ||
        teacher.shiftsText.toLowerCase().includes(needle)

      const matchesSubject = selectedSubject === 'All Faculty' || teacher.assignments?.some(assignment => assignment.subjectId === selectedSubject)

      return matchesSearch && matchesSubject
    })
  }, [enrichedTeachers, search, selectedSubject])

  // Table selection hook for bulk select, export scope, and checkboxes
  const {
    toggleSelect,
    toggleSelectPage,
    selectAllMatching,
    clearSelection,
    isPageSelected,
    isAllMatchingSelected,
    isSelected,
    selectedCount,
    getExportScope,
  } = useTableSelection(visibleTeachers, (t) => t.id)

  const selectedTeacher = useMemo(() => {
    if (selectedTeacherId) {
      const found = enrichedTeachers.find((t) => t.id === selectedTeacherId)
      if (found) return found
    }
    const teacherWithSlot = enrichedTeachers.find((t) => (t.slots || []).some((s) => s.isReal || s.isSession))
    return (
      teacherWithSlot ||
      enrichedTeachers.find((t) => t.id === 'teacher-naeem') ||
      enrichedTeachers[0] ||
      null
    )
  }, [enrichedTeachers, selectedTeacherId])

  const activeSlot = useMemo(() => {
    if (!selectedTeacher?.slots?.length) return null
    if (selectedSlotId) {
      const found = selectedTeacher.slots.find(
        (s) => s.id === selectedSlotId || s.assignmentId === selectedSlotId || s.classId === selectedSlotId
      )
      if (found) return found
    }
    if (location.state?.subject) {
      const subLower = location.state.subject.toLowerCase()
      const found = selectedTeacher.slots.find((s) => s.subject?.toLowerCase().includes(subLower))
      if (found) return found
    }
    return selectedTeacher.slots[0] || null
  }, [selectedTeacher, selectedSlotId, location.state])

  const shiftCards = useMemo(()=>shiftDistribution({assignments:data?.teachers?.flatMap(t=>t.assignments||[]),sessions:data?.sessions,academic:{courses:data?.courses,batches:data?.batches,subjects:data?.subjects},branchId,now:shiftClock}),[data,branchId,shiftClock])

  const teacherSessionStatus = useMemo(() => {
    const slots = resolveDailyClasses({ assignments: selectedTeacher?.assignments || [], sessions: (data?.sessions || []).filter(session => session.teacherId === selectedTeacher?.id), academic: { courses: data?.courses, batches: data?.batches, subjects: data?.subjects }, branchId, now: shiftClock })
    return selectedClassStatus(activeSlot, slots, shiftClock)
  }, [activeSlot, selectedTeacher, data, branchId, shiftClock])

  // KPI Metrics calculations
  const totalInstructors = data?.teachers?.length || 0
  const totalDailySlots = useMemo(() => {
    const weekday=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Karachi',weekday:'short'}).format(new Date())
    return enrichedTeachers.reduce((sum,t)=>sum+(t.assignments||[]).filter(a=>a.days.some(d=>d.slice(0,3).toLowerCase()===weekday.toLowerCase())).length,0)
  }, [enrichedTeachers])

  const totalStudentReach = useMemo(() => {

    return new Set(enrichedTeachers.flatMap(t=>t.studentIds||[])).size.toLocaleString('en-US')
  }, [enrichedTeachers])

  const retry = () => setRetryCount((v) => v + 1)
  useEffect(() => {
    const refreshAcademic = () => setRetryCount(value => value + 1)
    window.addEventListener('focus', refreshAcademic)
    window.addEventListener('storage', refreshAcademic)
    return () => {
      window.removeEventListener('focus', refreshAcademic)
      window.removeEventListener('storage', refreshAcademic)
    }
  }, [])


  // Export functions respecting selection scope
  const handleExportCsv = () => {
    const scope = getExportScope()
    const targetTeachers = scope.items
    downloadCsv(
      `tsa-faculty-directory-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Instructor Name', 'Subject', 'Qualification', 'Contact', 'Batches', 'Weekly Hrs', 'Students'],
      targetTeachers.map((t) => [
        t.displayName,
        t.subject,
        t.qualification,
        t.contact,
        t.shiftsText,
        t.weeklyHours,
        t.studentReach,
      ])
    )
  }

  const handleExportPdf = () => {
    const scope = getExportScope()
    const targetTeachers = scope.items
    exportTablePdf({
      filename: `tsa-faculty-directory-${new Date().toISOString().slice(0, 10)}.pdf`,
      title: 'Faculty Directory & Lecture Allocations',
      branchName: branch?.name || 'The Scholar Coaching Academy',
      headers: ['Instructor Name', 'Subject', 'Qualification', 'Contact', 'Weekly Hrs', 'Students'],
      rows: targetTeachers.map((t) => [
        t.displayName,
        t.subject,
        t.qualification,
        t.contact,
        `${t.weeklyHours} hrs`,
        `${t.studentReach} students`,
      ]),
      filterSummary: `${targetTeachers.length} of ${data?.teachers?.length || 0} teaching instructors (${scope.summary})`,
    })
  }

  // Print timetable for selected teacher (separate from directory report)
  const handlePrintTimetable = () => {
    if (!selectedTeacher) return
    const slots = selectedTeacher.slots || []
    exportTablePdf({
      filename: `timetable-${selectedTeacher.displayName.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      title: `${selectedTeacher.displayName} — Weekly Class Timetable`,
      branchName: branch?.name || 'The Scholar Coaching Academy',
      headers: ['Course / Batch', 'Subject & Topic', 'Schedule Days & Time', 'Room / Hall', 'Class Size'],
      rows: slots.map((s) => [
        `${s.course} (${s.batch})`,
        s.subject,
        `${s.days} • ${s.time}`,
        s.room,
        `${s.students} Students`,
      ]),
      filterSummary: `Instructor: ${selectedTeacher.displayName} | ${selectedTeacher.department} | ${slots.length} Lecture Slots`,
    })
  }

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 pb-12">
        {/* TOP BAR / HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {section === 'subjects' ? 'Teacher Subject Assignments' : section === 'batches' ? 'Teacher Batch Assignments' : section === 'schedule' ? 'Class Schedule' : 'Faculty & Classes'}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {section === 'directory'
                ? 'Manage teaching instructors, course subject allocations, weekly timetables, and student batch loads.'
                : `Authorized branch view for ${branch?.name ?? 'the selected branch'}.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {canManage && section === 'directory' && (
              <Button
                type="button"
                size="sm"
                onClick={() => {setEditingFaculty(null);setAddFacultyOpen(true)}}
                className="h-8.5 text-xs px-3.5 gap-1.5 bg-[#940016] text-white hover:bg-[#7a0012] shadow-xs cursor-pointer"
              >
                <UserPlus size={14} />
                <span>+ Add Faculty Member</span>
              </Button>
            )}
          </div>
        </div>

        {section !== 'directory' && <ModuleNav section={section} />}

        <State loading={!current} error={current?.error} retry={retry}>
          {data && section === 'directory' && (
            <>
              {/* SUBJECT FILTER PILLS */}
              <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
                {subjectFilters.map(
                  ({ id: subjectKey, label }) => {
                    const isActive = selectedSubject === subjectKey
                    const count = subjectPillCounts[subjectKey] ?? 0
                    return (
                      <button
                        key={subjectKey}
                        type="button"
                        onClick={() => setActiveSubject(subjectKey)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#940016] text-white shadow-xs'
                            : 'bg-white border border-border/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span>{label}</span>
                        <span
                          className={`text-[11px] font-medium ${
                            isActive ? 'text-white/90' : 'text-slate-400'
                          }`}
                        >
                          ({count})
                        </span>
                      </button>
                    )
                  }
                )}
              </div>

              {/* 4 COMPACT KPI CARDS */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Total Instructors */}
                <Card className="top-kpi-card kpi-maroon rounded-xl border p-4 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        TOTAL INSTRUCTORS
                      </p>
                      <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                        {totalInstructors}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span>Saved branch faculty</span>
                      </div>
                    </div>
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F9EBEE] text-[#940016] border border-[#f0d5d9]">
                      <UserCheck size={18} />
                    </div>
                  </div>
                </Card>

                {/* 2. Daily Lecture Slots */}
                <Card className="top-kpi-card kpi-emerald rounded-xl border p-4 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        DAILY LECTURE SLOTS
                      </p>
                      <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                        {totalDailySlots}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Today's saved assignments
                      </p>
                    </div>
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <CalendarDays size={18} />
                    </div>
                  </div>
                </Card>

                {/* 3. Student Reach */}
                <Card className="top-kpi-card kpi-sky rounded-xl border p-4 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        STUDENT REACH
                      </p>
                      <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                        {totalStudentReach}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Enrolled MDCAT &amp; FSc
                      </p>
                    </div>
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700 border border-sky-100">
                      <UsersRound size={18} />
                    </div>
                  </div>
                </Card>

                {/* 4. Active Classrooms */}
                <Card className="top-kpi-card kpi-amber rounded-xl border p-4 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        ACTIVE CLASSROOMS
                      </p>
                      <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
                        {new Set(enrichedTeachers.flatMap(t=>(t.assignments||[]).filter(a=>a.days.some(d=>d.slice(0,3).toLowerCase()===new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Karachi',weekday:'short'}).format(new Date()).toLowerCase())).map(a=>a.room?.trim().toLowerCase())).filter(Boolean)).size}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Lecture halls in use
                      </p>
                    </div>
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                      <DoorOpen size={18} />
                    </div>
                  </div>
                </Card>
              </div>

              {/* MAIN CONTENT: 2-COLUMN DESKTOP (~65% LEFT, ~35% RIGHT) */}
              <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
                {/* LEFT COLUMN: ROSTER + CAMPUS SHIFT DISTRIBUTION */}
                <div className="space-y-4 lg:col-span-7 xl:col-span-8">
                  {/* Faculty Roster Card */}
                  <Card className="rounded-xl border border-border/80 bg-white shadow-xs overflow-hidden">
                    {/* Roster Header with Circular Toolbar Buttons */}
                    <div className="flex flex-col gap-3 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          aria-label="Select all instructors"
                          title="Select all on this page"
                          checked={isPageSelected}
                          onChange={toggleSelectPage}
                          className="size-4 rounded border-gray-300 text-[#940016] focus:ring-[#940016] cursor-pointer shrink-0"
                        />
                        <h2 className="text-sm font-bold text-slate-900">
                          Faculty Roster
                        </h2>
                        <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          {visibleTeachers.length} Showing
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Accessible test status matcher */}
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          {visibleTeachers.length} / {data.teachers.length} teachers
                        </span>

                        <div className="relative w-40 sm:w-52">
                          <Search
                            size={14}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            type="search"
                            role="searchbox"
                            aria-label="Search faculty"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter instructor..."
                            className="h-8 pl-8 text-xs bg-white rounded-lg border-border/80"
                          />
                        </div>

                        {/* THREE WORKING CIRCULAR TOOLBAR ACTIONS */}
                        <TableToolbarActions
                          onRefresh={retry}
                          onExportPdf={handleExportPdf}
                          onExportCsv={handleExportCsv}
                          showColumns={false}
                          showFilter={false}
                          exportScopeSummary={getExportScope().summary}
                        />
                      </div>
                    </div>

                    {/* Bulk Action Bar when rows are selected */}
                    {selectedCount > 0 && (
                      <div className="p-3 border-b border-border/60 bg-[#F9EBEE]/40">
                        <BulkActionBar
                          selectedCount={selectedCount}
                          totalCount={visibleTeachers.length}
                          onClear={clearSelection}
                          onSelectAllMatching={selectAllMatching}
                          isAllMatchingSelected={isAllMatchingSelected}
                          onExportCsv={handleExportCsv}
                          onExportPdf={handleExportPdf}
                        />
                      </div>
                    )}

                    {/* Teacher Rows List */}
                    {visibleTeachers.length === 0 ? (
                      <div className="py-12 text-center text-xs text-muted-foreground">
                        {data.teachers.length === 0
                          ? 'No faculty members are assigned to this branch.'
                          : 'No instructors match the search or subject filter.'}
                      </div>
                    ) : (
                      <div className="divide-y divide-border/60">
                        {visibleTeachers.map((teacher) => {
                          const isSelectedRow = selectedTeacher?.id === teacher.id
                          const isRowChecked = isSelected(teacher.id)
                          const initials = teacher.displayName
                            .split(' ')
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()

                          return (
                            <div
                              key={teacher.id}
                              onClick={() => setSelectedTeacherId(teacher.id)}
                              className={`flex flex-col gap-3 p-4 transition-all sm:flex-row sm:items-center sm:justify-between cursor-pointer ${
                                isSelectedRow
                                  ? 'border-l-4 border-l-[#940016] bg-[#F9EBEE]/35'
                                  : 'hover:bg-slate-50/70 border-l-4 border-l-transparent'
                              }`}
                            >
                              {/* Left: Checkbox, Avatar & Info */}
                              <div className="flex items-center gap-3 min-w-0">
                                <input
                                  type="checkbox"
                                  aria-label={`Select ${teacher.displayName || teacher.name}`}
                                  checked={isRowChecked}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    toggleSelect(teacher.id)
                                  }}
                                  className="size-4 rounded border-gray-300 text-[#940016] focus:ring-[#940016] cursor-pointer shrink-0"
                                />

                                <div
                                  className={`flex size-10 shrink-0 items-center justify-center rounded-full font-bold text-xs border ${
                                    isSelectedRow
                                      ? 'bg-[#940016] text-white border-[#940016]'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {initials}
                                </div>

                                <div className="min-w-0 space-y-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <Link
                                      to={`/faculty/${encodeURIComponent(teacher.id)}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="font-bold text-sm text-slate-900 hover:text-[#940016] hover:underline"
                                    >
                                      {teacher.name}
                                    </Link>

                                    {teacher.qualification && (
                                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200/60">
                                        {teacher.qualification}
                                      </span>
                                    )}

                                    {isSelectedRow && (
                                      <span className="rounded bg-[#008080] text-white px-1.5 py-0.2 text-[9px] font-bold">
                                        Selected
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-xs text-muted-foreground truncate">
                                    <span className="font-semibold text-slate-800">
                                      {teacher.subject}
                                    </span>
                                    <span className="mx-1.5">•</span>
                                    <span>{teacher.coursesText}</span>
                                    <span className="mx-1.5">•</span>
                                    <span>{teacher.shiftsText}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Right: Students & Action Button */}
                              <div className="flex items-center justify-between gap-3 sm:justify-end shrink-0 pl-7 sm:pl-0">
                                <div className="text-right">
                                  <p className="text-xs font-bold text-slate-900">
                                    {teacher.studentReach} Students
                                  </p>
                                  <p className="flex items-center justify-end gap-1 text-[11px] font-medium text-emerald-600">
                                    <span className="size-1.5 rounded-full bg-emerald-500" />
                                    <span>Active</span>
                                  </p>
                                </div>

                                {can(PERMISSIONS.USERS_MANAGE)&&<div className="flex items-center gap-1" onClick={e=>e.stopPropagation()}><Button size="sm" variant="outline" aria-label={`Edit faculty ${teacher.name}`} onClick={()=>{setEditingFaculty(teacher);setAddFacultyOpen(true)}}><Edit2 size={13}/></Button><Button size="sm" variant="outline" aria-label={`Delete faculty ${teacher.name}`} onClick={()=>{setFacultyError('');setDeletingFaculty(teacher)}}><Trash2 size={13}/></Button></div>}
                                <div>
                                  {isSelectedRow ? (
                                    <Button
                                      size="sm"
                                      type="button"
                                      className="h-7 px-3 text-xs font-semibold bg-[#940016] text-white hover:bg-[#7a0012] shadow-xs cursor-pointer"
                                    >
                                      Active View
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      type="button"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedTeacherId(teacher.id)
                                      }}
                                      className="h-7 px-3 text-xs font-medium text-slate-700 border-border/80 hover:bg-slate-100 cursor-pointer"
                                    >
                                      View Profile
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Pagination Footer */}
                    <div className="flex items-center justify-between border-t border-border/70 bg-slate-50/50 px-4 py-3 text-xs text-muted-foreground">
                      <p>
                        Showing 1 to {visibleTeachers.length} of {data.teachers.length} Instructors
                      </p>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="size-7 p-0 text-xs border-border/80"
                          disabled
                        >
                          <ChevronLeft size={14} />
                        </Button>
                        <Button
                          size="sm"
                          className="size-7 p-0 text-xs font-semibold bg-[#940016] text-white hover:bg-[#7a0012]"
                        >
                          1
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="size-7 p-0 text-xs border-border/80"
                        >
                          2
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="size-7 p-0 text-xs border-border/80"
                        >
                          <ChevronRight size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Campus Shift Distribution Overview */}
                  <Card className="rounded-xl border border-border/80 bg-white p-4 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <LayoutGrid size={16} className="text-[#940016]" />
                        <span>Campus Shift Distribution Overview</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        Today &middot; Asia/Karachi
                      </span>
                    </div>

                    <p className="mt-2 text-[10px] text-muted-foreground">Today only. Time elapsed is scheduled time, not attendance or syllabus completion. Weekend is a summary of the same morning/evening classes.</p>
                    <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-3">
                      {shiftCards.map(shift=><div key={shift.label} className="min-w-0 overflow-hidden rounded-xl border border-border/80 bg-slate-50/60 p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="min-w-0 truncate font-bold text-slate-900" title={shift.label}>{shift.label}</span>
                          <span className="min-w-0 truncate font-mono text-[10px] text-muted-foreground" title={shift.time}>{shift.time}</span>
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">{shift.lectures} Lectures today &middot; {shift.batches} Batches active</p>
                        <div className="mt-2 text-[11px] text-muted-foreground">Class time elapsed <strong>{shift.lectures?`${shift.progress}%`:"No classes today"}</strong><div role="progressbar" aria-label={`${shift.label} scheduled time elapsed`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={shift.progress} className="mt-1 h-1.5 rounded-full bg-slate-200"><div className="h-1.5 rounded-full bg-primary" style={{width:`${shift.progress}%`}} /></div></div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                            <span>Seats filled</span>
                            <span className="font-bold text-slate-900" title={shift.percentage===null?'Configure capacity for every linked batch.':`${shift.enrolled} enrolled / ${shift.capacity} configured seats`}>{shift.percentage===null?'Capacity not configured':`${shift.enrolled}/${shift.capacity} (${shift.percentage}%)`}</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200">
                            <div className="h-1.5 rounded-full bg-[#940016]" style={{width:`${Math.min(100,shift.percentage??0)}%`}} />
                          </div>
                        </div>
                      </div>)}
                    </div>
                  </Card>
                </div>

                {/* RIGHT COLUMN: SELECTED TEACHER DETAIL PANEL (~35%) */}
                <div className="lg:col-span-5 xl:col-span-4">
                  {selectedTeacher ? (
                    <Card className="rounded-xl border border-border/80 bg-white p-5 shadow-xs space-y-4">
                      {/* Teacher Profile Card Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex size-13 shrink-0 items-center justify-center rounded-full bg-[#940016]/10 text-[#940016] font-bold text-base border border-[#940016]/20">
                            {selectedTeacher.displayName
                              .split(' ')
                              .map((p) => p[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-900">
                              {selectedTeacher.displayName}
                            </h3>
                            <p className="text-xs text-slate-600 font-medium">
                              {selectedTeacher.department}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone size={12} className="text-slate-400" />
                                <span>{selectedTeacher.contact}</span>
                              </p>
                              {selectedTeacher.contact && (
                                <a
                                  href={`https://wa.me/${selectedTeacher.contact.replace(/[^0-9]/g, '').startsWith('0') ? '92' + selectedTeacher.contact.replace(/[^0-9]/g, '').slice(1) : selectedTeacher.contact.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${selectedTeacher.displayName}, regarding The Scholar Coaching Academy classes:`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold transition-colors cursor-pointer shadow-2xs"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageSquare size={11} className="text-emerald-600" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/faculty/${encodeURIComponent(selectedTeacher.id)}`)}
                            className="h-7 px-2.5 text-xs font-semibold text-[#940016] border-[#f0d5d9] bg-[#F9EBEE]/60 hover:bg-[#F9EBEE] cursor-pointer"
                          >
                            Full Profile →
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/faculty/${encodeURIComponent(selectedTeacher.id)}`)}
                            className="size-7 p-0 text-muted-foreground hover:text-slate-900 cursor-pointer"
                            title="Open Full Profile"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </div>
                      </div>

                      {/* 3 Metrics Box Row */}
                      <div className="grid grid-cols-3 divide-x divide-border/70 rounded-xl border border-border/80 bg-slate-50/60 py-2.5 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Batches</p>
                          <p className="mt-0.5 text-base font-extrabold text-slate-900">
                            {selectedTeacher.batchCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Weekly Hrs</p>
                          <p className="mt-0.5 text-base font-extrabold text-slate-900">
                            {selectedTeacher.weeklyHours}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Students</p>
                          <p className="mt-0.5 text-base font-extrabold text-slate-900">
                            {selectedTeacher.studentReach}
                          </p>
                        </div>
                      </div>

                      {/* Current status derives from today's saved teacher schedule. */}
                      <div className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-border/70 bg-slate-50/80 px-2.5 py-2">
                        <span className="min-w-0 truncate text-[11px] font-semibold text-slate-800" title="Today's saved class schedule status">Selected class status</span>
                        <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
                          <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${teacherSessionStatus.type==='in-progress'?'bg-emerald-100 text-emerald-800':'bg-muted text-muted-foreground'}`} title="Based on saved class times in Asia/Karachi">{teacherSessionStatus.label}</span>
                        </div>
                      </div>

                      {/* ASSIGNED CLASSES & TIMETABLE */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                            ASSIGNED CLASSES &amp; TIMETABLE
                          </span>
                          <span className="font-bold text-slate-700">
                            {selectedTeacher.slots?.length || 0} Slots
                          </span>
                        </div>

                        {selectedTeacher.slots && selectedTeacher.slots.length > 0 ? (
                          <div className="space-y-2">
                            {selectedTeacher.slots.map((slot) => {
                              const isSelected = activeSlot?.id === slot.id
                              return (
                                <div
                                  key={slot.id}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setSelectedSlotId(slot.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault()
                                      setSelectedSlotId(slot.id)
                                    }
                                  }}
                                  className={`group min-w-0 overflow-hidden rounded-xl border p-3 transition-all cursor-pointer ${
                                    isSelected
                                      ? 'border-[#940016] bg-[#940016]/[0.035] ring-2 ring-[#940016]/20 shadow-xs'
                                      : 'border-border/70 bg-white hover:border-[#940016]/40 hover:bg-slate-50/70'
                                  }`}
                                >
                                  <div className="flex min-w-0 items-center justify-between gap-2">
                                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                                      <span title={slot.course} className="min-w-0 truncate font-bold text-xs text-slate-900">
                                        {slot.course}
                                      </span>
                                      {(location.state?.fromDashboard || location.state?.classId) && isSelected && <span className="sr-only">Selected from dashboard</span>}
                                    </div>
                                    <div className="flex min-w-0 max-w-[40%] items-center gap-1.5">
                                      <span title={slot.room} className="min-w-0 truncate rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
                                        {slot.room}
                                      </span>
                                      {canManage && slot.assignmentId && (
                                        <button
                                          type="button"
                                          title="Remove class assignment"
                                          aria-label={`Remove assignment for ${slot.course}`}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setFacultyError('')
                                            setDeletingAssignment(slot)
                                          }}
                                          className="text-slate-400 hover:text-red-600 p-0.5 rounded transition-colors cursor-pointer"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="mt-1 truncate text-[10px] font-medium text-muted-foreground" title={slot.batch}>Batch: {slot.batch}</p>
                                  <p title={slot.subject} className="mt-1 truncate text-xs text-slate-600 font-medium">
                                    {slot.subject}
                                  </p>
                                  <div className="mt-2.5 flex min-w-0 flex-col gap-2 text-[10px] text-muted-foreground">
                                    <span className="flex min-w-0 items-center gap-1.5 font-medium text-slate-700">
                                      <Clock size={12} className="text-slate-400" />
                                      <span className="truncate" title={`${slot.days} - ${slot.time}`}>{slot.days} • {slot.time}</span>
                                    </span>
                                    <div className="flex w-full items-center justify-between gap-2 whitespace-nowrap">
                                      <span className="font-semibold text-slate-800">
                                        {slot.students} Students
                                      </span>
                                      {slot.batchId && <Button type="button" variant="ghost" size="xs" className="h-6 px-1.5 text-[11px] font-medium text-[#940016] hover:bg-[#940016]/10 cursor-pointer" onClick={event=>{event.stopPropagation();setBatchStudentsConfig({open:true,teacher:selectedTeacher,initialBatchId:slot.batchId,subjectId:slot.subjectId,subjectName:slot.subject,subjectOnly:true})}}>View Students</Button>}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="py-6 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                            No classes assigned to this instructor yet.
                          </div>
                        )}
                      </div>

                      {/* Syllabus Progress */}
                      <div className="space-y-1.5 pt-1 border-t border-border/60">
                        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                          <span className="text-muted-foreground font-medium">
                            Lecture Syllabus Progress
                          </span>
                          <span className="font-bold text-emerald-700">
                            Completion not recorded
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200">
                          <div
                            className="h-1.5 rounded-full bg-emerald-600"
                            style={{ width: '0%' }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-2">
                        <div className="grid grid-cols-2 gap-2">
                          {canManage && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setAssignModalConfig({ open: true, teacher: selectedTeacher })}
                              className="h-8.5 text-xs font-semibold gap-1.5 border-border/80 hover:bg-slate-50 cursor-pointer"
                            >
                              <Edit2 size={13} />
                              <span>Edit Batches</span>
                            </Button>
                          )}

                          {canManage && <Button
                            type="button" variant="outline" size="sm"
                            onClick={() => setAssignModalConfig({ open: true, teacher: selectedTeacher, addNew: true })}
                            className="h-8.5 text-xs font-semibold gap-1.5 border-border/80 hover:bg-slate-50 cursor-pointer">
                            <Plus size={13} /><span>Add Class</span>
                          </Button>}
                        </div>

                        <Button
                          type="button"
                          size="sm"
                          onClick={handlePrintTimetable}
                          className="h-9 w-full text-xs font-bold gap-1.5 bg-[#940016] text-white hover:bg-[#7a0012] shadow-xs cursor-pointer"
                        >
                          <Printer size={14} />
                          <span>Print Instructor Timetable</span>
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <div className="py-12 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                      Select an instructor from the roster to inspect timetable details.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {data && section === 'subjects' && (
            <SectionCard title="Saved subject assignments" icon={BookOpen}>
              <p className="text-sm text-muted-foreground">
                {data.subjectAssignments?.available
                  ? 'No teacher subject assignments are saved for this branch.'
                  : 'Subject records and teacher-subject assignment links are not available in the approved DEMO data model yet. This view is read-only; no assignments were inferred.'}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Current teacher accounts: {data.teachers.length}. New or removed assignments require an approved subject model and assignment policy.
              </p>
            </SectionCard>
          )}

          {data && section === 'batches' && (
            <SectionCard title="Saved branch batches" icon={GraduationCap}>
              {data.batchAssignments.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No saved batches are available in this branch.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.batchAssignments.map((batch) => (
                    <article key={batch.id} className="min-w-0 rounded-lg border p-4">
                      <h2 className="break-words font-semibold">{batch.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">Course: {batch.courseName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Teacher assignment: {batch.teacherAssignments.length ? batch.teacherAssignments.join(', ') : 'None saved'}
                      </p>
                      <Button asChild className="mt-3" variant="outline">
                        <Link to={`/faculty/classes/${encodeURIComponent(batch.id)}`}>View enrolled students</Link>
                      </Button>
                    </article>
                  ))}
                </div>
              )}
              <p className="mt-4 text-sm text-muted-foreground">
                Teacher-batch assignment records are not part of the current DEMO data model. No teacher is assumed to belong to a batch.
              </p>
            </SectionCard>
          )}


        </State>

        {/* MODALS */}
        {addFacultyOpen && (
          <AddFacultyModal
            teacher={editingFaculty}
            open={addFacultyOpen}
            onClose={() => setAddFacultyOpen(false)}
            branchId={branchId}
            onFacultyAdded={(newTeacher) => {
              retry()
              setSelectedTeacherId(newTeacher.id)
            }}
          />
        )}

        {deletingAssignment&&<Dialog open onOpenChange={open=>{if(!open&&!deleteBusy)setDeletingAssignment(null)}}><DialogContent><DialogHeader><DialogTitle>Remove Class Assignment</DialogTitle><DialogDescription>Remove {deletingAssignment.subject} from {deletingAssignment.course}? Other assignments will be kept.</DialogDescription></DialogHeader>{facultyError&&<p role="alert">{facultyError}</p>}<div className="flex justify-end gap-2"><Button variant="outline" disabled={deleteBusy} onClick={()=>setDeletingAssignment(null)}>Cancel</Button><Button variant="destructive" disabled={deleteBusy} onClick={async()=>{setDeleteBusy(true);try{if(deletingAssignment.isSession)await classScheduleService.delete(deletingAssignment.classId,{branchId});else await facultyService.removeAssignment(deletingAssignment.assignmentId,{branchId});setDeletingAssignment(null);retry()}catch(error){setFacultyError(error.message)}finally{setDeleteBusy(false)}}}>Delete Assignment</Button></div></DialogContent></Dialog>}
        {deletingFaculty&&<Dialog open onOpenChange={open=>{if(!open&&!deleteBusy)setDeletingFaculty(null)}}><DialogContent><DialogHeader><DialogTitle>Delete Faculty Member</DialogTitle><DialogDescription>Delete {deletingFaculty.name}? Linked records are protected. This cannot be undone.</DialogDescription></DialogHeader>{facultyError&&<p role="alert">{facultyError}</p>}<div className="flex justify-end gap-2"><Button variant="outline" disabled={deleteBusy} onClick={()=>setDeletingFaculty(null)}>Cancel</Button><Button variant="destructive" disabled={deleteBusy} onClick={async()=>{setDeleteBusy(true);try{await facultyService.deleteTeacher(deletingFaculty.id,{branchId});setDeletingFaculty(null);setSelectedTeacherId(null);retry()}catch(error){setFacultyError(error.message)}finally{setDeleteBusy(false)}}}>Delete Faculty</Button></div></DialogContent></Dialog>}
        {assignModalConfig && (
          <AssignFacultyModal
            open={assignModalConfig.open}
            onClose={() => setAssignModalConfig(null)}
            teachers={data?.teachers || []}
            batches={data?.batches || []}
            subjects={data?.subjects || []}
            courses={data?.courses || []}
            streams={data?.streams || []}
            assignments={assignModalConfig.addNew ? [] : assignModalConfig.teacher?.assignments || []}
            branchId={branchId}
            initialTeacherId={assignModalConfig.teacher?.id}
            onAssigned={() => {
              retry()
              setAssignModalConfig(null)
            }}
          />
        )}
        {batchStudentsConfig && <BatchStudentsModal open={batchStudentsConfig.open} onClose={()=>setBatchStudentsConfig(null)} teacher={batchStudentsConfig.teacher} initialBatchId={batchStudentsConfig.initialBatchId} subjectId={batchStudentsConfig.subjectId} subjectName={batchStudentsConfig.subjectName} subjectOnly={batchStudentsConfig.subjectOnly} branchId={branchId}/>}
      </div>
    </DashboardLayout>
  )
}
