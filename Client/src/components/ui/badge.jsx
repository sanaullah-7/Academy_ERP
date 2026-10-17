// Adapted from shadcn/ui's MIT-licensed Badge; noninteractive unless composed asChild.
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex max-w-full items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 [&_svg]:shrink-0',
  { variants: { variant: {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    destructive: 'border-transparent bg-destructive text-destructive-foreground',
    outline: 'border-border text-muted-foreground',
    success: 'border-emerald-200/60 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200/60 bg-amber-50 text-amber-700',
    info: 'border-blue-200/60 bg-blue-700',
    brand: 'border-[#f0d5d9] bg-[#F9EBEE] text-[#940016]',
  } }, defaultVariants: { variant: 'default' } },
)

export function Badge({ className, variant, asChild = false, ...props }) {
  const Component = asChild ? Slot : 'span'
  return <Component data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}
