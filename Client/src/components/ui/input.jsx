// Adapted from shadcn/ui's MIT-licensed Input; callers supply a visible label.
import { cn } from '@/lib/utils'

export function Input({ className, type, ...props }) {
  return (
    <input type={type} data-slot="input"
      className={cn('min-h-11 w-full min-w-0 rounded-md border border-input bg-card px-3 py-2 text-base text-foreground shadow-xs outline-none transition-[color,box-shadow,border-color] duration-200 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-invalid:border-destructive aria-invalid:ring-destructive md:text-sm', className)}
      {...props} />
  )
}
