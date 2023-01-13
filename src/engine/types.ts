export type UniformInitFunc = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
) => {
  uniforms: Record<string, (data: any) => void>;
};
