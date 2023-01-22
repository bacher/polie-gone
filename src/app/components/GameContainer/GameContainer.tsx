import { useMemo, useRef } from 'react';
import cn from 'classnames';

import { Game, setupGame } from '../../../game/setup';
import { useOnlyOnce } from '../../hooks/useOnlyOnce';
import { useForceUpdate } from '../../hooks/useForceUpdate';
import { useWindowEvent } from '../../hooks/useWindowEvent';

import { Controls } from '../Controls';

import styles from './GameContainer.module.scss';

export function GameContainer() {
  const forceUpdate = useForceUpdate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useMemo<{
    game: Game | undefined;
    cancelLoop: (() => void) | undefined;
  }>(
    () => ({
      game: undefined,
      cancelLoop: undefined,
    }),
    [],
  );

  useOnlyOnce(async () => {
    if (!canvasRef.current) {
      throw new Error('No canvas');
    }

    state.game = await setupGame({ canvasElement: canvasRef.current });
    state.game.render();

    forceUpdate();
  });

  useWindowEvent('mousedown', () => {
    if (state.game && !state.game.scene.isRenderLoop) {
      state.cancelLoop = state.game.startRenderLoop();
      forceUpdate();
    }
  });

  useWindowEvent('keydown', (event) => {
    if (event.code === 'Space') {
      if (state.cancelLoop) {
        state.cancelLoop();
        forceUpdate();
      }
    }
  });

  return (
    <div className={styles.wrapper}>
      <div
        className={cn(styles.canvasWrapper, {
          [styles.canvasWrapper_inLoop]: state.game?.scene.isRenderLoop,
        })}
        onMouseDown={() => {
          if (canvasRef.current && !document.pointerLockElement) {
            canvasRef.current.requestPointerLock();
          }
        }}
      >
        <canvas ref={canvasRef} width={600} height={400} />
      </div>
      {state.game && <Controls game={state.game} />}
    </div>
  );
}
