import type { ShaderInterface } from './shaders/types';
import type { ModelVao } from './initModelVao';

export type GlContext = {
  gl: GL;
  useProgram: (program: ShaderInterface) => void;
  useVao: (vao: ModelVao) => void;
  reset: () => void;
};

export function createGlContext(gl: WebGL2RenderingContext): GlContext {
  let currentProgram: WebGLVertexArrayObject;
  let currentVao: WebGLVertexArrayObject;

  return {
    gl,
    useProgram: (program: ShaderInterface): void => {
      if (currentProgram !== program.glProgram) {
        gl.useProgram(program.glProgram);
        currentProgram = program.glProgram;
      }
    },
    useVao: (vao: ModelVao): void => {
      if (currentVao !== vao.glVao) {
        gl.bindVertexArray(vao.glVao);
        currentVao = vao.glVao;
      }
    },
    reset: (): void => {
      gl.useProgram(null);
      gl.bindVertexArray(null);
    },
  };
}
