import { useMemo } from 'react';

import type { Game } from '../../../game/setup';
import { MouseStateType } from '../../../game/inputTypes';
import { useForceUpdate } from '../../hooks/useForceUpdate';
import { useWindowEvent } from '../../hooks/useWindowEvent';

import styles from './Controls.module.scss';

type Props = {
  game: Game;
};

export function Controls({ game }: Props) {
  const forceUpdate = useForceUpdate();
  const state = useMemo<{ isRotating: boolean }>(
    () => ({
      isRotating: false,
    }),
    [],
  );

  function handleMouse(event: MouseEvent) {
    const isPressed = event.buttons === 1 && event.button === 0;

    game.updateMouseState({
      mouseStateType: isPressed
        ? MouseStateType.PRESSED
        : MouseStateType.RELEASED,
      position: {
        x: event.pageX,
        y: event.pageY,
      },
    });
  }

  useWindowEvent('mousedown', handleMouse);
  useWindowEvent('mouseup', handleMouse);
  useWindowEvent('mousemove', handleMouse);

  return (
    <div className={styles.controls}>
      <h2>Controls</h2>
      <label>
        <input
          type="checkbox"
          checked={state.isRotating}
          onChange={(event) => {
            state.isRotating = event.target.checked;
            game.globalState.isRotating = state.isRotating;
            forceUpdate();
          }}
        />{' '}
        Rotate
      </label>
    </div>
  );
}
