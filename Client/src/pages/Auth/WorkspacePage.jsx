import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Card, CardContent } from '../../components/ui/card.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useBranch } from '../../hooks/useBranch.js'
import { ROLE_LABELS } from '../../constants/roles.js'
import { PERMISSIONS } from '../../constants/permissions.js'
import PermissionGate from '../../components/Auth/PermissionGate.jsx'

export default function WorkspacePage() {
  const { user } = useAuth()
  const { branch, roles } = useBranch()
  return <DashboardLayout>
    <Card className="workspace-home">Hi</Card>
    <PermissionGate permission={PERMISSIONS.WORKSPACE_VIEW}><Card className="mt-6">
      <CardContent className="grid gap-2 text-sm">
        <p className="font-medium">Fictional demo session</p>
        <p>{user.name} · {branch.name}</p>
        <p>Assigned roles: {roles.map((role) => ROLE_LABELS[role]).join(', ')}</p>
        <p className="text-muted-foreground">Only workspace viewing is enabled. ERP actions remain unavailable.</p>
      </CardContent>
    </Card></PermissionGate>
  </DashboardLayout>
}
