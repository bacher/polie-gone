import type { ShadersManager } from '../engine/shaders/shaderManager';
import { initShaderProgram } from '../engine/shaders/initShaderProgram';
import type { GlContext } from '../engine/glContext';

import { initVertex, vertexSource } from '../shaders/heightMap.vertex';
import { initFragment, fragmentSource } from '../shaders/directLight.fragment';

import { ProgramInit, ShaderProgramType } from './types';

export type HeightMapProgram = ProgramInit<
  ShaderProgramType.HEIGHT_MAP,
  typeof initVertex,
  typeof initFragment
>;

export function initHeightMapProgram(
  glContext: GlContext,
  shadersManager: ShadersManager,
): HeightMapProgram {
  return initShaderProgram(glContext, shadersManager, {
    type: ShaderProgramType.HEIGHT_MAP,
    vertex: {
      source: vertexSource,
      init: initVertex,
    },
    fragment: {
      source: fragmentSource,
      init: initFragment,
    },
  }) as HeightMapProgram;
}
