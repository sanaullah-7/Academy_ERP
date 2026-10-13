import { ArrowLeft, Construction } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { Badge } from '../../components/ui/badge.jsx'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardContent } from '../../components/ui/card.jsx'
import { ROUTE_PATHS } from '../../routes/routePaths.js'

export default function ComingSoonPage({ moduleName }) {
  return <DashboardLayout title={moduleName} description={`${moduleName} module preview`}>
    <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center">
      <Card className="w-full overflow-hidden border-primary/15 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <CardContent className="flex flex-col items-center px-6 py-12 sm:px-12 sm:py-16">
          <span className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary"><Construction size={30} aria-hidden="true" /></span>
          <Badge variant="secondary" className="mt-6 rounded-full px-3 py-1">COMING SOON</Badge>
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{moduleName} is coming soon</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">This module is planned but its approved workflow and data source are not implemented yet.</p>
          <Button asChild variant="outline" className="mt-7"><Link to={ROUTE_PATHS.DASHBOARD}><ArrowLeft size={17} aria-hidden="true" />Back to Dashboard</Link></Button>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
}
