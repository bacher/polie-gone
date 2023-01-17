import type { Position2d } from './types';

export const enum MouseStateType {
  PRESSED = 'PRESSED',
  RELEASED = 'RELEASED',
}

export type MouseState = {
  mouseStateType: MouseStateType;
  position: Position2d;
};
