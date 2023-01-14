import type { LoadedModel } from '../types/model';
import { initSimpleProgram } from '../shaderPrograms/programs/simpleProgram';
import type { ShaderProgram } from '../shaderPrograms/programs';

import { initModelVao } from './initModelVao';
import { Scene, setupScene } from './scene';

type Params = {
  modelData: LoadedModel;
};

export type InitResults = {
  gl: WebGL2RenderingContext;
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

  const program = initSimpleProgram(gl);

  const modelVao = initModelVao(gl, program.attributeLocations, modelData);

  const scene = setupScene({ modelVao });

  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  console.log('Program init complete');

  return {
    gl,
    program,
    scene,
  };
}
