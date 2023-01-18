export type KeyboardController = {
  isPressed: (code: KeyboardCode) => boolean;
  addOnPressListener: (callback: KeyPressListener) => void;
  removeOnPressListener: (callback: KeyPressListener) => void;
  dispose: () => void;
};

type KeyPressListener = (code: KeyboardCode) => void;

type KeyboardCode = string;

export function initKeyboardController(): KeyboardController {
  const keysMap = new Set<KeyboardCode>();

  function keyDownHandler(keyEvent: KeyboardEvent) {
    keysMap.add(keyEvent.code);
  }

  function keyUpHandler(keyEvent: KeyboardEvent) {
    keysMap.delete(keyEvent.code);
  }

  const keyPressListeners: KeyPressListener[] = [];

  window.addEventListener('keydown', keyDownHandler, { passive: true });
  window.addEventListener('keyup', keyUpHandler, { passive: true });

  const keyboardState: KeyboardController = {
    isPressed: (code: KeyboardCode) => keysMap.has(code),
    addOnPressListener: (handler) => {
      keyPressListeners.push(handler);
    },
    removeOnPressListener: (handler) => {
      const indexOfHandler = keyPressListeners.indexOf(handler);
      if (indexOfHandler !== -1) {
        keyPressListeners.splice(indexOfHandler, 1);
      }
    },
    dispose: () => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
    },
  };

  return keyboardState;
}
