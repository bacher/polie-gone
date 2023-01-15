import { mat4 } from 'gl-matrix';

import type { LoadedModel } from '../types/model';
import { ModelType } from '../types/model';
import { initSimpleProgram } from '../shaderPrograms/simpleProgram';
import type { ShaderProgram } from '../shaderPrograms/types';

import { initModelVao } from './initModelVao';
import { Scene, setupScene } from './scene';
import { initVertexBufferObjects } from './initVertextBuffer';
import { createShadersManager } from './shaders/shaderManager';
import { calculateGlobalJoinsMatrices } from './utils';

type Params = {
  modelData: LoadedModel;
};

export type InitResults = {
  gl: GL;
  program: ShaderProgram;
  scene: Scene;
};

export function initialize(
  canvasElement: HTMLCanvasElement,
  { modelData }: Params,
): InitResults {
  const gl = canvasElement.getContext('webgl2', {
    alpha: false,
    // preserveDrawingBuffer: true,
  });

  if (!gl) {
    throw new Error('No WebGL 2');
  }

  const shaderManager = createShadersManager(gl);

  const program = initSimpleProgram(gl, shaderManager);

  // After creation of all shader programs we can clear shader cache
  shaderManager.disposeAll();

  const vertexBuffers = initVertexBufferObjects(gl, modelData);

  const modelVao = initModelVao(
    gl,
    program.attributeLocations,
    vertexBuffers,
    modelData,
  );

  const scene = setupScene({ modelVao });

  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (modelData.type === ModelType.SKINNED) {
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

    program.use();
    program.uniforms.jointMatrices(jointMatricesArray);
  }

  console.log('Program init complete');

  return {
    gl,
    program,
    scene,
  };
}
