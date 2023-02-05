import type { mat4, quat, vec3 } from 'gl-matrix';

import type { Animation } from '../utils/loadGltf';

import type { BufferTarget, ComponentType } from './webgl';

export const enum ModelType {
  REGULAR = 'REGULAR',
  SKINNED = 'SKINNED',
  BASIC = 'BASIC',
  HEIGHT_MAP = 'HEIGHT_MAP',
  WIREFRAME = 'WIREFRAME',
}

export type DataBuffer = {
  bufferTarget: BufferTarget;
  componentType: ComponentType;
  componentDimension: number;
  elementsCount: number;
  dataArray: Uint8Array | Uint16Array | Float32Array;
  divisor?: number;
};

export type BoundBox = {
  min: vec3;
  max: vec3;
};

export type BoundSphere = {
  center: vec3;
  radius: number;
};

type LoadedModelBase = {
  modelName: string;
  texture?: HTMLImageElement;
  bounds: BoundBox;
};

export type RegularLoadedModel = LoadedModelBase & {
  type: ModelType.REGULAR;
  dataBuffers: {
    indices: DataBuffer;
    position: DataBuffer;
    normal?: DataBuffer;
    texcoord?: DataBuffer;
  };
};

export type WireframeLoadedModel = LoadedModelBase & {
  type: ModelType.WIREFRAME;
  dataBuffers: {
    indices: DataBuffer;
    position: DataBuffer;
  };
};

export type BasicLoadedModel = LoadedModelBase & {
  type: ModelType.BASIC;
  dataBuffers: {
    position: DataBuffer;
    normal?: DataBuffer;
    texcoord?: DataBuffer;
  };
};

export type HeightMapLoadedModel = LoadedModelBase & {
  type: ModelType.HEIGHT_MAP;
  instancedCount: number;
  dataBuffers: {
    position: DataBuffer;
    offset: DataBuffer;
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

export type SkinnedLoadedModel = LoadedModelBase & {
  type: ModelType.SKINNED;
  dataBuffers: {
    indices: DataBuffer;
    position: DataBuffer;
    normal?: DataBuffer;
    texcoord?: DataBuffer;
    joints: DataBuffer;
    weights: DataBuffer;
  };
  joints: JointInfo[];
  animations: Animation[] | undefined;
};

export type LoadedModel =
  | RegularLoadedModel
  | SkinnedLoadedModel
  | BasicLoadedModel
  | HeightMapLoadedModel
  | WireframeLoadedModel;
