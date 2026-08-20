// Campos de formulário acessíveis (input, textarea, select, toggle).

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useId } from 'react';
import { cn } from '@/shared/lib/cn';

const CONTROL_BASE = cn(
  'w-full rounded-[3px] border border-rule bg-surface px-3 py-2 text-sm',
  'transition-colors placeholder:text-ink-muted/60',
  'focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40',
  'disabled:opacity-60',
);

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
}

function FieldShell({ label, hint, error, children }: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="eyebrow">
        {label}
      </label>

      {children(id, describedBy)}

      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-alert">
          {error}
        </p>
      )}
    </div>
  );
}

type InputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string;
  hint?: string;
  error?: string;
};

export function InputField({ label, hint, error, className, ...props }: InputFieldProps) {
  return (
    <FieldShell label={label} {...(hint && { hint })} {...(error && { error })}>
      {(id, describedBy) => (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(CONTROL_BASE, error && 'border-alert', className)}
          {...props}
        />
      )}
    </FieldShell>
  );
}

type TextareaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextareaField({ label, hint, error, className, ...props }: TextareaFieldProps) {
  return (
    <FieldShell label={label} {...(hint && { hint })} {...(error && { error })}>
      {(id, describedBy) => (
        <textarea
          id={id}
          rows={4}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(CONTROL_BASE, 'resize-y', error && 'border-alert', className)}
          {...props}
        />
      )}
    </FieldShell>
  );
}

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function SelectField({ label, hint, error, className, children, ...props }: SelectFieldProps) {
  return (
    <FieldShell label={label} {...(hint && { hint })} {...(error && { error })}>
      {(id, describedBy) => (
        <select id={id} aria-describedby={describedBy} className={cn(CONTROL_BASE, className)} {...props}>
          {children}
        </select>
      )}
    </FieldShell>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm">

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40',
          checked ? 'bg-accent' : 'bg-border-subtle',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}
        />
      </span>
      {label}
    </label>
  );
}
