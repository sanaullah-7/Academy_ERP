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
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(ROUTE_PATHS.ADMISSIONS)} aria-label="Back to admissions">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Admission</h1>
            <p className="text-muted-foreground mt-1 text-sm">Enter student details to initiate a new admission application.</p>
          </div>
        </header>

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
