import { mat4, vec3 } from 'gl-matrix';

import { ShaderProgramType } from '../shaderPrograms/types';
import { ShaderProgram } from '../shaderPrograms/programs';

import type { Light, ModelVao } from './types';
import type { Scene } from './sceneInterface';
import type { Camera } from './camera';
import { DebugFigureType } from './debug/types';
import { sceneRenderDebugOverlay } from './debug/debugRender';

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

const enum RenderPhase {
  SHADOW_MAP = 'SHADOW_MAP',
  REGULAR = 'REGULAR',
}

const renderPhases: RenderPhase[] = [
  RenderPhase.SHADOW_MAP,
  RenderPhase.REGULAR,
];

export function renderScene(scene: Scene): void {
  const { glContext, gl } = scene;

  scene.debug.overlay = [];

  for (const renderPhase of renderPhases) {
    // const cameraBoundBox = getCameraViewBoundBox(scene.camera);

    let camera: Camera | Light;

    if (renderPhase === RenderPhase.SHADOW_MAP) {
      if (!scene.shadowMapContext) {
        continue;
      }

      camera = scene.light;

      scene.shadowMapContext.frameBuffer.use();

      // TODO: reset gl.viewport
      gl.viewport(0, 0, 1024, 1024);

      gl.clear(gl.DEPTH_BUFFER_BIT);
    } else {
      glContext.resetFrameBuffer();
      // TODO: reset gl.viewport
      gl.viewport(0, 0, scene.viewport.width, scene.viewport.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      camera = scene.camera;
    }

    for (const model of scene.models) {
      const { boundInfo, modelMat, renderTypes } = model;

      let shaderProgram: ShaderProgram;
      let modelVao: ModelVao;

      if (renderPhase === RenderPhase.SHADOW_MAP) {
        if (!renderTypes.shadowMap) {
          continue;
        }
        ({ shaderProgram, modelVao } = renderTypes.shadowMap);
      } else {
        ({ shaderProgram, modelVao } = renderTypes.regular);
      }

      // TODO: We could use only translate (not whole matrix transform)
      vec3.transformMat4(boundCenterTempVec, boundInfo.center, modelMat);
      const radius = boundInfo.radius * getMaxScaleFactor(modelMat);

      const isVisible = camera.isSphereBoundVisible({
        center: boundCenterTempVec,
        radius,
      });

      if (process.env.NODE_ENV !== 'production') {
        scene.debug.overlay.push({
          type: DebugFigureType.SPHERE,
          center: vec3.copy(vec3.create(), boundCenterTempVec),
          radius,
        });
      }

      if (!isVisible) {
        continue;
      }

      /* TODO:
          Is not using now because of isSphereBoundVisible is more correct
          This section can be deleted
      if (
        !isBoundsIntersect(cameraBoundBox, {
          center: boundCenterTempVec,
          radius,
        })
      ) {
        continue;
      }
      */

      shaderProgram.use();

      if (shaderProgram.type !== ShaderProgramType.OVERLAY_QUAD) {
        // TODO: Don't update if nothing was changed
        // TODO: Rename uniform name to projectionView
        shaderProgram.uniforms.projection(camera.mat);
        shaderProgram.uniforms.model(model.modelMat);
      }

      if (renderPhase === RenderPhase.REGULAR) {
        // TODO: It's better to use some feature detector here:
        if (
          shaderProgram.type !== ShaderProgramType.DEFAULT_SHADOW_MAP &&
          shaderProgram.type !== ShaderProgramType.SKIN_SHADOW_MAP
        ) {
          if (shaderProgram.type !== ShaderProgramType.OVERLAY_QUAD) {
            shaderProgram.uniforms.lightDirection(scene.light.direction);
          }
          shaderProgram.uniforms.diffuseTexture(0);
          // TODO: Optimize condition
          if (
            shaderProgram.type === ShaderProgramType.DEFAULT ||
            shaderProgram.type === ShaderProgramType.SKIN ||
            shaderProgram.type === ShaderProgramType.HEIGHT_MAP_INSTANCED
          ) {
            shaderProgram.uniforms.lightSpace(scene.light.textureSpaceMat);
            // TODO: Optimize
            //       Once set texture to 5th slot and don't reset
            scene.shadowMapContext?.texture.use(5);
            shaderProgram.uniforms.shadowMapTexture(5);
          }
        }
      }

      if (
        shaderProgram.type === ShaderProgramType.SKIN ||
        shaderProgram.type === ShaderProgramType.SKIN_SHADOW_MAP
      ) {
        // TODO: Use more strict check (instead of !)
        shaderProgram.uniforms.jointMatrices(model.jointsDataArray!);
      }

      if (model.beforeDraw) {
        model.beforeDraw(model, shaderProgram);
      }

      modelVao.draw();
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    // TODO (!!!)
    // sceneRenderDebugOverlay(scene);
  }
}

const tempVec = vec3.create();

function getMaxScaleFactor(mat: mat4): number {
  // TODO: Compare and replace by optimized version, or use scale from model directly
  return Math.max(...mat4.getScaling(tempVec, mat));

  // return Math.max(mat[0], mat[5], mat[10]);
}
