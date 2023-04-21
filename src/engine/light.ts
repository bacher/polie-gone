import { mat4, vec3 } from 'gl-matrix';

import type { Light } from './types';
import type { Camera } from './camera';

const SIZE_X = 10;
const SIZE_Y = 10;
const NEAR = 0.0001;
const FAR = 50;
const DEPTH = FAR - NEAR;

const HALF_SIZE_X_INV = 1 / (SIZE_X * 0.5);
const HALF_SIZE_Y_INV = 1 / (SIZE_Y * 0.5);
const HALF_DEPTH_INV = 1 / (DEPTH * 0.5);

const newCenterTemp = vec3.create();
const towardBoundTemp = vec3.create();

export function initLight(): Light {
  const mat = mat4.create();
  const halfSizeX = SIZE_X / 2;
  const halfSizeY = SIZE_Y / 2;
  mat4.ortho(mat, -halfSizeX, halfSizeX, -halfSizeY, halfSizeY, NEAR, FAR);

  const position = vec3.fromValues(-5, 10, 4);
  const direction = vec3.normalize(vec3.create(), position); // direction toward light

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
    adaptToCamera: (camera: Camera) => {
      const { center, radius } = camera.boundSphere;

      // TODO: mat could be calculated one time if radius doesn't change
      mat4.ortho(mat, -radius, radius, -radius, radius, NEAR, radius * 2);

      // TODO: towardBoundTemp could be calculated one time if radius doesn't change
      vec3.scale(towardBoundTemp, direction, radius);
      vec3.add(position, center, towardBoundTemp);

      mat4.lookAt(viewMat, position, center, [0, 1, 0]);

      mat4.mul(mat, mat, viewMat);
    },
  };
}
