import { mat4, vec3 } from 'gl-matrix';

import type { ShaderProgramType, ShaderProgram } from '../shaderPrograms/types';
import type { ModelVao } from './initModelVao';
import type { Transforms } from '../types/model';
import type { Model } from './initialize';
import type { GlContext } from './glContext';
import { convertTransformsToMat4 } from '../utils/transforms';

export type ModelInstance = {
  shaderProgram: ShaderProgram;
  modelMat: mat4;
  modelVao: ModelVao;
};

type ShadersCollection = Record<ShaderProgramType, ShaderProgram>;

type AddDrawObjectParams = {
  model: Model<any>;
  transforms: Partial<Transforms>;
  defaultShaderProgramType: ShaderProgramType;
};

export type Scene = {
  gl: GL;
  glContext: GlContext;
  isRenderLoop: boolean;
  shaderPrograms: ShadersCollection;
  cameraMat: mat4;
  lightDirection: vec3;
  models: ModelInstance[];
  setGlobalLightDirection: (vec: vec3) => void;
  addDrawObject: (params: AddDrawObjectParams) => ModelInstance;
};

type SceneSetupParams = {
  glContext: GlContext;
  shaderPrograms: ShadersCollection;
};

export function setupScene({
  glContext,
  shaderPrograms,
}: SceneSetupParams): Scene {
  // TODO: Do we need this?
  const cameraMat = mat4.perspective(
    mat4.create(),
    Math.PI / 2,
    600 / 400,
    0.1,
    1000,
  );

  mat4.translate(cameraMat, cameraMat, [0, 0, -2]);

  const lightDirection = vec3.fromValues(-5, 10, 4);
  vec3.normalize(lightDirection, lightDirection);

  const scene: Scene = {
    gl: glContext.gl,
    glContext,
    isRenderLoop: false,
    cameraMat,
    lightDirection,
    shaderPrograms,
    models: [],

    setGlobalLightDirection: (...args) =>
      sceneSetGlobalLightDirection(scene, ...args),
    addDrawObject: (...args) => sceneAddDrawObject(scene, ...args),
  };

  return scene;
}

export function sceneSetGlobalLightDirection(
  scene: Scene,
  direction: vec3,
): void {
  scene.lightDirection = direction;
}

function sceneAddDrawObject(
  scene: Scene,
  { model, transforms, defaultShaderProgramType }: AddDrawObjectParams,
): ModelInstance {
  const defaultVao = model.vaos[defaultShaderProgramType];

  if (!defaultVao) {
    throw new Error('Model do not have needed vao type');
  }

  const shaderProgram = scene.shaderPrograms[defaultShaderProgramType];

  const modelInstance: ModelInstance = {
    shaderProgram,
    modelMat: convertTransformsToMat4(transforms),
    modelVao: defaultVao,
  };

  scene.models.push(modelInstance);

  return modelInstance;
}
