import type { GlContext } from './glContext';
import type { FrameBuffer, Texture } from './types';
import { initDepthMapTexture } from './texture';
import { initFrameBuffer } from './frameBuffer';

export type ShadowMapContext = {
  frameBuffer: FrameBuffer;
  texture: Texture;
};

export function initShadowMapContext(glContext: GlContext): ShadowMapContext {
  const { gl } = glContext;

  const frameBuffer = initFrameBuffer(gl);
  const texture = initDepthMapTexture(glContext);

  frameBuffer.use();

  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.TEXTURE_2D,
    texture.glTexture,
    0,
  );

  // TODO: Should call?
  gl.drawBuffers([]);
  gl.readBuffer(gl.NONE);

  glContext.resetFrameBuffer();

  return {
    frameBuffer,
    texture,
  };
}
