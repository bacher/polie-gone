import { useMemo, useRef } from 'react';
import { mat4, vec3, vec4, quat } from 'gl-matrix';

(window as any).vec3 = vec3;
(window as any).vec4 = vec4;
(window as any).mat4 = mat4;
(window as any).quat = quat;

import { loadGltf } from '../../utils/loadGltf';
import { useOnlyOnce } from '../../hooks/useOnlyOnce';
import { useForceUpdate } from '../../hooks/useForceUpdate';
import { initialize } from '../../engine/initialize';
import { renderScene, startRenderLoop } from '../../engine/render';
import type { Scene } from '../../engine/scene';

import styles from './App.module.css';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const forceUpdate = useForceUpdate();
  const sceneState = useMemo<{ scene: Scene | undefined; isRotating: boolean }>(
    () => ({
      scene: undefined,
      isRotating: false,
    }),
    [],
  );

  useOnlyOnce(async () => {
    const model = await loadGltf('/models/man.gltf', { loadSkin: true });

    if (!canvasRef.current) {
      throw new Error('No canvas');
    }

    const { scene } = initialize(canvasRef.current, {
      modelData: model,
    });

    sceneState.scene = scene;

    renderScene(scene);
  });

  return (
    <div
      className={styles.wrapper}
      onClick={() => {
        if (sceneState.scene!.isRenderLoop) {
          return;
        }

        startRenderLoop({
          scene: sceneState.scene!,
          // fps: 5,
          onTick: ({ delta, timestamp }) => {
            if (sceneState.isRotating) {
              const modelMat = sceneState.scene!.models[0].modelMat;

              mat4.rotateY(modelMat, modelMat, delta * 0.001);
            }
          },
        });
      }}
    >
      <canvas ref={canvasRef} width={600} height={400} />
      <div className={styles.controls}>
        <h2>Controls</h2>
        <label>
          <input
            type="checkbox"
            checked={sceneState.isRotating}
            onChange={(event) => {
              sceneState.isRotating = event.target.checked;
              forceUpdate();
            }}
          />{' '}
          Rotate
        </label>
      </div>
    </div>
  );
}
