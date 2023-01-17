import { useCallback, useRef } from 'react';

export function useHandler<T extends (...args: unknown[]) => unknown>(
  handler: T,
): T {
  const handlerRef = useRef(handler);

  return useCallback(
    ((...args) => {
      handlerRef.current(...args);
    }) as T,
    [],
  );
}
