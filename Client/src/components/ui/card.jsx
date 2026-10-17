// Adapted from shadcn/ui's MIT-licensed Card with the approved semantic theme.
import { cn } from '@/lib/utils'

export function Card({ className, ...props }) {
  return <div data-slot="card" className={cn('flex min-w-0 flex-col rounded-xl border border-border/80 bg-card text-card-foreground shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200', className)} {...props} />
}
export function CardHeader({ className, ...props }) {
  return <div data-slot="card-header" className={cn('grid gap-1 px-5 py-4', className)} {...props} />
}
export function CardTitle({ className, ...props }) {
  return <div data-slot="card-title" className={cn('text-base font-semibold leading-normal tracking-tight', className)} {...props} />
}
export function CardDescription({ className, ...props }) {
  return <div data-slot="card-description" className={cn('text-xs text-muted-foreground', className)} {...props} />
}
export function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn('min-w-0 px-5 py-4', className)} {...props} />
}
export function CardFooter({ className, ...props }) {
  return <div data-slot="card-footer" className={cn('flex flex-wrap items-center gap-2 px-5 py-3 border-t border-border/50', className)} {...props} />
}
