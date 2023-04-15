import type { DefaultProgram } from './defaultProgram';
import type { SkinProgram } from './skinProgram';
import type { ModerProgram } from './modernProgram';
import type { HeightMapProgram } from './heightMapProgram';
import type { HeightMapInstancedProgram } from './heightMapInstancedProgram';
import type { DefaultShadowMapProgram } from './defaultShadowMapProgram';

export type ShaderProgram =
  | DefaultProgram
  | SkinProgram
  | ModerProgram
  | HeightMapProgram
  | HeightMapInstancedProgram
  | DefaultShadowMapProgram;
