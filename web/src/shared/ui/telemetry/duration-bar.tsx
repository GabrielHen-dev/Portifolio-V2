// Barra proporcional à duração de uma experiência.

import { motion } from 'motion/react';
import { useReducedMotion } from '@/shared/hooks/use-reduced-motion';
import { cn } from '@/shared/lib/cn';

interface DurationBarProps {
  months: number;

  maxMonths: number;
  label: string;
  className?: string;
}

export function DurationBar({ months, maxMonths, label, className }: DurationBarProps) {
  const reduced = useReducedMotion();
  const ratio = maxMonths > 0 ? Math.max(months / maxMonths, 0.06) : 0;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div aria-hidden="true" className="relative h-0.5 w-32 overflow-hidden bg-rule">
        <motion.div
          className="absolute inset-y-0 left-0 bg-accent"
          initial={reduced ? { width: `${ratio * 100}%` } : { width: 0 }}
          whileInView={{ width: `${ratio * 100}%` }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        />
      </div>

      <span className="eyebrow">{label}</span>
    </div>
  );
}
