import { mat4 } from 'gl-matrix';

import type { JointInfo, Transforms } from '../types/model';

export function calculateGlobalJoinsMatrices(joints: JointInfo[]) {
  const acc = Array(joints.length) as mat4[];

  recursiveDescend(mat4.create(), 0);

  function recursiveDescend(global: mat4, jointIndex: number): void {
    const joint = joints[jointIndex];
    const localJointTransform = convertTransformsToMat4(joint.transforms);
    const globalJointTransform = mat4.multiply(
      mat4.create(),
      global,
      localJointTransform,
    );

    acc[jointIndex] = globalJointTransform;

    if (joint.children) {
      for (const childJointIndex of joint.children) {
        recursiveDescend(globalJointTransform, childJointIndex);
      }
    }
  }

  return acc;
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
