// Adapted from shadcn/ui's MIT-licensed Radix Dialog; CSS motion avoids another dependency.
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button.jsx'

export function Dialog(props) { return <DialogPrimitive.Root {...props} /> }
export function DialogTrigger(props) { return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} /> }
export function DialogClose(props) { return <DialogPrimitive.Close data-slot="dialog-close" {...props} /> }

export function DialogContent({ className, children, showCloseButton = true, variant = 'default', ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay data-slot="dialog-overlay" className="ui-dialog-overlay" />
      <DialogPrimitive.Content data-slot="dialog-content"
        className={cn('ui-dialog-content bg-card text-card-foreground outline-none', variant === 'navigation' ? 'app-drawer' : 'ui-dialog-centered grid gap-4 rounded-xl border border-border p-6 shadow-sm', className)} {...props}>
        {children}
        {showCloseButton && <DialogPrimitive.Close asChild><Button variant="ghost" size="icon" className="absolute right-2 top-2 print:hidden" aria-label="Close dialog"><X size={20} aria-hidden="true" /></Button></DialogPrimitive.Close>}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
export function DialogHeader({ className, ...props }) { return <div data-slot="dialog-header" className={cn('flex flex-col gap-2 text-left', className)} {...props} /> }
export function DialogFooter({ className, ...props }) { return <div data-slot="dialog-footer" className={cn('flex flex-wrap justify-end gap-2 print:hidden', className)} {...props} /> }
export function DialogTitle({ className, ...props }) { return <DialogPrimitive.Title data-slot="dialog-title" className={cn('text-lg font-semibold', className)} {...props} /> }
export function DialogDescription({ className, ...props }) { return <DialogPrimitive.Description data-slot="dialog-description" className={cn('text-sm text-muted-foreground', className)} {...props} /> }
