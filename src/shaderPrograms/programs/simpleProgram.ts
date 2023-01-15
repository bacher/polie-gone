import { initShaderProgram } from '../initShaderProgram';

import { ProgramInit, ShaderProgramType } from '../types';
import { initVertex, vertexSource } from '../shaders/simple.vertex';
import { initFragment, fragmentSource } from '../shaders/simple.fragment';
import { ShadersManager } from '../shaderManager';

export type SimpleProgram = ProgramInit<
  ShaderProgramType.SIMPLE,
  typeof initVertex,
  typeof initFragment
>;

export function initSimpleProgram(
  gl: GL,
  shadersManager: ShadersManager,
): SimpleProgram {
  return initShaderProgram(gl, shadersManager, {
    type: ShaderProgramType.SIMPLE,
    vertex: {
      source: vertexSource,
      init: initVertex,
    },
    fragment: {
      source: fragmentSource,
      init: initFragment,
    },
  }) as SimpleProgram;
}
