// Botão com variantes; destrutivo sem cor por semântica.

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'link' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-accent-ink hover:opacity-90',
  secondary: 'border border-rule text-ink hover:bg-surface-raised',
  ghost: 'text-ink-muted hover:text-ink hover:bg-surface-raised',
  link: 'link-underline text-ink-muted hover:text-ink !h-auto !px-0',
  destructive: 'border border-rule text-ink-muted hover:border-alert/50 hover:text-alert',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-sm gap-2.5',
};

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-[3px] font-medium',
        'transition-[opacity,background-color,color] duration-200',
        'disabled:pointer-events-none disabled:opacity-50',
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
