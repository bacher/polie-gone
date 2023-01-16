import type { ShadersManager } from '../engine/shaders/shaderManager';
import { initShaderProgram } from '../engine/shaders/initShaderProgram';

import { initVertex, vertexSource } from '../shaders/default.vertex';
import { initFragment, fragmentSource } from '../shaders/directLight.fragment';

import { ProgramInit, ShaderProgramType } from './types';

export type DefaultProgram = ProgramInit<
  ShaderProgramType.DEFAULT,
  typeof initVertex,
  typeof initFragment
>;

export function initDefaultProgram(
  gl: GL,
  shadersManager: ShadersManager,
): DefaultProgram {
  return initShaderProgram(gl, shadersManager, {
    type: ShaderProgramType.DEFAULT,
    vertex: {
      source: vertexSource,
      init: initVertex,
    },
    fragment: {
      source: fragmentSource,
      init: initFragment,
    },
  }) as DefaultProgram;
}
