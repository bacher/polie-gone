import { BufferTarget, ComponentType } from '../types/webgl';
import { ModelType, RegularLoadedModel } from '../types/model';

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
    const yPos = (y / dim) * 2 - 1;
    for (let x = 0; x <= dim; x += 1) {
      const xPos = (x / dim) * 2 - 1;
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
  };
}
