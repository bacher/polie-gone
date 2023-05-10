import { BufferTarget, ComponentType } from '../types/webgl';
import {
  BasicLoadedModel,
  HeightMapLoadedModel,
  ModelType,
  RegularLoadedModel,
  WireframeLoadedModel,
} from '../types/model';

export {
  generateIcosphere,
  generateIcosphere2,
} from './meshGenerators/icosphere';

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

// TODO: This is just an example, so it better to move to documentation page
export function generateIndexedTriangle(): RegularLoadedModel {
  const useUint16 = true;
  const indexData = new Uint16Array(3);
  const dataArray = new Float32Array(9);

  indexData.set([0, 1, 2], 0);
  dataArray.set([0, 0, 0, 0, 1, 0, -1, 0, 0], 0);

  return {
    modelName: 'indexed-triangle',
    type: ModelType.REGULAR,
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
        componentDimension: 3,
        componentType: ComponentType.FLOAT,
        elementsCount: dataArray.length / 2,
        dataArray: dataArray,
      },
    },
    bounds: {
      min: [-1, 0, 0],
      max: [0, 1, 0],
    },
  };
}

// TODO: This is just an example, so it better to move to documentation page
export function generateIndexedTriangleWireframe(): WireframeLoadedModel {
  const useUint16 = true;
  const indexData = new Uint16Array(6);
  const dataArray = new Float32Array(9);

  indexData.set([0, 1, 0, 2, 1, 2], 0);
  dataArray.set([0, 0, 0, 0, 1, 0, -1, 0, 0], 0);

  return {
    modelName: 'indexed-triangle-wireframe',
    type: ModelType.WIREFRAME,
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
        componentDimension: 3,
        componentType: ComponentType.FLOAT,
        elementsCount: dataArray.length / 2,
        dataArray: dataArray,
      },
    },
    bounds: {
      min: [-1, 0, 0],
      max: [0, 1, 0],
    },
  };
}
