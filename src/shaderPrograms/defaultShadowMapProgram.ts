import type { ShadersManager } from '../engine/shaders/shaderManager';
import { initShaderProgram } from '../engine/shaders/initShaderProgram';
import type { GlContext } from '../engine/glContext';

import { initVertex, vertexSource } from '../shaders/shadowmap.vertex';
import { initFragment, fragmentSource } from '../shaders/empty.fragment';

import { ProgramInit, ShaderProgramType } from './types';

export type DefaultShadowMapProgram = ProgramInit<
  ShaderProgramType.DEFAULT_SHADOW_MAP,
  typeof initVertex,
  typeof initFragment
>;

export function initDefaultShadowMapProgram(
  glContext: GlContext,
  shadersManager: ShadersManager,
): DefaultShadowMapProgram {
  return initShaderProgram(glContext, shadersManager, {
    type: ShaderProgramType.DEFAULT_SHADOW_MAP,
    vertex: {
      source: vertexSource,
      init: initVertex,
    },
    fragment: {
      source: fragmentSource,
      init: initFragment,
    },
  }) as DefaultShadowMapProgram;
}
