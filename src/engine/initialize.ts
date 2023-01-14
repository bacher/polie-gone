import type { LoadedModel } from '../types/model';
import { initVertex, vertexSource } from '../shaders/simple.vertex';
import { initFragment, fragmentSource } from '../shaders/simple.fragment';

import { initShaderProgram, ShaderProgramInstance } from './initShaderProgram';
import { initModelVao } from './initModelVao';
import { Scene, setupScene } from './scene';

type Params = {
  modelData: LoadedModel;
};

type InitResults = {
  gl: WebGL2RenderingContext;
  program: ShaderProgramInstance<any>;
  scene: Scene;
};

export function initialize(
  canvasElement: HTMLCanvasElement,
  { modelData }: Params,
): InitResults {
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

  const modelVao = initModelVao(
    gl,
    {
      position: program.getAttributeLocation('position'),
      normal: program.getAttributeLocation('normal'),
    },
    modelData,
  );

  const scene = setupScene({ modelVao });

  console.log('Program init complete');

  return {
    gl,
    program,
    scene,
  };
}
