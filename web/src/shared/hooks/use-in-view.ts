// Observa entrada na viewport (animações e economia de recursos).

import { useEffect, useRef, useState } from 'react';

interface Options {
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
}

export function useInView<T extends HTMLElement = HTMLDivElement>(options: Options = {}) {
  const { once = false, rootMargin = '0px', threshold = 0.15 } = options;

  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin, threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return { ref, inView };
}
