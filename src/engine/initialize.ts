import type { LoadedModel } from '../types/model';
import { initShaderProgram } from './initShaderProgram';

import vertexSource from '../shaders/simple.vertex.glsl?raw';
import { init as initVertex } from '../shaders/simple.vertex';
import fragmentSource from '../shaders/simple.fragment.glsl?raw';
import { init as initFragment } from '../shaders/simple.fragment';

type Params = {
  model: LoadedModel;
};

export function initialize(
  canvasElement: HTMLCanvasElement,
  { model }: Params,
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

  console.log('Program init');
}
