import type { FrameBuffer } from './types';

export function initFrameBuffer(gl: GL): FrameBuffer {
  const glFrameBuffer = gl.createFramebuffer();

  if (!glFrameBuffer) {
    throw new Error("Can't create framebuffer");
  }

  return {
    glFrameBuffer,
    use: () => gl.bindFramebuffer(gl.FRAMEBUFFER, glFrameBuffer),
    dispose: () => gl.deleteFramebuffer(glFrameBuffer),
  };
}
