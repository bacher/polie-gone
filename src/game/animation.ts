import { mat4 } from 'gl-matrix';

import type { Animation } from '../types/animation';

export function applyAnimationFrame({
  jointsDataArray,
  animation,
  frameIndex,
}: {
  jointsDataArray: Float32Array;
  animation: Animation;
  frameIndex: number;
}) {
  const jointsCount = animation.joints.length;

  const alreadyCalculatedMatrices = calculateGlobalJointsMatrices(
    animation,
    frameIndex,
  );

  for (let i = 0; i < jointsCount; i += 1) {
    const jointInfo = animation.joints[i].joint;
    const jointGlobal = alreadyCalculatedMatrices[i];

    mat4.multiply(jointGlobal, jointGlobal, jointInfo.inverseMat);

    jointsDataArray.set(jointGlobal, i * 16);
  }
}

function calculateGlobalJointsMatrices(
  animation: Animation,
  frameIndex: number,
) {
  const acc = Array(animation.joints.length) as mat4[];

  recursiveDescend(mat4.create(), 0);

  function recursiveDescend(global: mat4, jointIndex: number): void {
    const { joint, mutations } = animation.joints[jointIndex];

    const mat = mat4.create();

    for (const mutation of mutations) {
      switch (mutation.path) {
        case 'translation': {
          const size = 3;
          const values = mutation.sampler.output.dataArray.slice(
            frameIndex * size,
            (frameIndex + 1) * size,
          ) as Float32Array;
          mat4.translate(mat, mat, values);
          break;
        }
        case 'rotation': {
          const size = 4;
          const values = mutation.sampler.output.dataArray.slice(
            frameIndex * size,
            (frameIndex + 1) * size,
          ) as Float32Array;
          const rotationMat = mat4.fromQuat(mat4.create(), values);
          mat4.multiply(mat, mat, rotationMat);
          break;
        }
        case 'scale': {
          const size = 3;
          const values = mutation.sampler.output.dataArray.slice(
            frameIndex * size,
            (frameIndex + 1) * size,
          ) as Float32Array;
          mat4.scale(mat, mat, values);
          break;
        }
        default:
          throw new Error(`Unknown animation path "${mutation.path}"`);
      }
    }
    // const localJointTransform = convertTransformsToMat4(joint.transforms);

    mat4.multiply(mat, global, mat); // mat becomes globalJointTransform

    acc[jointIndex] = mat;

    if (joint.children) {
      for (const childJointIndex of joint.children) {
        recursiveDescend(mat, childJointIndex);
      }
    }
  }

  return acc;
}

// Bend arm
// if (true) {
//   if (i === 7) {
//     mat4.rotateX(mat, mat, 0.2 * Math.PI);
//   }
//   if (i === 8) {
//     mat4.translate(mat, mat, [0, -0.2, 0.4]);
//     mat4.rotateX(mat, mat, 0.2 * Math.PI);
//   }
// }
