import { mat4, vec3 } from 'gl-matrix';

import type { LoadedModel } from '../types/model';
import { initVertex, vertexSource } from '../shaders/simple.vertex';
import { initFragment, fragmentSource } from '../shaders/simple.fragment';

import { initShaderProgram } from './initShaderProgram';
import { initModelVao } from './initModelVao';

type Params = {
  modelData: LoadedModel;
};

export function initialize(
  canvasElement: HTMLCanvasElement,
  { modelData }: Params,
) {
  const gl = canvasElement.getContext('webgl2');

  if (!gl) {
    throw new Error('No WebGL 2');
  }

  const program = initShaderProgram<typeof initVertex, typeof initFragment>(
    gl,
    {
      vertex: {
        source: vertexSource,
        init: initVertex,
      },
      fragment: {
        source: fragmentSource,
        init: initFragment,
      },
    },
  );

  const model = initModelVao(
    gl,
    {
      position: program.getAttributeLocation('position'),
      normal: program.getAttributeLocation('normal'),
    },
    modelData,
  );

  console.log('Program init');

  const cameraMat = mat4.perspective(
    mat4.create(),
    Math.PI / 2,
    600 / 400,
    0.1,
    1000,
  );

  const modelMat = mat4.fromTranslation(mat4.create(), [0, 0, -3]);

  const lightDirection = vec3.fromValues(-5, 10, 4);
  console.log('lightDirection =', lightDirection);

  gl.enable(gl.CULL_FACE);

  gl.useProgram(program.glProgram);
  program.uniforms.projection(cameraMat);
  program.uniforms.model(modelMat);
  program.uniforms.lightDirection(lightDirection);

  gl.bindVertexArray(model.glVao);
  model.draw();
}
