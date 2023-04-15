import { ModelType, LoadedModel, SkinnedLoadedModel } from '../types/model';
import type { Animation } from '../types/animation';
import { initDefaultProgram } from '../shaderPrograms/defaultProgram';
import { initSkinProgram, SkinProgram } from '../shaderPrograms/skinProgram';
import { initModernProgram } from '../shaderPrograms/modernProgram';
import { initHeightMapProgram } from '../shaderPrograms/heightMapProgram';
import { ShaderProgramType } from '../shaderPrograms/types';
import { initHeightMapInstancedProgram } from '../shaderPrograms/heightMapInstancedProgram';
import { initDefaultShadowMapProgram } from '../shaderPrograms/defaultShadowMapProgram';

import type { Model, ModelVao, Texture } from './types';
import { initModelVao } from './initModelVao';
import { setupScene } from './scene';
import type { Scene } from './sceneInterface';
import { initVertexBufferObjects } from './initVertextBuffer';
import { createShadersManager } from './shaders/shaderManager';
import { createGlContext, GlContext } from './glContext';
import { initTextureByImageData } from './texture';
import { initOverlayQuadProgram } from '../shaderPrograms/overlayQuadProgram';
import { generateQuad } from '../utils/meshGenerator';

export type InitResults = {
  glContext: GlContext;
  scene: Scene;
};

export function initialize(canvasElement: HTMLCanvasElement): InitResults {
  const gl = canvasElement.getContext('webgl2', {
    alpha: false,
    // preserveDrawingBuffer: true,
  });

  if (!gl) {
    throw new Error('No WebGL 2');
  }

  const glContext = createGlContext(gl);

  const shaderManager = createShadersManager(gl);

  const defaultProgram = initDefaultProgram(glContext, shaderManager);
  const defaultShadowMapProgram = initDefaultShadowMapProgram(
    glContext,
    shaderManager,
  );

  /*
    TODO: !!! Restore
  const skinProgram = initSkinProgram(glContext, shaderManager);
  const modernProgram = initModernProgram(glContext, shaderManager);
  const heightMapProgram = initHeightMapProgram(glContext, shaderManager);
  const heightMapInstancedProgram = initHeightMapInstancedProgram(
    glContext,
    shaderManager,
  );
   */

  const overlayQuadProgram = initOverlayQuadProgram(glContext, shaderManager);

  // After creation of all shader programs we can clear shader cache
  shaderManager.disposeAll();

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  const scene = setupScene({
    glContext,
    shaderPrograms: {
      [defaultProgram.type]: defaultProgram,
      [defaultShadowMapProgram.type]: defaultShadowMapProgram,
      /*
        TODO: !!! Restore
      [skinProgram.type]: skinProgram,
      [modernProgram.type]: modernProgram,
      [heightMapProgram.type]: heightMapProgram,
      [heightMapInstancedProgram.type]: heightMapInstancedProgram,
       */
      [overlayQuadProgram.type]: overlayQuadProgram,
    } as any,
    initOptions: {
      renderShadows: true,
    },
  });

  scene.debug.models['quad'] = initializeModel(
    glContext,
    scene,
    generateQuad(),
    [ShaderProgramType.OVERLAY_QUAD],
  );

  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  console.info('Program init complete');

  return {
    glContext,
    scene,
  };
}

export function initializeModel<T extends ShaderProgramType>(
  glContext: GlContext,
  scene: Scene,
  modelData: LoadedModel,
  programTypes: T[],
): Model<T> {
  const vertexBuffers = initVertexBufferObjects(scene.gl, modelData);

  const textures: Texture[] = [];

  if (modelData.texture) {
    textures.push(initTextureByImageData(glContext, modelData.texture));
  }

  const vaos = {} as Record<T, ModelVao>;
  let animations: Animation[] | undefined;
  let jointsCount: number | undefined;

  for (const programType of programTypes) {
    // TODO: !!! FIX
    if (
      programType !== ShaderProgramType.DEFAULT &&
      programType !== ShaderProgramType.DEFAULT_SHADOW_MAP &&
      programType !== ShaderProgramType.OVERLAY_QUAD
    ) {
      continue;
    }

    const shaderProgram = scene.shaderPrograms[programType];

    checkIfModelMatchShader(
      modelData.modelName,
      modelData.type,
      shaderProgram.type,
      textures.length,
    );

    const vao = initModelVao(
      glContext,
      shaderProgram,
      vertexBuffers,
      modelData,
      textures,
    );

    vaos[programType] = vao;

    if (
      modelData.type === ModelType.SKINNED &&
      shaderProgram.type === ShaderProgramType.SKIN
    ) {
      jointsCount = modelData.joints.length;
      animations = modelData.animations;
    }
  }

  return {
    vaos,
    bounds: modelData.bounds,
    jointsCount,
    animations,
  };
}

function checkIfModelMatchShader(
  modelName: string,
  modelType: ModelType,
  shaderProgramType: ShaderProgramType,
  texturesCount: number,
): void {
  if (
    shaderProgramType !== ShaderProgramType.OVERLAY_QUAD &&
    shaderProgramType !== ShaderProgramType.DEFAULT_SHADOW_MAP
  ) {
    if (texturesCount === 0) {
      console.error(
        `Model "${modelName}" does not have textures for shader ${shaderProgramType}`,
      );
    }
  }

  if (
    (modelType === ModelType.HEIGHT_MAP) !==
    (shaderProgramType === ShaderProgramType.HEIGHT_MAP_INSTANCED)
  ) {
    console.error(
      `Model "${modelName}" cant be used with shader ${shaderProgramType}`,
    );
  }

  if (
    modelType === ModelType.SKINNED &&
    shaderProgramType !== ShaderProgramType.SKIN
  ) {
    console.error(
      `Model "${modelName}" have joints but uses shader ${shaderProgramType}`,
    );
  }

  if (
    modelType !== ModelType.SKINNED &&
    shaderProgramType === ShaderProgramType.SKIN
  ) {
    console.error(
      `Model "${modelName}" does not have joints but uses shader ${shaderProgramType}`,
    );
  }
}
