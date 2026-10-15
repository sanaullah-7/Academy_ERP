/**
 * Purpose: Will define New Admission Page for the Admissions area of the Academy frontend.
 * Module: Admissions
 * Status: Planned — functionality not implemented.
 */

import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Card } from '../../components/ui/card.jsx'
import { Button } from '../../components/ui/button.jsx'
import { ArrowLeft } from 'lucide-react'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import NewAdmissionForm from '../../components/Admissions/NewAdmissionForm.jsx'

export default function NewAdmissionPage() {
  const navigate = useNavigate()

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Button className="w-fit" variant="ghost" onClick={() => navigate(ROUTE_PATHS.ADMISSIONS)}>
          <ArrowLeft size={20} />Back to admissions
        </Button>

        <Card>
          <NewAdmissionForm
            onSuccess={(result) => navigate(ROUTE_PATHS.ADMISSIONS, { state: { createdAdmissionInternalId: result.id, createdAdmissionId: result.displayAdmissionId ?? result.admissionId ?? result.id, createdBranchId: result.branchId } })}
            onCancel={() => navigate(ROUTE_PATHS.ADMISSIONS)}
          />
        </Card>
      </div>
    </DashboardLayout>
  )
}
