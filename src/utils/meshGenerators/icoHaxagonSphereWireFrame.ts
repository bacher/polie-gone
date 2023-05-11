import { ModelType, WireframeLoadedModel } from '../../types/model';
import { BufferTarget, ComponentType } from '../../types/webgl';
import { neverCall } from '../typeHelpers';

import { FragmentType, generateIcoHexagonPolygons } from './icosphere';

export function generateIcoHaxagonSphereWireFrame(
  maxLevel: number,
): WireframeLoadedModel {
  const { fragments, allVertices } = generateIcoHexagonPolygons(maxLevel);

  const allEdges: number[][][] = [];

  for (const fragment of fragments) {
    switch (fragment.fragmentType) {
      case FragmentType.HEXAGON: {
        const h = fragment.points;
        allEdges.push([
          [h[0], h[1]],
          [h[1], h[2]],
          [h[2], h[3]],
          [h[3], h[4]],
          [h[4], h[5]],
          [h[5], h[0]],
        ]);
        break;
      }
      case FragmentType.PENTAGON: {
        const h = fragment.points;
        allEdges.push([
          [h[0], h[1]],
          [h[1], h[2]],
          [h[2], h[3]],
          [h[3], h[4]],
          [h[4], h[0]],
        ]);
        break;
      }
      default:
        throw neverCall(fragment.fragmentType);
    }
  }

  const indexData = new Uint16Array(allEdges.flat().flat());
  const dataArray = new Float32Array(allVertices.flat().flat());

  return {
    modelName: 'icosphere-wireframe',
    type: ModelType.WIREFRAME,
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
        elementsCount: dataArray.length / 2,
        dataArray: dataArray,
      },
    },
    bounds: {
      min: [-1, -1, -1],
      max: [1, 1, 1],
    },
  };
}
