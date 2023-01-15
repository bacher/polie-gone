import type { mat4 } from 'gl-matrix';

import type { BufferTarget, ComponentType } from './webgl';

export const enum ModelType {
  REGULAR = 'REGULAR',
  SKINNED = 'SKINNED',
}

export type DataBuffer = {
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
      dataBuffers: {
        indices: DataBuffer;
        position: DataBuffer;
        normal?: DataBuffer;
        uv?: DataBuffer;
      };
    }
  | {
      type: ModelType.SKINNED;
      modelName: string;
      dataBuffers: {
        indices: DataBuffer;
        position: DataBuffer;
        normal?: DataBuffer;
        uv?: DataBuffer;
        joints: DataBuffer;
        weights: DataBuffer;
      };
      inverseJoints: mat4[];
    };
