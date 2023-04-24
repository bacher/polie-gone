import type { ShadersManager } from '../engine/shaders/shaderManager';
import { initShaderProgram } from '../engine/shaders/initShaderProgram';
import type { GlContext } from '../engine/glContext';

import { initVertex, vertexSource } from '../shaders/skin.shadowmap.vertex';
import { initFragment, fragmentSource } from '../shaders/empty.fragment';

import { ProgramInit, ShaderProgramType } from './types';

export type SkinShadowMapProgram = ProgramInit<
  ShaderProgramType.SKIN_SHADOW_MAP,
  typeof initVertex,
  typeof initFragment
>;

export function initSkinShadowMapProgram(
  glContext: GlContext,
  shadersManager: ShadersManager,
): SkinShadowMapProgram {
  return initShaderProgram(glContext, shadersManager, {
    type: ShaderProgramType.SKIN_SHADOW_MAP,
    vertex: {
      source: vertexSource,
      init: initVertex,
    },
    fragment: {
      source: fragmentSource,
      init: initFragment,
    },
  }) as SkinShadowMapProgram;
}
