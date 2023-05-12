import { IndexedLoadedModel, ModelType } from '../../types/model';
import { BufferTarget, ComponentType } from '../../types/webgl';
import { neverCall } from '../typeHelpers';
import { createAdaptiveIndexBuffer } from '../webgl';

import { FragmentType, generateIcoHexagonPolygons } from './icosphere';

export function generateIcoHaxagonSphere(maxLevel: number): IndexedLoadedModel {
  const { fragments, vertices } = generateIcoHexagonPolygons(maxLevel);

  const verticesBuffer: number[][] = [];
  const uvBuffer: number[][] = [];
  const indicesBuffer: number[][] = [];

  let fragmentIndex = 0;

  for (const fragment of fragments) {
    const offset = verticesBuffer.length;

    for (const point of fragment.points) {
      verticesBuffer.push(vertices[point]);
      uvBuffer.push([fragmentIndex / fragments.length, 0]);
    }

    switch (fragment.fragmentType) {
      case FragmentType.HEXAGON:
        indicesBuffer.push(
          [offset, offset + 5, offset + 4],
          [offset, offset + 4, offset + 3],
          [offset, offset + 3, offset + 1],
          [offset + 1, offset + 3, offset + 2],
        );
        break;
      case FragmentType.PENTAGON:
        indicesBuffer.push(
          [offset, offset + 2, offset + 1],
          [offset, offset + 3, offset + 2],
          [offset, offset + 4, offset + 3],
        );
        break;
      default:
        throw neverCall(fragment.fragmentType);
    }

    fragmentIndex += 1;
  }

  const dataArray = new Float32Array(verticesBuffer.flat());
  const texcoordArray = new Float32Array(uvBuffer.flat());

  const indexBufferData = createAdaptiveIndexBuffer(
    indicesBuffer.flat(),
    dataArray.length,
  );

  return {
    modelName: 'icosphere',
    type: ModelType.INDEXED,
    dataBuffers: {
      indices: {
        bufferTarget: BufferTarget.ELEMENT_ARRAY_BUFFER,
        componentDimension: 1,
        componentType: indexBufferData.componentType,
        elementsCount: indexBufferData.indexData.length,
        dataArray: indexBufferData.indexData,
      },
      position: {
        bufferTarget: BufferTarget.ARRAY_BUFFER,
        componentDimension: 3,
        componentType: ComponentType.FLOAT,
        elementsCount: dataArray.length / 2, // TODO: ???
        dataArray: dataArray,
      },
      texcoord: {
        bufferTarget: BufferTarget.ARRAY_BUFFER,
        componentDimension: 2,
        componentType: ComponentType.FLOAT,
        elementsCount: texcoordArray.length / 2, // TODO: ???
        dataArray: texcoordArray,
      },
    },
    bounds: {
      min: [-1, -1, -1],
      max: [1, 1, 1],
    },
  };
}
