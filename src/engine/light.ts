import { mat4, vec3 } from 'gl-matrix';

import type { Light } from './types';

const SIZE_X = 10;
const SIZE_Y = 10;
const NEAR = 0.01;
const FAR = 50;
const DEPTH = FAR - NEAR;

const HALF_SIZE_X_INV = 1 / (SIZE_X * 0.5);
const HALF_SIZE_Y_INV = 1 / (SIZE_Y * 0.5);
const HALF_DEPTH_INV = 1 / (DEPTH * 0.5);

const newCenterTemp = vec3.create();

export function initLight(): Light {
  const mat = mat4.create();
  const halfSizeX = SIZE_X / 2;
  const halfSizeY = SIZE_Y / 2;
  mat4.ortho(mat, -halfSizeX, halfSizeX, -halfSizeY, halfSizeY, NEAR, FAR);

  const direction = vec3.fromValues(-5, 10, 4); // direction toward light
  const position = direction;

  const viewMat = mat4.create();
  mat4.lookAt(viewMat, position, [0, 0, 0], [0, 1, 0]);

  mat4.mul(mat, mat, viewMat);

  return {
    mat,
    direction,
    isSphereBoundVisible: ({ center, radius }): boolean => {
      vec3.transformMat4(newCenterTemp, center, mat);

      const x = Math.abs(newCenterTemp[0]);
      const normalizedRadiusX = radius * HALF_SIZE_X_INV;

      const y = Math.abs(newCenterTemp[1]);
      const normalizedRadiusY = radius * HALF_SIZE_Y_INV;

      const z = Math.abs(newCenterTemp[2]);
      const normalizedRadiusZ = radius * HALF_DEPTH_INV;

      return (
        x - normalizedRadiusX <= 1 &&
        y - normalizedRadiusY <= 1 &&
        z - normalizedRadiusZ <= 1
      );
    },
  };
}
