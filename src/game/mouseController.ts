import type { Position2d } from './types';
import { addWindowListener } from '../utils/browser';

export type MouseController = {
  getPosition: () => Readonly<Position2d> | undefined;
  getMovementPosition: () => Readonly<Position2d>;
  isPointerLocked: () => boolean;
  dispose: () => void;
};

export function initMouseController(): MouseController {
  let isWindowActive = true;
  let isPointerLocked = Boolean(document.pointerLockElement);
  let position: Readonly<Position2d> | undefined;
  let movementPosition: Readonly<Position2d> = {
    x: 0,
    y: 0,
  };

  const cancelMoveHandler = addWindowListener(
    'mousemove',
    (event: MouseEvent) => {
      if (isWindowActive) {
        isPointerLocked = Boolean(document.pointerLockElement);

        if (isPointerLocked) {
          position = undefined;
        } else {
          position = {
            x: event.pageX,
            y: event.pageY,
          };
        }

        movementPosition = {
          x: movementPosition.x + event.movementX,
          y: movementPosition.y + event.movementY,
        };
      }
    },
  );

  const cancelBlurHandler = addWindowListener('blur', () => {
    isWindowActive = false;
    isPointerLocked = false;
    position = undefined;
  });

  const cancelFocusHandler = addWindowListener('focus', () => {
    isWindowActive = true;
    isPointerLocked = Boolean(document.pointerLockElement);
    position = undefined;
  });

  return {
    getPosition: () => position,
    getMovementPosition: () => movementPosition,
    isPointerLocked: () => isPointerLocked,
    dispose: () => {
      cancelMoveHandler();
      cancelBlurHandler();
      cancelFocusHandler();
    },
  };
}
