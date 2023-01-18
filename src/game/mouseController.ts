import type { Position2d } from './types';
import { addWindowListener } from '../utils/browser';

export type MouseController = {
  getPosition: () => Position2d | undefined;
  dispose: () => void;
};

export function initMouseController(): MouseController {
  let isWindowActive = true;
  let position: Position2d | undefined;

  const cancelMoveHandler = addWindowListener(
    'mousemove',
    (event: MouseEvent) => {
      if (isWindowActive) {
        position = {
          x: event.pageX,
          y: event.pageY,
        };
      }
    },
  );

  const cancelBlurHandler = addWindowListener('blur', () => {
    isWindowActive = false;
    position = undefined;
  });

  const cancelFocusHandler = addWindowListener('focus', () => {
    isWindowActive = true;
    position = undefined;
  });

  return {
    getPosition: () => position,
    dispose: () => {
      cancelMoveHandler();
      cancelBlurHandler();
      cancelFocusHandler();
    },
  };
}
