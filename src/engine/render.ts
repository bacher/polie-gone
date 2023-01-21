import { vec3, mat4 } from 'gl-matrix';

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

const boundCenterTempBuffer = vec3.create();
const topLeftTempBuffer = vec3.create();
const bottomRightTempBuffer = vec3.create();
const topLeftPoint = vec3.fromValues(-1, 1, 1);
const bottomRightPoint = vec3.fromValues(1, -1, 1);

export function renderScene(scene: Scene): void {
  const { gl } = scene;

  vec3.transformMat4(topLeftTempBuffer, topLeftPoint, scene.camera.inverseMat);
  vec3.transformMat4(
    bottomRightTempBuffer,
    bottomRightPoint,
    scene.camera.inverseMat,
  );

  /*
  console.group();
  console.log('center      ', Array.from(scene.camera.position));
  console.log('top left    ', Array.from(topLeftTempBuffer));
  console.log('bottom right', Array.from(bottomRightTempBuffer));
  console.groupEnd();
   */

  // const cameraBoundBox = {
  //   min:
  // }

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (const model of scene.models) {
    const { shaderProgram, boundInfo, modelMat } = model;

    // console.log('boundInfo', boundInfo);

    // We could use only translate (not whole matrix transform)
    vec3.transformMat4(boundCenterTempBuffer, boundInfo.center, modelMat);

    // console.log('boundCenterTempBuffer', Array.from(boundCenterTempBuffer));

    // Calculate if object could be visible?

    shaderProgram.use();

    // TODO: Don't update if nothing was changed
    shaderProgram.uniforms.projection(scene.camera.mat);
    shaderProgram.uniforms.lightDirection(scene.lightDirection);
    shaderProgram.uniforms.model(model.modelMat);
    shaderProgram.uniforms.diffuseTexture(0);

    if (model.beforeDraw) {
      model.beforeDraw(model, shaderProgram);
    }

    model.modelVao.draw();
  }
}
