import type { quat, vec3 } from 'gl-matrix';

export type Transforms = {
  rotation: quat;
  translation: vec3;
  scale: vec3;
};

export type BoundBox = {
  min: vec3;
  max: vec3;
};

export type BoundSphere = {
  center: vec3;
  radius: number;
};
