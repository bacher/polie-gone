import { mat4, vec3 } from 'gl-matrix';

import type { BoundBox, BoundSphere } from '../types/core';
import { convertTransformsToMat4 } from '../utils/transforms';
import { ShaderProgramType } from '../shaderPrograms/types';
import { ShaderProgram, ShadersCollection } from '../shaderPrograms/programs';

import type { GlContext } from './glContext';
import type {
  AddDrawObjectParams,
  ModelInstance,
  Renderer,
  Scene,
  SceneInitOptions,
} from './sceneInterface';
import { initCamera } from './camera';
import { initShadowMapContext } from './shadowMap';
import { initLight } from './light';
import { Model, ModelVao } from './types';

const DEBUG = true;

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
  const viewport = initOptions.viewportSize;

  const camera = initCamera(viewport.width / viewport.height);
  const light = initLight();
  light.adaptToCamera(camera);

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

function getShadowMapRenderer(
  scene: Scene,
  model: Model<any>,
  shaderType: ShaderProgramType,
): Renderer | undefined {
  let shadowShaderProgramType: ShaderProgramType;

  if (shaderType === ShaderProgramType.SKIN) {
    shadowShaderProgramType = ShaderProgramType.SKIN_SHADOW_MAP;
  } else {
    shadowShaderProgramType = ShaderProgramType.DEFAULT_SHADOW_MAP;
  }

  let shaderProgram = scene.shaderPrograms[shadowShaderProgramType];
  let modelVao = model.vaos[shadowShaderProgramType];

  if (DEBUG) {
    if (shaderProgram && !modelVao) {
      console.warn(
        `Shadow shader ${shaderProgram.type} uses without corresponding vao for model "${model.debugName}"`,
      );
      return undefined;
    }

    if (!shaderProgram && modelVao) {
      console.warn(
        `No shadow shader has found for vao ${shadowShaderProgramType} for model "${model.debugName}"`,
      );
      return undefined;
    }
  }

  if (shaderProgram && modelVao) {
    return {
      shaderProgram,
      modelVao,
    };
  }

  return undefined;
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
    throw new Error(`Model do not have ${defaultShaderProgramType} vao type`);
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

  const shadowRenderer = getShadowMapRenderer(
    scene,
    model,
    defaultShaderProgramType,
  );

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
      shadowMap: shadowRenderer,
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
