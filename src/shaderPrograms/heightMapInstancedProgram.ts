import type { ShadersManager } from '../engine/shaders/shaderManager';
import { initShaderProgram } from '../engine/shaders/initShaderProgram';
import type { GlContext } from '../engine/glContext';

import { initVertex, vertexSource } from '../shaders/heightMapInstanced.vertex';
import { initFragment, fragmentSource } from '../shaders/directLight.fragment';

import { ProgramInit, ShaderProgramType } from './types';

export type HeightMapInstancedProgram = ProgramInit<
  ShaderProgramType.HEIGHT_MAP_INSTANCED,
  typeof initVertex,
  typeof initFragment
>;

export function initHeightMapInstancedProgram(
  glContext: GlContext,
  shadersManager: ShadersManager,
): HeightMapInstancedProgram {
  return initShaderProgram(glContext, shadersManager, {
    type: ShaderProgramType.HEIGHT_MAP_INSTANCED,
    vertex: {
      source: vertexSource,
      init: initVertex,
    },
    fragment: {
      source: fragmentSource,
      init: initFragment,
    },
    modifyBounds: (bounds) => ({
      min: [bounds.min[0] - 0.5, bounds.min[0] - 0.5, -0.5],
      max: [bounds.max[0] - 0.5, bounds.max[0] - 0.5, 0.5],
    }),
  }) as HeightMapInstancedProgram;
}
