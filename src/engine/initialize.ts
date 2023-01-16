import { mat4 } from 'gl-matrix';

import type { LoadedModel } from '../types/model';
import { ModelType } from '../types/model';
import { initDefaultProgram } from '../shaderPrograms/defaultProgram';
import { initSkinProgram } from '../shaderPrograms/skinProgram';
import { initModernProgram } from '../shaderPrograms/modernProgram';
import { ShaderProgramType } from '../shaderPrograms/types';

import { initModelVao, ModelVao } from './initModelVao';
import { Scene, setupScene } from './scene';
import { initVertexBufferObjects } from './initVertextBuffer';
import { createShadersManager } from './shaders/shaderManager';
import { calculateGlobalJoinsMatrices } from './utils';
import { createGlContext, GlContext } from './glContext';
import { initTexture, Texture } from './texture';

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
  const skinProgram = initSkinProgram(glContext, shaderManager);
  const modernProgram = initModernProgram(glContext, shaderManager);

  // After creation of all shader programs we can clear shader cache
  shaderManager.disposeAll();

  const scene = setupScene({
    glContext,
    shaderPrograms: {
      [defaultProgram.type]: defaultProgram,
      [skinProgram.type]: skinProgram,
      [modernProgram.type]: modernProgram,
    },
  });

  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  console.info('Program init complete');

  return {
    glContext,
    scene,
  };
}

export type Model<T extends string> = {
  vaos: Record<T, ModelVao>;
};

export function initializeModel<T extends ShaderProgramType>(
  glContext: GlContext,
  scene: Scene,
  modelData: LoadedModel,
  programTypes: T[],
): Model<T> {
  const vertexBuffers = initVertexBufferObjects(scene.gl, modelData);

  let manTexture: Texture | undefined;

  if (modelData.texture) {
    manTexture = initTexture(glContext, modelData.texture);
  }

  const vaos = {} as Record<T, ModelVao>;

  for (const programType of programTypes) {
    const shaderProgram = scene.shaderPrograms[programType];

    checkIfModelMatchShader(
      modelData.modelName,
      modelData.type,
      shaderProgram.type,
    );

    const vao = initModelVao(
      glContext,
      shaderProgram,
      vertexBuffers,
      modelData,
    );

    vaos[programType] = vao;

    if (
      modelData.type === ModelType.SKINNED &&
      shaderProgram.type === ShaderProgramType.SKIN
    ) {
      const jointsCount = modelData.joints.length;

      const jointMatricesArray = new Float32Array(16 * jointsCount);

      const alreadyCalculatedMatrices = calculateGlobalJoinsMatrices(
        modelData.joints,
      );

      for (let i = 0; i < jointsCount; i += 1) {
        const jointInfo = modelData.joints[i];
        const jointGlobal = alreadyCalculatedMatrices[i];

        const mat = mat4.create();

        mat4.multiply(mat, mat, jointGlobal);
        // Bend arm
        if (true) {
          if (i === 7) {
            mat4.rotateX(mat, mat, 0.2 * Math.PI);
          }
          if (i === 8) {
            mat4.translate(mat, mat, [0, -0.2, 0.4]);
            mat4.rotateX(mat, mat, 0.2 * Math.PI);
          }
        }
        mat4.multiply(mat, mat, jointInfo.inverseMat);

        jointMatricesArray.set(mat, i * 16);
      }

      shaderProgram.use();
      shaderProgram.uniforms.jointMatrices(jointMatricesArray);
    }
  }

  return {
    vaos,
  };
}

function checkIfModelMatchShader(
  modelName: string,
  modelType: ModelType,
  shaderProgramType: ShaderProgramType,
): void {
  if (
    modelType === ModelType.SKINNED &&
    shaderProgramType !== ShaderProgramType.SKIN
  ) {
    console.error(
      `Model ${modelName} have joints but uses shader ${shaderProgramType}`,
    );
  }

  if (
    modelType !== ModelType.SKINNED &&
    shaderProgramType === ShaderProgramType.SKIN
  ) {
    console.error(
      `Model ${modelName} don't have joints but uses shader ${shaderProgramType}`,
    );
  }
}
