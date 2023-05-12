import { mat4 } from 'gl-matrix';

import { loadGltf } from '../utils/loadGltf';
import { initialize } from '../engine/initialize';
import type { Scene } from '../engine/sceneInterface';
import { renderScene, startRenderLoop } from '../engine/render';
import { loadTexture } from '../utils/loadTexture';

import './exportGlMatrix';
import {
  initKeyboardController,
  KeyboardController,
} from './keyboardController';
import { initMouseController, MouseController } from './mouseController';
import { CameraController, createCameraController } from './cameraController';
import { addTestSceneDrawObjects } from './testSceneDrawObjects';

export type Game = {
  scene: Scene;
  globalState: {
    isRotating: boolean;
  };
  inputControls: {
    keyboard?: KeyboardController;
    mouse?: MouseController;
  };
  cameraController: CameraController;
  render: () => void;
  startRenderLoop: () => () => void;
  dispose: () => void;
};

type SetupGameParams = {
  canvasElement: HTMLCanvasElement;
};

export async function setupGame({
  canvasElement,
}: SetupGameParams): Promise<Game> {
  const prefix = import.meta.env.BASE_URL;

  const [
    manModelData,
    toiletModelData,
    unitSphereModelData,
    manTextureImage,
    noiseTextureImage,
  ] = await Promise.all([
    loadGltf(`${prefix}models/man/man.gltf`, {
      loadSkin: true,
    }),
    loadGltf(`${prefix}models/toilet/toilet.gltf`),
    loadGltf(`${prefix}models/unit-sphere/unit-sphere.gltf`),
    loadTexture(`${prefix}models/man/man.png`),
    loadTexture(`${prefix}textures/noise.png`),
  ]);

  manModelData.texture = manTextureImage;

  const { glContext, scene } = initialize(canvasElement);

  if (process.env.NODE_ENV !== 'production') {
    (window as any).gl = glContext.gl;
  }

  const globalState = {
    isRotating: false,
  };

  addTestSceneDrawObjects(scene, {
    models: {
      manModelData,
      toiletModelData,
      unitSphereModelData,
    },
    textureImages: {
      noiseTextureImage,
    },
  });

  const keyboardController = initKeyboardController();
  const mouseController = initMouseController();
  const cameraController = createCameraController({
    scene,
    keyboardController,
    mouseController,
    movementSpeed: 2,
  });
  cameraController.setPosition([
    2.1513619422912598, 0.004043835215270519, 2.377631187438965,
  ]);
  cameraController.setDirection({
    pitch: 0.005833099999999829,
    yaw: 0.0841633000000014,
  });

  const game: Game = {
    scene,
    globalState,
    inputControls: {
      keyboard: keyboardController,
      mouse: mouseController,
    },
    cameraController,
    render: () => {
      cameraController.applyCameraState();
      gameRender(game);
    },
    startRenderLoop: () => gameStartRenderLoop(game),
    dispose: () => {
      mouseController.dispose();
      keyboardController.dispose();
    },
  };

  return game;
}

function gameRender(game: Game) {
  renderScene(game.scene);
}

function gameStartRenderLoop(game: Game): () => void {
  return startRenderLoop({
    scene: game.scene,
    // fps: 5,
    onTick: (tickParams) => {
      const { delta } = tickParams;

      if (game.cameraController) {
        game.cameraController.tick(tickParams);
      }

      if (game.globalState.isRotating) {
        const firstModel = game.scene.models[0];

        if (firstModel) {
          const modelMat = firstModel.modelMat;
          mat4.rotateY(modelMat, modelMat, delta);
        }

        const thirdModel = game.scene.models[2];

        if (thirdModel) {
          const modelMat = thirdModel.modelMat;
          mat4.rotateZ(modelMat, modelMat, delta);
        }
      }
    },
  });
}
