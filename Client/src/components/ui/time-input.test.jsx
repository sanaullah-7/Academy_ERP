import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './input.jsx'

function Clock({ initial = '', onChange = () => {} }) {
  const [value, setValue] = useState(initial)
  return <><Input type="time" aria-label="Start Time" value={value} onChange={event => { setValue(event.target.value); onChange(event.target.value) }}/><output data-testid="stored">{value}</output></>
}
describe('shared AM/PM input, canonical HH:mm output', () => {
  it('changes noon/midnight and PM input without mutating the storage format', async () => {
    const user = userEvent.setup()
    render(<Clock initial="00:00" />)
    expect(screen.getByRole('textbox', {name:'Start Time'})).toHaveValue('12:00')
    await user.selectOptions(screen.getByRole('combobox',{name:'AM/PM'}),'PM')
    expect(screen.getByTestId('stored')).toHaveTextContent('12:00')
    fireEvent.change(screen.getByLabelText('Start Time'),{target:{value:'1:30'}})
    expect(screen.getByTestId('stored')).toHaveTextContent('13:30')
    fireEvent.change(screen.getByLabelText('Start Time'),{target:{value:'11:59'}})
    expect(screen.getByTestId('stored')).toHaveTextContent('23:59')
  })
  it('supports typing partial values and invalid input never retains a previous valid saved clock', async () => {
    const user = userEvent.setup();render(<Clock initial="13:00"/>)
    await user.clear(screen.getByLabelText('Start Time'))
    await user.type(screen.getByLabelText('Start Time'),'8:30')
    expect(screen.getByTestId('stored')).toHaveTextContent('20:30')
    fireEvent.change(screen.getByLabelText('Start Time'),{target:{value:'13:00'}})
    expect(screen.getByTestId('stored')).toBeEmptyDOMElement()
    expect(screen.getByLabelText('Start Time')).toBeInvalid()
  })
  it('reflects an externally loaded/edit value and disabled/read-only constraints', () => {
    const change=vi.fn();const view=render(<Input type="time" aria-label="End Time" value="12:00" onChange={change}/>)
    expect(screen.getByRole('combobox', {name:'AM/PM'})).toHaveValue('PM')
    view.rerender(<Input type="time" aria-label="End Time" value="23:59" disabled onChange={change}/>)
    expect(screen.getByLabelText('End Time')).toHaveValue('11:59')
    expect(screen.getByRole('combobox', {name:'AM/PM'})).toBeDisabled()
  })
})


it('accepts a complete custom-minute AM/PM entry and normalizes it on blur', async () => {
  const user = userEvent.setup()
  render(<Clock initial="14:15" />)
  const input = screen.getByLabelText('Start Time')
  await user.clear(input)
  await user.type(input, '9:07 AM')
  expect(screen.getByTestId('stored')).toHaveTextContent('09:07')
  expect(input).toBeValid()
  await user.tab()
  expect(input).toHaveValue('9:07')
  expect(screen.getByRole('combobox', {name:'AM/PM'})).toHaveValue('AM')
  expect(screen.queryByRole('listbox', {name:'Suggested times'})).not.toBeInTheDocument()
})

it('offers96 compact suggestions and supports keyboard selection and dismissal', async () => {
  const user = userEvent.setup()
  render(<Clock />)
  await user.tab()
  expect(screen.getByLabelText('Start Time')).toHaveFocus()
  await user.tab()
  expect(screen.getByRole('combobox', {name:'AM/PM'})).toHaveFocus()
  await user.tab()
  const trigger = screen.getByRole('button', {name:'Suggested times'})
  expect(trigger).toHaveFocus()
  await user.keyboard('{Enter}')
  expect(screen.getAllByRole('option').filter(option => option.closest('[role="listbox"]'))).toHaveLength(96)
  const suggestions = screen.getByRole('listbox', {name:'Suggested times'})
  expect(suggestions).toHaveFocus()
  await user.keyboard('{End}{Enter}')
  expect(screen.getByTestId('stored')).toHaveTextContent('23:45')
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  expect(screen.getByLabelText('Start Time')).toHaveFocus()
  await user.click(trigger)
  await user.click(screen.getByRole('option', {name:'2:15 PM',exact:true}))
  expect(screen.getByLabelText('Start Time')).toHaveValue('2:15')
  expect(screen.getByRole('combobox', {name:'AM/PM'})).toHaveValue('PM')
  expect(screen.getByTestId('stored')).toHaveTextContent('14:15')
  await user.click(trigger)
  await user.keyboard('{Home}{Enter}')
  expect(screen.getByLabelText('Start Time')).toHaveValue('12:00')
  expect(screen.getByTestId('stored')).toHaveTextContent('00:00')
  await user.click(trigger)
  await user.click(screen.getByRole('option', {name:'12:00 PM',exact:true}))
  expect(screen.getByTestId('stored')).toHaveTextContent('12:00')
  await user.click(trigger)
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  expect(trigger).toHaveFocus()
})

it('rejects13:70 and retains non-quarter-hour saved values on edit', () => {
  const change = vi.fn()
  const view = render(<Input type="time" aria-label="Clock" required value="09:07" onChange={change}/>)
  expect(screen.getByLabelText('Clock')).toHaveValue('9:07')
  expect(screen.queryByRole('listbox', {name:'Suggested times'})).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Clock'), {target:{value:'13:70'}})
  expect(change.mock.lastCall[0].target.value).toBe('')
  view.rerender(<Input type="time" aria-label="Clock" required value="" onChange={change}/>)
  expect(screen.getByLabelText('Clock')).toBeInvalid()
})


it('closes only the time menu on Escape inside a dialog and preserves focus on Tab',async()=>{
 const user=userEvent.setup()
 render(<div role="dialog" onKeyDown={event=>{if(event.key==='Escape')throw new Error('Escape leaked to the modal')}}><Clock initial="14:15"/><button>Next field</button></div>)
 await user.click(screen.getByRole('button',{name:'Suggested times'}))
 await user.keyboard('{ArrowUp}{Escape}')
 expect(screen.getByRole('dialog')).toBeInTheDocument()
 expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
 await user.click(screen.getByRole('button',{name:'Suggested times'}))
 await user.tab()
 expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
 expect(screen.getByRole('button',{name:'Next field'})).toHaveFocus()
})
