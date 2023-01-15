import { initShaderProgram } from '../initShaderProgram';

import { ProgramInit, ShaderProgramType } from '../types';
import { initVertex, vertexSource } from '../shaders/simple.vertex';
import { initFragment, fragmentSource } from '../shaders/simple.fragment';

export type SimpleProgram = ProgramInit<
  ShaderProgramType.SIMPLE,
  typeof initVertex,
  typeof initFragment
>;

export function initSimpleProgram(gl: GL): SimpleProgram {
  return initShaderProgram(gl, {
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
