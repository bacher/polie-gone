import type { LoadedModel } from '../types/model';
import { initShaderProgram } from './initShaderProgram';

import vertexSource from '../shaders/simple.vertex.glsl?raw';
import { init as initVertex } from '../shaders/simple.vertex';
import fragmentSource from '../shaders/simple.fragment.glsl?raw';
import { init as initFragment } from '../shaders/simple.fragment';
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
    { position: program.getAttributeLocation('position') },
    modelData,
  );

  console.log('Program init');

  gl.useProgram(program.glProgram);
  gl.bindVertexArray(model.glVao);
  model.draw();
}
