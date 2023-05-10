import { mat4 } from 'gl-matrix';

import { ShaderProgramType } from '../../shaderPrograms/types';
import type { Scene } from '../sceneInterface';

import { DebugFigureType } from './types';

export function sceneRenderDebugOverlay(scene: Scene): void {
  // TODO: !!! FIX
  // renderBoundSpheres(scene);
  // renderOverlayQuad(scene);
}

function renderBoundSpheres(scene: Scene): void {
  if (!scene.debug.overlay.length) {
    return;
  }

  const shaderProgram = scene.shaderPrograms[ShaderProgramType.DEFAULT];
  // TODO: Load sphere mesh somehow inside engine
  const model = scene.debug.models['unitSphere'];
  const vao = model.vaos[shaderProgram.type];

  if (!vao) {
    console.error(`No suitable vao from model "unitSphere" for debug render`);
    return;
  }

  shaderProgram.use();

  shaderProgram.uniforms.projection(scene.camera.mat);

  shaderProgram.uniforms.lightDirection(scene.light.direction);
  shaderProgram.uniforms.diffuseTexture(0);

  for (const figure of scene.debug.overlay) {
    // TODO: Use static buffer
    const modelMat = mat4.create();

    switch (figure.type) {
      case DebugFigureType.SPHERE:
        mat4.fromTranslation(modelMat, figure.center);
        mat4.scale(modelMat, modelMat, [
          // TODO: We could use unit sphere where R = 1 (currently using R = 0.5)
          figure.radius * 2,
          figure.radius * 2,
          figure.radius * 2,
        ]);
        break;
      default:
        console.warn(`Debug rendering for ${figure.type} is not supported`);
    }

    shaderProgram.uniforms.model(modelMat);

    vao.draw();
  }
}

function renderOverlayQuad(scene: Scene): void {
  const { gl } = scene;

  const shaderProgram = scene.shaderPrograms[ShaderProgramType.OVERLAY_QUAD];
  // TODO: Load sphere mesh somehow inside engine
  const model = scene.debug.models['quad'];
  const vao = model.vaos[ShaderProgramType.OVERLAY_QUAD];

  if (!vao) {
    console.error(
      `No suitable vao from model "quad" for debug "${shaderProgram.type}" render`,
    );
    return;
  }

  shaderProgram.use();

  // TODO:
  // scene.shadowMapContext?.texture.use(5);
  shaderProgram.uniforms.diffuseTexture(5);
  shaderProgram.uniforms.invertColor(true);
  shaderProgram.uniforms.useOnlyRedChannel(true);

  gl.disable(gl.DEPTH_TEST);

  const { width, height } = scene.viewport;

  if (width >= height) {
    gl.viewport(0, height - width, width, width);
  } else {
    gl.viewport(width - height, 0, height, height);
  }

  vao.draw();

  gl.enable(gl.DEPTH_TEST);
}
