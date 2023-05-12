import { useEffect, useMemo, useState } from 'react';

import type { Game } from '../../../game/setup';
import type { CameraOrientation } from '../../../game/cameraController';
import { useForceUpdate } from '../../hooks/useForceUpdate';

import styles from './Controls.module.scss';

type Props = {
  game: Game;
};

export function Controls({ game }: Props) {
  const forceUpdate = useForceUpdate();
  const state = useMemo<{
    isRotating: boolean;
    displayCameraOrientation: boolean;
  }>(
    () => ({
      isRotating: false,
      displayCameraOrientation: false,
    }),
    [],
  );

  const [cameraOrientation, setCameraOrientation] = useState<
    CameraOrientation | undefined
  >();

  useEffect(() => {
    if (state.displayCameraOrientation) {
      const intervalId = window.setInterval(() => {
        setCameraOrientation(game.cameraController.getState());
      }, 500);

      return () => {
        setCameraOrientation(undefined);
        window.clearInterval(intervalId);
      };
    }
  }, [state.displayCameraOrientation]);

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
      <label>
        <input
          type="checkbox"
          checked={state.displayCameraOrientation}
          onChange={(event) => {
            state.displayCameraOrientation = event.target.checked;
            forceUpdate();
          }}
        />{' '}
        Display camera orientation
      </label>
      {cameraOrientation && (
        <div>
          <div>
            Position:{' '}
            <pre>
              <code>[ {cameraOrientation.position.join(',\n  ')}]</code>
            </pre>
          </div>
          <div>
            Direction:{' '}
            <pre>
              <code>
                {JSON.stringify(cameraOrientation.direction, null, 2)}
              </code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
