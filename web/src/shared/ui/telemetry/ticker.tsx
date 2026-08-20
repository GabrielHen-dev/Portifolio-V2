// Faixa de itens em rolagem contínua com pausa no hover.

import { useReducedMotion } from '@/shared/hooks/use-reduced-motion';
import { cn } from '@/shared/lib/cn';

interface TickerProps {
  items: string[];

  speed?: number;
  className?: string;
}

export function Ticker({ items, speed = 40, className }: TickerProps) {
  const reduced = useReducedMotion();

  if (items.length === 0) return null;

  if (reduced) {
    return (
      <div className={cn('overflow-hidden border-y border-rule py-3', className)}>
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1 px-5">
          {items.map((item) => (
            <li key={item} className="eyebrow">
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const renderRow = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item} className="flex items-center">
          <span className="eyebrow whitespace-nowrap px-6">{item}</span>
          <span aria-hidden="true" className="size-1 rounded-full bg-accent" />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={cn('group relative overflow-hidden border-y border-rule py-3', className)}
    >
      <div
        className="flex w-max animate-[ticker-scroll_linear_infinite] group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${speed}s` }}
      >
        {renderRow(false)}
        {renderRow(true)}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-canvas to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-canvas to-transparent"
      />
    </div>
  );
}
