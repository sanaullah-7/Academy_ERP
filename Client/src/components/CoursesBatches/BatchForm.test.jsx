import { beforeEach, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BatchForm from './BatchForm.jsx'
import { academicService } from '../../services/academicService.js'
vi.mock('../../services/academicService.js',()=>({academicService:{saveBatch:vi.fn()}}))
beforeEach(()=>vi.clearAllMocks())
const courses=[{id:'a',name:'Course A'},{id:'b',name:'Course B'}]
it.each(['Morning','Evening',''])('saves optional shift %s without time inputs or guessed schedules',async shift=>{
 const user=userEvent.setup(),onSaved=vi.fn()
 academicService.saveBatch.mockResolvedValue({id:'saved'})
 render(<BatchForm courses={courses} branchId="north" onSaved={onSaved} onCancel={()=>{}}/>)
 expect(screen.queryByText('Start time')).not.toBeInTheDocument()
 expect(screen.queryByText('End time')).not.toBeInTheDocument()
 await user.type(screen.getByLabelText('Batch name'),'Batch 1')
 await user.selectOptions(screen.getByLabelText('Course'),'b')
 await user.selectOptions(screen.getByLabelText('Batch shift (optional)'),shift)
 await user.click(screen.getByRole('button',{name:'Add batch'}))
 expect(academicService.saveBatch).toHaveBeenCalledWith(undefined,{name:'Batch 1',courseId:'b',active:true,shift:shift||null,durationMonths:null},{branchId:'north'})
 expect(onSaved).toHaveBeenCalledWith({id:'saved'})
})
it('prefills a saved shift and lets it be cleared without writing legacy time fields',async()=>{
 const user=userEvent.setup()
 academicService.saveBatch.mockResolvedValue({id:'saved'})
 render(<BatchForm batch={{id:'saved',name:'Batch 1',courseId:'a',shift:'Morning',startTime:'08:00',endTime:'09:00'}} courses={courses} branchId="north" onSaved={()=>{}} onCancel={()=>{}}/>)
 expect(screen.getByLabelText('Batch shift (optional)')).toHaveValue('Morning')
 await user.selectOptions(screen.getByLabelText('Batch shift (optional)'),'')
 await user.click(screen.getByRole('button',{name:'Save changes'}))
 expect(academicService.saveBatch).toHaveBeenCalledWith('saved',expect.objectContaining({shift:null}),{branchId:'north'})
 expect(academicService.saveBatch.mock.lastCall[1]).not.toHaveProperty('startTime')
 expect(academicService.saveBatch.mock.lastCall[1]).not.toHaveProperty('endTime')
})

it('prefills, updates and clears optional month duration',async()=>{
 const user=userEvent.setup()
 academicService.saveBatch.mockResolvedValue({id:'saved'})
 render(<BatchForm batch={{id:'saved',name:'Batch 1',courseId:'a',durationMonths:2}} courses={courses} branchId="north" onSaved={()=>{}} onCancel={()=>{}}/>)
 const input=screen.getByLabelText('Duration in months (optional)')
 expect(input).toHaveValue(2)
 await user.clear(input);await user.type(input,'3')
 await user.click(screen.getByRole('button',{name:'Save changes'}))
 expect(academicService.saveBatch.mock.lastCall[1].durationMonths).toBe(3)
 await user.clear(input);await user.click(screen.getByRole('button',{name:'Save changes'}))
 expect(academicService.saveBatch.mock.lastCall[1].durationMonths).toBeNull()
})
