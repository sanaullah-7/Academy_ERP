// Adapted from shadcn/ui's MIT-licensed Input; callers supply a visible label.
import { TimePicker } from './time-input.jsx'
import { cn } from '@/lib/utils'

export function Input({ className, type, ...props }) {
  if (type === 'time') return <TimePicker className={className} {...props} />
  return (
    <input type={type} data-slot="input"
      className={cn('min-h-10 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow,border-color] duration-180 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 aria-invalid:border-destructive aria-invalid:ring-destructive', className)}
      {...props} />
  )
}
