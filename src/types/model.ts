import type { BoundBox } from './core';
import type { Animation, JointInfo } from './animation';
import type { BufferTarget, ComponentType } from './webgl';

export const enum ModelType {
  INDEXED = 'INDEXED',
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

type LoadedModelBase = {
  modelName: string;
  texture?: HTMLImageElement;
  bounds: BoundBox;
};

export type IndexedLoadedModel = LoadedModelBase & {
  type: ModelType.INDEXED;
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
  | IndexedLoadedModel
  | SkinnedLoadedModel
  | BasicLoadedModel
  | HeightMapLoadedModel
  | WireframeLoadedModel;
