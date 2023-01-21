import { vec2 } from 'gl-matrix';

import type { LoadedModel } from '../types/model';
import type { Scene } from '../engine/scene';
import { generateHeightMapInstanced } from '../utils/meshGenerator';
import { initializeModel } from '../engine/initialize';
import { ShaderProgramType } from '../shaderPrograms/types';
import type { HeightMapInstancedProgram } from '../shaderPrograms/heightMapInstancedProgram';

import { fromEuler } from './utils';

type Params = {
  models: Record<string, LoadedModel>;
  textureImages: Record<string, HTMLImageElement>;
};

export function addTestSceneDrawObjects(
  scene: Scene,
  {
    models: { manModelData, toiletModelData },
    textureImages: { noiseTextureImage },
  }: Params,
) {
  addMen(scene, manModelData);
  addToilet(scene, toiletModelData);
  addTerrain(scene, noiseTextureImage);
}

function addMen(scene: Scene, manModelData: LoadedModel) {
  const { glContext } = scene;

  const manModel = initializeModel(glContext, scene, manModelData, [
    ShaderProgramType.DEFAULT,
    ShaderProgramType.SKIN,
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
}

function addToilet(scene: Scene, toiletModelData: LoadedModel) {
  const { glContext } = scene;

  const toiletModel = initializeModel(glContext, scene, toiletModelData, [
    ShaderProgramType.DEFAULT,
  ]);

  const toilet = scene.addDrawObject({
    model: toiletModel,
    transforms: {
      translation: [-0.9, -1, -1.5],
      scale: [0.6, 0.6, 0.6],
      rotation: fromEuler(0, 0.01, 0),
    },
    defaultShaderProgramType: ShaderProgramType.DEFAULT,
  });
}

function addTerrain(scene: Scene, noiseTextureImage: HTMLImageElement) {
  const { glContext } = scene;

  const dimension = 50;
  const cellSize = vec2.fromValues(1 / dimension, 1 / dimension);

  const heightMapInstancedModelData = generateHeightMapInstanced({
    size: dimension,
  });

  heightMapInstancedModelData.texture = noiseTextureImage;

  const heightMapInstancedModel = initializeModel(
    glContext,
    scene,
    heightMapInstancedModelData,
    [ShaderProgramType.HEIGHT_MAP_INSTANCED],
  );

  scene.addDrawObject({
    model: heightMapInstancedModel,
    transforms: {
      translation: [0, -2.4, 0],
      scale: [100, 4, 100],
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
