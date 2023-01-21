import type {
  FragmentShaderInitFunc,
  VertexShaderInitFunc,
} from '../engine/shaders/types';

import type { DefaultProgram } from './defaultProgram';
import type { SkinProgram } from './skinProgram';
import type { ModerProgram } from './modernProgram';
import type { HeightMapProgram } from './heightMapProgram';
import { HeightMapInstancedProgram } from './heightMapInstancedProgram';
import { Bounds } from '../types/model';

export const enum ShaderProgramType {
  DEFAULT = 'DEFAULT',
  SKIN = 'SKIN',
  MODERN = 'MODERN',
  HEIGHT_MAP = 'HEIGHT_MAP',
  HEIGHT_MAP_INSTANCED = 'HEIGHT_MAP_INSTANCED',
}

export type ShaderProgram =
  | DefaultProgram
  | SkinProgram
  | ModerProgram
  | HeightMapProgram
  | HeightMapInstancedProgram;

export type ProgramInit<
  T extends ShaderProgramType,
  V extends VertexShaderInitFunc,
  F extends FragmentShaderInitFunc,
> = {
  type: T;
  glProgram: WebGLProgram;
  uniforms: ReturnType<V>['uniforms'] & ReturnType<F>['uniforms'];
  attributeLocations: ReturnType<V>['attributeLocations'];
  modifyBounds: BoundsModifier;
  use: () => void;
  dispose: () => void;
};

export type BoundsModifier = (bounds: Bounds) => Bounds;
