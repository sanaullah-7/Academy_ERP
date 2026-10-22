import { beforeEach, describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { authService } from '../../services/authService.js'
import { payrollService } from '../../services/payrollService.js'
import { financialService } from '../../services/financialService.js'
import { academicService } from '../../services/academicService.js'
import { facultyService } from '../../services/facultyService.js'
import './FinancePage.jsx'
import App from '../../App.jsx'
const query={branchId:'demo-central'}
beforeEach(async()=>{localStorage.clear();await authService.login({userId:'demo-admin'});await authService.selectBranch('demo-admin',query.branchId);window.history.replaceState(null,'','/finance')})
async function setup(){
 await payrollService.updateSettings({enabled:true},query)
 const stream=await academicService.saveStream(null,{name:'Salary Stream',active:true},query)
 const course=await academicService.saveCourse(null,{name:'Salary Course',streamId:stream.id,active:true,pricingMode:'course',feeAmount:1000},query)
 const subject=await academicService.saveSubject(null,{name:'Biology',courseId:course.id,active:true,feeAmount:1000},query)
 const batch=await academicService.saveBatch(null,{name:'Salary Batch',courseId:course.id,active:true},query)
 const assignment=await facultyService.assignFaculty({teacherId:'teacher-naeem',courseId:course.id,batchId:batch.id,subjectId:subject.id,days:['Mon'],startTime:'10:00',endTime:'11:00',room:'Salary Room'},query)
 await payrollService.saveAgreement({teacherId:assignment.teacherId,facultyAssignmentId:assignment.id,courseId:course.id,batchId:batch.id,subjectId:subject.id,calculationMethod:'fixed',monthlySalary:15000},query)
}
async function mountPayroll(){render(createElement(App));const user=userEvent.setup();await user.click(await screen.findByRole('button',{name:/Teacher Payroll/i},{timeout:10000}));return user}
describe('running Teacher Payroll mounted flow',()=>{
 it('keeps Payroll hidden when disabled',async()=>{
  render(createElement(App));await screen.findByRole('heading',{name:'Academy Finance'},{timeout:10000})
  expect(screen.queryByRole('button',{name:/Teacher Payroll/i})).not.toBeInTheDocument()
 })
 it('shows only assigned salaries and accepts partial payment without approval',async()=>{
  await setup();const user=await mountPayroll()
  const row=await screen.findByRole('row',{name:/Prof. Naeem/})
  expect(screen.queryByLabelText('Salary period')).not.toBeInTheDocument()
  expect(screen.queryByRole('button',{name:/Approve Payroll/i})).not.toBeInTheDocument()
  await user.click(within(row).getByRole('button',{name:/Payroll actions for/}))
  await user.click(screen.getByRole('menuitem',{name:'Add Payment',exact:true}))
  const dialog=await screen.findByRole('dialog')
  await user.clear(within(dialog).getByLabelText('Disbursement amount'));await user.type(within(dialog).getByLabelText('Disbursement amount'),'5000')
  await user.click(within(dialog).getByRole('button',{name:'Add Payment & Post to Finance'}))
  expect(await screen.findAllByText('PKR 10,000')).not.toHaveLength(0)
  const finance=await financialService.financeOverview(query)
  expect(finance.expenses.filter(e=>e.description.includes('PAYROLL'))).toHaveLength(1)
  expect(finance.expenses.find(e=>e.description.includes('PAYROLL')).amount).toBe(5000)
 })
 it('opens the salary balance payslip without deductions or monthly approval information',async()=>{
  await setup();const user=await mountPayroll();const row=await screen.findByRole('row',{name:/Prof. Naeem/})
  await user.click(within(row).getByRole('button',{name:/Payroll actions for/}))
  await user.click(screen.getByRole('menuitem',{name:'Payslip'}))
  expect(await screen.findByRole('heading',{name:'Official Faculty Payslip'})).toBeInTheDocument()
  expect(screen.queryByText('Deductions & Advances')).not.toBeInTheDocument()
  expect(screen.getByRole('button',{name:'Download PDF'})).toBeInTheDocument()
 })
 it('preserves balances and payments when payroll visibility is disabled',async()=>{
  await setup();const line=(await payrollService.getRunningOverview(query)).lines[0]
  await payrollService.recordPayment({payrollLineId:line.id,amount:5000,method:'Cash',transactionReference:'PRESERVE'},query)
  await payrollService.updateSettings({enabled:false},query)
  render(createElement(App));await screen.findByRole('heading',{name:'Academy Finance'},{timeout:10000})
  expect(screen.queryByRole('button',{name:/Teacher Payroll/i})).not.toBeInTheDocument()
  const saved=await payrollService.getRunningOverview(query)
  expect(saved.lines[0]).toMatchObject({netPayable:15000,totalPaid:5000,outstanding:10000})
  expect(saved.payments).toHaveLength(1)
 })
})
