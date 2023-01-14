import { mat4, vec3 } from 'gl-matrix';

import type { ModelVao } from './initModelVao';

export type ModelInstance = {
  modelMat: mat4;
  modelVao: ModelVao;
};

export type Scene = {
  cameraMat: mat4;
  lightDirection: vec3;
  models: ModelInstance[];
};

type SceneSetupParams = {
  modelVao: ModelVao;
};

export function setupScene({ modelVao }: SceneSetupParams): Scene {
  const cameraMat = mat4.perspective(
    mat4.create(),
    Math.PI / 2,
    600 / 400,
    0.1,
    1000,
  );

  const modelMat = mat4.fromTranslation(mat4.create(), [0, 0, -3]);

  const lightDirection = vec3.fromValues(-5, 10, 4);

  return {
    cameraMat,
    lightDirection,
    models: [
      {
        modelMat,
        modelVao,
      },
    ],
  };
}