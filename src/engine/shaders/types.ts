import type { AttributeLocation } from '../../types/webgl';
import type { ShaderProgramInitial } from './initShaderProgram';

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
