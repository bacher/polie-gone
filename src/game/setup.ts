import { mat4 } from 'gl-matrix';

import { loadGltf } from '../utils/loadGltf';
import { initialize, initializeModel } from '../engine/initialize';
import type { Scene } from '../engine/scene';
import { renderScene, startRenderLoop } from '../engine/render';
import { ShaderProgramType } from '../shaderPrograms/types';
import { loadTexture } from '../utils/loadTexture';

import './exportGlMatrix';
import type { MouseState } from './inputTypes';
import { MouseStateType } from './inputTypes';
import { fromEuler } from './utils';

export type Game = {
  scene: Scene;
  globalState: {
    isRotating: boolean;
  };
  render: () => void;
  startRenderLoop: () => void;

  updateMouseState: (mouseState: MouseState) => void;
};

type SetupGameParams = {
  canvasElement: HTMLCanvasElement;
};

export async function setupGame({
  canvasElement,
}: SetupGameParams): Promise<Game> {
  const [manModelData, toiletModelData, manTextureImage] = await Promise.all([
    loadGltf('/models/man/man.gltf', {
      loadSkin: true,
    }),
    loadGltf('/models/toilet/toilet.gltf'),
    loadTexture('/models/man/man.png'),
  ]);

  manModelData.texture = manTextureImage;

  const { glContext, scene } = initialize(canvasElement);

  const globalState = {
    isRotating: false,
  };

  const manModel = initializeModel(glContext, scene, manModelData, [
    ShaderProgramType.DEFAULT,
    ShaderProgramType.SKIN,
  ]);

  const toiletModel = initializeModel(glContext, scene, toiletModelData, [
    ShaderProgramType.DEFAULT,
  ]);

  const man1 = scene.addDrawObject({
    model: manModel,
    transforms: {
      translation: [0, -0.23, -1],
    },
    defaultShaderProgramType: ShaderProgramType.DEFAULT,
  });

  const man2 = scene.addDrawObject({
    model: manModel,
    transforms: {
      translation: [3, -0.23, -3],
    },
    defaultShaderProgramType: ShaderProgramType.SKIN,
  });

  const man3 = scene.addDrawObject({
    model: manModel,
    transforms: {
      rotation: fromEuler(0.14, 0, 0.13),
      translation: [-3, -0.23, -2],
      scale: [0.4, 0.4, 0.4],
    },
    defaultShaderProgramType: ShaderProgramType.SKIN,
  });

  const toilet = scene.addDrawObject({
    model: toiletModel,
    transforms: {
      translation: [-0.9, -1, -1.5],
      scale: [0.6, 0.6, 0.6],
      rotation: fromEuler(0, 0.01, 0),
    },
    defaultShaderProgramType: ShaderProgramType.DEFAULT,
  });

  const game: Game = {
    scene,
    globalState,
    render: () => gameRender(game),
    startRenderLoop: () => gameStartRenderLoop(game),
    updateMouseState: (mouseState) => {
      if (mouseState.mouseStateType === MouseStateType.PRESSED) {
        // TODO:
      }
    },
  };

  return game;
}

function gameRender(game: Game) {
  renderScene(game.scene);
}

function gameStartRenderLoop(game: Game) {
  startRenderLoop({
    scene: game.scene,
    // fps: 5,
    onTick: ({ delta, timestamp }) => {
      if (game.globalState.isRotating) {
        const firstModel = game.scene.models[0];

        if (firstModel) {
          const modelMat = firstModel.modelMat;
          mat4.rotateY(modelMat, modelMat, delta * 0.001);
        }

        const thirdModel = game.scene.models[2];

        if (thirdModel) {
          const modelMat = thirdModel.modelMat;
          mat4.rotateZ(modelMat, modelMat, delta * 0.001);
        }
      }
    },
  });
}
