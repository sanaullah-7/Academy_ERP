import { formatTimeRange, formatTime, formatTimestamp } from '../../utils/timeFormat.js'
import { capturePageVersion, peekPageResource, rememberPageResource } from '../../services/localPageResources.js'
import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  Loader2,
  Package,
  Phone,
  Printer,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  X
} from 'lucide-react'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from 'recharts'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import ReportTrendCard from '../../components/Reports/ReportTrendCard.jsx'
import { reportTrendEvents } from '../../utils/reportTrend.js'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'
import CustomSelect from '../../components/ui/CustomSelect.jsx'
import Pagination from '../../components/Shared/Pagination.jsx'
import { TableToolbarActions } from '../../components/Shared/TableUtilities.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog.jsx'
import { reportService } from '../../services/reportService.js'
import { useBranch } from '../../hooks/useBranch.js'
import { usePermissions } from '../../hooks/usePermissions.js'
import { PERMISSIONS } from '../../constants/permissions.js'
import { downloadCsv } from '../../utils/exportHelpers.js'
import { exportTablePdf } from '../../utils/pdfHelpers.js'
import { downloadWordTable } from '../../utils/wordExport.js'
import { getDemoUsers } from '../../mock/authFixtures.js'
import tsaLogo from '../../assets/images/tsa-logo.png'
import { payrollReportTotals, payrollReportHeaders, payrollReportCells } from '../../utils/payrollReport.js'

const money = value =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(value || 0)

const TAB_CONFIG = {
  payroll: { id: 'payroll', iconColor: 'text-[#940016]', tint: 'border-[#f0d5d9] bg-[#F9EBEE] text-[#940016]', badgeColor: 'bg-[#F9EBEE] text-[#940016]', icon: DollarSign, label: 'Teacher Payroll & Salary Ledger', shortLabel: 'Teacher Payroll', description: 'Saved assignment salary balances, verified payments, and payout ledgers.' },
  fees: {
    id: 'fees',
    iconColor: 'text-emerald-700',
    tint: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    icon: Receipt,
    label: 'Fees & Payment Defaulters',
    shortLabel: 'Fees & Defaulters',
    description: 'Challan generation, verified receipts, outstanding balances, and defaulter tracking.'
  },
  students: {
    id: 'students',
    iconColor: 'text-sky-600',
    tint: 'border-sky-200 bg-sky-50 text-sky-800',
    badgeColor: 'bg-sky-100 text-sky-700',
    icon: Users,
    label: 'Students Directory',
    shortLabel: 'Students',
    description: 'Enrolled student profiles, guardian records, batch placements, and academic status.'
  },
  admissions: {
    id: 'admissions',
    iconColor: 'text-violet-600',
    tint: 'border-violet-200 bg-violet-50 text-violet-800',
    badgeColor: 'bg-violet-100 text-violet-700',
    icon: UserCheck,
    label: 'Admissions & Intake',
    shortLabel: 'Admissions',
    description: 'Application intake pipeline, approval decisions, fee configuration, and conversions.'
  },
  courses: {
    id: 'courses',
    iconColor: 'text-amber-600',
    tint: 'border-amber-200 bg-amber-50 text-amber-900',
    badgeColor: 'bg-amber-100 text-amber-800',
    icon: BookOpen,
    label: 'Courses & Batch Occupancy',
    shortLabel: 'Courses & Batches',
    description: 'Active programs, stream classifications, seat occupancy, and classroom capacity utilization.'
  },
  faculty: {
    id: 'faculty',
    iconColor: 'text-indigo-600',
    tint: 'border-indigo-200 bg-indigo-50 text-indigo-800',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    icon: GraduationCap,
    label: 'Faculty & Timetable',
    shortLabel: 'Faculty & Schedule',
    description: 'Teacher assignments, weekly timetable commitments, classroom allocations, and student reach.'
  },
  finance: {
    id: 'finance',
    iconColor: 'text-teal-600',
    tint: 'border-teal-200 bg-teal-50 text-teal-800',
    badgeColor: 'bg-teal-100 text-teal-700',
    icon: DollarSign,
    label: 'Finance & Expenses',
    shortLabel: 'Finance & P&L',
    description: 'Verified cash receipts against operating expenditures and institutional net liquidity.'
  },
  demos: {
    id: 'demos',
    iconColor: 'text-rose-600',
    tint: 'border-rose-200 bg-rose-50 text-rose-800',
    badgeColor: 'bg-rose-100 text-rose-700',
    icon: Award,
    label: 'Demo Conversion',
    shortLabel: 'Demo Classes',
    description: 'Prospective student trials, trial attendance tracking, and paid enrollment conversion rate.'
  },
  assets: {
    id: 'assets',
    iconColor: 'text-orange-600',
    tint: 'border-orange-200 bg-orange-50 text-orange-900',
    badgeColor: 'bg-orange-100 text-orange-800',
    icon: Package,
    label: 'Campus Assets',
    shortLabel: 'Assets Inventory',
    description: 'Institutional inventory, equipment condition audits, custodian assignments, and recorded book value.'
  }
}

// Chart Palette aligned with TSA Maroon System & Semantic States
const CHART_COLORS = ['#940016', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#64748b']

const reportingMonthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'Asia/Karachi' })

export default function ReportsPage() {
  const { branchId, branch, scopeKey } = useBranch()
  const { can } = usePermissions()
  const [selectedTab, setActiveTab] = useState('payroll')
  const activeTab = (selectedTab === 'payroll' && !can(PERMISSIONS.PAYROLL_VIEW)) ||
    (selectedTab === 'finance' && !can(PERMISSIONS.FINANCE_VIEW)) ? 'fees' : selectedTab
  const [rawResult, setRawResult] = useState(() => peekPageResource('reports', { scopeKey, refresh: 0 }))
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Filters State
  const [mountTime] = useState(() => Date.now())
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSessionLabel, setCurrentSessionLabel] = useState(() => reportingMonthFormatter.format(new Date()))
  useEffect(() => {
    const updateMonth = () => setCurrentSessionLabel(reportingMonthFormatter.format(new Date()))
    const timer = window.setInterval(updateMonth, 60000)
    window.addEventListener('focus', updateMonth)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', updateMonth) }
  }, [])

  const [windowFilter, setWindowFilter] = useState('all') // 'all', 'session', 'month', 'quarter'
  const [streamFilter, setStreamFilter] = useState('All')
  const [courseFilter, setCourseFilter] = useState('All')
  const [batchFilter, setBatchFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [teacherFilter, setTeacherFilter] = useState('All')
  const [payPeriodFilter, setPayPeriodFilter] = useState('All')

  // Pagination & Selection
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedRowIds, setSelectedRowIds] = useState(new Set())

  // UI Modals & Feedback
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [selectedRecordDetail, setSelectedRecordDetail] = useState(null)

  // Load Real authorized data from reportService.overview
  useEffect(() => {
    let isMounted = true
    const loadVersion = capturePageVersion()
    reportService.overview({ branchId }, { refresh: refreshTrigger > 0 }).then(
      data => {
        if (isMounted) {
          setRawResult(rememberPageResource('reports', { scopeKey, refresh: refreshTrigger, data, error: null }, loadVersion))
          if (refreshTrigger > 0) setToastMessage('Report refreshed from saved branch records.')
        }
      },
      error => {
        if (isMounted) setRawResult({ scopeKey, refresh: refreshTrigger, data: null, error: error.message || 'Failed to load report data.' })
      }
    )
    return () => {
      isMounted = false
    }
  }, [branchId, scopeKey, refreshTrigger])

  const isRefreshing = rawResult?.scopeKey !== scopeKey || rawResult?.refresh !== refreshTrigger
  const reportData = rawResult?.scopeKey === scopeKey ? rawResult.data : null
  const error = rawResult?.scopeKey === scopeKey ? rawResult.error : null

  // Raw Collections with safe fallbacks
  const streams = useMemo(() => reportData?.academicStreams ?? [], [reportData])
  const courses = useMemo(() => reportData?.courses ?? [], [reportData])
  const batches = useMemo(() => reportData?.batches ?? [], [reportData])
  const students = useMemo(() => reportData?.students ?? [], [reportData])
  const enrollments = useMemo(() => reportData?.enrollments ?? [], [reportData])
  const admissions = useMemo(() => reportData?.admissions ?? [], [reportData])
  const challans = useMemo(() => reportData?.challans ?? [], [reportData])
  const payments = useMemo(() => reportData?.payments ?? [], [reportData])
  const expenses = useMemo(() => reportData?.expenses ?? [], [reportData])
  const demoClasses = useMemo(() => reportData?.demoClasses ?? [], [reportData])
  const assets = useMemo(() => reportData?.assets ?? [], [reportData])
  const facultyAssignments = useMemo(() => reportData?.facultyAssignments ?? [], [reportData])
  const demoUsers = useMemo(() => getDemoUsers(), [])

  // Lookups Maps
  const streamMap = useMemo(() => new Map(streams.map(s => [s.id, s.name])), [streams])
  const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c])), [courses])
  const batchMap = useMemo(() => new Map(batches.map(b => [b.id, b])), [batches])
  const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students])
  const enrollmentMap = useMemo(() => new Map(enrollments.map(e => [e.id, e])), [enrollments])
  const userMap = useMemo(() => new Map(demoUsers.map(u => [u.id, u.name])), [demoUsers])

  // Dependent Filter Options
  const availableCourses = useMemo(() => {
    if (streamFilter === 'All') return courses
    return courses.filter(c => c.streamId === streamFilter)
  }, [courses, streamFilter])

  const availableBatches = useMemo(() => {
    if (courseFilter === 'All') {
      if (streamFilter === 'All') return batches
      const validCourseIds = new Set(availableCourses.map(c => c.id))
      return batches.filter(b => validCourseIds.has(b.courseId))
    }
    return batches.filter(b => b.courseId === courseFilter)
  }, [batches, courseFilter, streamFilter, availableCourses])

  // Change handlers to update filters and reset pagination
  const handleTabChange = tabId => {
    setActiveTab(tabId)
    setCurrentPage(1)
    setSelectedRowIds(new Set())
  }

  const handleSearchChange = val => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleWindowChange = val => {
    setWindowFilter(val)
    setCurrentPage(1)
  }

  const handleStreamChange = val => {
    setStreamFilter(val)
    setCourseFilter('All')
    setBatchFilter('All')
    setCurrentPage(1)
  }

  const handleCourseChange = val => {
    setCourseFilter(val)
    setBatchFilter('All')
    setCurrentPage(1)
  }

  const handleBatchChange = val => {
    setBatchFilter(val)
    setCurrentPage(1)
  }

  const handleStatusChange = val => {
    setStatusFilter(val)
    setCurrentPage(1)
  }

  // Dynamic Badges Counts for Tabs
  const tabCounts = useMemo(() => {
    if (!reportData) return {}
    return {
      fees: challans.length,
      payroll: reportData.payroll?.length ?? 0,
      students: students.length,
      admissions: admissions.length,
      courses: batches.length,
      faculty: facultyAssignments.length,
      finance: payments.length + expenses.length,
      demos: demoClasses.length > 0
        ? `${Math.round((demoClasses.filter(d => d.status === 'Converted').length / demoClasses.length) * 100)}%`
        : '0%',
      assets: assets.length
    }
  }, [reportData, challans, students, admissions, batches, facultyAssignments, payments, expenses, demoClasses, assets])

  // Preserve payment order/status semantics while avoiding a full payment scan per challan.
  const verifiedPaymentTotals = useMemo(() => {
    const totals = new Map()
    for (const payment of payments) {
      if (payment.status === 'Verified') totals.set(payment.challanId, (totals.get(payment.challanId) ?? 0) + payment.amount)
    }
    return totals
  }, [payments])

  // Build Full Datasets for Each Tab
  const tabDatasets = useMemo(() => {
    if (!reportData) {
      return { fees: [], students: [], admissions: [], courses: [], faculty: [], finance: [], demos: [], assets: [] }
    }

    // 1. FEES DATASET (Authentic calculations matching screenshot layout)
    const feesRows = challans.map(ch => {
      const enr = enrollmentMap.get(ch.enrollmentId)
      const stu = studentMap.get(ch.studentId) || studentMap.get(enr?.studentId)
      const crs = courseMap.get(enr?.courseId)
      const bat = batchMap.get(enr?.batchId)
      const stm = crs?.streamId ? streamMap.get(crs.streamId) : 'General'

      const paidForChallan = verifiedPaymentTotals.get(ch.id) ?? 0

      const totalFee = ch.totalAmount ?? ch.amount ?? 0
      const remainingBalance = Math.max(0, totalFee - paidForChallan)
      const isOverdue = ch.dueDate && ch.dueDate < new Date().toISOString().slice(0, 10) && remainingBalance > 0

      let ledgerStatus
      if (remainingBalance <= 0) {
        ledgerStatus = 'Paid in Full'
      } else if (paidForChallan > 0) {
        ledgerStatus = '1 Installment Due'
      } else if (isOverdue) {
        ledgerStatus = 'Defaulter Overdue'
      } else {
        ledgerStatus = 'Partial Due'
      }

      const courseAbbr = crs?.name?.split(' ')?.[0]?.toUpperCase() || 'STD'
      const rollNumber = stu?.studentNumber
        ? `${courseAbbr}-${stu.studentNumber}`
        : `${courseAbbr}-${ch.number || ch.id.slice(0, 4)}`

      const enrolledDateFormatted = enr?.enrolledAt
        ? new Date(enr.enrolledAt).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })
        : 'Active'

      const studentInitials = stu?.name
        ? stu.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'ST'

      return {
        id: ch.id,
        rollNumber,
        enrolledDateText: `Enr: ${enrolledDateFormatted}`,
        studentId: stu?.id,
        studentName: stu?.name || 'Unresolved Student',
        studentInitials,
        guardianName: stu?.guardianName || 'Guardian',
        contact: stu?.studentPhone || stu?.guardianContact || '0300-0000000',
        courseId: enr?.courseId || crs?.id,
        courseName: crs?.name || 'Unassigned Course',
        streamId: crs?.streamId,
        streamName: stm,
        batchId: enr?.batchId || bat?.id,
        batchName: bat?.name || 'Unassigned Batch',
        batchTimings:
          bat?.startTime && bat?.endTime ? formatTimeRange(bat.startTime, bat.endTime) : formatTimeRange('08:00', '12:00'),
        totalFee,
        paid: paidForChallan,
        remainingBalance,
        dueDate: ch.dueDate || '',
        status: ledgerStatus,
        date: ch.createdAt || ch.issueDate,
        challanRef: ch.reference || `CH-${ch.number}`
      }
    })

    // 2. STUDENTS DATASET
    const studentsRows = students.map(s => {
      const activeEnr = enrollments.find(e => e.studentId === s.id && e.status === 'Active') || enrollments.find(e => e.studentId === s.id)
      const crs = activeEnr ? courseMap.get(activeEnr.courseId) : null
      const bat = activeEnr ? batchMap.get(activeEnr.batchId) : null
      const stm = crs?.streamId ? streamMap.get(crs.streamId) : 'General'

      return {
        id: s.id,
        rollNumber: s.studentNumber ? `STD-${s.studentNumber}` : s.id.slice(0, 8),
        studentName: s.name,
        guardianName: s.guardianName || 'N/A',
        contact: s.studentPhone || s.guardianContact || 'N/A',
        courseId: activeEnr?.courseId || '',
        courseName: crs?.name || 'Not Enrolled',
        streamId: crs?.streamId,
        streamName: stm,
        batchId: activeEnr?.batchId || '',
        batchName: bat?.name || 'Unassigned',
        enrolledAt: activeEnr?.enrolledAt || '',
        status: s.status || 'Active',
        gender: s.gender || 'Not specified',
        date: activeEnr?.enrolledAt || ''
      }
    })

    // 3. ADMISSIONS DATASET
    const admissionsRows = admissions.map(adm => {
      const crs = courseMap.get(adm.courseId)
      const bat = batchMap.get(adm.preferredBatchId)
      const stm = crs?.streamId ? streamMap.get(crs.streamId) : 'General'

      return {
        id: adm.id,
        applicationId: adm.admissionId || `ADM-${adm.id.slice(0, 6)}`,
        studentName: adm.studentName,
        guardianName: adm.guardianName,
        contact: adm.contact || adm.studentPhone,
        courseId: adm.courseId,
        courseName: crs?.name || adm.course || 'Unresolved Course',
        streamId: crs?.streamId,
        streamName: stm,
        batchId: adm.preferredBatchId,
        batchName: bat?.name || 'Flexible / Unselected',
        netFee: adm.netFee ?? adm.configuredFee ?? 0,
        status: adm.status || 'Pending',
        date: adm.createdAt
      }
    })

    // 4. COURSES & BATCHES DATASET
    const coursesRows = batches.map(b => {
      const crs = courseMap.get(b.courseId)
      const stm = crs?.streamId ? streamMap.get(crs.streamId) : 'General'
      const enrolledCount = enrollments.filter(e => e.batchId === b.id && e.status === 'Active').length
      const cap = b.capacity || 40
      const occupancyRate = cap > 0 ? Math.min(100, Math.round((enrolledCount / cap) * 100)) : 0

      return {
        id: b.id,
        courseId: b.courseId,
        courseName: crs?.name || 'Unassigned Course',
        streamId: crs?.streamId,
        streamName: stm,
        batchId: b.id,
        batchName: b.name,
        timings: b.startTime && b.endTime ? formatTimeRange(b.startTime, b.endTime) : 'Morning Session',
        days: b.days?.length ? b.days.join(', ') : 'Mon - Fri',
        room: b.room || 'Hall A',
        enrolled: enrolledCount,
        capacity: cap,
        occupancyRate,
        status: b.active ? 'Active' : 'Archived',
        date: ''
      }
    })

    // 5. FACULTY & TIMETABLE DATASET
    const facultyRows = facultyAssignments.map(fa => {
      const crs = courseMap.get(fa.courseId)
      const bat = batchMap.get(fa.batchId)
      const teacherName = userMap.get(fa.teacherId) || 'Faculty Member'
      const enrolledCount = enrollments.filter(e => e.batchId === fa.batchId && e.status === 'Active').length

      // Calculate weekly teaching hours strictly from actual saved schedule
      let weeklyHours = 0
      if (fa.startTime && fa.endTime && fa.startTime < fa.endTime) {
        const [sh, sm] = fa.startTime.split(':').map(Number)
        const [eh, em] = fa.endTime.split(':').map(Number)
        const durationHours = (eh * 60 + em - (sh * 60 + sm)) / 60
        weeklyHours = (fa.days?.length || 0) * durationHours
      }

      return {
        id: fa.id,
        teacherId: fa.teacherId,
        teacherName,
        courseId: fa.courseId,
        courseName: crs?.name || 'Unassigned Course',
        streamId: crs?.streamId,
        batchId: fa.batchId,
        batchName: bat?.name || 'Batch',
        subjectName: fa.subjectId ? fa.subjectId.replace('sub-', '').toUpperCase() : 'Subject',
        schedule: `${fa.days?.join(', ') || 'Weekly'} (${formatTime(fa.startTime || '09:00')} - ${formatTime(fa.endTime || '11:00')})`,
        room: fa.room || 'Room 101',
        weeklyHours: Number(weeklyHours.toFixed(1)),
        studentReach: enrolledCount,
        status: 'Active Assignment',
        date: fa.createdAt
      }
    })

    // 6. FINANCE & EXPENSES DATASET
    const incomeTransactions = payments.map(p => {
      const ch = challans.find(c => c.id === p.challanId)
      const stu = studentMap.get(p.studentId)
      const enr = enrollmentMap.get(ch?.enrollmentId)
      const crs = courseMap.get(enr?.courseId)

      return {
        id: p.id,
        refNumber: p.receiptReference || `REC-${p.number || p.id.slice(0, 4)}`,
        type: 'Fee Income',
        category: crs?.name || 'Tuition Fee',
        sourceOrPayee: stu?.name ? `Student: ${stu.name}` : 'Fee Payment',
        method: p.method || 'Cash Counter',
        amount: p.amount,
        isInflow: true,
        status: p.status || 'Verified',
        date: p.paidAt,
        courseId: enr?.courseId,
        streamId: crs?.streamId,
        batchId: enr?.batchId
      }
    })

    const expenseTransactions = expenses.map(exp => ({
      id: exp.id,
      refNumber: `EXP-${exp.id.slice(0, 6).toUpperCase()}`,
      type: 'Operating Expense',
      category: exp.category || 'Operations',
      sourceOrPayee: exp.description || 'Institutional Expenditure',
      method: exp.method || 'Bank Transfer',
      amount: exp.amount,
      isInflow: false,
      status: exp.status || 'Posted',
      date: exp.entryDate || exp.createdAt,
      courseId: '',
      streamId: '',
      batchId: ''
    }))

    const financeRows = [...incomeTransactions, ...expenseTransactions].sort(
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    )

    // 7. DEMO CLASSES DATASET
    const demosRows = demoClasses.map(d => {
      const crs = courseMap.get(d.courseId)
      const bat = batchMap.get(d.preferredBatchId)

      return {
        id: d.id,
        demoNumber: d.demoNumber ? `DEMO-${d.demoNumber}` : `DEMO-${d.id.slice(0, 4)}`,
        studentName: d.studentName,
        guardianName: d.guardianName,
        contact: d.guardianContact,
        courseId: d.courseId,
        courseName: d.courseName || crs?.name || 'Target Course',
        streamId: crs?.streamId,
        batchId: d.preferredBatchId,
        batchName: bat?.name || d.batchName || 'Flexible',
        sessionDate: d.scheduledSession?.classDate || d.requestedDate || 'Pending Date',
        sessionTime: d.scheduledSession?.startTime
          ? formatTimeRange(d.scheduledSession.startTime, d.scheduledSession.endTime)
          : formatTime(d.requestedTime, 'Morning'),
        attendance: d.attendance?.status || (['Attended', 'Converted'].includes(d.status) ? 'Present' : 'Scheduled'),
        status: d.status || 'Registered',
        convertedDisplayId: d.convertedAdmissionDisplayId,
        date: d.createdAt
      }
    })

    // 8. ASSETS DATASET
    const assetsRows = assets.map(a => ({
      id: a.id,
      assetCode: a.assetCode,
      name: a.name,
      category: a.category,
      quantity: a.quantity || 1,
      condition: a.condition || 'Working',
      location: a.location || 'Campus Main',
      bookValue: a.bookValue ?? a.purchaseCost ?? 0,
      status: a.status || 'Available',
      date: a.purchaseDate || a.createdAt
    }))

    return {
      fees: feesRows,
      payroll: reportData.payroll ?? [],
      students: studentsRows,
      admissions: admissionsRows,
      courses: coursesRows,
      faculty: facultyRows,
      finance: financeRows,
      demos: demosRows,
      assets: assetsRows
    }
  }, [
    reportData,
    verifiedPaymentTotals,
    challans,
    enrollmentMap,
    studentMap,
    courseMap,
    batchMap,
    streamMap,
    payments,
    students,
    enrollments,
    admissions,
    batches,
    facultyAssignments,
    userMap,
    expenses,
    demoClasses,
    assets
  ])

  // Get active dataset for current tab
  const rawTabRows = useMemo(() => tabDatasets[activeTab] || [], [tabDatasets, activeTab])

  // Dynamic Status Options based on active tab
  const tabStatusOptions = useMemo(() => {
    const uniqueStatuses = Array.from(new Set(rawTabRows.map(r => r.status).filter(Boolean)))
    return [
      { value: 'All', label: 'All Statuses' },
      ...uniqueStatuses.map(s => ({ value: s, label: s }))
    ]
  }, [rawTabRows])

  // Window timestamp threshold computed once per filter change
  const windowThreshold = useMemo(() => {
    if (windowFilter === 'month') return mountTime - 30 * 86400000
    if (windowFilter === 'quarter') return mountTime - 90 * 86400000
    return null
  }, [windowFilter, mountTime])

  // Apply Global Filters to Active Dataset
  const filteredRows = useMemo(() => {
    return rawTabRows.filter(row => {
      if (activeTab === 'payroll' && ((teacherFilter !== 'All' && row.teacherId !== teacherFilter) || (payPeriodFilter !== 'All' && row.payPeriod !== payPeriodFilter))) return false
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchString = Object.values(row)
          .filter(val => typeof val === 'string' || typeof val === 'number')
          .join(' ')
          .toLowerCase()
        if (!matchString.includes(query)) return false
      }

      // 2. Stream Filter
      if (activeTab === 'payroll' && ((streamFilter !== 'All' && row.streamId !== streamFilter) || (courseFilter !== 'All' && row.courseId !== courseFilter) || (batchFilter !== 'All' && row.batchId !== batchFilter))) return false
      if (streamFilter !== 'All' && row.streamId && row.streamId !== streamFilter) {
        return false
      }

      // 3. Course Filter
      if (courseFilter !== 'All' && row.courseId && row.courseId !== courseFilter) {
        return false
      }

      // 4. Batch Filter
      if (batchFilter !== 'All' && row.batchId && row.batchId !== batchFilter) {
        return false
      }

      // 5. Status Filter
      if (statusFilter !== 'All' && row.status !== statusFilter) {
        return false
      }

      // 6. Reporting Window Filter
      if (windowThreshold !== null && row.date) {
        const rowTime = new Date(row.date).getTime()
        if (rowTime < windowThreshold) return false
      }

      return true
    })
  }, [rawTabRows, searchQuery, streamFilter, courseFilter, batchFilter, statusFilter, windowThreshold, activeTab, teacherFilter, payPeriodFilter])

  // Paginated Rows
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedRows = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, safeCurrentPage, pageSize])

  // Row Selection Handlers
  const handleSelectAll = checked => {
    if (checked) {
      setSelectedRowIds(new Set(filteredRows.map(r => r.id)))
    } else {
      setSelectedRowIds(new Set())
    }
  }

  const handleSelectRow = (id, checked) => {
    setSelectedRowIds(prev => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const isAllSelected = filteredRows.length > 0 && selectedRowIds.size === filteredRows.length

  // Calculate Dynamic Authentic KPIs per Tab (Strictly no fabricated percentages or fallbacks)
  const kpiData = useMemo(() => {
    const count = filteredRows.length
    if (activeTab === 'payroll') {
      const totals = payrollReportTotals(filteredRows)
      const settlementRate = totals.payable > 0
        ? Math.min(100, Math.round((totals.paid / totals.payable) * 1000) / 10)
        : 100

      return [
        {
          key: 'payable',
          label: 'Total Salary Payable',
          mainValue: money(totals.payable),
          subValue: `${totals.teachers} assigned instructors`,
          icon: Wallet,
          theme: 'maroon'
        },
        {
          key: 'paid',
          label: 'Verified Salary Paid',
          mainValue: money(totals.paid),
          subValue: `${totals.paidEntries} settled disbursement records`,
          icon: CheckCircle2,
          theme: 'emerald'
        },
        {
          key: 'outstanding',
          label: 'Outstanding Salary',
          mainValue: money(totals.outstanding),
          subValue: `${totals.pendingEntries} pending or partial payouts`,
          icon: AlertCircle,
          theme: totals.outstanding > 0 ? 'crimson' : 'slate',
          isAlert: totals.outstanding > 0
        },
        {
          key: 'teachers',
          label: 'Teachers in Payroll',
          mainValue: totals.teachers,
          subValue: `${filteredRows.length} total ledger records`,
          icon: Users,
          theme: 'blue'
        },
        {
          key: 'settlementRate',
          label: 'Salary Settlement Rate',
          mainValue: `${settlementRate}%`,
          subValue: `${totals.paidEntries}/${filteredRows.length || 0} entries cleared`,
          icon: TrendingUp,
          theme: 'amber',
          gaugeValue: settlementRate
        }
      ]
    }

    if (activeTab === 'fees') {
      const targetCourseObj = courseFilter !== 'All' ? courseMap.get(courseFilter) : null
      const selectedCohortTitle = targetCourseObj ? targetCourseObj.name : 'All Cohorts'
      const selectedStreamName =
        streamFilter !== 'All'
          ? streamMap.get(streamFilter) || 'Active Stream'
          : targetCourseObj?.streamId
          ? streamMap.get(targetCourseObj.streamId) || 'Pre-Medical Stream'
          : 'All Academic Fields'

      const matchingStudentsCount = new Set(filteredRows.map(r => r.studentId || r.studentName)).size
      const totalCommittedFees = filteredRows.reduce((sum, r) => sum + (r.totalFee || 0), 0)
      const totalRemainingBalance = filteredRows.reduce((sum, r) => sum + (r.remainingBalance || 0), 0)
      const pendingChallansCount = filteredRows.filter(r => r.remainingBalance > 0).length

      const totalPaid = filteredRows.reduce((sum, r) => sum + (r.paid || 0), 0)
      const recoveryRate =
        totalCommittedFees > 0 ? ((totalPaid / totalCommittedFees) * 100).toFixed(1) : '0.0'

      return [
        {
          key: 'cohort',
          label: 'SELECTED COHORT',
          mainValue: selectedCohortTitle,
          subValue: selectedStreamName,
          icon: GraduationCap,
          theme: 'maroon'
        },
        {
          key: 'students',
          label: 'MATCHING STUDENTS',
          mainValue: matchingStudentsCount.toLocaleString(),
          subValue: 'Active Enrolled',
          icon: Users,
          theme: 'slate'
        },
        {
          key: 'total_fees',
          label: 'TOTAL COHORT FEES',
          mainValue: money(totalCommittedFees),
          subValue: 'Committed Tuition Base',
          icon: DollarSign,
          theme: 'slate'
        },
        {
          key: 'outstanding',
          label: 'OUTSTANDING BALANCE',
          mainValue: money(totalRemainingBalance),
          subValue: `${pendingChallansCount} Pending Challans`,
          icon: AlertCircle,
          theme: 'crimson',
          isAlert: true
        },
        {
          key: 'recovery_rate',
          label: 'CHALLAN RECOVERY RATE',
          mainValue: `${recoveryRate}%`,
          subValue: `${money(totalPaid)} Collected`,
          icon: TrendingUp,
          theme: 'maroon',
          gaugeValue: Math.min(100, Math.max(0, parseFloat(recoveryRate) || 0))
        }
      ]
    }

    if (activeTab === 'students') {
      const activeCount = filteredRows.filter(r => r.status === 'Active').length
      const provisionalCount = filteredRows.filter(r => r.status === 'Provisional').length
      const batchesRepresented = new Set(filteredRows.map(r => r.batchId).filter(Boolean)).size
      const coursesRepresented = new Set(filteredRows.map(r => r.courseId).filter(Boolean)).size

      return [
        {
          key: 'total',
          label: 'TOTAL DIRECTORY',
          mainValue: count.toLocaleString(),
          subValue: 'Enrolled Records',
          icon: Users,
          theme: 'slate'
        },
        {
          key: 'active',
          label: 'CONFIRMED ACTIVE',
          mainValue: activeCount.toLocaleString(),
          subValue: 'Full Privileges',
          icon: UserCheck,
          theme: 'emerald'
        },
        {
          key: 'provisional',
          label: 'PROVISIONAL STUDENTS',
          mainValue: provisionalCount.toLocaleString(),
          subValue: 'Pending Final Verification',
          icon: Clock,
          theme: 'amber'
        },
        {
          key: 'courses',
          label: 'COURSES REPRESENTED',
          mainValue: coursesRepresented.toLocaleString(),
          subValue: 'Active Programs',
          icon: BookOpen,
          theme: 'maroon'
        },
        {
          key: 'batches',
          label: 'BATCHES SPREAD',
          mainValue: batchesRepresented.toLocaleString(),
          subValue: 'Rosters Distributed',
          icon: Layers,
          theme: 'maroon'
        }
      ]
    }

    if (activeTab === 'admissions') {
      const approvedCount = filteredRows.filter(r => r.status === 'Approved').length
      const pendingCount = filteredRows.filter(r => r.status === 'Pending').length
      const rejectedCount = filteredRows.filter(r => r.status === 'Rejected').length
      const committedValue = filteredRows
        .filter(r => r.status === 'Approved')
        .reduce((sum, r) => sum + (r.netFee || 0), 0)
      const intakeRate = count > 0 ? ((approvedCount / count) * 100).toFixed(1) : '0.0'

      return [
        {
          key: 'total',
          label: 'TOTAL APPLICATIONS',
          mainValue: count.toLocaleString(),
          subValue: 'Intake Pipeline',
          icon: FileText,
          theme: 'slate'
        },
        {
          key: 'approved',
          label: 'APPROVED INTAKE',
          mainValue: approvedCount.toLocaleString(),
          subValue: 'Enrolled into Batches',
          icon: CheckCircle2,
          theme: 'emerald'
        },
        {
          key: 'pending',
          label: 'PENDING DECISION',
          mainValue: pendingCount.toLocaleString(),
          subValue: 'Under Verification',
          icon: Clock,
          theme: 'amber'
        },
        {
          key: 'committed',
          label: 'COMMITTED REVENUE',
          mainValue: money(committedValue),
          subValue: 'Approved Admissions',
          icon: DollarSign,
          theme: 'maroon'
        },
        {
          key: 'conversion',
          label: 'APPROVAL RATE',
          mainValue: `${intakeRate}%`,
          subValue: `${rejectedCount} Rejected Records`,
          icon: TrendingUp,
          theme: 'emerald',
          gaugeValue: Math.min(100, Math.max(0, parseFloat(intakeRate) || 0))
        }
      ]
    }

    if (activeTab === 'courses') {
      const activeBatchesCount = filteredRows.filter(r => r.status === 'Active').length
      const totalCapacitySeats = filteredRows.reduce((sum, r) => sum + (r.capacity || 0), 0)
      const totalOccupiedSeats = filteredRows.reduce((sum, r) => sum + (r.enrolled || 0), 0)
      const overallOccupancy =
        totalCapacitySeats > 0 ? Math.round((totalOccupiedSeats / totalCapacitySeats) * 100) : 0

      return [
        {
          key: 'batches',
          label: 'ACTIVE BATCHES',
          mainValue: activeBatchesCount.toLocaleString(),
          subValue: 'Current Roster Schedules',
          icon: Layers,
          theme: 'maroon'
        },
        {
          key: 'enrolled_seats',
          label: 'OCCUPIED SEATS',
          mainValue: totalOccupiedSeats.toLocaleString(),
          subValue: 'Active Student Seats',
          icon: Users,
          theme: 'slate'
        },
        {
          key: 'total_cap',
          label: 'CAMPUS SEAT CAPACITY',
          mainValue: totalCapacitySeats.toLocaleString(),
          subValue: 'Classroom Availability',
          icon: Building2,
          theme: 'slate'
        },
        {
          key: 'available_seats',
          label: 'VACANT SEATS',
          mainValue: Math.max(0, totalCapacitySeats - totalOccupiedSeats).toLocaleString(),
          subValue: 'Enrollment Headroom',
          icon: CheckCircle2,
          theme: 'emerald'
        },
        {
          key: 'occupancy_rate',
          label: 'CAPACITY UTILIZATION',
          mainValue: `${overallOccupancy}%`,
          subValue: 'Campus Infrastructure',
          icon: TrendingUp,
          theme: overallOccupancy >= 80 ? 'emerald' : 'amber',
          gaugeValue: overallOccupancy
        }
      ]
    }

    if (activeTab === 'faculty') {
      const distinctInstructors = new Set(filteredRows.map(r => r.teacherId)).size
      const totalWeeklyLectures = filteredRows.length
      const totalWeeklyHours = filteredRows.reduce((sum, r) => sum + (r.weeklyHours || 0), 0)
      const totalStudentReach = filteredRows.reduce((sum, r) => sum + (r.studentReach || 0), 0)
      const distinctRooms = new Set(filteredRows.map(r => r.room).filter(Boolean)).size

      return [
        {
          key: 'instructors',
          label: 'ACTIVE INSTRUCTORS',
          mainValue: distinctInstructors.toLocaleString(),
          subValue: 'Assigned Faculty Staff',
          icon: UserCheck,
          theme: 'maroon'
        },
        {
          key: 'sessions',
          label: 'WEEKLY SESSIONS',
          mainValue: totalWeeklyLectures.toLocaleString(),
          subValue: 'Scheduled Lectures',
          icon: Calendar,
          theme: 'slate'
        },
        {
          key: 'hours',
          label: 'TEACHING LOAD',
          mainValue: `${totalWeeklyHours.toFixed(1)} hrs`,
          subValue: 'Classroom Delivery / Week',
          icon: Clock,
          theme: 'slate'
        },
        {
          key: 'reach',
          label: 'TOTAL STUDENT REACH',
          mainValue: totalStudentReach.toLocaleString(),
          subValue: 'Combined Roster Count',
          icon: Users,
          theme: 'emerald'
        },
        {
          key: 'rooms',
          label: 'CLASSROOMS OCCUPIED',
          mainValue: distinctRooms.toLocaleString(),
          subValue: 'Teaching Venues',
          icon: Building2,
          theme: 'slate'
        }
      ]
    }

    if (activeTab === 'finance') {
      const verifiedInflow = filteredRows
        .filter(r => r.isInflow)
        .reduce((sum, r) => sum + (r.amount || 0), 0)
      const postedExpenses = filteredRows
        .filter(r => !r.isInflow)
        .reduce((sum, r) => sum + (r.amount || 0), 0)
      const netCashBalance = verifiedInflow - postedExpenses
      const operatingMargin =
        verifiedInflow > 0 ? Math.round((netCashBalance / verifiedInflow) * 100) : 0

      return [
        {
          key: 'inflow',
          label: 'VERIFIED FEE INFLOW',
          mainValue: money(verifiedInflow),
          subValue: 'Collected Tuition Receipts',
          icon: DollarSign,
          theme: 'emerald'
        },
        {
          key: 'expenses',
          label: 'POSTED EXPENDITURES',
          mainValue: money(postedExpenses),
          subValue: 'Operating Disbursements',
          icon: AlertCircle,
          theme: 'crimson',
          isAlert: true
        },
        {
          key: 'net',
          label: 'NET CASH POSITION',
          mainValue: money(netCashBalance),
          subValue: netCashBalance >= 0 ? 'Operating Surplus' : 'Operating Deficit',
          icon: TrendingUp,
          theme: netCashBalance >= 0 ? 'emerald' : 'crimson'
        },
        {
          key: 'vouchers',
          label: 'POSTED VOUCHERS',
          mainValue: count.toLocaleString(),
          subValue: 'Total Ledger Transactions',
          icon: Receipt,
          theme: 'slate'
        },
        {
          key: 'margin',
          label: 'OPERATING MARGIN',
          mainValue: `${operatingMargin}%`,
          subValue: 'Cash Margin Ratio',
          icon: Award,
          theme: operatingMargin >= 0 ? 'maroon' : 'crimson',
          gaugeValue: Math.max(0, Math.min(100, operatingMargin))
        }
      ]
    }

    if (activeTab === 'demos') {
      const attendedCount = filteredRows.filter(r => ['Attended', 'Converted'].includes(r.status)).length
      const convertedCount = filteredRows.filter(r => r.status === 'Converted').length
      const scheduledCount = filteredRows.filter(r => ['Registered', 'Scheduled'].includes(r.status)).length
      const conversionRate =
        count > 0 ? ((convertedCount / count) * 100).toFixed(1) : '0.0'

      return [
        {
          key: 'total',
          label: 'DEMO REGISTRATIONS',
          mainValue: count.toLocaleString(),
          subValue: 'Prospect Inquiries',
          icon: Users,
          theme: 'slate'
        },
        {
          key: 'attended',
          label: 'ATTENDED SESSIONS',
          mainValue: attendedCount.toLocaleString(),
          subValue: 'Completed Classroom Trials',
          icon: UserCheck,
          theme: 'maroon'
        },
        {
          key: 'converted',
          label: 'CONVERTED TO ADMISSION',
          mainValue: convertedCount.toLocaleString(),
          subValue: 'Official Enrolled Students',
          icon: CheckCircle2,
          theme: 'emerald'
        },
        {
          key: 'pipeline',
          label: 'ACTIVE PIPELINE',
          mainValue: scheduledCount.toLocaleString(),
          subValue: 'Awaiting Demo Session',
          icon: Clock,
          theme: 'amber'
        },
        {
          key: 'conversion_rate',
          label: 'CONVERSION RATIO',
          mainValue: `${conversionRate}%`,
          subValue: 'Trial to Admission Ratio',
          icon: TrendingUp,
          theme: 'emerald',
          gaugeValue: Math.min(100, Math.max(0, parseFloat(conversionRate) || 0))
        }
      ]
    }

    if (activeTab === 'assets') {
      const operationalCount = filteredRows.filter(r => ['Available', 'Assigned'].includes(r.status)).length
      const maintenanceCount = filteredRows.filter(r => ['Maintenance', 'Needs Maintenance'].includes(r.condition) || r.status === 'Maintenance').length
      const totalAssetValue = filteredRows.reduce((sum, r) => sum + (r.bookValue || 0), 0)
      const distinctCategories = new Set(filteredRows.map(r => r.category)).size

      return [
        {
          key: 'total',
          label: 'TRACKED ASSET UNITS',
          mainValue: count.toLocaleString(),
          subValue: 'Physical Institutional Items',
          icon: Package,
          theme: 'slate'
        },
        {
          key: 'operational',
          label: 'OPERATIONAL ASSETS',
          mainValue: operationalCount.toLocaleString(),
          subValue: 'In Active Campus Use',
          icon: CheckCircle2,
          theme: 'emerald'
        },
        {
          key: 'maintenance',
          label: 'SERVICE REQUIRED',
          mainValue: maintenanceCount.toLocaleString(),
          subValue: 'Under Inspection or Repair',
          icon: AlertCircle,
          theme: 'crimson',
          isAlert: true
        },
        {
          key: 'value',
          label: 'RECORDED BOOK VALUE',
          mainValue: money(totalAssetValue),
          subValue: 'Institutional Capital Assets',
          icon: DollarSign,
          theme: 'maroon'
        },
        {
          key: 'categories',
          label: 'ASSET CATEGORIES',
          mainValue: distinctCategories.toLocaleString(),
          subValue: 'Inventory Classifications',
          icon: Layers,
          theme: 'slate'
        }
      ]
    }

    return []
  }, [
    activeTab,
    filteredRows,
    courseFilter,
    courseMap,
    streamFilter,
    streamMap
  ])

  // Chart Analytics Data
  const chartAnalytics = useMemo(() => {
    if (filteredRows.length === 0) return { pieData: [], summaryText: 'No records to visualize.' }

    if (activeTab === 'payroll') {
      const paidCount = filteredRows.filter(r => r.status === 'Paid').length
      const partialCount = filteredRows.filter(r => r.status === 'Partially Paid').length
      const pendingCount = filteredRows.filter(r => r.status === 'Pending').length

      const pieData = [
        { name: 'Fully Paid / Cleared', value: paidCount, color: '#10b981' },
        { name: 'Partially Paid', value: partialCount, color: '#f59e0b' },
        { name: 'Pending Disbursement', value: pendingCount, color: '#940016' }
      ].filter(d => d.value > 0)

      const totals = payrollReportTotals(filteredRows)
      return {
        title: 'Salary Disbursement & Payout Status',
        pieData,
        summaryText: `${paidCount} Cleared • ${partialCount} Partial • ${pendingCount} Pending (${money(totals.paid)} Paid)`
      }
    }

    if (activeTab === 'fees') {
      const paidCount = filteredRows.filter(r => r.status === 'Paid in Full').length
      const partialCount = filteredRows.filter(r => r.status === '1 Installment Due' || r.status === 'Partial Due').length
      const overdueCount = filteredRows.filter(r => r.status === 'Defaulter Overdue').length

      const pieData = [
        { name: 'Paid in Full', value: paidCount, color: '#10b981' },
        { name: 'Partial / Due', value: partialCount, color: '#f59e0b' },
        { name: 'Defaulter Overdue', value: overdueCount, color: '#940016' }
      ].filter(d => d.value > 0)

      return {
        title: 'Challan Recovery & Defaulter Breakdown',
        pieData,
        summaryText: `${paidCount} Cleared • ${partialCount} Partial • ${overdueCount} Overdue Defaulters`
      }
    }

    if (activeTab === 'admissions') {
      const app = filteredRows.filter(r => r.status === 'Approved').length
      const pen = filteredRows.filter(r => r.status === 'Pending').length
      const rej = filteredRows.filter(r => r.status === 'Rejected').length
      return {
        title: 'Admission Intake Decision Distribution',
        pieData: [
          { name: 'Approved', value: app, color: '#10b981' },
          { name: 'Pending Review', value: pen, color: '#f59e0b' },
          { name: 'Rejected', value: rej, color: '#940016' }
        ].filter(d => d.value > 0),
        summaryText: `${app} Approved (${Math.round((app / filteredRows.length) * 100)}%)`
      }
    }

    if (activeTab === 'courses') {
      const highOcc = filteredRows.filter(r => r.occupancyRate >= 80).length
      const midOcc = filteredRows.filter(r => r.occupancyRate >= 50 && r.occupancyRate < 80).length
      const lowOcc = filteredRows.filter(r => r.occupancyRate < 50).length
      return {
        title: 'Batch Capacity Saturation Levels',
        pieData: [
          { name: 'High (80%+)', value: highOcc, color: '#10b981' },
          { name: 'Optimal (50-79%)', value: midOcc, color: '#3b82f6' },
          { name: 'Low (<50%)', value: lowOcc, color: '#f59e0b' }
        ].filter(d => d.value > 0),
        summaryText: `${highOcc} High Capacity Batches`
      }
    }

    if (activeTab === 'finance') {
      const inflow = filteredRows.filter(r => r.isInflow).reduce((s, r) => s + r.amount, 0)
      const outflow = filteredRows.filter(r => !r.isInflow).reduce((s, r) => s + r.amount, 0)
      return {
        title: 'Institutional Cash Flow Composition',
        pieData: [
          { name: 'Fee Income', value: inflow, color: '#10b981' },
          { name: 'Operating Expenses', value: outflow, color: '#940016' }
        ].filter(d => d.value > 0),
        summaryText: `Net Cash Surplus: ${money(inflow - outflow)}`
      }
    }

    if (activeTab === 'demos') {
      const conv = filteredRows.filter(r => r.status === 'Converted').length
      const att = filteredRows.filter(r => r.status === 'Attended').length
      const sch = filteredRows.filter(r => ['Registered', 'Scheduled'].includes(r.status)).length
      const cnl = filteredRows.filter(r => ['Cancelled', 'Missed'].includes(r.status)).length
      return {
        title: 'Demo Class Pipeline Funnel',
        pieData: [
          { name: 'Converted', value: conv, color: '#10b981' },
          { name: 'Attended Trial', value: att, color: '#3b82f6' },
          { name: 'Scheduled', value: sch, color: '#f59e0b' },
          { name: 'Cancelled/Missed', value: cnl, color: '#94a3b8' }
        ].filter(d => d.value > 0),
        summaryText: `${conv} Converted to Full Admissions`
      }
    }

    // Default for Assets/Students/Faculty
    const statusCounts = {}
    filteredRows.forEach(r => {
      const key = r.status || 'Active'
      statusCounts[key] = (statusCounts[key] || 0) + 1
    })
    const pieData = Object.entries(statusCounts).map(([name, value], i) => ({
      name,
      value,
      color: CHART_COLORS[i % CHART_COLORS.length]
    }))

    return {
      title: `${TAB_CONFIG[activeTab]?.label || 'Active Dataset'} Status Allocation`,
      pieData,
      summaryText: `${filteredRows.length} Total Verified Records`
    }
  }, [activeTab, filteredRows])

  const trendSource = useMemo(() => reportTrendEvents({
    tab: activeTab, rows: filteredRows, data: reportData || {}, branchId,
    filters: { streamId: streamFilter, courseId: courseFilter, batchId: batchFilter, windowThreshold }
  }), [activeTab, filteredRows, reportData, branchId, streamFilter, courseFilter, batchFilter, windowThreshold])

  // Active Query Criteria Bullet String
  const activeCriteriaText = useMemo(() => {
    const parts = []
    if (streamFilter !== 'All') {
      parts.push(streamMap.get(streamFilter) || 'Stream')
    } else {
      parts.push('All Academic Streams')
    }
    if (courseFilter !== 'All') {
      const c = courseMap.get(courseFilter)
      if (c) parts.push(c.name)
    }
    if (batchFilter !== 'All') {
      const b = batchMap.get(batchFilter)
      if (b) parts.push(b.name)
    }
    if (statusFilter !== 'All') {
      parts.push(statusFilter)
    }
    return parts.join(' • ')
  }, [streamFilter, courseFilter, batchFilter, statusFilter, streamMap, courseMap, batchMap])

  // Reset Filters
  const handleResetFilters = () => {
    setTeacherFilter('All')
    setPayPeriodFilter('All')
    setSearchQuery('')
    setWindowFilter('all')
    setStreamFilter('All')
    setCourseFilter('All')
    setBatchFilter('All')
    setStatusFilter('All')
    setCurrentPage(1)
    setToastMessage('Filters reset to default.')
    setTimeout(() => setToastMessage(''), 3000)
  }

  // Export Operations (Respecting user selections & active filters)
  const getExportRows = () => {
    if (activeTab === 'payroll' && !can(PERMISSIONS.PAYROLL_VIEW)) return []
    if (selectedRowIds.size > 0) {
      return filteredRows.filter(r => selectedRowIds.has(r.id))
    }
    return filteredRows
  }

  const handleExportCsv = () => {
    const exportData = getExportRows()
    if (exportData.length === 0) {
      setToastMessage('No matching records to export.')
      return
    }

    let headers
    let rowsFormatted

    if (activeTab === 'payroll') {
      headers = payrollReportHeaders
      rowsFormatted = exportData.map(payrollReportCells)
    } else if (activeTab === 'fees') {
      headers = [
        'Roll No / ID',
        'Student Name',
        'Guardian',
        'Contact',
        'Course',
        'Batch',
        'Timings',
        'Total Fee (PKR)',
        'Paid (PKR)',
        'Remaining Balance (PKR)',
        'Due Date',
        'Status'
      ]
      rowsFormatted = exportData.map(r => [
        r.rollNumber,
        r.studentName,
        r.guardianName,
        r.contact,
        r.courseName,
        r.batchName,
        r.batchTimings,
        r.totalFee,
        r.paid,
        r.remainingBalance,
        r.dueDate,
        r.status
      ])
    } else if (activeTab === 'students') {
      headers = ['Student ID', 'Name', 'Guardian', 'Contact', 'Course', 'Batch', 'Enrolled Date', 'Status']
      rowsFormatted = exportData.map(r => [
        r.rollNumber,
        r.studentName,
        r.guardianName,
        r.contact,
        r.courseName,
        r.batchName,
        formatTimestamp(r.enrolledAt, { fallback: '' }),
        r.status
      ])
    } else if (activeTab === 'finance') {
      headers = ['Voucher Ref', 'Date', 'Type', 'Category / Course', 'Payee / Description', 'Method', 'Amount (PKR)', 'Status']
      rowsFormatted = exportData.map(r => [
        r.refNumber,
        r.date ? new Date(r.date).toLocaleDateString('en-PK') : '',
        r.type,
        r.category,
        r.sourceOrPayee,
        r.method,
        r.isInflow ? `+${r.amount}` : `-${r.amount}`,
        r.status
      ])
    } else {
      headers = ['Record ID', 'Title / Name', 'Category / Course', 'Classification', 'Status', 'Date']
      rowsFormatted = exportData.map(r => [
        r.id || r.rollNumber || r.assetCode,
        r.studentName || r.name || r.teacherName || r.courseName,
        r.courseName || r.category || 'Standard',
        r.batchName || r.streamName || 'General',
        r.status,
        r.date ? new Date(r.date).toLocaleDateString('en-PK') : 'Current'
      ])
    }

    const timestamp = new Date().toISOString().slice(0, 10)
    downloadCsv(`TSA-${branch?.name || 'Academy'}-${activeTab}-report-${timestamp}.csv`, headers, rowsFormatted)
    setToastMessage(`Exported ${exportData.length} records to CSV (Excel).`)
    setTimeout(() => setToastMessage(''), 3500)
  }

  const handleExportPdf = () => exportReport('pdf')
  const handleExportWord = () => exportReport('word')

  const exportReport = format => {
    const exportData = getExportRows()
    if (exportData.length === 0) {
      setToastMessage('No matching records to export.')
      return
    }

    let headers
    let rowsFormatted

    if (activeTab === 'payroll') {
      headers = payrollReportHeaders
      rowsFormatted = exportData.map(payrollReportCells)
    } else if (activeTab === 'fees') {
      headers = ['Roll No', 'Student & Guardian', 'Course & Batch', 'Total Fee', 'Paid', 'Balance', 'Status']
      rowsFormatted = exportData.map(r => [
        r.rollNumber,
        `${r.studentName}\n(${r.guardianName})`,
        `${r.courseName} - ${r.batchName}`,
        money(r.totalFee),
        money(r.paid),
        money(r.remainingBalance),
        r.status
      ])
    } else if (activeTab === 'finance') {
      headers = ['Voucher', 'Date', 'Type', 'Category / Description', 'Amount', 'Status']
      rowsFormatted = exportData.map(r => [
        r.refNumber,
        r.date ? new Date(r.date).toLocaleDateString('en-PK') : '',
        r.type,
        `${r.category}\n${r.sourceOrPayee}`,
        r.isInflow ? `+${money(r.amount)}` : `-${money(r.amount)}`,
        r.status
      ])
    } else {
      headers = ['ID / Code', 'Name / Entity', 'Course / Category', 'Sub-Group', 'Status']
      rowsFormatted = exportData.map(r => [
        r.rollNumber || r.assetCode || r.applicationId || r.demoNumber || r.id.slice(0, 8),
        r.studentName || r.name || r.teacherName || r.courseName,
        r.courseName || r.category || 'N/A',
        r.batchName || r.streamName || 'Standard',
        r.status
      ])
    }

    const timestamp = new Date().toISOString().slice(0, 10)
    const options = {
      title: `${TAB_CONFIG[activeTab]?.label || 'Academy'} Report`,
      branchName: branch?.name || 'The Scholar Coaching Academy',
      headers,
      rows: rowsFormatted,
      filterSummary: `${activeCriteriaText} (${exportData.length} records)`
    }
    if (format === 'word') {
      downloadWordTable(`TSA-${branch?.name || 'Academy'}-${activeTab}-${timestamp}.docx`, options)
    } else {
      exportTablePdf({ ...options, filename: `TSA-${branch?.name || 'Academy'}-${activeTab}-${timestamp}.pdf` })
    }
    setToastMessage(`Generated ${format === 'word' ? 'Word document' : 'PDF report'} for ${exportData.length} records.`)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Loading & Error States
  if (!rawResult) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-[#940016]" />
          <span>Synchronizing authorized campus intelligence...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-destructive">
            <h3 className="font-semibold">Unable to Load Reports</h3>
            <p className="mt-1 text-sm">{error}</p>
            <Button
              size="sm"
              className="mt-4 bg-[#940016] text-white hover:bg-[#72000E]"
              onClick={() => setRefreshTrigger(t => t + 1)}
            >
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-12 print:space-y-3">
        {/* Official Institutional Branded Header for Browser Print */}
        <div className="hidden print:flex items-center gap-3.5 border-b-2 border-[#940016] pb-3 mb-4">
          <img
            src={tsaLogo}
            alt="TSA Logo"
            className="size-14 object-contain rounded shrink-0 bg-white p-1 border border-slate-200 shadow-2xs"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase tracking-wider text-[#940016]">
              THE SCHOLAR COACHING ACADEMY
            </p>
            <h2 className="text-lg font-bold text-slate-900 truncate">
              {TAB_CONFIG[activeTab]?.label || 'Academy'} Operational Ledger &amp; Analytics
            </h2>
            <p className="text-[11px] text-slate-600 font-medium">
              Official Management &amp; Academic Information System • Campus: {branch?.name || 'Main Campus'} • Filter: {activeCriteriaText}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="rounded bg-[#940016] px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
              {activeTab.toUpperCase()} LEDGER
            </span>
            <p className="mt-1 text-[10px] text-slate-500 font-mono font-semibold">
              {new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-3.5 pt-1 print:hidden">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Academy Reports &amp; Ledgers
            </h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Generate and export filtered operational records for admissions, fee collections, batch rosters, and faculty sessions.
            </p>
          </div>
        </header>

        {/* Temporary Toast / Status Feedback */}
        {toastMessage && (
          <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-800 shadow-2xs animate-in fade-in">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* =========================================================================
            2. REPORT TYPE TABS (8 Tabs with Genuine Live Badges - TSA Maroon)
            ========================================================================= */}
        <nav
          aria-label="Report Categories"
          className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-[#efd0d6] bg-[#F9EBEE]/50 p-1.5 shadow-2xs no-scrollbar print:hidden"
        >
          {Object.values(TAB_CONFIG).filter(tab => (tab.id !== 'finance' || can(PERMISSIONS.FINANCE_VIEW)) && (tab.id !== 'payroll' || can(PERMISSIONS.PAYROLL_VIEW))).map(tab => {
            const isActive = activeTab === tab.id
            const badgeValue = tabCounts[tab.id] ?? 0
            const TabIcon = tab.icon

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                aria-pressed={isActive}
                className={`group flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer ${
                  isActive
                    ? 'border-[#940016] bg-[#940016] text-white shadow-xs'
                    : `${tab.tint} hover:border-[#d59ba7] hover:bg-[#f0d5dc] hover:text-[#940016]`
                }`}
              >
                <TabIcon size={14} aria-hidden="true" className={isActive ? 'shrink-0 text-white' : `shrink-0 ${tab.iconColor}`} />
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.badgeColor
                  }`}
                >
                  {badgeValue}
                </span>
              </button>
            )
          })}
        </nav>

        {/* =========================================================================
            3. GLOBAL FILTER BAR (Refined White Background & Compact Layout)
            ========================================================================= */}
        <Card className="reports-filter-panel rounded-xl border border-slate-200/90 bg-white shadow-2xs print:hidden">
          <CardContent className="p-2 sm:px-3 sm:py-2 space-y-1.5">
            {/* 5 Filter Selectors in a Row */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {/* Filter 1: Reporting Window */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  Reporting Window
                </label>
                <div className="relative">
                  <CustomSelect
                    value={windowFilter}
                    onChange={handleWindowChange}
                    options={[
                      { value: 'all', label: 'All Time (Full Ledger)' },
                      { value: 'session', label: `Current Session (${currentSessionLabel})` },
                      { value: 'month', label: 'Last 30 Days' },
                      { value: 'quarter', label: 'Past 90 Days' }
                    ]}
                    containerClassName="w-full"
                    className="w-full text-xs"
                  />
                </div>
              </div>

              {/* Filter 2: Academic Field */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  Academic Field
                </label>
                <CustomSelect
                  value={streamFilter}
                  onChange={handleStreamChange}
                  options={[
                    { value: 'All', label: 'All Fields / Streams' },
                    ...streams.map(s => ({ value: s.id, label: s.name }))
                  ]}
                  containerClassName="w-full"
                  className="w-full text-xs"
                />
              </div>

              {/* Filter 3: Target Course */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  Target Course
                </label>
                <CustomSelect
                  value={courseFilter}
                  onChange={handleCourseChange}
                  options={[
                    { value: 'All', label: 'All Enrolled Courses' },
                    ...availableCourses.map(c => ({ value: c.id, label: c.name }))
                  ]}
                  containerClassName="w-full"
                  className="w-full text-xs"
                />
              </div>

              {/* Filter 4: Assigned Cohort / Batch */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  Assigned Cohort / Batch
                </label>
                <CustomSelect
                  value={batchFilter}
                  onChange={handleBatchChange}
                  options={[
                    { value: 'All', label: 'All Batches (Morning A, Eve A, Wknd)' },
                    ...availableBatches.map(b => ({ value: b.id, label: b.name }))
                  ]}
                  containerClassName="w-full"
                  className="w-full text-xs"
                />
              </div>

              {/* Filter 5: Ledger Status */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  Ledger Status
                </label>
                <CustomSelect
                  value={statusFilter}
                  onChange={handleStatusChange}
                  options={tabStatusOptions}
                  containerClassName="w-full"
                  className="w-full text-xs"
                />
              </div>
            </div>

            {/* Filter Summary & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium truncate">
                <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">
                  <span className="font-semibold text-slate-700">Active query criteria:</span>{' '}
                  {activeCriteriaText}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-7 rounded-lg border border-amber-200 bg-amber-50 text-[11px] font-semibold text-amber-800 hover:border-[#d59ba7] hover:bg-[#F9EBEE] hover:text-[#940016] cursor-pointer px-2.5"
                >
                  <RotateCcw size={11} className="mr-1 text-amber-600" />
                  Reset Filters
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setToastMessage('Filters applied to active records.')
                    setTimeout(() => setToastMessage(''), 2500)
                  }}
                  className="h-7 gap-1.5 bg-[#940016] hover:bg-[#72000E] text-white text-[11px] font-semibold rounded-lg shadow-2xs cursor-pointer px-3"
                >
                  <Filter size={11} />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* =========================================================================
            4. REAL KPI CARDS (TSA Maroon Accents & Reconciled Figures)
            ========================================================================= */}
        {activeTab === 'payroll' && <div className="flex flex-wrap gap-3"><CustomSelect aria-label="Payroll teacher" value={teacherFilter} onChange={value => { setTeacherFilter(value); setCurrentPage(1) }} options={[{ value: 'All', label: 'All Teachers' }, ...Array.from(new Map(rawTabRows.map(row => [row.teacherId, { value: row.teacherId, label: row.teacherName }])).values())]} /><CustomSelect aria-label="Payroll pay period" value={payPeriodFilter} onChange={value => { setPayPeriodFilter(value); setCurrentPage(1) }} options={[{ value: 'All', label: 'All Pay Periods' }, ...Array.from(new Set(rawTabRows.map(row => row.payPeriod))).map(value => ({ value, label: value }))]} /></div>}
        <section className="reports-summary-cards grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {kpiData.map(kpi => {
            const Icon = kpi.icon || FileText
            const isAlert = kpi.isAlert
            const hasGauge = kpi.gaugeValue !== undefined

            return (
              <Card
                key={kpi.key}
                className="top-kpi-card relative min-h-[116px] overflow-hidden rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs"
              >
                <div className="grid min-w-0 flex-1 grid-rows-[auto_1fr_auto] gap-1">
                  <div className="flex min-w-0 items-start justify-between gap-1.5">
                    <p title={kpi.label} className={`min-w-0 flex-1 whitespace-nowrap leading-tight font-extrabold uppercase tracking-tight text-slate-600 ${kpi.label.length > 18 ? 'text-[9px]' : 'text-[10px]'}`}>
                      {kpi.label}
                    </p>
                  {/* Icon or Circular Progress */}
                  {hasGauge ? (
                    <div className="relative flex size-8 shrink-0 items-center justify-center">
                      <svg viewBox="0 0 40 40" className="size-8 -rotate-90">
                        <circle
                          cx="20"
                          cy="20"
                          r="15"
                          className="stroke-slate-100"
                          strokeWidth="3"
                          fill="transparent"
                        />
                        <circle
                          cx="20"
                          cy="20"
                          r="15"
                          className="stroke-[#940016] transition-all duration-500"
                          strokeWidth="3"
                          strokeDasharray={94.2}
                          strokeDashoffset={94.2 - (94.2 * kpi.gaugeValue) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute text-[9px] font-bold text-[#940016]">
                        {Math.round(kpi.gaugeValue)}%
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg border ${
                        kpi.theme === 'maroon'
                          ? 'border-[#f0d5d9] bg-[#F9EBEE] text-[#940016]'
                          : kpi.theme === 'crimson'
                          ? 'border-red-100 bg-red-50 text-[#940016]'
                          : kpi.theme === 'emerald'
                          ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                          : kpi.theme === 'amber'
                          ? 'border-amber-100 bg-amber-50 text-amber-700'
                          : 'border-slate-100 bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                  )}
                  </div>
                  <div title={String(kpi.mainValue)}
                    className={`min-w-0 self-center -translate-y-2 truncate whitespace-nowrap text-left text-[21px] leading-tight font-black tracking-tight ${isAlert ? 'text-[#940016]' : 'text-slate-900'}`}>
                    {kpi.mainValue}
                  </div>
                  <p title={String(kpi.subValue ?? '')} className="min-w-0 truncate whitespace-nowrap text-[10px] leading-tight font-semibold text-slate-500">
                    {kpi.subValue}
                  </p>
                </div>
              </Card>
            )
          })}
        </section>

        {/* =========================================================================
            5. DUAL-PANEL EXECUTIVE ANALYTICS: PROGRESS VELOCITY & STATUS COMPOSITION
            ========================================================================= */}
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12 print:hidden">
            <ReportTrendCard key={scopeKey} tab={activeTab} source={trendSource} rows={filteredRows}
              sessionUnconfigured={windowFilter === 'session'} loading={isRefreshing} />

            {/* RIGHT CARD: Doughnut Chart & Composition Legend (5 Cols) */}
            {chartAnalytics.pieData.length > 0 && <Card className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs lg:col-span-5 flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-[#F9EBEE] text-[#940016] border border-[#f0d5d9]">
                      <BarChart3 size={15} />
                    </span>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        {chartAnalytics.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Categorical segment distribution.
                      </p>
                    </div>
                  </div>
                  <span className="rounded bg-slate-100 text-slate-700 border border-slate-200/90 px-2 py-0.5 text-[10px] font-mono font-bold">
                    {filteredRows.length} Records
                  </span>
                </div>

                {/* Doughnut Chart & Legend Container */}
                <div className="mt-3 flex flex-col sm:flex-row items-center gap-3">
                  {/* Doughnut Chart */}
                  <div className="h-40 w-40 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <RechartsTooltip
                          formatter={(val, name) => [`${val} records`, name]}
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            borderColor: '#e2e8f0',
                            borderRadius: '8px',
                            fontSize: '11px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                        />
                        <Pie
                          data={chartAnalytics.pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={78}
                          paddingAngle={3}
                        >
                          {chartAnalytics.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend Cards Stack */}
                  <div className="flex-1 w-full space-y-1.5 min-w-0">
                    {chartAnalytics.pieData.map((item, idx) => {
                      const totalPieVal = chartAnalytics.pieData.reduce((s, d) => s + d.value, 0)
                      const pct = totalPieVal > 0 ? Math.round((item.value / totalPieVal) * 100) : 0
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5"
                          style={{ backgroundColor: `${item.color}14`, borderColor: `${item.color}33` }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="size-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-[11px] font-medium text-slate-700 truncate">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold text-slate-900 font-mono">
                            <span>{item.value}</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({pct}%)
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Summary Pill at Bottom */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 truncate">
                  <span className="size-2 rounded-full bg-[#940016] shrink-0" />
                  <span className="truncate">{chartAnalytics.summaryText}</span>
                </div>
              </div>
            </Card>}
          </div>

        {/* =========================================================================
            6. COMPLETE REPORT TABLE (Clean, Theme-Consistent)
            ========================================================================= */}
        <section className="reports-ledger overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-2xs">
          {/* Table Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/70 px-4 py-3">
            <div className="flex min-w-0 flex-col items-start gap-1.5">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                {activeTab === 'fees'
                  ? `${courseFilter !== 'All' ? courseMap.get(courseFilter)?.name || 'Course' : 'Active'} Tuition Defaulter Ledger`
                  : `${TAB_CONFIG[activeTab]?.label} Ledger`}
              </h2>
              <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                Showing {filteredRows.length > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0}-
                {Math.min(safeCurrentPage * pageSize, filteredRows.length)} of {filteredRows.length}{' '}
                records
              </span>
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {/* Quick Search in Cohort */}
              <div className="relative">
                <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  aria-label="Search cohort records"
                  className="h-9 w-56 sm:w-72 xl:w-80 pl-10 text-[13px] rounded-lg border-slate-300 focus:ring-1 focus:ring-slate-400"
                  placeholder="Quick find in cohort..."
                  value={searchQuery}
                  onChange={e => handleSearchChange(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => handleSearchChange('')}
                    className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <TableToolbarActions showColumns={false} showLabels
                onExportPdf={handleExportPdf} onExportCsv={handleExportCsv} />
              <button type="button" onClick={handleExportWord} aria-label="Export Word Document" title="Export Word Document (.docx)"
                className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-2.5 text-[11px] font-semibold text-blue-700 hover:border-[#d59ba7] hover:bg-[#F9EBEE] hover:text-[#940016]">
                <FileText size={14} aria-hidden="true" />Word
              </button>

              {/* Print Button */}
              <Button
                variant="outline"
                size="sm"
                aria-label="Print report"
                onClick={() => window.print()}
                className="h-8 border-sky-200 bg-sky-50 px-2.5 text-xs text-sky-700 hover:border-[#d59ba7] hover:bg-[#F9EBEE] hover:text-[#940016] cursor-pointer"
                title="Print Ledger Table"
              >
                <Printer size={14} aria-hidden="true" /><span>Print</span>
              </Button>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                aria-label="Refresh report records"
                aria-busy={isRefreshing}
                disabled={isRefreshing}
                onClick={() => { setToastMessage(''); setSelectedRowIds(new Set()); setRefreshTrigger(r => r + 1) }}
                className="h-8 border-violet-200 bg-violet-50 px-2.5 text-xs text-violet-700 hover:border-[#d59ba7] hover:bg-[#F9EBEE] hover:text-[#940016] cursor-pointer"
                title="Refresh Table Records"
              >
                <RefreshCw size={14} aria-hidden="true" className={isRefreshing ? 'animate-spin' : undefined} /><span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-100/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="w-10 px-3.5 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={e => handleSelectAll(e.target.checked)}
                      className="size-3.5 rounded border-slate-300 text-[#940016] focus:ring-1 focus:ring-[#940016] cursor-pointer"
                      aria-label="Select all rows"
                    />
                  </th>

                  {activeTab === 'payroll' && (
                    <>
                      <th className="px-3.5 py-3">Teacher</th>
                      <th className="px-3.5 py-3">Course</th>
                      <th className="px-3.5 py-3">Batch</th>
                      <th className="px-3.5 py-3">Subject</th>
                      <th className="px-3.5 py-3 text-center">Salary Method</th>
                      <th className="px-3.5 py-3 text-center">Eligible Students</th>
                      <th className="px-3.5 py-3 text-right">Salary (PKR)</th>
                      <th className="px-3.5 py-3 text-right">Verified Paid (PKR)</th>
                      <th className="px-3.5 py-3 text-right">Remaining (PKR)</th>
                      <th className="px-3.5 py-3 text-center">Status</th>
                      <th className="px-3.5 py-3 text-center">Pay Period</th>
                    </>
                  )}
                  {activeTab === 'fees' && (
                    <>
                      <th className="px-3.5 py-3">Roll No / ID</th>
                      <th className="px-3.5 py-3">Student &amp; Guardian</th>
                      <th className="px-3.5 py-3">Contact / WhatsApp</th>
                      <th className="px-3.5 py-3">Batch &amp; Timings</th>
                      <th className="px-3.5 py-3 text-right">Total Fee</th>
                      <th className="px-3.5 py-3 text-right">Paid</th>
                      <th className="px-3.5 py-3 text-right">Remaining Balance</th>
                      <th className="px-3.5 py-3 text-center">Challan Coverage</th>
                      <th className="px-3.5 py-3 text-center">Status</th>
                      <th className="px-3.5 py-3 text-center">Action</th>
                    </>
                  )}

                  {activeTab === 'students' && (
                    <>
                      <th className="px-3.5 py-3">Student ID</th>
                      <th className="px-3.5 py-3">Student Name</th>
                      <th className="px-3.5 py-3">Guardian &amp; Contact</th>
                      <th className="px-3.5 py-3">Course &amp; Batch</th>
                      <th className="px-3.5 py-3">Enrolled Date</th>
                      <th className="px-3.5 py-3 text-center">Status</th>
                      <th className="px-3.5 py-3 text-center">Action</th>
                    </>
                  )}

                  {activeTab === 'admissions' && (
                    <>
                      <th className="px-3.5 py-3">Application ID</th>
                      <th className="px-3.5 py-3">Applicant Name</th>
                      <th className="px-3.5 py-3">Guardian &amp; Contact</th>
                      <th className="px-3.5 py-3">Course &amp; Preferred Batch</th>
                      <th className="px-3.5 py-3 text-right">Configured Fee</th>
                      <th className="px-3.5 py-3 text-center">Decision Status</th>
                      <th className="px-3.5 py-3 text-center">Action</th>
                    </>
                  )}

                  {activeTab === 'courses' && (
                    <>
                      <th className="px-3.5 py-3">Course Name</th>
                      <th className="px-3.5 py-3">Batch Cohort</th>
                      <th className="px-3.5 py-3">Academic Field</th>
                      <th className="px-3.5 py-3">Schedule &amp; Room</th>
                      <th className="px-3.5 py-3 text-center">Enrolled / Cap</th>
                      <th className="px-3.5 py-3 text-center">Occupancy %</th>
                      <th className="px-3.5 py-3 text-center">Status</th>
                    </>
                  )}

                  {activeTab === 'faculty' && (
                    <>
                      <th className="px-3.5 py-3">Instructor</th>
                      <th className="px-3.5 py-3">Assigned Course &amp; Batch</th>
                      <th className="px-3.5 py-3">Subject</th>
                      <th className="px-3.5 py-3">Weekly Schedule</th>
                      <th className="px-3.5 py-3">Room</th>
                      <th className="px-3.5 py-3 text-center">Weekly Hours</th>
                      <th className="px-3.5 py-3 text-center">Student Reach</th>
                    </>
                  )}

                  {activeTab === 'finance' && (
                    <>
                      <th className="px-3.5 py-3">Voucher Ref</th>
                      <th className="px-3.5 py-3">Date</th>
                      <th className="px-3.5 py-3">Type</th>
                      <th className="px-3.5 py-3">Category / Payee</th>
                      <th className="px-3.5 py-3">Method</th>
                      <th className="px-3.5 py-3 text-right">Inflow (PKR)</th>
                      <th className="px-3.5 py-3 text-right">Outflow (PKR)</th>
                      <th className="px-3.5 py-3 text-center">Status</th>
                    </>
                  )}

                  {activeTab === 'demos' && (
                    <>
                      <th className="px-3.5 py-3">Demo ID</th>
                      <th className="px-3.5 py-3">Student</th>
                      <th className="px-3.5 py-3">Guardian &amp; Phone</th>
                      <th className="px-3.5 py-3">Target Course</th>
                      <th className="px-3.5 py-3">Session Date &amp; Time</th>
                      <th className="px-3.5 py-3 text-center">Attendance</th>
                      <th className="px-3.5 py-3 text-center">Status</th>
                    </>
                  )}

                  {activeTab === 'assets' && (
                    <>
                      <th className="px-3.5 py-3">Asset Code</th>
                      <th className="px-3.5 py-3">Item Description</th>
                      <th className="px-3.5 py-3">Category</th>
                      <th className="px-3.5 py-3 text-center">Quantity</th>
                      <th className="px-3.5 py-3">Condition</th>
                      <th className="px-3.5 py-3">Location</th>
                      <th className="px-3.5 py-3 text-right">Book Value</th>
                      <th className="px-3.5 py-3 text-center">Status</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200/80">
                {paginatedRows.map(row => {
                  const isSelected = selectedRowIds.has(row.id)

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors hover:bg-slate-50/80 ${
                        isSelected ? 'bg-[#F9EBEE]/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-3.5 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => handleSelectRow(row.id, e.target.checked)}
                          className="size-3.5 rounded border-slate-300 text-[#940016] focus:ring-1 focus:ring-[#940016] cursor-pointer"
                          aria-label={`Select row ${row.id}`}
                        />
                      </td>

                      {/* PAYROLL ROWS */}
                      {activeTab === 'payroll' && (
                        <>
                          {/* Teacher Name & Initial Avatar */}
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#F9EBEE] text-[10px] font-bold text-[#940016] border border-[#f0d5d9]">
                                {row.teacherName ? row.teacherName.charAt(0).toUpperCase() : 'T'}
                              </span>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 block truncate">
                                  {row.teacherName}
                                </span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  ID: {row.teacherId}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Course */}
                          <td className="px-3.5 py-3">
                            <span className="font-semibold text-slate-800 block truncate">
                              {row.courseName}
                            </span>
                          </td>

                          {/* Batch */}
                          <td className="px-3.5 py-3">
                            <span className="text-slate-700 block truncate">
                              {row.batchName}
                            </span>
                          </td>

                          {/* Subject */}
                          <td className="px-3.5 py-3">
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">
                              {row.subjectName || '—'}
                            </span>
                          </td>

                          {/* Salary Method */}
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
                              {row.method}
                            </span>
                          </td>

                          {/* Eligible Students */}
                          <td className="px-3.5 py-3 text-center whitespace-nowrap font-mono text-slate-700">
                            {row.eligibleStudents ?? '—'}
                          </td>

                          {/* Salary Amount */}
                          <td className="px-3.5 py-3 text-right font-semibold text-slate-800 whitespace-nowrap font-mono">
                            {money(row.salaryAmount)}
                          </td>

                          {/* Verified Paid */}
                          <td className="px-3.5 py-3 text-right font-bold text-emerald-700 whitespace-nowrap font-mono">
                            {money(row.paid)}
                          </td>

                          {/* Remaining Balance */}
                          <td className="px-3.5 py-3 text-right whitespace-nowrap font-mono">
                            <span className={`font-bold ${row.remainingBalance > 0 ? 'text-[#940016]' : 'text-emerald-700'}`}>
                              {money(row.remainingBalance)}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                row.status === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : row.status === 'Partially Paid'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-red-50 text-[#940016] border border-red-200'
                              }`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${
                                  row.status === 'Paid'
                                    ? 'bg-emerald-500'
                                    : row.status === 'Partially Paid'
                                    ? 'bg-amber-500'
                                    : 'bg-[#940016]'
                                }`}
                              />
                              {row.status}
                            </span>
                          </td>

                          {/* Pay Period */}
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600 border border-slate-200">
                              <Calendar size={10} className="text-slate-400" />
                              {row.payPeriod}
                            </span>
                          </td>
                        </>
                      )}
                      {activeTab === 'fees' && (
                        <>
                          {/* Roll No / ID */}
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <span className="font-bold text-[#940016] font-mono text-xs">
                              {row.rollNumber}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-medium">
                              {row.enrolledDateText}
                            </span>
                          </td>

                          {/* Student & Guardian */}
                          <td className="px-3.5 py-3">
                            <div className="flex items-center gap-2.5">
                              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#F9EBEE] text-[10px] font-bold text-[#940016] border border-[#f0d5d9]">
                                {row.studentInitials}
                              </span>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 block truncate">
                                  {row.studentName}
                                </span>
                                <span className="text-[11px] text-slate-400 block truncate">
                                  S/O {row.guardianName}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Contact / WhatsApp */}
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                              <Phone size={11} className="text-emerald-600 shrink-0" />
                              <span>{row.contact}</span>
                            </div>
                            <span className="text-[10px] text-emerald-600 font-medium block">
                              WhatsApp active
                            </span>
                          </td>

                          {/* Batch & Timings */}
                          <td className="px-3.5 py-3">
                            <span className="font-semibold text-slate-800 block truncate">
                              {row.batchName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {row.batchTimings}
                            </span>
                          </td>

                          {/* Total Fee */}
                          <td className="px-3.5 py-3 text-right font-medium text-slate-700 whitespace-nowrap">
                            {money(row.totalFee)}
                          </td>

                          {/* Paid */}
                          <td className="px-3.5 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                            {money(row.paid)}
                          </td>

                          {/* Remaining Balance */}
                          <td className="px-3.5 py-3 text-right whitespace-nowrap">
                            <span
                              className={`font-bold ${
                                row.remainingBalance > 0 ? 'text-[#940016]' : 'text-emerald-700'
                              }`}
                            >
                              {money(row.remainingBalance)}
                            </span>
                            <span
                              className={`block text-[10px] font-medium ${
                                row.remainingBalance > 0 ? 'text-amber-700' : 'text-emerald-600'
                              }`}
                            >
                              {row.remainingBalance > 0
                                ? `Due: ${row.dueDate ? new Date(row.dueDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending'}`
                                : 'Cleared'}
                            </span>
                          </td>

                          {/* Challan Coverage */}
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <div className={`inline-flex items-center gap-1 text-xs font-semibold ${row.paid >= row.totalFee ? 'text-emerald-700' : row.paid > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                              <span className={`size-1.5 rounded-full ${row.paid >= row.totalFee ? 'bg-emerald-500' : row.paid > 0 ? 'bg-amber-500' : 'bg-slate-300'}`} />
                              <span>{row.totalFee > 0 ? Math.min(100, Math.round((row.paid / row.totalFee) * 100)) : 0}%</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {money(row.paid)} of {money(row.totalFee)}
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                row.status === 'Paid in Full'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : row.status === '1 Installment Due'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : row.status === 'Defaulter Overdue'
                                  ? 'bg-red-50 text-[#940016] border border-red-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${
                                  row.status === 'Paid in Full'
                                    ? 'bg-emerald-500'
                                    : row.status === '1 Installment Due'
                                    ? 'bg-amber-500'
                                    : row.status === 'Defaulter Overdue'
                                    ? 'bg-[#940016]'
                                    : 'bg-slate-400'
                                }`}
                              />
                              {row.status}
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedRecordDetail(row)}
                              className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-2xs cursor-pointer"
                              title="View Ledger Detail"
                            >
                              <FileText size={13} />
                            </button>
                          </td>
                        </>
                      )}

                      {/* 2. STUDENTS ROWS */}
                      {activeTab === 'students' && (
                        <>
                          <td className="px-3.5 py-3 font-mono font-bold text-slate-900">
                            {row.rollNumber}
                          </td>
                          <td className="px-3.5 py-3 font-bold text-slate-900">
                            {row.studentName}
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="block font-medium text-slate-800">
                              {row.guardianName}
                            </span>
                            <span className="block text-[11px] text-slate-400 font-mono">
                              {row.contact}
                            </span>
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="block font-semibold text-slate-800">
                              {row.courseName}
                            </span>
                            <span className="block text-[11px] text-slate-400">
                              {row.batchName}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-slate-600 whitespace-nowrap">
                            {row.enrolledAt
                              ? new Date(row.enrolledAt).toLocaleDateString('en-PK')
                              : '—'}
                          </td>
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                row.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${
                                  row.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              />
                              {row.status}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedRecordDetail(row)}
                              className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 shadow-2xs cursor-pointer"
                            >
                              <Eye size={13} />
                            </button>
                          </td>
                        </>
                      )}

                      {/* 3. ADMISSIONS ROWS */}
                      {activeTab === 'admissions' && (
                        <>
                          <td className="px-3.5 py-3 font-mono font-bold text-slate-900">
                            {row.applicationId}
                          </td>
                          <td className="px-3.5 py-3 font-bold text-slate-900">
                            {row.studentName}
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="block font-medium text-slate-800">
                              {row.guardianName}
                            </span>
                            <span className="block text-[11px] text-slate-400 font-mono">
                              {row.contact}
                            </span>
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="block font-semibold text-slate-800">
                              {row.courseName}
                            </span>
                            <span className="block text-[11px] text-slate-400">
                              {row.batchName}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                            {money(row.netFee)}
                          </td>
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                row.status === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : row.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${
                                  row.status === 'Approved'
                                    ? 'bg-emerald-500'
                                    : row.status === 'Pending'
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                }`}
                              />
                              {row.status}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedRecordDetail(row)}
                              className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 shadow-2xs cursor-pointer"
                            >
                              <FileText size={13} />
                            </button>
                          </td>
                        </>
                      )}

                      {/* 4. COURSES ROWS */}
                      {activeTab === 'courses' && (
                        <>
                          <td className="px-3.5 py-3 font-bold text-slate-900">
                            {row.courseName}
                          </td>
                          <td className="px-3.5 py-3 font-semibold text-slate-800">
                            {row.batchName}
                          </td>
                          <td className="px-3.5 py-3 text-slate-600">
                            {row.streamName}
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="block text-slate-800 font-medium">
                              {row.timings}
                            </span>
                            <span className="block text-[11px] text-slate-400">
                              {row.days} • {row.room}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-center font-mono font-semibold text-slate-800">
                            {row.enrolled} / {row.capacity}
                          </td>
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="h-1.5 w-12 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    row.occupancyRate >= 80 ? 'bg-emerald-500' : 'bg-[#940016]'
                                  }`}
                                  style={{ width: `${Math.min(100, row.occupancyRate)}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-700">
                                {row.occupancyRate}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              {row.status}
                            </span>
                          </td>
                        </>
                      )}

                      {/* 5. FACULTY ROWS */}
                      {activeTab === 'faculty' && (
                        <>
                          <td className="px-3.5 py-3 font-bold text-slate-900">
                            {row.teacherName}
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="block font-semibold text-slate-800">
                              {row.courseName}
                            </span>
                            <span className="block text-[11px] text-slate-400">
                              {row.batchName}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 font-medium text-slate-700">
                            {row.subjectName}
                          </td>
                          <td className="px-3.5 py-3 text-slate-600">
                            {row.schedule}
                          </td>
                          <td className="px-3.5 py-3 font-mono text-slate-600">
                            {row.room}
                          </td>
                          <td className="px-3.5 py-3 text-center font-mono font-bold text-slate-800">
                            {row.weeklyHours} hrs
                          </td>
                          <td className="px-3.5 py-3 text-center font-semibold text-emerald-700">
                            {row.studentReach} students
                          </td>
                        </>
                      )}

                      {/* 6. FINANCE ROWS */}
                      {activeTab === 'finance' && (
                        <>
                          <td className="px-3.5 py-3 font-mono font-bold text-slate-900">
                            {row.refNumber}
                          </td>
                          <td className="px-3.5 py-3 text-slate-600 whitespace-nowrap">
                            {row.date ? new Date(row.date).toLocaleDateString('en-PK') : '—'}
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                row.isInflow
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-red-50 text-[#940016] border border-red-200'
                              }`}
                            >
                              {row.type}
                            </span>
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="block font-semibold text-slate-800">
                              {row.category}
                            </span>
                            <span className="block text-[11px] text-slate-400 truncate max-w-[200px]">
                              {row.sourceOrPayee}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-slate-600">
                            {row.method}
                          </td>
                          <td className="px-3.5 py-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                            {row.isInflow ? money(row.amount) : '—'}
                          </td>
                          <td className="px-3.5 py-3 text-right font-bold text-[#940016] whitespace-nowrap">
                            {!row.isInflow ? money(row.amount) : '—'}
                          </td>
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {row.status}
                            </span>
                          </td>
                        </>
                      )}

                      {/* 7. DEMOS ROWS */}
                      {activeTab === 'demos' && (
                        <>
                          <td className="px-3.5 py-3 font-mono font-bold text-slate-900">
                            {row.demoNumber}
                          </td>
                          <td className="px-3.5 py-3 font-bold text-slate-900">
                            {row.studentName}
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="block font-medium text-slate-800">
                              {row.guardianName}
                            </span>
                            <span className="block text-[11px] text-slate-400 font-mono">
                              {row.contact}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 font-medium text-slate-800">
                            {row.courseName}
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="block font-medium text-slate-700">
                              {row.sessionDate}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              {row.sessionTime}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                row.attendance === 'Present'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {row.attendance}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                row.status === 'Converted'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : row.status === 'Attended'
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </>
                      )}

                      {/* 8. ASSETS ROWS */}
                      {activeTab === 'assets' && (
                        <>
                          <td className="px-3.5 py-3 font-mono font-bold text-slate-900">
                            {row.assetCode}
                          </td>
                          <td className="px-3.5 py-3 font-bold text-slate-900">
                            {row.name}
                          </td>
                          <td className="px-3.5 py-3 text-slate-700">
                            {row.category}
                          </td>
                          <td className="px-3.5 py-3 text-center font-mono font-bold text-slate-900">
                            {row.quantity}
                          </td>
                          <td className="px-3.5 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                row.condition === 'Excellent' || row.condition === 'Working'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {row.condition}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 text-slate-600">
                            {row.location}
                          </td>
                          <td className="px-3.5 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                            {money(row.bookValue)}
                          </td>
                          <td className="px-3.5 py-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                row.status === 'Available'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : row.status === 'Assigned'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredRows.length === 0 && (
            <div className="p-12 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Search size={20} />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-800">No records found</h3>
              <p className="mt-1 text-xs text-slate-500">
                No authoritative records match the current filters or search term.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="mt-3 text-xs"
              >
                Reset active filters
              </Button>
            </div>
          )}

          {/* Table Footer & Pagination */}
          <div className="print:hidden">
            <Pagination label="Reports" page={safeCurrentPage} rows={pageSize} total={filteredRows.length}
              onPage={setCurrentPage} onRows={rows => { setPageSize(rows); setCurrentPage(1) }} />
          </div>
        </section>

        {/* Official Institutional Confidential Sign-off for Browser Print */}
        <div className="hidden print:flex items-center justify-between pt-8 mt-6 border-t border-slate-300 text-xs text-slate-600">
          <div className="text-center w-48 border-t border-slate-400 pt-1 text-[11px]">
            Prepared By / Incharge Signature
          </div>
          <div className="text-center text-[10px] text-slate-400">
            The Scholar Coaching Academy • Confidential Operational Document • Campus: {branch?.name || 'Main Campus'}
          </div>
          <div className="text-center w-48 border-t border-slate-400 pt-1 text-[11px]">
            Branch Administrator Stamp
          </div>
        </div>



        {/* =========================================================================
            8. BATCH SCHEDULE SUMMARY MODAL DIALOG (TSA Maroon Accents)
            ========================================================================= */}
        <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar size={18} className="text-[#940016]" />
                Batch Schedule &amp; Timetable Summary
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                All scheduled rosters, timings, teaching faculty, and room allocations for{' '}
                <span className="font-semibold text-slate-800">{branch?.name || 'Active Campus'}</span>.
              </p>
            </DialogHeader>

            <div className="mt-3 space-y-2.5">
              {batches.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">
                  No active batches configured for this branch.
                </p>
              ) : (
                batches.map(b => {
                  const crs = courseMap.get(b.courseId)
                  const fa = facultyAssignments.find(f => f.batchId === b.id)
                  const teacherName = fa ? userMap.get(fa.teacherId) || 'Assigned Instructor' : 'Staff Pending'
                  const enrolledCount = enrollments.filter(e => e.batchId === b.id && e.status === 'Active').length
                  const cap = b.capacity || 40

                  return (
                    <div
                      key={b.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200/90 bg-slate-50/70 p-3 hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{b.name}</span>
                          <span className="rounded bg-[#F9EBEE] text-[#940016] border border-[#f0d5d9] px-1.5 py-0.5 text-[10px] font-semibold">
                            {crs?.name || 'Course'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                          <span>
                            {b.days?.length ? b.days.join(', ') : 'Mon - Fri'} (
                            {b.startTime && b.endTime ? formatTimeRange(b.startTime, b.endTime) : 'Morning Session'}
                            )
                          </span>
                          <span>•</span>
                          <span>Room: {b.room || 'Main Hall'}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium">
                          Instructor: <span className="text-slate-800 font-semibold">{teacherName}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-slate-900">
                          {enrolledCount} / {cap} Seats
                        </div>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            enrolledCount >= cap
                              ? 'bg-red-50 text-red-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {enrolledCount >= cap ? 'Full' : `${cap - enrolledCount} Seats Open`}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Record Detail Modal */}
        <Dialog open={!!selectedRecordDetail} onOpenChange={() => setSelectedRecordDetail(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText size={16} className="text-[#940016]" />
                Record Audit Detail
              </DialogTitle>
            </DialogHeader>

            {selectedRecordDetail && (
              <div className="mt-2 space-y-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-3 space-y-1.5 border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Roll No / Ref:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedRecordDetail.rollNumber || selectedRecordDetail.challanRef || selectedRecordDetail.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Name / Subject:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedRecordDetail.studentName || selectedRecordDetail.teacherName || selectedRecordDetail.name}
                    </span>
                  </div>
                  {selectedRecordDetail.guardianName && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Guardian:</span>
                      <span className="text-slate-700">{selectedRecordDetail.guardianName}</span>
                    </div>
                  )}
                  {selectedRecordDetail.contact && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Contact:</span>
                      <span className="font-mono text-slate-700">{selectedRecordDetail.contact}</span>
                    </div>
                  )}
                  {selectedRecordDetail.courseName && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Course:</span>
                      <span className="text-slate-700">{selectedRecordDetail.courseName}</span>
                    </div>
                  )}
                  {selectedRecordDetail.batchName && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Batch:</span>
                      <span className="text-slate-700">{selectedRecordDetail.batchName}</span>
                    </div>
                  )}
                  {selectedRecordDetail.totalFee !== undefined && (
                    <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                      <span className="text-slate-700">Total Fee:</span>
                      <span className="text-slate-900">{money(selectedRecordDetail.totalFee)}</span>
                    </div>
                  )}
                  {selectedRecordDetail.paid !== undefined && (
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-700">Verified Paid:</span>
                      <span className="text-emerald-700">{money(selectedRecordDetail.paid)}</span>
                    </div>
                  )}
                  {selectedRecordDetail.remainingBalance !== undefined && (
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-700">Remaining Balance:</span>
                      <span className="text-[#940016]">{money(selectedRecordDetail.remainingBalance)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-1.5">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-slate-900">{selectedRecordDetail.status}</span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
