import { mat4, quat, vec3 } from 'gl-matrix';
import clamp from 'lodash/clamp';

import type { Transforms } from '../types/model';
import type { Scene } from '../engine/scene';
import type { TickHandler, TickTime } from '../engine/render';
import {
  convertTransformsToMat4,
  createIdentifyTransforms,
} from '../utils/transforms';

import type { KeyboardController } from './keyboardController';
import type { MouseController } from './mouseController';
import type { Position2d } from './types';
import { PI2 } from '../utils/math';

const MOUSE_SENSITIVITY = 0.1;
const ACCELERATION = 20;

export type CameraController = {
  transforms: Transforms;
  tick: TickHandler;
  setPosition: (pos: vec3) => void;
  dispose: () => void;
};

type CreateCameraControllerParams = {
  scene: Scene;
  mouseController: MouseController;
  keyboardController: KeyboardController;
  movementSpeed: number;
};

type InnerState = {
  previousMousePosition: Position2d | undefined;
  speedVector: vec3;
  isSpeedVectorNonEmpty: boolean;
};

export function createCameraController({
  scene,
  keyboardController,
  mouseController,
  movementSpeed,
}: CreateCameraControllerParams): CameraController {
  let isDirty = true;

  const state: InnerState = {
    previousMousePosition: undefined,
    speedVector: vec3.create(),
    isSpeedVectorNonEmpty: false,
  };

  const moveByBuffer = vec3.create();

  const projectionMat = mat4.perspective(
    mat4.create(),
    Math.PI / 2,
    // TODO: use actual size
    600 / 400,
    0.1,
    1000,
  );

  const transforms = createIdentifyTransforms();

  // Normalized [0..1], 1 = full roll (2PI)
  let yawAngle = 0;
  let pitchAngle = 0;

  function checkLookDirection({ delta }: TickTime): void {
    const position = mouseController.getPosition();
    const prevPosition = state.previousMousePosition;

    if (position && prevPosition) {
      const mouseMovement = {
        x: position.x - prevPosition.x,
        y: position.y - prevPosition.y,
      };

      if (mouseMovement.x !== 0 || mouseMovement.y !== 0) {
        yawAngle += mouseMovement.x * delta * MOUSE_SENSITIVITY;
        pitchAngle += mouseMovement.y * delta * MOUSE_SENSITIVITY;
        pitchAngle = clamp(pitchAngle, -0.23, 0.23);

        // All operation uses original quat
        const mat = transforms.rotation;
        quat.identity(mat);
        quat.rotateX(mat, mat, pitchAngle * PI2);
        quat.rotateY(mat, mat, yawAngle * PI2);

        isDirty = true;
      }
    }

    state.previousMousePosition = position;
  }

  function checkMovement({ delta }: TickTime): void {
    const direction = vec3.create();

    let iSomeMovement = false;

    if (keyboardController.isPressed('KeyW')) {
      vec3.add(direction, direction, [0, 0, 1]);
      iSomeMovement = true;
    }
    if (keyboardController.isPressed('KeyS')) {
      vec3.add(direction, direction, [0, 0, -1]);
      iSomeMovement = true;
    }
    if (keyboardController.isPressed('KeyA')) {
      vec3.add(direction, direction, [1, 0, 0]);
      iSomeMovement = true;
    }
    if (keyboardController.isPressed('KeyD')) {
      vec3.add(direction, direction, [-1, 0, 0]);
      iSomeMovement = true;
    }

    if (iSomeMovement || state.isSpeedVectorNonEmpty) {
      // TODO: Use static buffer
      const targetSpeedVector = vec3.create();

      if (iSomeMovement) {
        vec3.normalize(direction, direction);
        vec3.scale(targetSpeedVector, direction, movementSpeed);
      }

      let distanceVector: vec3;

      if (state.isSpeedVectorNonEmpty) {
        distanceVector = vec3.subtract(
          vec3.create(),
          targetSpeedVector,
          state.speedVector,
        );
      } else {
        distanceVector = targetSpeedVector;
      }

      const distance = vec3.length(distanceVector);

      if (distance > 0) {
        const mix = clamp((ACCELERATION * delta) / distance, 0, 1);

        vec3Mix(state.speedVector, state.speedVector, targetSpeedVector, mix);
        state.isSpeedVectorNonEmpty = !isVec3Empty(state.speedVector);
      }
    }

    if (state.isSpeedVectorNonEmpty) {
      const { translation } = transforms;
      vec3.scale(moveByBuffer, state.speedVector, delta);
      vec3.add(translation, translation, moveByBuffer);
      isDirty = true;
    }
  }

  const cameraController: CameraController = {
    transforms,
    tick: (tickTime) => {
      checkLookDirection(tickTime);
      checkMovement(tickTime);

      if (isDirty) {
        const cameraTransformsMat = convertTransformsToMat4(transforms);

        // Write directly to scene camera matrix
        mat4.multiply(scene.cameraMat, projectionMat, cameraTransformsMat);
        isDirty = false;
      }
    },
    setPosition: (pos: vec3) => {
      transforms.translation = pos;
      isDirty = true;
    },
    dispose: () => {},
  };

  return cameraController;
}

const tempVec3 = vec3.create();

function vec3Mix(
  target: vec3,
  input1: vec3,
  input2: vec3,
  interpolation: number,
): vec3 {
  vec3.scale(target, input1, 1 - interpolation);
  vec3.scale(tempVec3, input2, interpolation);
  vec3.add(target, target, tempVec3);
  return target;
}

function isVec3Empty(vec: vec3): boolean {
  return vec[0] === 0 && vec[1] === 0 && vec[2] === 0;
}
