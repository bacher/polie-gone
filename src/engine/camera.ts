import { mat4, vec3 } from 'gl-matrix';

import { PI2 } from '../utils/math';

export type Camera = {
  mat: mat4;
  inverseMat: mat4;
  position: vec3;
  setTransforms: (params: {
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
  const currentDirection: CameraDirection = {
    pitch: 0,
    yaw: 0,
  };

  // mat4.translate(cameraMat, cameraMat, [0, 0, -2]);

  const camera: Camera = {
    mat,
    inverseMat,
    position: currentPosition,
    setTransforms: ({ position, direction }) => {
      vec3.copy(currentPosition, position);
      currentDirection.yaw = direction.yaw;
      currentDirection.pitch = direction.pitch;

      mat4.copy(mat, perspectiveMat);
      mat4.rotateX(mat, mat, currentDirection.pitch * PI2);
      mat4.rotateY(mat, mat, currentDirection.yaw * PI2);
      mat4.translate(mat, mat, currentPosition);

      mat4.invert(inverseMat, mat);
    },
  };

  return camera;
}
