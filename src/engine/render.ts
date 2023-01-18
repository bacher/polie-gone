import type { Scene } from './scene';

export type TickTime = {
  timestamp: number;
  delta: number; // in seconds
  deltaMs: number;
};

export type TickHandler = (tickTime: TickTime) => void;

type StartRenderLoopParams = {
  scene: Scene;
  fps?: number;
  onTick: TickHandler;
};

export function startRenderLoop({
  scene,
  fps,
  onTick,
}: StartRenderLoopParams): void {
  if (scene.isRenderLoop) {
    throw new Error('Already in render loop');
  }

  let lastTimestamp: number | undefined;

  function tick(timestamp: number) {
    const prevTimestamp = lastTimestamp;
    lastTimestamp = timestamp;

    let deltaMs: number;

    if (prevTimestamp) {
      deltaMs = timestamp - prevTimestamp;
    } else {
      // Set minimal interval of time
      deltaMs = 1;
    }

    onTick({
      timestamp,
      delta: deltaMs * 0.001,
      deltaMs,
    });
  }

  function processFrame(timestamp: number) {
    tick(timestamp);
    renderScene(scene);
  }

  if (fps) {
    setInterval(() => {
      processFrame(performance.now());
    }, 1000 / fps);
  } else {
    function animationFrameHandler(timestamp: number): void {
      processFrame(timestamp);
      requestAnimationFrame(animationFrameHandler);
    }

    requestAnimationFrame((timestamp) => {
      animationFrameHandler(timestamp);
    });
  }

  processFrame(performance.now());

  scene.isRenderLoop = true;

  console.info('Render loop started');
}

export function renderScene(scene: Scene): void {
  const { gl } = scene;

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (const model of scene.models) {
    const { shaderProgram } = model;

    shaderProgram.use();
    shaderProgram.uniforms.projection(scene.cameraMat);
    shaderProgram.uniforms.lightDirection(scene.lightDirection);
    shaderProgram.uniforms.model(model.modelMat);
    shaderProgram.uniforms.diffuseTexture(0);

    model.modelVao.draw();
  }
}
