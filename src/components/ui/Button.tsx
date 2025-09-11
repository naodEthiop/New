// To be replaced with Radix UI Button
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'cyber';
  size?: 'sm' | 'md' | 'lg';
};

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
  ghost: 'bg-transparent hover:bg-white/10 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  cyber: 'text-black bg-gradient-to-r from-cyan-300 to-fuchsia-400 hover:from-cyan-200 hover:to-fuchsia-300 shadow-[0_8px_26px_rgba(34,211,238,0.35),0_0_22px_rgba(232,121,249,0.25)]',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, variant = 'primary', size = 'md', className, disabled, ...props }, ref) => {
    const Comp: any = asChild ? Slot : 'button';
    const base = 'inline-flex items-center justify-center rounded-md font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-cyan-400 disabled:opacity-50 disabled:pointer-events-none';
    return (
      <Comp
        ref={ref}
        className={[base, variantClasses[variant], sizeClasses[size], className || ''].join(' ')}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
