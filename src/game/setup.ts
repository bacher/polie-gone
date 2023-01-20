import { mat4, vec2 } from 'gl-matrix';

import { loadGltf } from '../utils/loadGltf';
import { initialize, initializeModel } from '../engine/initialize';
import type { Scene } from '../engine/scene';
import { renderScene, startRenderLoop } from '../engine/render';
import { ShaderProgramType } from '../shaderPrograms/types';
import { loadTexture } from '../utils/loadTexture';
import {
  generateHeightMapInstanced,
  generatePlain,
  generateQuad,
} from '../utils/meshGenerator';
import type { HeightMapInstancedProgram } from '../shaderPrograms/heightMapInstancedProgram';

import './exportGlMatrix';
import { fromEuler } from './utils';
import {
  initKeyboardController,
  KeyboardController,
} from './keyboardController';
import { initMouseController, MouseController } from './mouseController';
import { CameraController, createCameraController } from './cameraController';

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
  startRenderLoop: () => void;
  dispose: () => void;
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

  if (process.env.NODE_ENV !== 'production') {
    (window as any).gl = glContext.gl;
  }

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

  const plainModelData = generatePlain({ dimension: 10 });
  const plainModel = initializeModel(glContext, scene, plainModelData, [
    ShaderProgramType.DEFAULT,
    ShaderProgramType.HEIGHT_MAP,
  ]);

  scene.addDrawObject({
    model: plainModel,
    transforms: {
      translation: [0, -2.8, 0],
      scale: [10, 10, 10],
    },
    defaultShaderProgramType: ShaderProgramType.HEIGHT_MAP,
  });

  if (false) {
    const dimension = 50;
    const cellSize = vec2.fromValues(1 / dimension, 1 / dimension);

    const heightMapInstancedModelData = generateHeightMapInstanced({
      size: dimension,
    });

    const heightMapInstancedModel = initializeModel(
      glContext,
      scene,
      heightMapInstancedModelData,
      [ShaderProgramType.HEIGHT_MAP_INSTANCED],
    );

    scene.addDrawObject({
      model: heightMapInstancedModel,
      transforms: {
        translation: [0, -2.8, 0],
        scale: [10, 10, 10],
      },
      defaultShaderProgramType: ShaderProgramType.HEIGHT_MAP_INSTANCED,
      beforeDraw: (model, program) => {
        // TODO: Do we actually use several shaders for same draw object?
        // switch (program.type) {
        //   case ShaderProgramType.HEIGHT_MAP_INSTANCED:
        (program as HeightMapInstancedProgram).uniforms.cellSize(cellSize);
        // break;
        // }
      },
    });
  }

  const keyboardController = initKeyboardController();
  const mouseController = initMouseController();
  const cameraController = createCameraController({
    scene,
    keyboardController,
    mouseController,
    movementSpeed: 2,
  });
  cameraController.setPosition([0, 0, -2]);

  const game: Game = {
    scene,
    globalState,
    inputControls: {
      keyboard: keyboardController,
      mouse: mouseController,
    },
    cameraController,
    render: () => gameRender(game),
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

function gameStartRenderLoop(game: Game) {
  startRenderLoop({
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
