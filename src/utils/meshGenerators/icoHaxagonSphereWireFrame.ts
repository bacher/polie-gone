import { ModelType, WireframeLoadedModel } from '../../types/model';
import { BufferTarget, ComponentType } from '../../types/webgl';
import { neverCall } from '../typeHelpers';
import { createAdaptiveIndexBuffer } from '../webgl';

import { FragmentType, generateIcoHexagonPolygons } from './icosphere';

export function generateIcoHaxagonSphereWireFrame(
  maxLevel: number,
): WireframeLoadedModel {
  const { fragments, vertices } = generateIcoHexagonPolygons(maxLevel);

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

  const dataArray = new Float32Array(vertices.flat());

  const adaptiveIndexData = createAdaptiveIndexBuffer(
    allEdges.flat().flat(),
    dataArray.length,
  );

  return {
    modelName: 'icosphere-wireframe',
    type: ModelType.WIREFRAME,
    dataBuffers: {
      indices: {
        bufferTarget: BufferTarget.ELEMENT_ARRAY_BUFFER,
        componentDimension: 1,
        componentType: adaptiveIndexData.componentType,
        elementsCount: adaptiveIndexData.indexData.length,
        dataArray: adaptiveIndexData.indexData,
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
