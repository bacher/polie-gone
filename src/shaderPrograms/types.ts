import type {
  FragmentShaderInitFunc,
  VertexShaderInitFunc,
} from '../engine/shaders/types';
import type { SimpleProgram } from './simpleProgram';
import type { ModerProgram } from './modernProgram';

export const enum ShaderProgramType {
  SIMPLE = 'SIMPLE',
  MODERN = 'MODERN',
}

export type ShaderProgram = SimpleProgram | ModerProgram;

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
