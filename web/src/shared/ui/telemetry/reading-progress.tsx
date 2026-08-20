// Barra de progresso de leitura no cabeçalho.

import { motion, useScroll, useSpring } from 'motion/react';
import { useReducedMotion } from '@/shared/hooks/use-reduced-motion';

export function ReadingProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const smooth = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 });
  const scaleX = reduced ? scrollYProgress : smooth;

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent"
      style={{ scaleX }}
    />
  );
}
