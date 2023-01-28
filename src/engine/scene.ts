import { mat4, vec3 } from 'gl-matrix';

import type { ShaderProgramType, ShaderProgram } from '../shaderPrograms/types';
import type { BoundBox, BoundSphere, Transforms } from '../types/model';
import { convertTransformsToMat4 } from '../utils/transforms';

import type { ModelVao } from './initModelVao';
import type { Model } from './initialize';
import type { GlContext } from './glContext';
import { initCamera, Camera } from './camera';
import type { DebugFigure } from './debugRender';

export type ModelInstance = {
  shaderProgram: ShaderProgram;
  modelMat: mat4;
  modelVao: ModelVao;
  boundInfo: BoundSphere;
  beforeDraw?: BeforeDrawHandler;
};

export type BeforeDrawHandler = (
  drawObject: ModelInstance,
  program: ShaderProgram,
) => void;

type ShadersCollection = Record<ShaderProgramType, ShaderProgram>;

type AddDrawObjectParams = {
  model: Model<any>;
  transforms: Partial<Transforms>;
  defaultShaderProgramType: ShaderProgramType;
  beforeDraw?: BeforeDrawHandler;
};

export type Scene = {
  gl: GL;
  glContext: GlContext;
  isRenderLoop: boolean;
  shaderPrograms: ShadersCollection;
  camera: Camera;
  lightDirection: vec3;
  models: ModelInstance[];
  debug: {
    models: Record<string, Model<any>>;
    overlay: DebugFigure[];
  };
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
  const camera = initCamera();

  const lightDirection = vec3.fromValues(-5, 10, 4);
  vec3.normalize(lightDirection, lightDirection);

  const scene: Scene = {
    gl: glContext.gl,
    glContext,
    isRenderLoop: false,
    camera,
    lightDirection,
    shaderPrograms,
    models: [],
    debug: {
      models: {},
      overlay: [],
    },
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
  {
    model,
    transforms,
    defaultShaderProgramType,
    beforeDraw,
  }: AddDrawObjectParams,
): ModelInstance {
  const defaultVao = model.vaos[defaultShaderProgramType];

  if (!defaultVao) {
    throw new Error('Model do not have needed vao type');
  }

  const shaderProgram = scene.shaderPrograms[defaultShaderProgramType];

  const bounds = shaderProgram.modifyBounds(model.bounds);

  const modelInstance: ModelInstance = {
    shaderProgram,
    modelMat: convertTransformsToMat4(transforms),
    modelVao: defaultVao,
    boundInfo: getSphereBound(bounds),
    beforeDraw,
  };

  scene.models.push(modelInstance);

  return modelInstance;
}

function getSphereBound(bounds: BoundBox): BoundSphere {
  const x = bounds.max[0] - bounds.min[0];
  const y = bounds.max[1] - bounds.min[1];
  const z = bounds.max[2] - bounds.min[2];

  return {
    center: [
      bounds.min[0] + x * 0.5,
      bounds.min[1] + y * 0.5,
      bounds.min[2] + z * 0.5,
    ],
    radius: Math.max(x, y, z) / 2,
  };
}
