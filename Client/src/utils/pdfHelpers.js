/**
 * Purpose: Universal PDF Document Generator for The Scholar Coaching Academy (TSA) ERP.
 * Implements:
 * - Template A: Table Report PDF (Multi-page, repeated headers, page numbers, auto orientation)
 * - Template B: Student Fee Challan / Invoice PDF (Official branded invoice with financial verification)
 * - Template C: Payment Receipt PDF (Official verified receipt with payment acknowledgment)
 */

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

// Official TSA Branding Constants
const TSA_MAROON = [148, 0, 22] // #940016
const TSA_SLATE = [30, 41, 59] // #1e293b
const TSA_MUTED = [100, 116, 139] // #64748b
const TSA_BORDER = [226, 232, 240] // #e2e8f0
const TSA_ZEBRA = [248, 250, 252] // #f8fafc

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
 * TEMPLATE A: TABLE REPORT PDF
 * Generates consistent multi-page table directory reports.
 */
export function exportTablePdf({
  filename = 'report.pdf',
  title = 'Directory Report',
  branchName = 'The Scholar Coaching Academy',
  headers = [],
  rows = [],
  filterSummary = '',
  orientation = null,
}) {
  // Auto determine orientation: landscape if wide (>= 6 columns), else portrait
  const autoOrientation = orientation || (headers.length >= 6 ? 'landscape' : 'portrait')
  const doc = new jsPDF({
    orientation: autoOrientation,
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // 1. Top Decorative Brand Bar
  doc.setFillColor(...TSA_MAROON)
  doc.rect(0, 0, pageWidth, 5, 'F')

  // 2. Header Branding
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...TSA_MAROON)
  doc.text('THE SCHOLAR COACHING ACADEMY', 14, 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TSA_MUTED)
  doc.text('Official Management & Academic Information System', 14, 17)

  // Right-aligned report title & date
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...TSA_SLATE)
  doc.text(title.toUpperCase(), pageWidth - 14, 13, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TSA_MUTED)
  const metaLine = `Campus: ${branchName} | Generated: ${new Date().toLocaleString('en-PK')}`
  doc.text(metaLine, pageWidth - 14, 17, { align: 'right' })

  // Subtle separator line
  doc.setDrawColor(...TSA_BORDER)
  doc.setLineWidth(0.3)
  doc.line(14, 20, pageWidth - 14, 20)

  // Scope summary if provided
  let startY = 24
  if (filterSummary) {
    doc.setFontSize(8)
    doc.setTextColor(...TSA_SLATE)
    doc.text(`Scope: ${filterSummary} (${rows.length} records)`, 14, startY)
    startY += 4
  }

  // 3. Render Table with repeated headers and pagination
  autoTable(doc, {
    startY,
    head: [headers],
    body: rows.map(r => r.map(safeText)),
    margin: { top: 24, bottom: 16, left: 14, right: 14 },
    theme: 'grid',
    headStyles: {
      fillColor: TSA_MAROON,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.2,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TSA_SLATE,
      cellPadding: 2,
      lineColor: TSA_BORDER,
      lineWidth: 0.15,
    },
    alternateRowStyles: {
      fillColor: TSA_ZEBRA,
    },
    showHead: 'everyPage',
    didDrawPage: (data) => {
      // Repeat top header line on subsequent pages
      if (data.pageNumber > 1) {
        doc.setFillColor(...TSA_MAROON)
        doc.rect(0, 0, pageWidth, 4, 'F')

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(...TSA_MAROON)
        doc.text('THE SCHOLAR COACHING ACADEMY', 14, 9)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...TSA_MUTED)
        doc.text(`${title} (cont.) — ${branchName}`, pageWidth - 14, 9, { align: 'right' })

        doc.setDrawColor(...TSA_BORDER)
        doc.setLineWidth(0.2)
        doc.line(14, 12, pageWidth - 14, 12)
      }

      // Footer on every page
      doc.setDrawColor(...TSA_BORDER)
      doc.setLineWidth(0.2)
      doc.line(14, pageHeight - 10, pageWidth - 14, pageHeight - 10)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...TSA_MUTED)
      doc.text('The Scholar Coaching Academy — Confidential Document', 14, pageHeight - 6)
      doc.text(`Page ${data.pageNumber}`, pageWidth - 14, pageHeight - 6, { align: 'right' })
    },
  })

  // Download directly
  const safeFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  doc.save(safeFilename)
}

/**
 * TEMPLATE B: STUDENT FEE CHALLAN / INVOICE PDF
 * Official financial document with student details, course/batch, due date, and verified balance.
 */
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

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // 1. Top Decorative Brand Bar
  doc.setFillColor(...TSA_MAROON)
  doc.rect(0, 0, pageWidth, 6, 'F')

  // 2. Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...TSA_MAROON)
  doc.text('THE SCHOLAR COACHING ACADEMY', 14, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...TSA_MUTED)
  doc.text(`Official Academic Fee Challan & Invoice • Campus: ${branchName}`, 14, 21)

  // Status Badge in Top Right
  const status = challan.status || 'Unpaid'
  const statusColor = status === 'Paid' ? [16, 185, 129] : status === 'Partial' ? [245, 158, 11] : [239, 68, 68]
  doc.setFillColor(...statusColor)
  doc.roundedRect(pageWidth - 42, 11, 28, 7, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text(status.toUpperCase(), pageWidth - 28, 15.5, { align: 'center' })

  doc.setDrawColor(...TSA_BORDER)
  doc.setLineWidth(0.3)
  doc.line(14, 25, pageWidth - 14, 25)

  // 3. Two Information Cards (Left: Student Info, Right: Challan Info)
  // Left Card: Student Info
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(14, 29, 88, 38, 2, 2, 'F')
  doc.setDrawColor(...TSA_BORDER)
  doc.roundedRect(14, 29, 88, 38, 2, 2, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...TSA_MAROON)
  doc.text('STUDENT INFORMATION', 18, 35)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TSA_SLATE)
  doc.text(`Name: ${challan.studentName || student.name || '—'}`, 18, 41)
  doc.text(`Roll / ID: ${challan.studentNumber || student.studentNumber || challan.studentId || '—'}`, 18, 47)
  doc.text(`Guardian: ${student.guardianName || '—'}`, 18, 53)
  doc.text(`Contact: ${student.guardianContact || '—'}`, 18, 59)

  // Right Card: Challan & Course Info
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(108, 29, 88, 38, 2, 2, 'F')
  doc.setDrawColor(...TSA_BORDER)
  doc.roundedRect(108, 29, 88, 38, 2, 2, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...TSA_MAROON)
  doc.text('CHALLAN DETAILS', 112, 35)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TSA_SLATE)
  doc.text(`Challan No: ${challan.reference || '—'}`, 112, 41)
  doc.text(`Course: ${challan.courseName || student.courseName || '—'}`, 112, 47)
  doc.text(`Batch: ${challan.batchName || student.batchName || '—'}`, 112, 53)
  doc.text(`Issue: ${formatDate(challan.issueDate)}  |  Due: ${formatDate(challan.dueDate)}`, 112, 59)

  // 4. Line Items Table
  const amount = Number(challan.amount || 0)
  const paid = Number(challan.paidAmount || 0)
  const balance = Number(challan.balance ?? (amount - paid))

  autoTable(doc, {
    startY: 73,
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
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: TSA_SLATE,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 80 },
      2: { halign: 'right' },
      3: { halign: 'right', textColor: [16, 185, 129] },
      4: { halign: 'right', fontStyle: 'bold', textColor: [148, 0, 22] },
    },
  })

  // 5. Financial Summary Card
  const finalY = doc.lastAutoTable.finalY + 6
  doc.setFillColor(254, 242, 242) // subtle maroon tint
  doc.roundedRect(pageWidth - 84, finalY, 70, 26, 1.5, 1.5, 'F')
  doc.setDrawColor(...TSA_BORDER)
  doc.roundedRect(pageWidth - 84, finalY, 70, 26, 1.5, 1.5, 'D')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TSA_SLATE)
  doc.text('Total Challan Fee:', pageWidth - 80, finalY + 6)
  doc.text(formatCurrency(amount), pageWidth - 18, finalY + 6, { align: 'right' })

  doc.text('Amount Received:', pageWidth - 80, finalY + 12)
  doc.setTextColor(16, 185, 129)
  doc.text(formatCurrency(paid), pageWidth - 18, finalY + 12, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...TSA_MAROON)
  doc.text('Net Balance Due:', pageWidth - 80, finalY + 20)
  doc.text(formatCurrency(balance), pageWidth - 18, finalY + 20, { align: 'right' })

  // 6. Payment Instructions & Official Policy
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(14, finalY, 90, 26, 1.5, 1.5, 'F')
  doc.setDrawColor(...TSA_BORDER)
  doc.roundedRect(14, finalY, 90, 26, 1.5, 1.5, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_MAROON)
  doc.text('TERMS & PAYMENT INSTRUCTIONS', 18, finalY + 6)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...TSA_MUTED)
  doc.text('1. Present this challan at the accounts desk for payment.', 18, finalY + 11)
  doc.text('2. An official verified receipt is issued upon receiving payment.', 18, finalY + 15)
  doc.text('3. Dues must be settled on or before the due date.', 18, finalY + 19)
  doc.text('4. Fee once paid is strictly non-refundable and non-transferable.', 18, finalY + 23)

  // 7. Signature & Stamp Lines
  const sigY = finalY + 45
  doc.setDrawColor(...TSA_BORDER)
  doc.setLineWidth(0.3)
  doc.line(20, sigY, 70, sigY)
  doc.line(pageWidth - 70, sigY, pageWidth - 20, sigY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_MUTED)
  doc.text('Student / Depositor Signature', 45, sigY + 4, { align: 'center' })
  doc.text('Authorized Accounts Officer / Cashier', pageWidth - 45, sigY + 4, { align: 'center' })

  // Footer
  doc.setDrawColor(...TSA_BORDER)
  doc.setLineWidth(0.2)
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12)

  doc.setFontSize(7)
  doc.text('The Scholar Coaching Academy — Official Student Billing Document', 14, pageHeight - 7)
  doc.text(`Reference: ${challan.reference || 'N/A'}`, pageWidth - 14, pageHeight - 7, { align: 'right' })

  const outName = filename || `${(challan.studentName || 'student').toLowerCase().replace(/\s+/g, '-')}-challan-${challan.reference || 'ref'}.pdf`
  doc.save(outName)
}

/**
 * TEMPLATE C: OFFICIAL PAYMENT RECEIPT PDF
 * Official verified receipt acknowledgment for recorded payments.
 */
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

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // 1. Top Decorative Brand Bar
  doc.setFillColor(...TSA_MAROON)
  doc.rect(0, 0, pageWidth, 6, 'F')

  // 2. Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...TSA_MAROON)
  doc.text('THE SCHOLAR COACHING ACADEMY', 14, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...TSA_MUTED)
  doc.text(`Official Fee Payment Receipt • Campus: ${branchName}`, 14, 21)

  // Verified Badge
  doc.setFillColor(16, 185, 129) // emerald green
  doc.roundedRect(pageWidth - 44, 11, 30, 7, 1.5, 1.5, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(255, 255, 255)
  doc.text('VERIFIED RECEIPT', pageWidth - 29, 15.5, { align: 'center' })

  doc.setDrawColor(...TSA_BORDER)
  doc.setLineWidth(0.3)
  doc.line(14, 25, pageWidth - 14, 25)

  // 3. Two Information Cards
  // Left: Student Info
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(14, 29, 88, 34, 2, 2, 'F')
  doc.setDrawColor(...TSA_BORDER)
  doc.roundedRect(14, 29, 88, 34, 2, 2, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...TSA_MAROON)
  doc.text('STUDENT PARTICULARS', 18, 35)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TSA_SLATE)
  doc.text(`Name: ${payment.studentName || student.name || '—'}`, 18, 41)
  doc.text(`Roll / ID: ${payment.studentNumber || student.studentNumber || '—'}`, 18, 47)
  doc.text(`Program: ${challan.courseName || student.courseName || '—'} (${challan.batchName || student.batchName || '—'})`, 18, 53)

  // Right: Receipt Particulars
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(108, 29, 88, 34, 2, 2, 'F')
  doc.setDrawColor(...TSA_BORDER)
  doc.roundedRect(108, 29, 88, 34, 2, 2, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor(...TSA_MAROON)
  doc.text('RECEIPT PARTICULARS', 112, 35)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...TSA_SLATE)
  doc.text(`Receipt Ref: ${payment.receiptReference || '—'}`, 112, 41)
  doc.text(`Challan Ref: ${payment.challanReference || challan.reference || '—'}`, 112, 47)
  doc.text(`Payment Mode: ${payment.method || 'Cash'}  |  Date: ${formatDate(payment.paidAt)}`, 112, 53)

  // 4. Payment Line Item Table
  const amountPaid = Number(payment.amount || 0)
  autoTable(doc, {
    startY: 69,
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
      fillColor: [16, 185, 129], // Emerald header for receipt
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: TSA_SLATE,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
      4: { halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] },
    },
  })

  // 5. Total Paid Box
  const finalY = doc.lastAutoTable.finalY + 6
  doc.setFillColor(240, 253, 244) // subtle emerald tint
  doc.roundedRect(pageWidth - 84, finalY, 70, 18, 1.5, 1.5, 'F')
  doc.setDrawColor(...TSA_BORDER)
  doc.roundedRect(pageWidth - 84, finalY, 70, 18, 1.5, 1.5, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(16, 185, 129)
  doc.text('TOTAL RECEIVED:', pageWidth - 80, finalY + 7)
  doc.text(formatCurrency(amountPaid), pageWidth - 18, finalY + 7, { align: 'right' })

  if (challan.balance != null) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...TSA_MUTED)
    doc.text('Remaining Challan Balance:', pageWidth - 80, finalY + 13)
    doc.text(formatCurrency(challan.balance), pageWidth - 18, finalY + 13, { align: 'right' })
  }

  // 6. Formal Acknowledgment Text
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(14, finalY, 90, 18, 1.5, 1.5, 'F')
  doc.setDrawColor(...TSA_BORDER)
  doc.roundedRect(14, finalY, 90, 18, 1.5, 1.5, 'D')

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_SLATE)
  doc.text('Received with thanks from the student/guardian named above.', 18, finalY + 7)
  doc.text('This verified computer-generated receipt requires no physical stamp.', 18, finalY + 13)

  // 7. Signature / Seal Line
  const sigY = finalY + 36
  doc.setDrawColor(...TSA_BORDER)
  doc.setLineWidth(0.3)
  doc.line(pageWidth - 70, sigY, pageWidth - 20, sigY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...TSA_MUTED)
  doc.text('Accounts Officer / Cashier Signature', pageWidth - 45, sigY + 4, { align: 'center' })

  // Footer
  doc.setDrawColor(...TSA_BORDER)
  doc.setLineWidth(0.2)
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12)

  doc.setFontSize(7)
  doc.text('The Scholar Coaching Academy — Official Verified Payment Receipt', 14, pageHeight - 7)
  doc.text(`Receipt: ${payment.receiptReference || 'N/A'}`, pageWidth - 14, pageHeight - 7, { align: 'right' })

  const outName = filename || `${(payment.studentName || 'student').toLowerCase().replace(/\s+/g, '-')}-receipt-${payment.receiptReference || 'ref'}.pdf`
  doc.save(outName)
}
