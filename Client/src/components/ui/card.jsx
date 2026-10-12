// Adapted from shadcn/ui's MIT-licensed Card with the approved semantic theme.
import { cn } from '@/lib/utils'

export function Card({ className, ...props }) {
  return <div data-slot="card" className={cn('flex min-w-0 flex-col gap-6 rounded-xl border border-border bg-card py-6 text-card-foreground shadow-sm', className)} {...props} />
}
export function CardHeader({ className, ...props }) {
  return <div data-slot="card-header" className={cn('grid gap-2 px-6', className)} {...props} />
}
export function CardTitle({ className, ...props }) {
  return <div data-slot="card-title" className={cn('text-base font-semibold leading-normal', className)} {...props} />
}
export function CardDescription({ className, ...props }) {
  return <div data-slot="card-description" className={cn('text-sm text-muted-foreground', className)} {...props} />
}
export function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn('min-w-0 px-6', className)} {...props} />
}
export function CardFooter({ className, ...props }) {
  return <div data-slot="card-footer" className={cn('flex flex-wrap items-center gap-2 px-6', className)} {...props} />
}
