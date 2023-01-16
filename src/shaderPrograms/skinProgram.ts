import type { ShadersManager } from '../engine/shaders/shaderManager';
import { initShaderProgram } from '../engine/shaders/initShaderProgram';
import type { GlContext } from '../engine/glContext';

import { initVertex, vertexSource } from '../shaders/skin.vertex';
import { initFragment, fragmentSource } from '../shaders/directLight.fragment';

import { ProgramInit, ShaderProgramType } from './types';

export type SkinProgram = ProgramInit<
  ShaderProgramType.SKIN,
  typeof initVertex,
  typeof initFragment
>;

export function initSkinProgram(
  glContext: GlContext,
  shadersManager: ShadersManager,
): SkinProgram {
  return initShaderProgram(glContext, shadersManager, {
    type: ShaderProgramType.SKIN,
    vertex: {
      source: vertexSource,
      init: initVertex,
    },
    fragment: {
      source: fragmentSource,
      init: initFragment,
    },
  }) as SkinProgram;
}
