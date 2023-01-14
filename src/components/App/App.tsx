import { useMemo, useRef } from 'react';
import { mat4 } from 'gl-matrix';

import { loadGltf } from '../../utils/loadGltf';
import { useOnlyOnce } from '../../hooks/useOnlyOnce';
import { useForceUpdate } from '../../hooks/useForceUpdate';
import { initialize, InitResults } from '../../engine/initialize';
import { renderScene } from '../../engine/render';

import styles from './App.module.css';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<InitResults | undefined>();
  const forceUpdate = useForceUpdate();
  const sceneState = useMemo(
    () => ({
      timestamp: undefined as number | undefined,
      isRotating: false,
      isPlaying: false,
    }),
    [],
  );

  useOnlyOnce(async () => {
    const model = await loadGltf('/models/man.gltf', { loadSkin: true });

    if (!canvasRef.current) {
      throw new Error('No canvas');
    }

    engineRef.current = initialize(canvasRef.current, {
      modelData: model,
    });

    render();
  });

  function tick(timestamp: number) {
    const prevTimestamp = sceneState.timestamp;
    sceneState.timestamp = timestamp;

    if (!prevTimestamp) {
      return;
    }

    const delta = timestamp - prevTimestamp;

    if (sceneState.isRotating) {
      const modelMat = engineRef.current!.scene.models[0].modelMat;

      mat4.rotateY(modelMat, modelMat, delta * 0.001);
    }
  }

  function render() {
    if (!engineRef.current) {
      console.error('Try render without engine');
      return;
    }

    const { gl, program, scene } = engineRef.current;
    renderScene(gl, program, scene);
  }

  function startLoop() {
    function processFrame(timestamp: number) {
      tick(timestamp);
      render();

      requestAnimationFrame(processFrame);
    }

    requestAnimationFrame(processFrame);
  }

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} width={600} height={400} />
      <div className={styles.controls}>
        <h2>Controls</h2>
        <label>
          <input
            type="checkbox"
            checked={sceneState.isRotating}
            onChange={(event) => {
              sceneState.isRotating = event.target.checked;

              if (!sceneState.isPlaying) {
                sceneState.isPlaying = true;
                startLoop();
              }

              forceUpdate();
            }}
          />{' '}
          Rotate
        </label>
      </div>
    </div>
  );
}
