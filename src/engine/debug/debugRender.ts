import { mat4 } from 'gl-matrix';

import { ShaderProgramType } from '../../shaderPrograms/types';
import type { Scene } from '../sceneInterface';

import { DebugFigureType } from './types';

export function sceneRenderDebugOverlay(scene: Scene): void {
  if (scene.debug.overlay.length) {
    const shaderProgram = scene.shaderPrograms.DEFAULT;
    // TODO: Load sphere mesh somehow inside engine
    const model = scene.debug.models['unitSphere'];
    const vao = model.vaos[ShaderProgramType.DEFAULT];

    if (!vao) {
      console.error(`No suitable vao from model "unitSphere" for debug render`);
    }

    if (model && vao) {
      shaderProgram.use();

      shaderProgram.uniforms.projection(scene.camera.mat);

      if (shaderProgram.type !== ShaderProgramType.DEFAULT_SHADOW_MAP) {
        shaderProgram.uniforms.lightDirection(scene.light.direction);
        shaderProgram.uniforms.diffuseTexture(0);
      }

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
  }
}
