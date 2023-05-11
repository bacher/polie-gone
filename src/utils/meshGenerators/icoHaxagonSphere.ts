import { IndexedLoadedModel, ModelType } from '../../types/model';
import { BufferTarget, ComponentType } from '../../types/webgl';
import { neverCall } from '../typeHelpers';

import { FragmentType, generateIcoHexagonPolygons } from './icosphere';

export function generateIcoHaxagonSphere(maxLevel: number): IndexedLoadedModel {
  const { fragments, allVertices } = generateIcoHexagonPolygons(maxLevel);

  const flatVertices = allVertices.flat();

  const verticesBuffer: number[][] = [];
  const uvBuffer: number[][] = [];
  const indecesBuffer: number[][] = [];

  let fragmentIndex = 0;

  for (const fragment of fragments) {
    const offset = verticesBuffer.length;

    for (const point of fragment.points) {
      verticesBuffer.push(flatVertices[point]);
      uvBuffer.push([fragmentIndex / fragments.length, 0]);
    }

    switch (fragment.fragmentType) {
      case FragmentType.HEXAGON:
        indecesBuffer.push(
          [offset, offset + 5, offset + 4],
          [offset, offset + 4, offset + 3],
          [offset, offset + 3, offset + 1],
          [offset + 1, offset + 3, offset + 2],
        );
        break;
      case FragmentType.PENTAGON:
        indecesBuffer.push(
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

  const indexData = new Uint16Array(indecesBuffer.flat());
  const dataArray = new Float32Array(verticesBuffer.flat());
  const texcoordArray = new Float32Array(uvBuffer.flat());

  return {
    modelName: 'icosphere',
    type: ModelType.INDEXED,
    dataBuffers: {
      indices: {
        bufferTarget: BufferTarget.ELEMENT_ARRAY_BUFFER,
        componentDimension: 1,
        componentType: ComponentType.UNSIGNED_SHORT,
        elementsCount: indexData.length,
        dataArray: indexData,
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
