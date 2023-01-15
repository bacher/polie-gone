import type { AttributeLocation } from '../types/webgl';
import { ShaderProgramInitial } from './initShaderProgram';

export const enum ShaderProgramType {
  SIMPLE = 'SIMPLE',
  MODERN = 'MODERN',
}

export type UniformsCollection = Record<string, (data: any) => void>;

export type AttributeLocationsCollection = Record<
  string,
  AttributeLocation | undefined
>;

type VertexShaderInitResults = {
  uniforms: UniformsCollection;
  attributeLocations: AttributeLocationsCollection;
};

export type VertexShaderInitFunc = (
  gl: GL,
  program: ShaderProgramInitial,
) => VertexShaderInitResults;

type FragmentShaderInitResults = {
  uniforms: UniformsCollection;
};

export type FragmentShaderInitFunc = (
  gl: GL,
  program: ShaderProgramInitial,
) => FragmentShaderInitResults;

export type VertexShaderInitParams = {
  source: string;
  init: VertexShaderInitFunc;
};

export type FragmentShaderInitParams = {
  source: string;
  init: FragmentShaderInitFunc;
};

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
