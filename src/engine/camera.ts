import { mat4, vec3 } from 'gl-matrix';

import { PI2 } from '../utils/math';
import type { BoundSphere } from '../types/core';
import { debugVec } from '../utils/debug';

export type Camera = {
  mat: mat4;
  // inverseMat using only in getCameraViewBoundBox,
  // currently getCameraViewBoundBox is disabled and inverseMat was commented
  // inverseMat: mat4;
  position: vec3;
  setOrientation: (params: {
    position: vec3;
    direction: CameraDirection;
  }) => void;
  transformIntoCameraCoords: (out: vec3, point: vec3) => vec3;
  isSphereBoundVisible: (boundSphere: BoundSphere) => boolean;
};

export type CameraDirection = {
  pitch: number;
  yaw: number;
};

const zeroVec = vec3.create();

export function initCamera(ratio: number): Camera {
  const verticalFov = Math.PI / 2;
  const verticalHalfFov = verticalFov / 2;
  const verticalHalfFovTan = Math.tan(verticalHalfFov);
  // sec = Secant (1/cos)
  const verticalHalfFovSec = 1 / Math.cos(verticalHalfFov);
  const maxDistance = 1000;
  const horizontalFov = Math.atan(verticalHalfFovTan * ratio) * 2;
  const horizontalHalfFov = horizontalFov / 2;
  const horizontalHalfFovTan = Math.tan(horizontalHalfFov);
  const horizontalHalfFovSec = 1 / Math.cos(horizontalHalfFov);

  const halfHeight = maxDistance * verticalHalfFovTan;
  const halfWidth = maxDistance * horizontalHalfFovTan;

  // TODO: Actualize ratio on resizes
  const perspectiveMat = mat4.perspective(
    mat4.create(),
    verticalFov,
    ratio,
    0.1,
    maxDistance,
  );

  const mat = mat4.create();
  // const inverseMat = mat4.create();
  const currentPosition = vec3.create();
  const invertedCurrentPosition = vec3.create();
  const boundCenterInCameraTemp = vec3.create();
  const currentDirection: CameraDirection = {
    pitch: 0,
    yaw: 0,
  };

  const camera: Camera = {
    mat,
    // inverseMat,
    position: currentPosition,
    setOrientation: ({ position, direction }) => {
      vec3.copy(currentPosition, position);
      vec3.scale(invertedCurrentPosition, currentPosition, -1);
      currentDirection.yaw = direction.yaw;
      currentDirection.pitch = direction.pitch;

      mat4.copy(mat, perspectiveMat);
      mat4.rotateX(mat, mat, -currentDirection.pitch * PI2);
      mat4.rotateY(mat, mat, -currentDirection.yaw * PI2);
      mat4.translate(mat, mat, invertedCurrentPosition);

      // mat4.invert(inverseMat, mat);
    },
    transformIntoCameraCoords: (out, point) => {
      vec3.sub(out, point, currentPosition);
      vec3.rotateY(out, out, zeroVec, -currentDirection.yaw * PI2);
      vec3.rotateX(out, out, zeroVec, -currentDirection.pitch * PI2);
      return out;
    },
    isSphereBoundVisible: ({ center, radius }) => {
      camera.transformIntoCameraCoords(boundCenterInCameraTemp, center);

      let [x, y, z] = boundCenterInCameraTemp;
      x = Math.abs(x);
      y = Math.abs(y);
      z = -z;

      if (z <= -radius || z >= maxDistance + radius) {
        return false;
      }

      if (x >= halfWidth + radius || y >= halfHeight + radius) {
        return false;
      }

      const bHorizontal = radius * horizontalHalfFovSec;
      const xThreshold = horizontalHalfFovTan * z + bHorizontal;

      if (x >= xThreshold) {
        return false;
      }

      const bVertical = radius * verticalHalfFovSec;
      const yThreshold = verticalHalfFovTan * z + bVertical;

      if (y >= yThreshold) {
        return false;
      }

      return true;
    },
  };

  return camera;
}

/*
  TODO: This section can be deleted
const topLeftScreenPoint = vec3.fromValues(-1, 1, 1);
const bottomRightScreenPoint = vec3.fromValues(1, -1, 1);
const topLeftTempVec = vec3.create();
const bottomRightTempVec = vec3.create();

export function getCameraViewBoundBox(camera: Camera) {
  vec3.transformMat4(topLeftTempVec, topLeftScreenPoint, camera.inverseMat);
  vec3.transformMat4(
    bottomRightTempVec,
    bottomRightScreenPoint,
    camera.inverseMat,
  );

  return makeBoundBoxByPoints([
    camera.position,
    topLeftTempVec,
    bottomRightTempVec,
  ]);
}
 */
