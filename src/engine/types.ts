import type { mat4, vec3 } from 'gl-matrix';

import type { BoundBox, BoundSphere } from '../types/core';
import type { Animation } from '../types/animation';
import type { Camera } from './camera';

export type ModelVao = {
  glVao: WebGLVertexArrayObject;
  draw: () => void;
  dispose: () => void;
};

export type Texture = {
  glTexture: WebGLTexture;
  use: (slotIndex: number) => void;
  bind: () => void;
};

export type VertexBufferObject = {
  glBuffer: WebGLBuffer;
};

export type Model<T extends string> = {
  vaos: Record<T, ModelVao | undefined>;
  bounds: BoundBox;
  jointsCount?: number;
  animations: Animation[] | undefined;
};

export type FrameBuffer = {
  glFrameBuffer: WebGLFramebuffer;
  use: () => void;
  dispose: () => void;
};

export type Light = {
  direction: vec3;
  mat: mat4;
  textureSpaceMat: mat4;
  isSphereBoundVisible: (boundSphere: BoundSphere) => boolean;
  adaptToCamera: (camera: Camera) => void;
};
