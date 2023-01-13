import { useRef } from 'react';

import { loadGltf } from '../../utils/loadGltf';
import { useOnlyOnce } from '../../hooks/useOnlyOnce';
import { initialize } from '../../engine/initialize';

import styles from './App.module.css';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useOnlyOnce(async () => {
    const model = await loadGltf('/models/man.gltf');

    console.log('model =', model);

    if (!canvasRef.current) {
      throw new Error('No canvas');
    }

    initialize(canvasRef.current, { modelData: model });
  });

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} width={600} height={400} />
    </div>
  );
}
