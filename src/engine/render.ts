import { mat4, vec3 } from 'gl-matrix';

import { isBoundsIntersect } from '../utils/boundBox';

import type { Scene } from './scene';
import { getCameraViewBoundBox } from './camera';

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
}: StartRenderLoopParams): () => void {
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

  let intervalId: number | undefined;
  let animationFrameId: number | undefined;

  if (fps) {
    intervalId = window.setInterval(() => {
      processFrame(performance.now());
    }, 1000 / fps);
  } else {
    function animationFrameHandler(timestamp: number): void {
      processFrame(timestamp);
      animationFrameId = window.requestAnimationFrame(animationFrameHandler);
    }

    animationFrameId = window.requestAnimationFrame(animationFrameHandler);
  }

  processFrame(performance.now());

  scene.isRenderLoop = true;

  console.info('Render loop started');

  return () => {
    scene.isRenderLoop = false;

    if (intervalId !== undefined) {
      window.clearInterval(intervalId);
    }
    if (animationFrameId !== undefined) {
      window.cancelAnimationFrame(animationFrameId);
    }

    console.info('Render loop stopped');
  };
}

// TODO: Move to camera.ts

const boundCenterTempVec = vec3.create();

export function renderScene(scene: Scene): void {
  const { gl } = scene;

  const cameraBoundBox = getCameraViewBoundBox(scene.camera);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (const model of scene.models) {
    const { shaderProgram, boundInfo, modelMat } = model;

    // TODO: We could use only translate (not whole matrix transform)
    vec3.transformMat4(boundCenterTempVec, boundInfo.center, modelMat);

    const radius = boundInfo.radius * getMaxScaleFactor(modelMat);

    if (
      !isBoundsIntersect(cameraBoundBox, {
        center: boundCenterTempVec,
        radius,
      })
    ) {
      continue;
    }

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

const tempVec = vec3.create();

function getMaxScaleFactor(mat: mat4): number {
  // TODO: Compare and replace by optimized version, or use scale from model directly
  return Math.max(...mat4.getScaling(tempVec, mat));

  // return Math.max(mat[0], mat[5], mat[10]);
}
