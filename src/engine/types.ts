type UniformsCollection = Record<string, (data: any) => void>;

export type FragmentShaderInitFunc = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
) => {
  uniforms: UniformsCollection;
};

export type VertexShaderInitFunc = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
) => {
  uniforms: UniformsCollection;
  attributeLocations: Record<string, number | null | undefined>;
};
