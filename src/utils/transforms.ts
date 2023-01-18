import { mat4, quat, vec3 } from 'gl-matrix';

import type { Transforms } from '../types/model';

export function createIdentifyTransforms(): Transforms {
  return {
    rotation: quat.create(),
    translation: vec3.create(),
    scale: vec3.fromValues(1, 1, 1),
  };
}
export function convertTransformsToMat4({
  translation: t,
  rotation: r,
  scale: s,
}: Partial<Transforms>): mat4 {
  const mat = mat4.create();

  if (r) {
    if (t && s) {
      return mat4.fromRotationTranslationScale(mat, r, t, s);
    }
    if (t && !s) {
      return mat4.fromRotationTranslation(mat, r, t);
    }
    if (!t && !s) {
      return mat4.fromQuat(mat, r);
    }
  }

  if (t) {
    mat4.translate(mat, mat, t);
  }

  if (s) {
    mat4.scale(mat, mat, s);
  }

  return mat;
}
