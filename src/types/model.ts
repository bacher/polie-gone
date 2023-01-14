import { mat4 } from 'gl-matrix';

export const enum ComponentType {
  UNSIGNED_SHORT = 5123,
  FLOAT = 5126,
}

export const enum ModelType {
  REGULAR = 'REGULAR',
  SKINNED = 'SKINNED',
}

export type BufferInfo = {
  componentType: ComponentType;
  componentDimension: number;
  elementsCount: number;
  dataArray: Uint8Array;
};

export type LoadedModel =
  | {
      type: ModelType.REGULAR;
      modelName: string;
      buffers: {
        indices: BufferInfo;
        position: BufferInfo;
        normal?: BufferInfo;
        uv?: BufferInfo;
      };
    }
  | {
      type: ModelType.SKINNED;
      modelName: string;
      buffers: {
        indices: BufferInfo;
        position: BufferInfo;
        normal?: BufferInfo;
        uv?: BufferInfo;
        joints: BufferInfo;
        weights: BufferInfo;
      };
      inverseJoints: mat4[];
    };
