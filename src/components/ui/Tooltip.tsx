// To be replaced with Radix UI Tooltip
import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>>(
  ({ className, side = 'top', align = 'center', ...props }, ref) => (
    <TooltipPrimitive.Content
      ref={ref}
      side={side}
      align={align}
      className={[
        'z-50 rounded-md bg-slate-900/95 px-3 py-1.5 text-sm text-white shadow-md data-[state=delayed-open]:data-[side=top]:slide-in-from-bottom-1 data-[state=delayed-open]:data-[side=bottom]:slide-in-from-top-1 data-[state=delayed-open]:data-[side=left]:slide-in-from-right-1 data-[state=delayed-open]:data-[side=right]:slide-in-from-left-1',
        className || ''
      ].join(' ')}
      {...props}
    />
  )
);
TooltipContent.displayName = 'TooltipContent';


