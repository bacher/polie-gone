import { useEffect, useRef } from 'react';

export function useOnlyOnce(callback: () => void) {
  const isCalledRef = useRef(false);
  const callbackRef = useRef(callback);

  useEffect(() => {
    if (!isCalledRef.current) {
      isCalledRef.current = true;
      callbackRef.current();
    }
  }, []);
}
