/**
 * Purpose: Will define Page Header for the Layout area of the Academy frontend.
 * Module: Layout
 * Status: Planned — functionality not implemented.
 */

// F00-003: Reusable page heading with optional supporting copy.
import { ChevronRight, House } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/routePaths.js'

export default function PageHeader({ title, description = 'Your academy, thoughtfully organized.' }) {
  return (
    <div className="workspace-page-header">
      <div className="min-w-0"><h4 className="workspace-page-title">{title}</h4>{description && <p className="sr-only">{description}</p>}</div>
      <nav className="workspace-page-breadcrumb" aria-label="Breadcrumb">
        <Link to={ROUTE_PATHS.DASHBOARD}><House size={17} aria-hidden="true" />Home</Link>
        <ChevronRight size={17} aria-hidden="true" />
        <span aria-current="page">{title}</span>
      </nav>
    </div>
  )
}
