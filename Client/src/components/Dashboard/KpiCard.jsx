import { Card, CardContent } from '../ui/card.jsx'
import { Badge } from '../ui/badge.jsx'
import { AlertCircle, Loader2 } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

export function KpiCard({ title, icon: Icon, value, description, isLoading, error, isDemo = true }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="h-full hover:shadow-md transition-shadow duration-300">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {Icon && <Icon size={18} className="text-primary" aria-hidden="true" />}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            ) : error ? (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle size={16} aria-hidden="true" />
                <span className="text-sm font-medium">Error loading data</span>
              </div>
            ) : (
              <p className="text-2xl font-bold">{value !== undefined ? value : '—'}</p>
            )}
            {isDemo && <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-muted/50 hover:bg-muted text-muted-foreground border-transparent shadow-none">DEMO</Badge>}
          </div>
          {description && <p className="mt-2 text-xs text-muted-foreground">{description}</p>}
        </CardContent>
      </Card>
    </motion.div>
  )
}
