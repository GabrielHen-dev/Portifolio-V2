// Texto revelado com embaralhamento, sem salto de layout: uma cópia invisível do texto final trava a caixa.

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/shared/hooks/use-reduced-motion';

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghjkmnpqrstuvwxyz';
const DIGITS = '0123456789';

function scrambleChar(char: string): string {
  if (/[a-z]/.test(char)) return LOWER[Math.floor(Math.random() * LOWER.length)]!;
  if (/[A-Z]/.test(char)) return UPPER[Math.floor(Math.random() * UPPER.length)]!;
  if (/[0-9]/.test(char)) return DIGITS[Math.floor(Math.random() * DIGITS.length)]!;
  return char;
}

interface ScrambleTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export function ScrambleText({ text, className, speed = 28 }: ScrambleTextProps) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? text : '');
  const frameRef = useRef(0);

  useEffect(() => {
    if (reduced) {
      setDisplay(text);
      return;
    }

    let revealed = 0;
    let lastFrame = 0;

    const tick = (now: number): void => {
      if (now - lastFrame >= speed) {
        lastFrame = now;
        revealed += 1 / 3;

        const settled = Math.floor(revealed);
        const scrambled = text.slice(settled).split('').map(scrambleChar).join('');
        setDisplay(text.slice(0, settled) + scrambled);

        if (settled >= text.length) {
          setDisplay(text);
          return;
        }
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [text, speed, reduced]);

  return (
    <span className={`inline-grid ${className ?? ''}`}>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {text}
      </span>
      <span aria-hidden="true" className="col-start-1 row-start-1">
        {display || text}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
