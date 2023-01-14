export const enum ShaderProgramType {
  SIMPLE = 'SIMPLE',
  MODERN = 'MODERN',
}

export type UniformsCollection = Record<string, (data: any) => void>;

type VertexShaderInitResults = {
  uniforms: UniformsCollection;
  attributeLocations: Record<string, number | null | undefined>;
};

export type VertexShaderInitFunc = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
) => VertexShaderInitResults;

type FragmentShaderInitResults = {
  uniforms: UniformsCollection;
};

export type FragmentShaderInitFunc = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
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
  getAttributeLocation: (attributeName: string) => number;
  dispose: () => void;
};
