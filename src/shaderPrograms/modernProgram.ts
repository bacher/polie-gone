import type { ShadersManager } from '../engine/shaders/shaderManager';
import { initShaderProgram } from '../engine/shaders/initShaderProgram';

import { initVertex, vertexSource } from '../shaders/default.vertex';
import { initFragment, fragmentSource } from '../shaders/directLight.fragment';

import { ProgramInit, ShaderProgramType } from './types';

export type ModerProgram = ProgramInit<
  ShaderProgramType.MODERN,
  typeof initVertex,
  typeof initFragment
>;

export function initModernProgram(
  gl: GL,
  shadersManager: ShadersManager,
): ModerProgram {
  return initShaderProgram(gl, shadersManager, {
    type: ShaderProgramType.MODERN,
    vertex: {
      source: vertexSource,
      init: initVertex,
    },
    fragment: {
      source: fragmentSource,
      init: initFragment,
    },
  }) as ModerProgram;
}
