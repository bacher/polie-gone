import type { ShadersManager } from '../engine/shaders/shaderManager';
import { initShaderProgram } from '../engine/shaders/initShaderProgram';
import type { GlContext } from '../engine/glContext';

import { initVertex, vertexSource } from '../shaders/overlayQuad.vertex';
import { initFragment, fragmentSource } from '../shaders/overlayQuad.fragment';

import { ProgramInit, ShaderProgramType } from './types';

export type OverlayQuadProgram = ProgramInit<
  ShaderProgramType.OVERLAY_QUAD,
  typeof initVertex,
  typeof initFragment
>;

export function initOverlayQuadProgram(
  glContext: GlContext,
  shadersManager: ShadersManager,
): OverlayQuadProgram {
  return initShaderProgram(glContext, shadersManager, {
    type: ShaderProgramType.OVERLAY_QUAD,
    vertex: {
      source: vertexSource,
      init: initVertex,
    },
    fragment: {
      source: fragmentSource,
      init: initFragment,
    },
  }) as OverlayQuadProgram;
}
