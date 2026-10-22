import { formatTimestamp } from './timeFormat.js'
import { payrollReference, paymentReference } from './payrollReference.js'
/**
 * Purpose: Universal PDF Document Generator for The Scholar Coaching Academy (TSA) ERP.
 * Implements:
 * - Template A: Table Report PDF (Multi-page, repeated headers, page numbers, auto orientation)
 * - Template B: Student Fee Challan / Invoice PDF (Official branded invoice with financial verification)
 * - Template C: Payment Receipt PDF (Official verified receipt with payment acknowledgment)
 *
 * Branding:
 * - Official Academy Name: THE SCHOLAR COACHING ACADEMY
 * - Official Palette: Maroon (#940016), Slate (#1e293b), White (#ffffff)
 * - Official TSA Logo: Embedded synchronously via base64 data URL
 */

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { TSA_LOGO_DATA_URL } from './tsaLogoBase64.js'

// Official TSA Brand Palette
const TSA_MAROON   = [148, 0, 22]       // #940016
const TSA_MAROON_D = [114, 0, 14]       // #72000E  (darker accent)
const TSA_MAROON_L = [249, 235, 238]    // #F9EBEE  (light maroon tint)
const TSA_SLATE    = [30, 41, 59]       // #1e293b
const TSA_MUTED    = [100, 116, 139]    // #64748b
const TSA_BORDER   = [226, 232, 240]    // #e2e8f0
const TSA_ZEBRA    = [248, 250, 252]    // #f8fafc
const TSA_WHITE    = [255, 255, 255]    // #ffffff
const TSA_EMERALD  = [16, 185, 129]     // #10b981
const TSA_EMERALD_D= [5, 150, 105]      // #059669

const ACADEMY_NAME    = 'THE SCHOLAR COACHING ACADEMY'
const ACADEMY_TAGLINE = 'Official Management & Academic Information System'
const ACADEMY_FOOTER  = 'The Scholar Coaching Academy — Confidential Institutional Document'

function safeText(val) {
  if (val == null) return ''
  return String(val)
}

function formatCurrency(amount) {
  const num = Number(amount)
  if (Number.isNaN(num)) return 'PKR 0'
  return `PKR ${num.toLocaleString('en-PK')}`
}

function formatDate(dateString) {
  if (!dateString) return new Date().toLocaleDateString('en-PK')
  try {
    const d = new Date(dateString)
    return Number.isNaN(d.getTime()) ? String(dateString) : d.toLocaleDateString('en-PK')
  } catch {
    return String(dateString)
  }
}

/**
 * Draw premium branded header on any jsPDF page.
 * Displays:
 * 1. Maroon decorative top stripes
 * 2. Large clear TSA logo on the left
 * 3. Prominent academy name: THE SCHOLAR COACHING ACADEMY in bold maroon
 * 4. Subtitle: Official Management & Academic Information System
 * 5. Campus metadata line
 * 6. Document type / date badge on the right
 * 7. Clean double separator line
 *
 * @returns {number} Y coordinate immediately below the header
 */
function drawPremiumHeader(doc, docTypeLabel, branchName) {
  const pw = doc.internal.pageSize.getWidth()

  // 1. Top decorative stripes
  doc.setFillColor(...TSA_MAROON)
  doc.rect(0, 0, pw, 5.5, 'F')

  doc.setFillColor(...TSA_MAROON_D)
  doc.rect(0, 5.5, pw, 1.2, 'F')

  // 2. TSA Logo on left (22mm x 22mm)
  const LOGO_X = 14
  const LOGO_Y = 10
  const LOGO_SIZE = 22

  try {
    if (TSA_LOGO_DATA_URL) {
      doc.addImage(TSA_LOGO_DATA_URL, 'PNG', LOGO_X, LOGO_Y, LOGO_SIZE, LOGO_SIZE, undefined, 'FAST')
    }
  } catch {
    // Graceful fallback for test runners or environments where image decode fails
    doc.setFillColor(...TSA_MAROON_L)
    doc.roundedRect(LOGO_X, LOGO_Y, LOGO_SIZE, LOGO_SIZE, 2, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...TSA_MAROON)
    doc.text('TSA', LOGO_X + LOGO_SIZE / 2, LOGO_Y + LOGO_SIZE / 2 + 1.5, { align: 'center' })
  }

  // 3. Middle: Academy Name, Subtitle & Campus
  const textLeft = LOGO_X + LOGO_SIZE + 4.5
  const badgeWidth = 44
  const badgeX = pw - 14 - badgeWidth

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13.5)
  doc.setTextColor(...TSA_MAROON)
  doc.text(ACADEMY_NAME, textLeft, 16.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TSA_MUTED)
  doc.text(ACADEMY_TAGLINE, textLeft, 22)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_SLATE)
  doc.text(`Campus: ${branchName || 'Main Campus'}`, textLeft, 27)

  // 4. Right: Document Type & Date Badge
  doc.setFillColor(...TSA_MAROON)
  doc.roundedRect(badgeX, 11, badgeWidth, 19, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_WHITE)
  doc.text(docTypeLabel.toUpperCase(), badgeX + badgeWidth / 2, 17, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(new Date().toLocaleDateString('en-PK'), badgeX + badgeWidth / 2, 22, { align: 'center' })

  doc.setFontSize(6.5)
  doc.text('TSA ERP SYSTEM', badgeX + badgeWidth / 2, 26.5, { align: 'center' })

  // 5. Separator lines
  doc.setDrawColor(...TSA_MAROON)
  doc.setLineWidth(0.6)
  doc.line(14, 34, pw - 14, 34)

  doc.setDrawColor(...TSA_BORDER)
  doc.setLineWidth(0.2)
  doc.line(14, 34.8, pw - 14, 34.8)

  return 38
}

/**
 * Draw mini header for subsequent pages (Template A).
 */
function drawMiniHeader(doc, title, branchName) {
  const pw = doc.internal.pageSize.getWidth()

  doc.setFillColor(...TSA_MAROON)
  doc.rect(0, 0, pw, 5, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...TSA_WHITE)
  doc.text(ACADEMY_NAME, 14, 3.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_MUTED)
  doc.text(`${title} (cont.) — ${branchName}`, pw - 14, 3.5, { align: 'right' })

  doc.setDrawColor(...TSA_BORDER)
  doc.setLineWidth(0.2)
  doc.line(14, 7, pw - 14, 7)
}

/**
 * Draw footer on each page.
 */
function drawFooter(doc, pageNumber, footerNote) {
  const pw = doc.internal.pageSize.getWidth()
  const ph = doc.internal.pageSize.getHeight()

  doc.setDrawColor(...TSA_MAROON)
  doc.setLineWidth(0.4)
  doc.line(14, ph - 11, pw - 14, ph - 11)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...TSA_MUTED)
  doc.text(footerNote || ACADEMY_FOOTER, 14, ph - 6.5)
  doc.text(`Page ${pageNumber}`, pw - 14, ph - 6.5, { align: 'right' })

  // Bottom maroon accent line
  doc.setFillColor(...TSA_MAROON)
  doc.rect(0, ph - 3, pw, 3, 'F')
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE A: TABLE REPORT PDF
// ─────────────────────────────────────────────────────────────────────────────
export function exportTablePdf({
  filename = 'report.pdf',
  title = 'Directory Report',
  branchName = 'The Scholar Coaching Academy',
  headers = [],
  rows = [],
  filterSummary = '',
  orientation = null,
}) {
  const autoOrientation = orientation || (headers.length >= 6 ? 'landscape' : 'portrait')
  const doc = new jsPDF({
    orientation: autoOrientation,
    unit: 'mm',
    format: 'a4',
  })

  const pw = doc.internal.pageSize.getWidth()

  // 1. Draw page 1 branded header
  const headerEndY = drawPremiumHeader(doc, title, branchName)

  // 2. Scope & Filter Summary
  let contentY = headerEndY
  if (filterSummary) {
    doc.setFillColor(...TSA_MAROON_L)
    doc.roundedRect(14, contentY, pw - 28, 6.5, 1, 1, 'F')
    doc.setDrawColor(240, 175, 183)
    doc.setLineWidth(0.2)
    doc.roundedRect(14, contentY, pw - 28, 6.5, 1, 1, 'D')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...TSA_MAROON)
    doc.text('Scope / Filter:', 18, contentY + 4.5)

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TSA_SLATE)
    doc.text(`${filterSummary}  ·  ${rows.length} total records`, 42, contentY + 4.5)

    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...TSA_MUTED)
    doc.text(`Generated: ${formatTimestamp(new Date())}`, pw - 18, contentY + 4.5, { align: 'right' })

    contentY += 9
  }

  // 3. Render Table
  autoTable(doc, {
    startY: contentY,
    head: [headers],
    body: rows.map(r => r.map(safeText)),
    margin: { top: 12, bottom: 16, left: 14, right: 14 },
    theme: 'grid',
    headStyles: {
      fillColor: TSA_MAROON,
      textColor: TSA_WHITE,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.6,
      halign: 'left',
      lineColor: TSA_MAROON_D,
      lineWidth: 0.3,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TSA_SLATE,
      cellPadding: 2.2,
      lineColor: TSA_BORDER,
      lineWidth: 0.15,
    },
    alternateRowStyles: {
      fillColor: TSA_ZEBRA,
    },
    showHead: 'everyPage',
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        drawMiniHeader(doc, title, branchName)
      }
      drawFooter(doc, data.pageNumber, `The Scholar Coaching Academy — ${title} — Confidential Document`)
    },
  })

  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  doc.save(safeFilename)
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE B: STUDENT FEE CHALLAN / INVOICE PDF
// ─────────────────────────────────────────────────────────────────────────────
export function exportChallanPdf({
  challan = {},
  student = {},
  branchName = 'Main Campus',
  filename = null,
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pw = doc.internal.pageSize.getWidth()

  // 1. Draw branded header
  const headerEndY = drawPremiumHeader(doc, 'FEE CHALLAN', branchName)

  // 2. Document Title Strip
  doc.setFillColor(...TSA_MAROON_L)
  doc.rect(14, headerEndY, pw - 28, 8, 'F')
  doc.setDrawColor(240, 175, 183)
  doc.setLineWidth(0.2)
  doc.rect(14, headerEndY, pw - 28, 8, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...TSA_MAROON)
  doc.text('STUDENT FEE CHALLAN & INVOICE', pw / 2, headerEndY + 5.5, { align: 'center' })

  // Status badge
  const status = challan.status || 'Unpaid'
  const statusColor = status === 'Paid' ? TSA_EMERALD : status === 'Partial' ? [245, 158, 11] : [220, 38, 38]
  doc.setFillColor(...statusColor)
  doc.roundedRect(pw - 44, headerEndY + 1.5, 26, 5.2, 1, 1, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...TSA_WHITE)
  doc.text(status.toUpperCase(), pw - 31, headerEndY + 5, { align: 'center' })

  const sectionY = headerEndY + 12

  // 3. Information Cards
  // Left: Student Particulars
  const cardW = 88
  doc.setFillColor(252, 253, 254)
  doc.roundedRect(14, sectionY, cardW, 42, 2, 2, 'F')
  doc.setDrawColor(...TSA_BORDER)
  doc.roundedRect(14, sectionY, cardW, 42, 2, 2, 'D')

  doc.setFillColor(...TSA_MAROON)
  doc.roundedRect(14, sectionY, cardW, 6.5, 2, 2, 'F')
  doc.rect(14, sectionY + 4.5, cardW, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_WHITE)
  doc.text('STUDENT PARTICULARS', 18, sectionY + 4.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const leftFields = [
    ['Student Name', challan.studentName || student.name || '—'],
    ['Roll / ID', challan.studentNumber || student.studentNumber || challan.studentId || '—'],
    ['Guardian', student.guardianName || '—'],
    ['Contact', student.guardianContact || '—'],
  ]
  leftFields.forEach(([label, val], idx) => {
    const y = sectionY + 11.5 + idx * 7.5
    doc.setTextColor(...TSA_MUTED)
    doc.text(`${label}:`, 18, y)
    doc.setTextColor(...TSA_SLATE)
    doc.setFont('helvetica', 'bold')
    doc.text(String(val), 43, y)
    doc.setFont('helvetica', 'normal')
  })

  // Right: Challan Particulars
  const rightX = 108
  doc.setFillColor(252, 253, 254)
  doc.roundedRect(rightX, sectionY, cardW, 42, 2, 2, 'F')
  doc.setDrawColor(...TSA_BORDER)
  doc.roundedRect(rightX, sectionY, cardW, 42, 2, 2, 'D')

  doc.setFillColor(...TSA_MAROON)
  doc.roundedRect(rightX, sectionY, cardW, 6.5, 2, 2, 'F')
  doc.rect(rightX, sectionY + 4.5, cardW, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_WHITE)
  doc.text('CHALLAN PARTICULARS', rightX + 4, sectionY + 4.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const rightFields = [
    ['Challan Ref', challan.reference || '—'],
    ['Program', challan.courseName || student.courseName || '—'],
    ['Batch', challan.batchName || student.batchName || '—'],
    ['Due Date', formatDate(challan.dueDate)],
  ]
  rightFields.forEach(([label, val], idx) => {
    const y = sectionY + 11.5 + idx * 7.5
    doc.setTextColor(...TSA_MUTED)
    doc.text(`${label}:`, rightX + 4, y)
    doc.setTextColor(...(idx === 3 ? [220, 38, 38] : TSA_SLATE))
    doc.setFont('helvetica', 'bold')
    doc.text(String(val), rightX + 28, y)
    doc.setFont('helvetica', 'normal')
  })

  // 4. Line Items Table
  const amount  = Number(challan.amount || 0)
  const paid    = Number(challan.paidAmount || 0)
  const balance = Number(challan.balance ?? (amount - paid))

  autoTable(doc, {
    startY: sectionY + 47,
    head: [['Sr #', 'Fee Item Description', 'Configured Total', 'Verified Paid', 'Net Balance']],
    body: [
      [
        '1',
        challan.description || 'Academic Tuition & Session Fee',
        formatCurrency(amount),
        formatCurrency(paid),
        formatCurrency(balance),
      ],
    ],
    theme: 'grid',
    margin: { left: 14, right: 14 },
    headStyles: {
      fillColor: TSA_MAROON,
      textColor: TSA_WHITE,
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 3,
      lineColor: TSA_MAROON_D,
      lineWidth: 0.3,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: TSA_SLATE,
      cellPadding: 3.5,
      lineColor: TSA_BORDER,
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 80 },
      2: { halign: 'right' },
      3: { halign: 'right', textColor: TSA_EMERALD },
      4: { halign: 'right', fontStyle: 'bold', textColor: TSA_MAROON },
    },
  })

  const finY = doc.lastAutoTable.finalY + 6

  // 5. Financial Summary Card (Right)
  const sumW = 72
  const sumX = pw - 14 - sumW
  doc.setFillColor(254, 242, 242)
  doc.roundedRect(sumX, finY, sumW, 28, 1.5, 1.5, 'F')
  doc.setDrawColor(240, 175, 183)
  doc.roundedRect(sumX, finY, sumW, 28, 1.5, 1.5, 'D')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TSA_SLATE)
  doc.text('Total Challan Fee:', sumX + 4, finY + 6.5)
  doc.text(formatCurrency(amount), sumX + sumW - 4, finY + 6.5, { align: 'right' })

  doc.text('Amount Received:', sumX + 4, finY + 13)
  doc.setTextColor(...TSA_EMERALD)
  doc.text(formatCurrency(paid), sumX + sumW - 4, finY + 13, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...TSA_MAROON)
  doc.text('Net Balance Due:', sumX + 4, finY + 21.5)
  doc.text(formatCurrency(balance), sumX + sumW - 4, finY + 21.5, { align: 'right' })

  // 6. Payment Instructions (Left)
  const instW = 96
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(14, finY, instW, 28, 1.5, 1.5, 'F')
  doc.setDrawColor(...TSA_BORDER)
  doc.roundedRect(14, finY, instW, 28, 1.5, 1.5, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_MAROON)
  doc.text('TERMS & PAYMENT INSTRUCTIONS', 18, finY + 6)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...TSA_MUTED)
  doc.text('1. Present this challan at the accounts desk for payment.', 18, finY + 11.5)
  doc.text('2. An official verified receipt is issued upon receiving payment.', 18, finY + 16.5)
  doc.text('3. Dues must be settled on or before the due date.', 18, finY + 21.5)

  // 7. Signature Lines
  const sigY = finY + 44
  doc.setDrawColor(...TSA_BORDER)
  doc.setLineWidth(0.3)
  doc.line(20, sigY, 75, sigY)
  doc.line(pw - 75, sigY, pw - 20, sigY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_MUTED)
  doc.text('Student / Depositor Signature', 47.5, sigY + 4, { align: 'center' })
  doc.text('Authorized Accounts Officer / Cashier', pw - 47.5, sigY + 4, { align: 'center' })

  // 8. Footer
  drawFooter(doc, 1, `The Scholar Coaching Academy — Official Student Billing Document • Ref: ${challan.reference || 'N/A'}`)

  const outName = filename || `${(challan.studentName || 'student').toLowerCase().replace(/\s+/g, '-')}-challan-${challan.reference || 'ref'}.pdf`
  doc.save(outName)
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE C: OFFICIAL PAYMENT RECEIPT PDF
// ─────────────────────────────────────────────────────────────────────────────
export function exportReceiptPdf({
  payment = {},
  challan = {},
  student = {},
  branchName = 'Main Campus',
  filename = null,
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pw = doc.internal.pageSize.getWidth()

  // 1. Draw branded header
  const headerEndY = drawPremiumHeader(doc, 'RECEIPT', branchName)

  // 2. Verified Receipt Strip
  doc.setFillColor(240, 253, 244)
  doc.rect(14, headerEndY, pw - 28, 8, 'F')
  doc.setDrawColor(167, 243, 208)
  doc.setLineWidth(0.2)
  doc.rect(14, headerEndY, pw - 28, 8, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...TSA_EMERALD_D)
  doc.text('OFFICIAL FEE PAYMENT RECEIPT', pw / 2, headerEndY + 5.5, { align: 'center' })

  // Verified Badge
  doc.setFillColor(...TSA_EMERALD)
  doc.roundedRect(pw - 46, headerEndY + 1.5, 30, 5.2, 1, 1, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...TSA_WHITE)
  doc.text('VERIFIED RECEIPT', pw - 31, headerEndY + 5, { align: 'center' })

  const sectionY = headerEndY + 12

  // 3. Information Cards
  // Left: Student Particulars
  const cardW = 88
  doc.setFillColor(252, 253, 254)
  doc.roundedRect(14, sectionY, cardW, 36, 2, 2, 'F')
  doc.setDrawColor(...TSA_BORDER)
  doc.roundedRect(14, sectionY, cardW, 36, 2, 2, 'D')

  doc.setFillColor(...TSA_MAROON)
  doc.roundedRect(14, sectionY, cardW, 6.5, 2, 2, 'F')
  doc.rect(14, sectionY + 4.5, cardW, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_WHITE)
  doc.text('STUDENT PARTICULARS', 18, sectionY + 4.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const leftFields = [
    ['Name', payment.studentName || student.name || '—'],
    ['Roll / ID', payment.studentNumber || student.studentNumber || '—'],
    ['Program', `${challan.courseName || student.courseName || '—'} (${challan.batchName || student.batchName || '—'})`],
  ]
  leftFields.forEach(([label, val], idx) => {
    const y = sectionY + 12 + idx * 7.5
    doc.setTextColor(...TSA_MUTED)
    doc.text(`${label}:`, 18, y)
    doc.setTextColor(...TSA_SLATE)
    doc.setFont('helvetica', 'bold')
    doc.text(String(val), 35, y)
    doc.setFont('helvetica', 'normal')
  })

  // Right: Receipt Particulars
  const rightX = 108
  doc.setFillColor(252, 253, 254)
  doc.roundedRect(rightX, sectionY, cardW, 36, 2, 2, 'F')
  doc.setDrawColor(...TSA_BORDER)
  doc.roundedRect(rightX, sectionY, cardW, 36, 2, 2, 'D')

  doc.setFillColor(...TSA_EMERALD_D)
  doc.roundedRect(rightX, sectionY, cardW, 6.5, 2, 2, 'F')
  doc.rect(rightX, sectionY + 4.5, cardW, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_WHITE)
  doc.text('RECEIPT PARTICULARS', rightX + 4, sectionY + 4.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  const rightFields = [
    ['Receipt Ref', payment.receiptReference || '—'],
    ['Challan Ref', payment.challanReference || challan.reference || '—'],
    ['Payment Mode', `${payment.method || 'Cash'}  |  Date: ${formatDate(payment.paidAt)}`],
  ]
  rightFields.forEach(([label, val], idx) => {
    const y = sectionY + 12 + idx * 7.5
    doc.setTextColor(...TSA_MUTED)
    doc.text(`${label}:`, rightX + 4, y)
    doc.setTextColor(...TSA_SLATE)
    doc.setFont('helvetica', 'bold')
    doc.text(String(val), rightX + 28, y)
    doc.setFont('helvetica', 'normal')
  })

  // 4. Payment Line Item Table
  const amountPaid = Number(payment.amount || 0)
  autoTable(doc, {
    startY: sectionY + 41,
    head: [['Sr #', 'Payment Description', 'Payment Method', 'Date Received', 'Amount Paid']],
    body: [
      [
        '1',
        `Tuition Fee Payment — ${payment.studentName || 'Student'}`,
        payment.method || 'Cash',
        formatDate(payment.paidAt),
        formatCurrency(amountPaid),
      ],
    ],
    theme: 'grid',
    margin: { left: 14, right: 14 },
    headStyles: {
      fillColor: TSA_EMERALD_D,
      textColor: TSA_WHITE,
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2.8,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: TSA_SLATE,
      cellPadding: 3,
      lineColor: TSA_BORDER,
      lineWidth: 0.15,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
      4: { halign: 'right', fontStyle: 'bold', textColor: TSA_EMERALD_D },
    },
  })

  const finY = doc.lastAutoTable.finalY + 6

  // 5. Total Received Highlight Box
  const sumW = 74
  const sumX = pw - 14 - sumW
  doc.setFillColor(240, 253, 244)
  doc.roundedRect(sumX, finY, sumW, 20, 1.5, 1.5, 'F')
  doc.setDrawColor(167, 243, 208)
  doc.roundedRect(sumX, finY, sumW, 20, 1.5, 1.5, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...TSA_EMERALD_D)
  doc.text('TOTAL RECEIVED:', sumX + 4, finY + 7.5)
  doc.text(formatCurrency(amountPaid), sumX + sumW - 4, finY + 7.5, { align: 'right' })

  if (challan.balance != null) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...TSA_MUTED)
    doc.text('Remaining Challan Balance:', sumX + 4, finY + 14.5)
    doc.setTextColor(...TSA_MAROON)
    doc.setFont('helvetica', 'bold')
    doc.text(formatCurrency(challan.balance), sumX + sumW - 4, finY + 14.5, { align: 'right' })
  }

  // 6. Formal Acknowledgment Box
  const ackW = 94
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(14, finY, ackW, 20, 1.5, 1.5, 'F')
  doc.setDrawColor(...TSA_BORDER)
  doc.roundedRect(14, finY, ackW, 20, 1.5, 1.5, 'D')

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_SLATE)
  doc.text('Received with thanks from the student/guardian named above.', 18, finY + 7.5)
  doc.text('This verified computer-generated receipt requires no physical stamp.', 18, finY + 14.5)

  // 7. Signature Line
  const sigY = finY + 36
  doc.setDrawColor(...TSA_BORDER)
  doc.setLineWidth(0.3)
  doc.line(pw - 75, sigY, pw - 20, sigY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_MUTED)
  doc.text('Accounts Officer / Cashier Signature', pw - 47.5, sigY + 4, { align: 'center' })

  // 8. Footer
  drawFooter(doc, 1, `The Scholar Coaching Academy — Official Verified Payment Receipt • Receipt: ${payment.receiptReference || 'N/A'}`)

  const outName = filename || `${(payment.studentName || 'student').toLowerCase().replace(/\s+/g, '-')}-receipt-${payment.receiptReference || 'ref'}.pdf`
  doc.save(outName)
}

export function exportPayslipPdf({
  payslip = {},
  branchName = 'Main Campus',
  filename = null,
}) {
  if (payslip.line?.payrollVersion >= 2) {
    const { line, payments = [] } = payslip
    return exportTablePdf({ filename: filename || `payslip-${payrollReference(line.id)}.pdf`, title: 'Faculty Salary Balance & Payments', branchName,
      headers: ['Salary / Payment Detail', 'Amount / Reference'],
      rows: [
        ['Teacher', line.teacherName], ['Course', line.courseName], ['Batch', line.batchName], ['Subject', line.subjectName],
        ['Payslip ref', payrollReference(line.id)], ['Class ref', payrollReference(line.facultyAssignmentId, 'CLS')], ['Salary method', line.calculationMethod],
        ['Calculation (listed fees, not cash receipts)', line.calculationDetails?.description],
        ['Salary due (PKR)', line.netPayable], ['Verified salary paid (PKR)', line.totalPaid], ['Remaining (PKR)', line.outstanding],
        ...payments.map(p => [`Payment ${p.paidAt.slice(0,10)} / ${p.method} / ${paymentReference(p)}`, p.amount]),
      ],
    })
  }
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pw = doc.internal.pageSize.getWidth()
  const teacher = payslip.teacher || {}
  const line = payslip.line || {}

  // 1. Draw branded header
  const headerEndY = drawPremiumHeader(doc, 'PAYSLIP', branchName)

  // 2. Payslip Strip
  doc.setFillColor(...TSA_MAROON_L)
  doc.rect(14, headerEndY, pw - 28, 8, 'F')
  doc.setDrawColor(...TSA_MAROON)
  doc.setLineWidth(0.2)
  doc.rect(14, headerEndY, pw - 28, 8, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(...TSA_MAROON)
  doc.text('OFFICIAL TEACHER SALARY PAYSLIP — ' + (line.yearMonth || 'Oct 2026'), pw / 2, headerEndY + 5.5, { align: 'center' })

  // Status Badge
  const status = line.status || 'Draft'
  const isPaid = status === 'Paid'
  doc.setFillColor(isPaid ? 16 : 148, isPaid ? 185 : 0, isPaid ? 129 : 22)
  doc.roundedRect(pw - 46, headerEndY + 1.5, 30, 5.2, 1, 1, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...TSA_WHITE)
  doc.text((status || 'APPROVED').toUpperCase(), pw - 31, headerEndY + 5, { align: 'center' })

  // 3. Faculty & Period Metadata Grid
  const metaY = headerEndY + 12
  doc.setFillColor(...TSA_ZEBRA)
  doc.roundedRect(14, metaY, pw - 28, 22, 1.5, 1.5, 'F')
  doc.setDrawColor(...TSA_BORDER)
  doc.setLineWidth(0.2)
  doc.roundedRect(14, metaY, pw - 28, 22, 1.5, 1.5, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_MUTED)
  doc.text('FACULTY MEMBER', 18, metaY + 5)
  doc.text('QUALIFICATION / ROLE', 75, metaY + 5)
  doc.text('PAYROLL PERIOD', 135, metaY + 5)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...TSA_SLATE)
  doc.text(safeText(teacher.name || 'Faculty Member'), 18, metaY + 11)
  doc.text(safeText(teacher.qualification || 'Teacher'), 75, metaY + 11)
  doc.text(safeText(line.yearMonth || '2026-10'), 135, metaY + 11)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_MUTED)
  doc.text('ID: ' + safeText(teacher.id) + ' • Contact: ' + safeText(teacher.contact || 'N/A'), 18, metaY + 17)
  doc.text('Method: ' + safeText(line.calculationMethod).toUpperCase(), 75, metaY + 17)
  doc.text('Ref: ' + safeText(line.id), 135, metaY + 17)

  // 4. Earnings & Deductions Tables (Side by side)
  const tblY = metaY + 26
  const colW = (pw - 32) / 2

  // Earnings Header
  doc.setFillColor(...TSA_MAROON)
  doc.rect(14, tblY, colW, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...TSA_WHITE)
  doc.text('EARNINGS & BREAKDOWN', 18, tblY + 5)
  doc.text('AMOUNT (PKR)', 14 + colW - 4, tblY + 5, { align: 'right' })

  // Deductions Header
  doc.setFillColor(...TSA_SLATE)
  doc.rect(14 + colW + 4, tblY, colW, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...TSA_WHITE)
  doc.text('DEDUCTIONS & ADJUSTMENTS', 18 + colW + 4, tblY + 5)
  doc.text('AMOUNT (PKR)', pw - 18, tblY + 5, { align: 'right' })

  // Earnings Rows
  let earnY = tblY + 7
  const earnItems = [
    ['Base Salary (' + (line.calculationDetails?.description || safeText(line.calculationMethod)) + ')', line.baseEarnings || 0],
    ['Conveyance / Medical Allowances', line.allowances || 0],
  ]
  if (line.adjustments > 0) earnItems.push(['Approved Performance Bonus', line.adjustments])

  earnItems.forEach(([label, amt], idx) => {
    if (idx % 2 === 1) doc.setFillColor(...TSA_ZEBRA)
    else doc.setFillColor(...TSA_WHITE)
    doc.rect(14, earnY, colW, 7, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...TSA_SLATE)
    doc.text(label.length > 35 ? label.slice(0, 33) + '..' : label, 18, earnY + 4.8)
    doc.setFont('helvetica', 'bold')
    doc.text(Number(amt).toLocaleString('en-PK'), 14 + colW - 4, earnY + 4.8, { align: 'right' })
    earnY += 7
  })

  // Deductions Rows
  let dedY = tblY + 7
  const dedItems = [
    ['Standard Tax / Fund Deductions', line.deductions || 0],
    ['Staff Advance Salary Recovery', line.advancesDeducted || 0],
  ]
  if (line.adjustments < 0) dedItems.push(['Manual Deduction / Fine', Math.abs(line.adjustments)])

  dedItems.forEach(([label, amt], idx) => {
    if (idx % 2 === 1) doc.setFillColor(...TSA_ZEBRA)
    else doc.setFillColor(...TSA_WHITE)
    doc.rect(14 + colW + 4, dedY, colW, 7, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...TSA_SLATE)
    doc.text(label.length > 35 ? label.slice(0, 33) + '..' : label, 18 + colW + 4, dedY + 4.8)
    doc.setFont('helvetica', 'bold')
    doc.text(Number(amt).toLocaleString('en-PK'), pw - 18, dedY + 4.8, { align: 'right' })
    dedY += 7
  })

  // 5. Net Salary Highlights Banner
  const summaryY = Math.max(earnY, dedY) + 4
  doc.setFillColor(...TSA_MAROON)
  doc.roundedRect(14, summaryY, pw - 28, 14, 1.5, 1.5, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...TSA_WHITE)
  doc.text('NET SALARY PAYABLE:', 20, summaryY + 9)
  doc.setFontSize(13)
  doc.text('PKR ' + Number(line.netPayable || 0).toLocaleString('en-PK'), pw - 20, summaryY + 9.5, { align: 'right' })

  // 6. Disbursements & Outstanding Details
  const disY = summaryY + 18
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...TSA_SLATE)
  doc.text('DISBURSEMENT & SETTLEMENT RECORD', 14, disY)

  doc.setFillColor(...TSA_ZEBRA)
  doc.roundedRect(14, disY + 3, pw - 28, 22, 1.5, 1.5, 'F')
  doc.setDrawColor(...TSA_BORDER)
  doc.setLineWidth(0.2)
  doc.roundedRect(14, disY + 3, pw - 28, 22, 1.5, 1.5, 'D')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_MUTED)
  doc.text('Total Disbursed (Paid):', 18, disY + 9)
  doc.text('Remaining Outstanding:', 85, disY + 9)
  doc.text('Disbursement Status:', 140, disY + 9)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(16, 185, 129)
  doc.text('PKR ' + Number(line.totalPaid || 0).toLocaleString('en-PK'), 18, disY + 16)
  doc.setTextColor(line.outstanding > 0 ? 148 : 100, line.outstanding > 0 ? 0 : 116, line.outstanding > 0 ? 22 : 139)
  doc.text('PKR ' + Number(line.outstanding || 0).toLocaleString('en-PK'), 85, disY + 16)
  doc.setTextColor(...TSA_SLATE)
  doc.text(safeText(line.status).toUpperCase(), 140, disY + 16)

  // 7. Signature Line
  const sigY = disY + 40
  doc.setDrawColor(...TSA_BORDER)
  doc.setLineWidth(0.3)
  doc.line(20, sigY, 75, sigY)
  doc.line(pw - 75, sigY, pw - 20, sigY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...TSA_MUTED)
  doc.text('Faculty Member Signature', 47.5, sigY + 4, { align: 'center' })
  doc.text('Campus Accountant / Super Admin', pw - 47.5, sigY + 4, { align: 'center' })

  // 8. Footer
  drawFooter(doc, 1, 'The Scholar Coaching Academy — Official Verified Payslip • Ref: ' + (line.id || 'N/A'))

  const outName = filename || ((teacher.name || 'teacher').toLowerCase().replace(/\s+/g, '-') + '-payslip-' + (line.yearMonth || 'month') + '.pdf')
  doc.save(outName)
}
