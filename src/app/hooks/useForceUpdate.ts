import { useRef, useState } from 'react';

export function useForceUpdate() {
  const triggerRef = useRef(0);

  const [, setValue] = useState(triggerRef.current);

  return () => {
    triggerRef.current += 1;
    setValue(triggerRef.current);
  };
}
