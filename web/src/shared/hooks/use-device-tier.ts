// Classifica a capacidade do aparelho para dosar efeitos.

import { useEffect, useState } from 'react';

interface NavigatorWithHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

export interface DeviceTier {
  isLowPower: boolean;
}

export function useDeviceTier(): DeviceTier {
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    const nav = navigator as NavigatorWithHints;

    const memory = nav.deviceMemory ?? 8;
    const cores = nav.hardwareConcurrency ?? 4;
    const saveData = nav.connection?.saveData === true;
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const smallScreen = window.matchMedia('(max-width: 767px)').matches;

    setIsLowPower(memory < 4 || cores < 4 || saveData || (coarsePointer && smallScreen));
  }, []);

  return { isLowPower };
}
