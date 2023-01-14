import { useRef } from 'react';

import { loadGltf } from '../../utils/loadGltf';
import { useOnlyOnce } from '../../hooks/useOnlyOnce';
import { initialize } from '../../engine/initialize';
import { render } from '../../engine/render';

import styles from './App.module.css';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useOnlyOnce(async () => {
    const model = await loadGltf('/models/man.gltf');

    if (!canvasRef.current) {
      throw new Error('No canvas');
    }

    const { gl, program, scene } = initialize(canvasRef.current, {
      modelData: model,
    });

    render(gl, program, scene);
  });

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} width={600} height={400} />
    </div>
  );
}
