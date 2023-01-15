import { mat4 } from 'gl-matrix';

import type { BufferTarget, ComponentType } from './webgl';

export const enum ModelType {
  REGULAR = 'REGULAR',
  SKINNED = 'SKINNED',
}

export type BufferInfo = {
  bufferTarget: BufferTarget;
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
