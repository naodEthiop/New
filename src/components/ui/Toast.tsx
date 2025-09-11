// To be replaced with Radix UI Toast
import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Viewport
      ref={ref}
      className={['fixed bottom-0 right-0 z-50 m-4 flex max-h-screen w-96 flex-col gap-2', className || ''].join(' ')}
      {...props}
    />
  )
);
ToastViewport.displayName = 'ToastViewport';

export const Toast = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Root
      ref={ref}
      className={['group pointer-events-auto grid w-full rounded-md border border-slate-700/50 bg-slate-900/95 p-4 text-white shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-full', className || ''].join(' ')}
      {...props}
    />
  )
);
Toast.displayName = 'Toast';

export const ToastTitle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Title ref={ref} className={['text-sm font-semibold', className || ''].join(' ')} {...props} />
  )
);
ToastTitle.displayName = 'ToastTitle';

export const ToastDescription = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitive.Description ref={ref} className={['text-sm opacity-90', className || ''].join(' ')} {...props} />
  )
);
ToastDescription.displayName = 'ToastDescription';

export const ToastClose = ToastPrimitive.Close;


