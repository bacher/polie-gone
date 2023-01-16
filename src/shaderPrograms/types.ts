import type {
  FragmentShaderInitFunc,
  VertexShaderInitFunc,
} from '../engine/shaders/types';

import type { DefaultProgram } from './defaultProgram';
import type { SkinProgram } from './skinProgram';
import type { ModerProgram } from './modernProgram';

export const enum ShaderProgramType {
  DEFAULT = 'DEFAULT',
  SKIN = 'SKIN',
  MODERN = 'MODERN',
}

export type ShaderProgram = DefaultProgram | SkinProgram | ModerProgram;

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
