import { vec3 } from 'gl-matrix';

import type { BoundBox, BoundSphere } from '../types/model';
import { convertTransformsToMat4 } from '../utils/transforms';

import type { GlContext } from './glContext';
import type {
  AddDrawObjectParams,
  ModelInstance,
  Scene,
  ShadersCollection,
} from './sceneInterface';
import { initCamera } from './camera';

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

const SQRT_2 = Math.sqrt(2);

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
    radius: SQRT_2 * 0.5 * Math.max(x, y, z),
  };
}
