// Entrada suave ao aparecer na tela; estática com reduced-motion.

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useReducedMotion } from '@/shared/hooks/use-reduced-motion';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;

  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const OFFSET = 24;

const DIRECTIONS = {
  up: { y: OFFSET, x: 0 },
  down: { y: -OFFSET, x: 0 },
  left: { x: OFFSET, y: 0 },
  right: { x: -OFFSET, y: 0 },
} as const;

export function ScrollReveal({ children, className, delay = 0, direction = 'up' }: ScrollRevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...DIRECTIONS[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay, ease: [0.25, 1, 0.5, 1] }}
    >
      {children}
    </motion.div>
  );
}
