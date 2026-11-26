import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:pointer-events-none disabled:opacity-50 select-none';

    const variants = {
      primary:
        'bg-white text-black hover:bg-neutral-200 active:bg-neutral-300 font-semibold shadow-lg shadow-white/5',
      secondary:
        'bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-800 border border-neutral-700/60',
      outline:
        'border border-neutral-700 bg-transparent text-white hover:bg-neutral-800/80 hover:text-white',
      ghost:
        'bg-transparent text-neutral-300 hover:bg-neutral-800/60 hover:text-white',
      link:
        'bg-transparent text-white underline-offset-4 hover:underline p-0 h-auto',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs rounded-lg',
      md: 'h-11 px-5 text-sm rounded-xl',
      lg: 'h-12 px-6 text-base rounded-xl',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.01 }}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
