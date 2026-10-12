import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '../../contexts/AuthContext.jsx'
import { BranchProvider } from '../../contexts/BranchContext.jsx'
import { authService } from '../../services/authService.js'
import { usePermissions } from '../../hooks/usePermissions.js'
import { useBranch } from '../../hooks/useBranch.js'
import { useAuth } from '../../hooks/useAuth.js'
import PermissionGate from './PermissionGate.jsx'

function Probe({ permission = 'workspace.view' }) {
  const { can, hasRole, roles } = usePermissions()
  const { selectBranch } = useBranch()
  const { logout } = useAuth()
  return <>
    <p aria-label="Current permission context">{roles.join(',')}:{String(can('workspace.view'))}:{String(hasRole('receptionist'))}</p>
    <button onClick={() => void selectBranch('demo-central')}>Change branch</button>
    <button onClick={() => void logout()}>Logout</button>
    <PermissionGate permission={permission}><button>Allowed feature</button></PermissionGate>
  </>
}
function mount(permission) {
  return render(<AuthProvider><BranchProvider><Probe permission={permission} /></BranchProvider></AuthProvider>)
}

describe('permission UI and hook', () => {
  it('allows only the approved workspace feature and updates informational branch roles', async () => {
    await authService.login({ userId: 'demo-multi' })
    await authService.selectBranch('demo-multi', 'demo-north')
    mount()
    expect(await screen.findByRole('button', { name: 'Allowed feature' })).toBeInTheDocument()
    expect(screen.getByLabelText('Current permission context')).toHaveTextContent('teacher:true:false')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Change branch' }))
    expect(screen.getByLabelText('Current permission context')).toHaveTextContent('teacher,receptionist:true:true')
    await userEvent.setup().click(screen.getByRole('button', { name: 'Logout' }))
    expect(screen.getByLabelText('Current permission context')).toHaveTextContent(':false:false')
    expect(screen.queryByRole('button', { name: 'Allowed feature' })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('no access')
  })

  it.each(['payments.reverse', 'unknown', undefined])('denies %s even for Super Admin and never mounts protected controls', async (permission) => {
    await authService.login({ userId: 'demo-admin' })
    await authService.selectBranch('demo-admin', 'demo-central')
    render(<AuthProvider><BranchProvider><PermissionGate permission={permission}><button>Sensitive action</button></PermissionGate></BranchProvider></AuthProvider>)
    expect(await screen.findByRole('status')).toHaveTextContent('permissions are denied')
    expect(screen.queryByRole('button', { name: 'Sensitive action' })).not.toBeInTheDocument()
  })

  it('supports an explicit hidden fallback without exposing protected controls', () => {
    const view = render(<AuthProvider><BranchProvider><PermissionGate permission="unknown" fallback={null}><button>Forbidden</button></PermissionGate></BranchProvider></AuthProvider>)
    expect(view.container).toBeEmptyDOMElement()
  })
})
