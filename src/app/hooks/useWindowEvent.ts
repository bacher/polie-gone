import { useEffect } from 'react';

import { useHandler } from './useHandler';

export function useWindowEvent<T extends (...args: any[]) => unknown>(
  eventName: keyof WindowEventMap,
  callback: T,
): void {
  const handler = useHandler(callback);

  useEffect(() => {
    window.addEventListener(eventName, handler, { passive: true });

    return () => {
      window.removeEventListener(eventName, handler);
    };
  }, []);
}
