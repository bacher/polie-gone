import { ModelType, WireframeLoadedModel } from '../../types/model';
import { BufferTarget, ComponentType } from '../../types/webgl';

import { generateIcoHexagonPolygons } from './icosphere';

export function generateIcoHaxagonSphereWireFrame(
  maxLevel: number,
): WireframeLoadedModel {
  const { allEdges, allVertices } = generateIcoHexagonPolygons(maxLevel);

  const indexData = new Uint16Array(
    allEdges.flatMap((i) => i).flatMap((i) => i),
  );
  const dataArray = new Float32Array(
    allVertices.flatMap((i) => i).flatMap((i) => i),
  );

  return {
    modelName: 'icosphere',
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
