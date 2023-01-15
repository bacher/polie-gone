import type {
  FragmentShaderInitFunc,
  VertexShaderInitFunc,
} from '../engine/shaders/types';
import type { SimpleProgram } from './simpleProgram';

export const enum ShaderProgramType {
  SIMPLE = 'SIMPLE',
  MODERN = 'MODERN',
}

export type ShaderProgram =
  | SimpleProgram
  | (Omit<SimpleProgram, 'type'> & { type: ShaderProgramType.MODERN });

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
