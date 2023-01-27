import { mat4, vec3 } from 'gl-matrix';

import { PI2 } from '../utils/math';
import { makeBoundBoxByPoints } from '../utils/boundBox';

export type Camera = {
  mat: mat4;
  inverseMat: mat4;
  position: vec3;
  setOrientation: (params: {
    position: vec3;
    direction: CameraDirection;
  }) => void;
};

export type CameraDirection = {
  pitch: number;
  yaw: number;
};

export function initCamera(): Camera {
  // TODO: Actualize ratio on resizes
  const perspectiveMat = mat4.perspective(
    mat4.create(),
    Math.PI / 2,
    600 / 400,
    0.1,
    1000,
  );

  const mat = mat4.create();
  const inverseMat = mat4.create();
  const currentPosition = vec3.create();
  const invertedCurrentPosition = vec3.create();
  const currentDirection: CameraDirection = {
    pitch: 0,
    yaw: 0,
  };

  const camera: Camera = {
    mat,
    inverseMat,
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

      mat4.invert(inverseMat, mat);
    },
  };

  return camera;
}

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
