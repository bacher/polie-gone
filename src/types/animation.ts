import { mat4 } from 'gl-matrix';

import type { Transforms } from './core';

export type Animation = {
  name: string;
  joints: {
    joint: JointInfo;
    mutations: {
      path: 'translation' | 'rotation' | 'scale';
      sampler: Sampler;
    }[];
  }[];
};

export type Sampler = {
  interpolation: 'LINEAR' | 'STEP' | 'CUBICSPLINE';
  input: Accessor;
  output: Accessor;
};

type Accessor = {
  dataArray: Uint8Array | Float32Array;
};

export type JointInfo = {
  nodeIndex: number;
  children: number[] | undefined;
  transforms: Partial<Transforms>;
  inverseMat: mat4;
};
