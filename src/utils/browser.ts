export function addWindowListener<T extends (...args: any[]) => unknown>(
  eventName: keyof WindowEventMap,
  callback: T,
): () => void {
  window.addEventListener(eventName, callback, { passive: true });

  return () => {
    window.removeEventListener(eventName, callback);
  };
}
