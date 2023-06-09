import type { ShaderInterface } from './shaders/types';
import type { ModelVao, Texture } from './types';

export type GlContext = {
  gl: GL;
  useProgram: (program: ShaderInterface) => void;
  useVao: (vao: ModelVao) => void;
  useTexture: (texture: Texture, slotIndex: number) => void;
  resetFrameBuffer: () => void;
  reset: () => void;
};

export function createGlContext(gl: WebGL2RenderingContext): GlContext {
  let currentProgram: WebGLVertexArrayObject;
  let currentVao: WebGLVertexArrayObject;
  let currentActiveTextureIndex = 0;
  let currentTextures: WebGLTexture[] = [];

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
    useTexture: (texture: Texture, slotIndex: number): void => {
      const currentGlTexture = currentTextures[slotIndex];
      if (currentGlTexture !== texture.glTexture) {
        if (currentActiveTextureIndex !== slotIndex) {
          gl.activeTexture(gl.TEXTURE0 + slotIndex);
        }
        currentActiveTextureIndex = slotIndex;
        gl.bindTexture(gl.TEXTURE_2D, texture.glTexture);
        currentTextures[slotIndex] = texture.glTexture;
      }
    },
    resetFrameBuffer: (): void => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
    reset: (): void => {
      gl.useProgram(null);
      gl.bindVertexArray(null);
    },
  };
}
