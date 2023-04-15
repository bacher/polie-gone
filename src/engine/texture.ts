import type { GlContext } from './glContext';
import type { Texture } from './types';

type TextureInitParams = {
  mipmaps: boolean;
  wrapS: 'clamp' | 'repeat';
  wrapT: 'clamp' | 'repeat';
};

function initTexture(glContext: GlContext, params: TextureInitParams): Texture {
  const { gl } = glContext;

  const glTexture = gl.createTexture();

  if (!glTexture) {
    throw new Error("Can't create texture");
  }

  const texture: Texture = {
    glTexture,
    use: (slotIndex: number) => glContext.useTexture(texture, slotIndex),
    bind: () => gl.bindTexture(gl.TEXTURE_2D, glTexture),
  };

  // TODO: Should we use and activate texture for setting parameters?
  // texture.use(0);
  // gl.activeTexture(gl.TEXTURE0 + 0);
  texture.bind();

  if (!params.mipmaps) {
    // TODO: Make some experiments with filtering
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_S,
    params.wrapS === 'clamp' ? gl.CLAMP_TO_EDGE : gl.REPEAT,
  );
  gl.texParameteri(
    gl.TEXTURE_2D,
    gl.TEXTURE_WRAP_T,
    params.wrapT === 'clamp' ? gl.CLAMP_TO_EDGE : gl.REPEAT,
  );

  return texture;
}

type InitTextureParams = {
  useMipmaps?: boolean;
};

export function initTextureByImageData(
  glContext: GlContext,
  image: HTMLImageElement,
  { useMipmaps = false }: InitTextureParams = {},
): Texture {
  const { gl } = glContext;

  const texture = initTexture(glContext, {
    mipmaps: useMipmaps,
    wrapS: 'clamp',
    wrapT: 'clamp',
  });

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  if (useMipmaps) {
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  // TODO: Maybe reset after loading?
  // glContext.useTexture(null, 0);

  return texture;
}

const SHADOW_WIDTH = 1024;
const SHADOW_HEIGHT = 1024;

export function initDepthMapTexture(glContext: GlContext) {
  const { gl } = glContext;

  const texture = initTexture(glContext, {
    mipmaps: false,
    wrapT: 'clamp',
    wrapS: 'clamp',
  });

  texture.bind();

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    // TODO: !!!
    gl.DEPTH_COMPONENT24, // TODO: Check to using of gl.DEPTH_COMPONENT32F and gl.FLOAT
    //   https://stackoverflow.com/a/60703526/2685446
    // gl.DEPTH_COMPONENT32F,
    SHADOW_WIDTH,
    SHADOW_HEIGHT,
    0,
    gl.DEPTH_COMPONENT,
    gl.UNSIGNED_INT, // Differ than in guide (in guide: GL_FLOAT)
    // gl.FLOAT,
    null,
  );

  return texture;
}
