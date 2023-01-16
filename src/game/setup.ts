import { mat4, quat } from 'gl-matrix';

import { loadGltf } from '../utils/loadGltf';
import { initialize, initializeModel } from '../engine/initialize';
import type { Scene } from '../engine/scene';
import { renderScene, startRenderLoop } from '../engine/render';

import './exportGlMatrix';
import { ShaderProgramType } from '../shaderPrograms/types';

export type Game = {
  scene: Scene;
  globalState: {
    isRotating: boolean;
  };
  render: () => void;
  startRenderLoop: () => void;
};

type SetupGameParams = {
  canvasElement: HTMLCanvasElement;
};

export async function setupGame({
  canvasElement,
}: SetupGameParams): Promise<Game> {
  const manModelData = await loadGltf('/models/man.gltf', { loadSkin: true });

  const { scene } = initialize(canvasElement);

  const globalState = {
    isRotating: false,
  };

  const manModel = initializeModel(scene, manModelData, [
    ShaderProgramType.SIMPLE,
  ]);

  const manDrawObject = scene.addDrawObject({
    model: manModel,
    transforms: {
      translation: [0, -0.23, -1],
    },
    defaultShaderProgramType: ShaderProgramType.SIMPLE,
  });

  const man2DrawObject = scene.addDrawObject({
    model: manModel,
    transforms: {
      translation: [3, -0.23, -3],
    },
    defaultShaderProgramType: ShaderProgramType.SIMPLE,
  });

  const man3DrawObject = scene.addDrawObject({
    model: manModel,
    transforms: {
      rotation: quat.fromEuler(quat.create(), 50, 0, 47),
      translation: [-3, -0.23, -2],
      scale: [0.4, 0.4, 0.4],
    },
    defaultShaderProgramType: ShaderProgramType.SIMPLE,
  });

  const game = {
    scene,
    globalState,
    render: () => gameRender(game),
    startRenderLoop: () => gameStartRenderLoop(game),
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
