import type { mat4, quat, vec3 } from 'gl-matrix';

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

export type RegularLoadedModel = {
  type: ModelType.REGULAR;
  modelName: string;
  dataBuffers: {
    indices: DataBuffer;
    position: DataBuffer;
    normal?: DataBuffer;
    uv?: DataBuffer;
  };
};

export type Transforms = {
  rotation: quat;
  translation: vec3;
  scale: vec3;
};

export type JointInfo = {
  nodeIndex: number;
  children: number[] | undefined;
  transforms: Partial<Transforms>;
  inverseMat: mat4;
};

export type SkinnedLoadedModel = {
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
  joints: JointInfo[];
};

export type LoadedModel = RegularLoadedModel | SkinnedLoadedModel;
