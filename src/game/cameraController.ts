import { mat4, quat, vec3 } from 'gl-matrix';
import clamp from 'lodash/clamp';

import { PI2 } from '../utils/math';
import type { Scene } from '../engine/scene';
import type { TickHandler, TickTime } from '../engine/render';

import type { KeyboardController } from './keyboardController';
import type { MouseController } from './mouseController';
import type { Position2d } from './types';

const MOUSE_SENSITIVITY = 0.05;
const ACCELERATION = 20;

export type CameraController = {
  tick: TickHandler;
  applyCameraState: () => void;
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
  previousMouseMovementPosition: Position2d | undefined;
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
    previousMouseMovementPosition: undefined,
    speedVector: vec3.create(),
    isSpeedVectorNonEmpty: false,
  };

  const moveByTempBuffer = vec3.create();

  const position = vec3.create();
  const origin = vec3.create();
  // Normalized [0..1], 1 = full roll (2PI)
  let yawAngle = 0;
  let pitchAngle = 0;

  function checkLookDirection({ delta }: TickTime): void {
    const isPointerLocked = mouseController.isPointerLocked();

    if (!isPointerLocked) {
      state.previousMouseMovementPosition = undefined;
      return;
    }

    const mouseMovementPosition = mouseController.getMovementPosition();
    const { previousMouseMovementPosition } = state;

    if (
      previousMouseMovementPosition &&
      mouseMovementPosition !== previousMouseMovementPosition
    ) {
      const mouseMovement = {
        x: mouseMovementPosition.x - previousMouseMovementPosition.x,
        y: mouseMovementPosition.y - previousMouseMovementPosition.y,
      };

      yawAngle += mouseMovement.x * delta * MOUSE_SENSITIVITY;
      pitchAngle += mouseMovement.y * delta * MOUSE_SENSITIVITY;
      pitchAngle = clamp(pitchAngle, -0.23, 0.23);
      isDirty = true;
    }

    state.previousMouseMovementPosition = mouseMovementPosition;
  }

  function checkMovement({ delta }: TickTime): void {
    const direction = vec3.create();

    let isSomeMovement = false;

    if (keyboardController.isPressed('KeyW')) {
      vec3.add(direction, direction, [0, 0, 1]);
      isSomeMovement = true;
    }
    if (keyboardController.isPressed('KeyS')) {
      vec3.add(direction, direction, [0, 0, -1]);
      isSomeMovement = true;
    }
    if (keyboardController.isPressed('KeyA')) {
      vec3.add(direction, direction, [1, 0, 0]);
      isSomeMovement = true;
    }
    if (keyboardController.isPressed('KeyD')) {
      vec3.add(direction, direction, [-1, 0, 0]);
      isSomeMovement = true;
    }

    if (isSomeMovement || state.isSpeedVectorNonEmpty) {
      // TODO: Use static buffer
      const targetSpeedVector = vec3.create();

      if (isSomeMovement) {
        vec3.normalize(direction, direction);

        // Inverted
        vec3.rotateX(direction, direction, origin, -pitchAngle * PI2);
        vec3.rotateY(direction, direction, origin, -yawAngle * PI2);

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
      vec3.scale(moveByTempBuffer, state.speedVector, delta);
      vec3.add(position, position, moveByTempBuffer);
      isDirty = true;
    }
  }

  const cameraController: CameraController = {
    tick: (tickTime) => {
      checkLookDirection(tickTime);
      checkMovement(tickTime);

      cameraController.applyCameraState();
    },
    applyCameraState: () => {
      if (isDirty) {
        scene.camera.setTransforms({
          direction: {
            pitch: pitchAngle,
            yaw: yawAngle,
          },
          position,
        });

        isDirty = false;
      }
    },
    setPosition: (pos: vec3) => {
      vec3.copy(position, pos);
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
