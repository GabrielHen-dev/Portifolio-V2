// Contador que sobe até o valor ao entrar na tela.

import { useEffect, useRef, useState } from 'react';
import { useInView } from '@/shared/hooks/use-in-view';
import { useReducedMotion } from '@/shared/hooks/use-reduced-motion';

interface CountUpProps {
  value: number;

  duration?: number;
  className?: string;
}

export function CountUp({ value, duration = 900, className }: CountUpProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLSpanElement>({ once: true, threshold: 0.5 });

  const [display, setDisplay] = useState(reduced ? value : 0);
  const frameRef = useRef(0);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    if (!inView) return;

    const start = performance.now();

    const tick = (now: number): void => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [inView, value, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="tabular">
        {display}
      </span>
    </span>
  );
}
