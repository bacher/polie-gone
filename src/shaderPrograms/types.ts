import type {
  FragmentShaderInitFunc,
  VertexShaderInitFunc,
} from '../engine/shaders/types';
import type { BoundBox } from '../types/core';

export const enum ShaderProgramType {
  DEFAULT = 'DEFAULT',
  DEFAULT_SHADOW_MAP = 'DEFAULT_SHADOW_MAP',
  SKIN = 'SKIN',
  SKIN_SHADOW_MAP = 'SKIN_SHADOW_MAP',
  MODERN = 'MODERN',
  HEIGHT_MAP = 'HEIGHT_MAP',
  HEIGHT_MAP_INSTANCED = 'HEIGHT_MAP_INSTANCED',
  OVERLAY_QUAD = 'OVERLAY_QUAD',
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
