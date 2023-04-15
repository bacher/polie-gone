import { mat4, vec3 } from 'gl-matrix';

import type { BoundBox, BoundSphere } from '../types/core';
import { convertTransformsToMat4 } from '../utils/transforms';
import { ShaderProgramType } from '../shaderPrograms/types';
import { ShadersCollection } from '../shaderPrograms/programs';

import type { GlContext } from './glContext';
import type {
  AddDrawObjectParams,
  ModelInstance,
  Scene,
  SceneInitOptions,
} from './sceneInterface';
import { initCamera } from './camera';
import { initShadowMapContext } from './shadowMap';
import { initLight } from './light';

type SceneSetupParams = {
  glContext: GlContext;
  shaderPrograms: ShadersCollection;
  initOptions: SceneInitOptions;
};

export function setupScene({
  glContext,
  shaderPrograms,
  initOptions,
}: SceneSetupParams): Scene {
  const viewport = {
    width: 600,
    height: 400,
  };

  const camera = initCamera(viewport.width / viewport.height);
  const light = initLight();

  const scene: Scene = {
    gl: glContext.gl,
    glContext,
    initOptions,
    viewport,
    isRenderLoop: false,
    camera,
    light,
    shaderPrograms,
    models: [],
    shadowMapContext: initOptions.renderShadows
      ? initShadowMapContext(glContext)
      : undefined,
    debug: {
      models: {},
      overlay: [],
    },
    addDrawObject: (...args) => sceneAddDrawObject(scene, ...args),
  };

  return scene;
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

  let jointsDataArray: Float32Array | undefined;

  if (shaderProgram.type === ShaderProgramType.SKIN) {
    if (!model.jointsCount) {
      throw new Error('Skin model without joints');
    }

    jointsDataArray = makeSkinIdentityMatrices({
      jointsCount: model.jointsCount,
    });
  }

  const shadowMapVao = model.vaos[ShaderProgramType.DEFAULT_SHADOW_MAP];

  const modelInstance: ModelInstance = {
    modelMat: convertTransformsToMat4(transforms),
    boundInfo: getSphereBound(bounds),
    jointsDataArray,
    beforeDraw,
    renderTypes: {
      regular: {
        shaderProgram,
        modelVao: defaultVao,
      },
      shadowMap: shadowMapVao
        ? {
            shaderProgram:
              scene.shaderPrograms[ShaderProgramType.DEFAULT_SHADOW_MAP],
            modelVao: shadowMapVao,
          }
        : undefined,
    },
  };

  scene.models.push(modelInstance);

  return modelInstance;
}

function makeSkinIdentityMatrices({
  jointsCount,
}: {
  jointsCount: number;
}): Float32Array {
  const jointMatricesArray = new Float32Array(16 * jointsCount);

  const mat = mat4.create();

  for (let i = 0; i < jointsCount; i += 1) {
    jointMatricesArray.set(mat, i * 16);
  }

  return jointMatricesArray;
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
