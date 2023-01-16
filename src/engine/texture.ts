import type { GlContext } from './glContext';

export type Texture = {
  glTexture: WebGLTexture;
};

type InitTextureParams = {
  useMipmaps?: boolean;
};

export function initTexture(
  glContext: GlContext,
  image: HTMLImageElement,
  { useMipmaps }: InitTextureParams = {},
): Texture {
  const { gl } = glContext;

  gl.activeTexture(gl.TEXTURE0 + 0);
  const glTexture = gl.createTexture();

  if (!glTexture) {
    throw new Error("Can't create texture");
  }

  gl.bindTexture(gl.TEXTURE_2D, glTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  if (useMipmaps) {
    gl.generateMipmap(gl.TEXTURE_2D);
  } else {
    // TODO: Make some experiments with filtering
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  return {
    glTexture,
  };
}
