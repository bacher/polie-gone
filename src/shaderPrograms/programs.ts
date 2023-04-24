import type { DefaultProgram } from './defaultProgram';
import type { SkinProgram } from './skinProgram';
import type { SkinShadowMapProgram } from './skinShadowMapProgram';
import type { ModerProgram } from './modernProgram';
import type { HeightMapProgram } from './heightMapProgram';
import type { HeightMapInstancedProgram } from './heightMapInstancedProgram';
import type { DefaultShadowMapProgram } from './defaultShadowMapProgram';
import type { OverlayQuadProgram } from './overlayQuadProgram';
import { ShaderProgramType } from './types';

export type ShaderProgram =
  | DefaultProgram
  | SkinProgram
  | SkinShadowMapProgram
  | ModerProgram
  | HeightMapProgram
  | HeightMapInstancedProgram
  | DefaultShadowMapProgram
  | OverlayQuadProgram;

export type ShadersCollection = {
  [ShaderProgramType.DEFAULT]: DefaultProgram;
  [ShaderProgramType.SKIN]: SkinProgram;
  [ShaderProgramType.SKIN_SHADOW_MAP]: SkinShadowMapProgram;
  [ShaderProgramType.MODERN]: ModerProgram;
  [ShaderProgramType.HEIGHT_MAP]: HeightMapProgram;
  [ShaderProgramType.HEIGHT_MAP_INSTANCED]: HeightMapInstancedProgram;
  [ShaderProgramType.DEFAULT_SHADOW_MAP]: DefaultShadowMapProgram;
  [ShaderProgramType.OVERLAY_QUAD]: OverlayQuadProgram;
};
