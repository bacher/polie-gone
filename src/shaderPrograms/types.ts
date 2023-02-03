import type {
  FragmentShaderInitFunc,
  VertexShaderInitFunc,
} from '../engine/shaders/types';
import type { BoundBox } from '../types/model';

export const enum ShaderProgramType {
  DEFAULT = 'DEFAULT',
  SKIN = 'SKIN',
  MODERN = 'MODERN',
  HEIGHT_MAP = 'HEIGHT_MAP',
  HEIGHT_MAP_INSTANCED = 'HEIGHT_MAP_INSTANCED',
}

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

export type BoundsModifier = (bounds: BoundBox) => BoundBox;
