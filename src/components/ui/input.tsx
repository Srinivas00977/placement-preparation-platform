import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full relative">
        <div className="relative flex items-center w-full">
          <input
            type={type}
            className={cn(
              'flex h-11 w-full rounded-xl border border-neutral-800 bg-neutral-900/90 px-4 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 font-normal transition-all duration-200 focus:border-neutral-500 focus:bg-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-500/50 disabled:cursor-not-allowed disabled:opacity-50',
              rightIcon ? 'pr-11' : 'pr-4',
              error && 'border-red-500/80 focus:border-red-500 focus:ring-red-500/30',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center justify-center text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-400 font-medium animate-in fade-in-50 duration-150">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
