/**
 * Purpose: Will define Not Found Page for the Errors area of the Academy frontend.
 * Module: Errors
 * Status: Planned — functionality not implemented.
 */

// F00-002A: Unknown URLs now render this page; the original planning comment is retained.
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/routePaths.js'
import { Button } from '../../components/ui/button.jsx'

export default function NotFoundPage() {
  return (
    <main className="p-10 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-4">The page you requested does not exist.</p>
      <Button asChild className="mt-4">
        <Link to={ROUTE_PATHS.ROOT}>Return home</Link>
      </Button>
    </main>
  )
}
