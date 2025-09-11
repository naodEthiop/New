// To be replaced with Radix UI Input
import * as React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={[
          'w-full rounded-md border border-slate-700/50 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 outline-none ring-blue-500 transition-colors focus:border-slate-600 focus:ring-2',
          className || ''
        ].join(' ')}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
