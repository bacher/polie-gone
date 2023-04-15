import { BufferTarget, ComponentType } from '../types/webgl';
import {
  BasicLoadedModel,
  HeightMapLoadedModel,
  ModelType,
  RegularLoadedModel,
} from '../types/model';

export function generatePlain({
  dimension,
}: {
  dimension: number;
}): RegularLoadedModel {
  const dim = dimension;
  const useUint16 = dim > 16;

  const indexData = new (useUint16 ? Uint16Array : Uint8Array)(dim ** 2 * 6);
  const vertexData = new Float32Array((dim + 1) ** 2 * 2);

  for (let y = 0; y <= dim; y += 1) {
    const yPos = y / dim;
    for (let x = 0; x <= dim; x += 1) {
      const xPos = x / dim;
      vertexData.set([xPos, yPos], (y * (dim + 1) + x) * 2);
    }
  }

  for (let y = 0; y < dim; y += 1) {
    const xOffset = y * (dim + 1);
    const isEven = y % 2 === 0;

    for (let x = 0; x < dim; x += 1) {
      const upLeft = xOffset + x;
      const upRight = upLeft + 1;
      const downLeft = upLeft + (dim + 1);
      const downRight = downLeft + 1;

      const vertices = isEven
        ? [upLeft, downLeft, upRight, downLeft, downRight, upRight]
        : [upLeft, downLeft, downRight, upLeft, downRight, upRight];

      indexData.set(vertices, (y * dim + x) * 6);
    }
  }

  return {
    type: ModelType.REGULAR,
    modelName: 'plain',
    dataBuffers: {
      indices: {
        bufferTarget: BufferTarget.ELEMENT_ARRAY_BUFFER,
        componentDimension: 1,
        componentType: useUint16
          ? ComponentType.UNSIGNED_SHORT
          : ComponentType.UNSIGNED_BYTE,
        elementsCount: indexData.length,
        dataArray: indexData,
      },
      position: {
        bufferTarget: BufferTarget.ARRAY_BUFFER,
        componentDimension: 2,
        componentType: ComponentType.FLOAT,
        elementsCount: vertexData.length / 2,
        dataArray: vertexData,
      },
    },
    bounds: {
      min: [0, 0, 0],
      max: [1, 1, 0],
    },
  };
}

export function generateQuad({
  clockwise,
}: {
  clockwise?: boolean;
} = {}): BasicLoadedModel {
  const downLeft = [0, 0];
  const downRight = [1, 0];
  const upLeft = [0, 1];
  const upRight = [1, 1];

  const dataArray = Float32Array.from(
    clockwise
      ? [
          ...downLeft,
          ...upLeft,
          ...upRight,
          ...downLeft,
          ...upRight,
          ...downRight,
        ]
      : [
          ...downLeft,
          ...upRight,
          ...upLeft,
          ...downLeft,
          ...downRight,
          ...upRight,
        ],
  );

  return {
    type: ModelType.BASIC,
    modelName: 'quad',
    dataBuffers: {
      position: {
        bufferTarget: BufferTarget.ARRAY_BUFFER,
        componentDimension: 2,
        componentType: ComponentType.FLOAT,
        elementsCount: dataArray.length / 2,
        dataArray: dataArray,
      },
    },
    bounds: {
      min: [0, 0, 0],
      max: [1, 1, 0],
    },
  };
}

export function generateHeightMapInstanced({
  size,
}: {
  size: number;
}): HeightMapLoadedModel {
  // clockwise because mixing axis in shader
  const quadModelData = generateQuad({ clockwise: true });

  const count = size ** 2;

  const cellSize = 1 / size;
  const offsetData = new Float32Array(count * 2);

  for (let i = 0; i < size; i += 1) {
    for (let j = 0; j < size; j += 1) {
      offsetData.set([j * cellSize, i * cellSize], (i * size + j) * 2);
    }
  }

  return {
    modelName: 'heightmap',
    type: ModelType.HEIGHT_MAP,
    instancedCount: count,
    dataBuffers: {
      position: quadModelData.dataBuffers.position,
      offset: {
        bufferTarget: BufferTarget.ARRAY_BUFFER,
        componentDimension: 2,
        componentType: ComponentType.FLOAT,
        elementsCount: offsetData.length / 2,
        dataArray: offsetData,
        divisor: 1,
      },
    },
    bounds: {
      // min: [-0.5, -0.5, -0.5],
      min: [0, 0, 0],
      max: [1, 1, 0],
    },
  };
}
