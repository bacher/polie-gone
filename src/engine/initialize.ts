import { mat4 } from 'gl-matrix';

import type { LoadedModel } from '../types/model';
import { initSimpleProgram } from '../shaderPrograms/simpleProgram';
import type { ShaderProgram } from '../shaderPrograms/types';

import { initModelVao } from './initModelVao';
import { Scene, setupScene } from './scene';
import { initVertexBufferObjects } from './buffers';
import { createShadersManager } from './shaders/shaderManager';

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

  const buffers = initVertexBufferObjects(gl, modelData);

  const modelVao = initModelVao(
    gl,
    program.attributeLocations,
    buffers,
    modelData,
  );

  const scene = setupScene({ modelVao });

  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const count = 20;

  const jointMatricesArray = new Float32Array(16 * count);
  const identityMat = mat4.create();

  for (let i = 0; i < count; i += 1) {
    let mat = identityMat;

    if (i === 8) {
      // mat = mat4.fromYRotation(mat4.create(), 0.3 * Math.PI);
      mat = mat4.fromTranslation(mat4.create(), [-1, -0.5, 0]);
    }

    jointMatricesArray.set(mat, i * 16);
  }

  console.log('jointMatricesArray', jointMatricesArray);

  program.use();
  program.uniforms.jointMatrices(jointMatricesArray);

  console.log('Program init complete');

  return {
    gl,
    program,
    scene,
  };
}
