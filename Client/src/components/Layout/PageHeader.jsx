/**
 * Purpose: Will define Page Header for the Layout area of the Academy frontend.
 * Module: Layout
 * Status: Planned — functionality not implemented.
 */

// F00-003: Reusable page heading with optional supporting copy.
import { ChevronRight, House } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/routePaths.js'

export default function PageHeader({ title }) {
  return (
    <div className="app-page-header app-page-header-breadcrumb-only">
      <nav className="app-page-breadcrumb" aria-label="Breadcrumb">
        <Link to={ROUTE_PATHS.DASHBOARD}><House size={14} aria-hidden="true" />Home</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{title}</span>
      </nav>
    </div>
  )
}
