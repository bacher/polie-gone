import type { DefaultProgram } from './defaultProgram';
import type { SkinProgram } from './skinProgram';
import type { ModerProgram } from './modernProgram';
import type { HeightMapProgram } from './heightMapProgram';
import type { HeightMapInstancedProgram } from './heightMapInstancedProgram';

export type ShaderProgram =
  | DefaultProgram
  | SkinProgram
  | ModerProgram
  | HeightMapProgram
  | HeightMapInstancedProgram;
