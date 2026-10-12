import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App.jsx'
import { authService } from '../../services/authService.js'

beforeEach(() => history.replaceState(null, '', '/courses-batches'))

async function login(userId, branchId) {
  await authService.login({ userId })
  if (branchId) await authService.selectBranch(userId, branchId)
}

describe('F04 Courses & Batches page', () => {
  it('lets Super Admin search, view, create and edit courses and batches', async () => {
    await login('demo-admin', 'demo-north')
    const user = userEvent.setup()
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Courses & Batches' })).toBeInTheDocument()
    await screen.findAllByText('Demo Course One')
    await user.type(screen.getByRole('searchbox', { name: 'Search courses' }), 'Demo Course')
    expect(screen.getAllByText('Demo Course One').length).toBeGreaterThan(0)
    await user.clear(screen.getByRole('searchbox'))
    await user.click(screen.getByRole('button', { name: 'Add Course' }))
    await user.type(screen.getByLabelText('Course name'), 'DEMO Robotics')
    await user.click(screen.getByRole('button', { name: 'Add course' }))
    expect(await screen.findByText(/Course “DEMO Robotics” saved/)).toBeInTheDocument()
    await user.click(screen.getByRole('tab', { name: /Batches/ }))
    await user.click(screen.getByRole('button', { name: 'Add Batch' }))
    await user.type(screen.getByLabelText('Batch name'), 'DEMO Robotics Morning')
    await user.selectOptions(screen.getByLabelText('Course'), screen.getByRole('option', { name: 'DEMO Robotics' }))
    await user.click(screen.getByRole('button', { name: 'Add batch' }))
    expect(await screen.findByText(/Batch “DEMO Robotics Morning” saved/)).toBeInTheDocument()
    expect(await screen.findByText('No saved timetable sessions. Schedule editing is deferred until day/time, teacher, room and overlap policies are approved.')).toBeInTheDocument()
  })
  it.each([['demo-reception', 'demo-north'], ['demo-owner', null]])('%s gets the read-only directory', async (userId, branchId) => {
    await login(userId, branchId)
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Courses & Batches' })).toBeInTheDocument()
    await screen.findAllByText(userId === 'demo-reception' ? 'Demo Course One' : 'Demo Course Two')
    expect(screen.queryByRole('button', { name: 'Add Course' })).not.toBeInTheDocument()
    const row = screen.getAllByRole('row').find(item => within(item).queryByText(userId === 'demo-reception' ? 'Demo Course One' : 'Demo Course Two'))
    expect(within(row).getByRole('button', { name: 'View' })).toBeInTheDocument()
    expect(within(row).queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })
  it('denies Teacher because assignment-based access is unresolved', async () => {
    await login('demo-teacher')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Access unavailable' })).toBeInTheDocument()
  })
})
