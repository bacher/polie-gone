import { ModelType, WireframeLoadedModel } from '../../types/model';
import { BufferTarget, ComponentType } from '../../types/webgl';

import {
  getIcosphereIndexedTriangles,
  getIcosphereVerteces,
} from './icosphere';

export function generateIcosahedronWireFrame(): WireframeLoadedModel {
  const icoPoints = getIcosphereVerteces();
  const icoIndexedTriangs = getIcosphereIndexedTriangles();

  const verticesArray = icoPoints.flatMap((i) => i);

  const edges = icoIndexedTriangs
    .map(([p1, p2, p3]) => [p1, p2, p1, p3, p2, p3])
    .flatMap((i) => i);

  const indexData = new Uint8Array(edges);
  const dataArray = new Float32Array(verticesArray);

  return {
    modelName: 'icosphere',
    type: ModelType.WIREFRAME,
    dataBuffers: {
      indices: {
        bufferTarget: BufferTarget.ELEMENT_ARRAY_BUFFER,
        componentDimension: 1,
        componentType: ComponentType.UNSIGNED_BYTE,
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
