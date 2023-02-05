import type { BoundBox } from '../types/model';
import type { Animation } from '../utils/loadGltf';

export type ModelVao = {
  glVao: WebGLVertexArrayObject;
  draw: () => void;
  dispose: () => void;
};

export type Texture = {
  glTexture: WebGLTexture;
  use: (slotIndex: number) => void;
};

export type VertexBufferObject = {
  glBuffer: WebGLBuffer;
};

export type Model<T extends string> = {
  vaos: Record<T, ModelVao>;
  bounds: BoundBox;
  jointsCount?: number;
  animations: Animation[] | undefined;
};
