import { useMemo } from 'react';

import type { Game } from '../../../game/setup';
import { useForceUpdate } from '../../hooks/useForceUpdate';

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
