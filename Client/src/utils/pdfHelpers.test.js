import { describe, expect, it, vi, beforeEach } from 'vitest'
import { exportTablePdf, exportChallanPdf, exportReceiptPdf } from './pdfHelpers.js'

const savedFiles = []

vi.mock('jspdf', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    jsPDF: class MockJsPDF extends actual.jsPDF {
      constructor(...args) {
        super(...args)
        this.save = vi.fn((name) => {
          savedFiles.push({
            filename: name,
            pages: this.internal.pages.length - 1,
            orientation: this.internal.pageSize.getWidth() > this.internal.pageSize.getHeight() ? 'landscape' : 'portrait'
          })
        })
      }
    }
  }
})

describe('PDF Helpers & Templates', () => {
  beforeEach(() => {
    savedFiles.length = 0
  })

  it('Template A (exportTablePdf): generates report PDF with branding, headers, and pagination', () => {
    const headers = ['ID', 'Student Name', 'Program', 'Campus', 'Fee Status', 'Balance']
    const rows = [
      ['STD-001', 'Ali Khan', 'MDCAT Morning', 'Main Campus', 'Paid', 'PKR 0'],
      ['STD-002', 'Sara Ahmed', 'ECAT Evening', 'Main Campus', 'Partial', 'PKR 15,000']
    ]

    exportTablePdf({
      filename: 'tsa-student-report.pdf',
      title: 'Active Students Directory',
      branchName: 'Main Campus',
      headers,
      rows,
      filterSummary: 'Active Students'
    })

    expect(savedFiles).toHaveLength(1)
    expect(savedFiles[0].filename).toBe('tsa-student-report.pdf')
    expect(savedFiles[0].orientation).toBe('landscape') // 6 columns -> landscape
    expect(savedFiles[0].pages).toBeGreaterThanOrEqual(1)
  })

  it('Template A (exportTablePdf): selects portrait for reports with fewer columns', () => {
    const headers = ['ID', 'Name', 'Status']
    const rows = [['1', 'Stream A', 'Active']]

    exportTablePdf({
      filename: 'tsa-streams.pdf',
      title: 'Academic Streams',
      headers,
      rows
    })

    expect(savedFiles).toHaveLength(1)
    expect(savedFiles[0].orientation).toBe('portrait')
  })

  it('Template B (exportChallanPdf): generates official fee challan/invoice with student details and PKR amounts', () => {
    const challan = {
      reference: 'CH-2026-001',
      studentName: 'Muhammad Hamza',
      studentNumber: 'TSA-9821',
      studentId: 'std-1',
      courseName: 'MDCAT Comprehensive',
      batchName: 'Morning Alpha',
      amount: 45000,
      paidAmount: 20000,
      balance: 25000,
      issueDate: '2026-10-01',
      dueDate: '2026-10-25',
      status: 'Partial',
      description: 'First Term Tuition Fee'
    }

    const student = {
      name: 'Muhammad Hamza',
      studentNumber: 'TSA-9821',
      guardianName: 'Tariq Mehmood',
      guardianContact: '0300-1234567'
    }

    exportChallanPdf({
      challan,
      student,
      branchName: 'Gulshan Campus',
      filename: 'hamza-challan.pdf'
    })

    expect(savedFiles).toHaveLength(1)
    expect(savedFiles[0].filename).toBe('hamza-challan.pdf')
    expect(savedFiles[0].orientation).toBe('portrait')
    expect(savedFiles[0].pages).toBe(1)
  })

  it('Template C (exportReceiptPdf): generates official verified payment receipt', () => {
    const payment = {
      receiptReference: 'REC-2026-8891',
      challanReference: 'CH-2026-001',
      studentName: 'Muhammad Hamza',
      studentNumber: 'TSA-9821',
      amount: 20000,
      method: 'Bank Transfer',
      paidAt: '2026-10-15'
    }

    const challan = {
      courseName: 'MDCAT Comprehensive',
      batchName: 'Morning Alpha',
      balance: 25000
    }

    exportReceiptPdf({
      payment,
      challan,
      branchName: 'Gulshan Campus',
      filename: 'hamza-receipt.pdf'
    })

    expect(savedFiles).toHaveLength(1)
    expect(savedFiles[0].filename).toBe('hamza-receipt.pdf')
    expect(savedFiles[0].orientation).toBe('portrait')
    expect(savedFiles[0].pages).toBe(1)
  })
})
