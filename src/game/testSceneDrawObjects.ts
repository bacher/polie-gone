import { quat, vec2 } from 'gl-matrix';

import {
  DataBuffer,
  LoadedModel,
  ModelType,
  IndexedLoadedModel,
  SkinnedLoadedModel,
} from '../types/model';
import { BufferTarget, ComponentType } from '../types/webgl';
import type { Scene } from '../engine/sceneInterface';
import { generateHeightMapInstanced } from '../utils/meshGenerator';
import { generateIcosahedronWireFrame } from '../utils/meshGenerators/icosahedronWireFrame';
import { initializeModel } from '../engine/initialize';
import { ShaderProgramType } from '../shaderPrograms/types';
import type { HeightMapInstancedProgram } from '../shaderPrograms/heightMapInstancedProgram';

import { fromEuler } from './utils';
import { applyAnimationFrame } from './animation';
import { generateIcoHaxagonSphereWireFrame } from '../utils/meshGenerators/icoHaxagonSphereWireFrame';
import { generateIcoHaxagonSphere } from '../utils/meshGenerators/icoHaxagonSphere';

type Params = {
  models: Record<string, LoadedModel>;
  textureImages: Record<string, HTMLImageElement>;
};

export function addTestSceneDrawObjects(
  scene: Scene,
  {
    models: { manModelData, toiletModelData, unitSphereModelData },
    textureImages: { noiseTextureImage },
  }: Params,
) {
  addMen(scene, manModelData);
  addToilet(scene, toiletModelData);
  addTerrain(scene, noiseTextureImage);
  // addUnitSphere(scene, unitSphereModelData);

  addIcosphere(scene);
}

function addMen(scene: Scene, manModelData: LoadedModel) {
  const { glContext } = scene;

  const manModel = initializeModel(glContext, scene, manModelData, [
    ShaderProgramType.DEFAULT,
    ShaderProgramType.DEFAULT_SHADOW_MAP,
    ShaderProgramType.SKIN,
    ShaderProgramType.SKIN_SHADOW_MAP,
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
    beforeDraw: (model, shaderProgram) => {
      if (
        shaderProgram.type === ShaderProgramType.SKIN ||
        shaderProgram.type === ShaderProgramType.SKIN_SHADOW_MAP
      ) {
        const frameIndex = Math.floor((Date.now() % 1000) / (1000 / 25));
        applyAnimationFrame({
          jointsDataArray: model.jointsDataArray!,
          animation: manModel.animations![0],
          frameIndex,
        });
      }
    },
  });

  const man3 = scene.addDrawObject({
    model: manModel,
    transforms: {
      rotation: fromEuler(0.14, 0, 0.13),
      translation: [-3, -0.23, -2],
      scale: [0.4, 0.4, 0.4],
    },
    defaultShaderProgramType: ShaderProgramType.SKIN,
    beforeDraw: (model, shaderProgram) => {
      if (
        shaderProgram.type === ShaderProgramType.SKIN ||
        shaderProgram.type === ShaderProgramType.SKIN_SHADOW_MAP
      ) {
        const frameIndex = 24 - Math.floor((Date.now() % 2000) / (2000 / 25));
        applyAnimationFrame({
          jointsDataArray: model.jointsDataArray!,
          animation: manModel.animations![0],
          frameIndex,
        });
      }
    },
  });
}

function addToilet(scene: Scene, toiletModelData: LoadedModel) {
  const { glContext } = scene;

  const toiletModel = initializeModel(glContext, scene, toiletModelData, [
    ShaderProgramType.DEFAULT,
    ShaderProgramType.DEFAULT_SHADOW_MAP,
  ]);

  const toilet = scene.addDrawObject({
    model: toiletModel,
    transforms: {
      translation: [0.8, -1, -1.5],
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

function transformModelToWireframe(
  modelData: IndexedLoadedModel | SkinnedLoadedModel,
): LoadedModel {
  return {
    type: ModelType.WIREFRAME,
    modelName: `${modelData.modelName}_wireframe`,
    bounds: modelData.bounds,
    dataBuffers: {
      indices: convertToLines(modelData.dataBuffers.indices),
      position: modelData.dataBuffers.position,
    },
  };
}

function convertToLines(buf: DataBuffer): DataBuffer {
  let arrayType: typeof Uint8Array | typeof Uint16Array;
  let view: Uint8Array | Uint16Array;

  switch (buf.componentType) {
    case ComponentType.UNSIGNED_BYTE:
      arrayType = Uint8Array;
      break;
    case ComponentType.UNSIGNED_SHORT:
      arrayType = Uint16Array;
      break;
    default:
      throw new Error('Invalid index buffer');
  }

  if (buf.dataArray instanceof arrayType) {
    view = buf.dataArray;
  } else {
    view = new arrayType(buf.dataArray.buffer).subarray(
      buf.dataArray.byteOffset / arrayType.BYTES_PER_ELEMENT,
      (buf.dataArray.byteOffset + buf.dataArray.byteLength) /
        arrayType.BYTES_PER_ELEMENT,
    );
  }

  // TODO: Choose:
  //  1. Use precreated typed array and shrink after creation
  //  2. Or use regular Array and create typed array at the end
  // const linesBuffer = new arrayType(view.length * 2);
  // let linesBufferIndex = 0;
  const values: number[] = [];
  let useUint16 = false;
  const alreadyLines = new Map<number, number[]>();

  function check(v1: number, v2: number): void {
    if (process.env.NODE_ENV !== 'production') {
      if (v1 === v2) {
        throw new Error('Invalid');
      }
    }

    if (v1 > v2) {
      const t = v1;
      v1 = v2;
      v2 = t;
    }

    const list = alreadyLines.get(v1);

    if (!list || !list.includes(v2)) {
      if (!list) {
        alreadyLines.set(v1, [v2]);
      } else {
        list.push(v2);
      }

      // linesBuffer.set([v1, v2], linesBufferIndex);
      // linesBufferIndex += 2;
      values.push(v1, v2);

      if (v1 > 255 || v2 > 255) {
        useUint16 = true;
      }
    } else {
      console.log('Skip');
    }
  }

  for (let i = 0; i < view.length; i += 3) {
    const vertex1 = view[i];
    const vertex2 = view[i + 1];
    const vertex3 = view[i + 2];

    check(vertex1, vertex2);
    check(vertex2, vertex3);
    check(vertex3, vertex1);
  }

  const finalLinesBuffer = (useUint16 ? Uint16Array : Uint8Array).from(values);

  return {
    bufferTarget: BufferTarget.ELEMENT_ARRAY_BUFFER,
    componentType: useUint16
      ? ComponentType.UNSIGNED_SHORT
      : ComponentType.UNSIGNED_BYTE,
    componentDimension: 1,
    dataArray: finalLinesBuffer,
    elementsCount: finalLinesBuffer.length,
  };
}

function addUnitSphere(scene: Scene, modelData: LoadedModel): void {
  const { glContext } = scene;

  if (modelData.type !== ModelType.INDEXED) {
    throw new Error('Invalid model type');
  }

  const wireframeModelData = transformModelToWireframe(modelData);

  const wireframeModel = initializeModel(glContext, scene, wireframeModelData, [
    ShaderProgramType.DEFAULT,
  ]);

  scene.debug.models['unitSphere'] = wireframeModel;

  const sphere = scene.addDrawObject({
    model: wireframeModel,
    transforms: {},
    defaultShaderProgramType: ShaderProgramType.DEFAULT,
  });
}

function addIcosphere(scene: Scene) {
  // addIcosphere1(scene);
  addIcosphere2(scene);
  addIcosphere3(scene);
}

function addIcosphere1(scene: Scene) {
  const { glContext } = scene;

  const icosphereModelData = generateIcosahedronWireFrame();

  const icosphereModel = initializeModel(glContext, scene, icosphereModelData, [
    ShaderProgramType.DEFAULT,
  ]);

  scene.addDrawObject({
    model: icosphereModel,
    transforms: {
      translation: [0, 0, 0],
      scale: [2, 2, 2],
      rotation: quat.fromEuler(quat.create(), -90, 0, 0),
    },
    defaultShaderProgramType: ShaderProgramType.DEFAULT,
    // beforeDraw: (model, program) => {},
  });
}

function addIcosphere2(scene: Scene) {
  const { glContext } = scene;

  const icosphereModelData = generateIcoHaxagonSphereWireFrame(10);

  const icosphereModel = initializeModel(glContext, scene, icosphereModelData, [
    ShaderProgramType.DEFAULT,
  ]);

  scene.addDrawObject({
    model: icosphereModel,
    transforms: {
      translation: [0, 0, 0],
      scale: [2, 2, 2],
      rotation: quat.fromEuler(quat.create(), -90, 0, 0),
    },
    defaultShaderProgramType: ShaderProgramType.DEFAULT,
    // beforeDraw: (model, program) => {},
  });
}

function addIcosphere3(scene: Scene) {
  const { glContext } = scene;

  const icosphereModelData = generateIcoHaxagonSphere(10);

  const icosphereModel = initializeModel(glContext, scene, icosphereModelData, [
    ShaderProgramType.DEFAULT,
  ]);

  scene.addDrawObject({
    model: icosphereModel,
    transforms: {
      translation: [0, 0, 0],
      scale: [2, 2, 2],
      rotation: quat.fromEuler(quat.create(), -90, 0, 0),
    },
    defaultShaderProgramType: ShaderProgramType.DEFAULT,
    // beforeDraw: (model, program) => {},
  });
}
