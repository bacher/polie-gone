import type {
  FragmentShaderInitFunc,
  VertexShaderInitFunc,
} from '../engine/shaders/types';

import type { DefaultProgram } from './defaultProgram';
import type { SkinProgram } from './skinProgram';
import type { ModerProgram } from './modernProgram';
import type { HeightMapProgram } from './heightMapProgram';

export const enum ShaderProgramType {
  DEFAULT = 'DEFAULT',
  SKIN = 'SKIN',
  MODERN = 'MODERN',
  HEIGHT_MAP = 'HEIGHT_MAP',
}

export type ShaderProgram =
  | DefaultProgram
  | SkinProgram
  | ModerProgram
  | HeightMapProgram;

export type ProgramInit<
  T extends ShaderProgramType,
  V extends VertexShaderInitFunc,
  F extends FragmentShaderInitFunc,
> = {
  type: T;
  glProgram: WebGLProgram;
  uniforms: ReturnType<V>['uniforms'] & ReturnType<F>['uniforms'];
  attributeLocations: ReturnType<V>['attributeLocations'];
  use: () => void;
  dispose: () => void;
};
