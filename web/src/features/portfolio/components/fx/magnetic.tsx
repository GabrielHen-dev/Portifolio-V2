// Efeito magnético do cursor nos CTAs (desligado no toque/reduced-motion).

import { motion, useMotionValue, useSpring } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { useReducedMotion } from '@/shared/hooks/use-reduced-motion';
import { useIsDesktop } from '@/shared/hooks/use-media-query';

interface MagneticProps {
  children: ReactNode;
  className?: string;

  strength?: number;
}

export function Magnetic({ children, className, strength = 0.35 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 180, damping: 15, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 180, damping: 15, mass: 0.4 });

  const enabled = isDesktop && !reduced;

  const handleMove = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (!enabled || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set((event.clientX - centerX) * strength);
    y.set((event.clientY - centerY) * strength);
  };

  const handleLeave = (): void => {
    x.set(0);
    y.set(0);
  };

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}
