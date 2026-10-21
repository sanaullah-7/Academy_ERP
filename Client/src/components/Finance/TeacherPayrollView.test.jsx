import {beforeEach,expect,it,vi} from 'vitest'
import {render,screen,fireEvent} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TeacherPayrollView from './TeacherPayrollView.jsx'
import {payrollService} from '../../services/payrollService.js'
vi.mock('../../hooks/usePermissions.js',()=>({usePermissions:()=>({can:()=>true})}))
vi.mock('../../services/payrollService.js',()=>({payrollService:{getAgreements:vi.fn(),getPeriodDetails:vi.fn(),calculatePeriod:vi.fn(),saveAgreement:vi.fn()}}))
const lines=Array.from({length:12},(_,i)=>({id:`l${i}`,teacherId:`t${i}`,teacherName:`QA Teacher ${i}`,calculationMethod:'fixed',calculationDetails:{description:'Fixed salary'},baseEarnings:1000,allowances:0,deductions:0,advancesDeducted:0,netPayable:1000,totalPaid:0,outstanding:1000,status:'Draft'}))
const details={period:{id:'period',status:'Draft',totalNetPayable:12000},lines,payments:[],advances:[]}
beforeEach(()=>{vi.clearAllMocks();payrollService.getAgreements.mockResolvedValue({teachers:lines.map(l=>({teacherId:l.teacherId,teacherName:l.teacherName,agreement:{calculationMethod:'fixed',monthlySalary:1000}}))});payrollService.getPeriodDetails.mockResolvedValue(details);payrollService.calculatePeriod.mockResolvedValue(details);payrollService.saveAgreement.mockResolvedValue({})})
it('uses shared pagination props and resets search to first page',async()=>{
 const user=userEvent.setup();render(<TeacherPayrollView branchId="demo-central"/>)
 expect(await screen.findByText('1\u201310 of 12')).toBeInTheDocument()
 await user.click(screen.getByRole('button',{name:'Next Teacher payroll page'}))
 expect(screen.getByText('11\u201312 of 12')).toBeInTheDocument()
 await user.selectOptions(screen.getByLabelText('Teacher payroll rows per page'),'15')
 expect(screen.getByText('1\u201312 of 12')).toBeInTheDocument()
 expect(screen.getByLabelText('Payroll month')).toHaveAttribute('type','month')
})
it('saves the actual teacher ID from agreement metadata and refreshes agreement list',async()=>{
 const user=userEvent.setup();render(<TeacherPayrollView branchId="demo-central"/>)
 await screen.findByText('QA Teacher 0')
 await user.click(screen.getAllByTitle('Configure teacher salary agreement')[0])
 fireEvent.change(screen.getByLabelText('Monthly contracted salary'),{target:{value:'1500'}})
 await user.click(screen.getByRole('button',{name:'Save Salary Agreement'}))
 expect(payrollService.saveAgreement).toHaveBeenCalledWith(expect.objectContaining({teacherId:'t0',monthlySalary:1500}),{branchId:'demo-central'})
 expect(payrollService.getAgreements.mock.calls.length).toBeGreaterThan(1)
})
