// Gráfico de telemetria do hero em SVG animado por CSS.

import { useMemo } from 'react';
import { useReducedMotion } from '@/shared/hooks/use-reduced-motion';

interface TelemetryTraceProps {
  className?: string;
}

const WIDTH = 600;
const HEIGHT = 420;
const SAMPLES = 90;

function buildTrace(amplitude: number, phase: number): string {
  const points: string[] = [];

  for (let i = 0; i <= SAMPLES; i += 1) {
    const t = i / SAMPLES;
    const x = t * WIDTH;

    const wave =
      Math.sin(t * Math.PI * 6 + phase) * 0.5 +
      Math.sin(t * Math.PI * 13.7 + phase * 1.6) * 0.3 +
      Math.sin(t * Math.PI * 2.3 + phase * 0.4) * 0.2;

    const y = HEIGHT / 2 - wave * amplitude;
    points.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return points.join(' ');
}

export function TelemetryTrace({ className }: TelemetryTraceProps) {
  const reduced = useReducedMotion();

  const traces = useMemo(
    () => [
      { d: buildTrace(120, 0), opacity: 1, width: 1.5, duration: 9 },
      { d: buildTrace(80, 2.1), opacity: 0.45, width: 1, duration: 13 },
      { d: buildTrace(150, 4.3), opacity: 0.2, width: 1, duration: 17 },
    ],
    [],
  );

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="presentation"
    >

      <g stroke="currentColor" strokeWidth="0.5" opacity="0.12">
        {[0.25, 0.5, 0.75].map((y) => (
          <line key={y} x1="0" y1={HEIGHT * y} x2={WIDTH} y2={HEIGHT * y} />
        ))}
        {[0.2, 0.4, 0.6, 0.8].map((x) => (
          <line key={x} x1={WIDTH * x} y1="0" x2={WIDTH * x} y2={HEIGHT} />
        ))}
      </g>

      <g fill="none" stroke="var(--color-accent)" strokeLinecap="round">
        {traces.map((trace, index) => (
          <path
            key={index}
            d={trace.d}
            strokeWidth={trace.width}
            opacity={trace.opacity}
            style={
              reduced
                ? undefined
                : {
                    strokeDasharray: '260 1400',
                    animation: `trace-sweep ${trace.duration}s linear infinite`,
                    animationDelay: `${index * -2.5}s`,
                  }
            }
          />
        ))}
      </g>

      <style>{`
        @keyframes trace-sweep {
          from { stroke-dashoffset: 1660; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
}
