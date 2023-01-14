import type { SimpleProgram } from './programs/simpleProgram';
import { ShaderProgramType } from './types';

export type ShaderProgram =
  | SimpleProgram
  | (Omit<SimpleProgram, 'type'> & { type: ShaderProgramType.MODERN });
