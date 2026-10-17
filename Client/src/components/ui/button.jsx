// Adapted from shadcn/ui's MIT-licensed Radix Button for JavaScript and 44px targets.
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm',
        destructive: 'bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm',
        outline: 'border border-input bg-card text-foreground hover:bg-accent hover:text-accent-foreground shadow-xs',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-accent shadow-xs',
        ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary-hover underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-h-10 px-4 py-2',
        sm: 'min-h-8 px-2.5 py-1 text-xs',
        lg: 'min-h-11 px-6 py-2.5',
        icon: 'size-9 p-0',
        'icon-sm': 'size-8 p-0 text-xs',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export function Button({ className, variant, size, asChild = false, type, ...props }) {
  const Component = asChild ? Slot : 'button'
  return <Component data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...(!asChild && { type: type ?? 'button' })} {...props} />
}
