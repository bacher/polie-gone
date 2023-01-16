import { useMemo, useRef } from 'react';

import { Game, setupGame } from '../../game/setup';
import { useOnlyOnce } from '../../hooks/useOnlyOnce';
import { useForceUpdate } from '../../hooks/useForceUpdate';
import { Controls } from '../Controls';

import styles from './GameContainer.module.scss';

export function GameContainer() {
  const forceUpdate = useForceUpdate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useMemo<{ game: Game | undefined }>(
    () => ({
      game: undefined,
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

  return (
    <div
      className={styles.wrapper}
      onClick={() => {
        if (!state.game || state.game.scene.isRenderLoop) {
          return;
        }

        state.game.startRenderLoop();
      }}
    >
      <canvas ref={canvasRef} width={600} height={400} />
      {state.game && <Controls game={state.game} />}
    </div>
  );
}
