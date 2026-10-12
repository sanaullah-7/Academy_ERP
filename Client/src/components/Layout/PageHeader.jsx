/**
 * Purpose: Will define Page Header for the Layout area of the Academy frontend.
 * Module: Layout
 * Status: Planned — functionality not implemented.
 */

// F00-003: Reusable page heading with optional supporting copy.
export default function PageHeader({ title, description = 'Your academy, thoughtfully organized.' }) {
  return (
    <div className="workspace-page-header">
      <p className="workspace-eyebrow">Academy management</p>
      <h1>{title}</h1>
      {description && <p className="workspace-page-description">{description}</p>}
    </div>
  )
}
