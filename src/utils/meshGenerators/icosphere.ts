import { vec3 } from 'gl-matrix';

import { ModelType, WireframeLoadedModel } from '../../types/model';
import { BufferTarget, ComponentType } from '../../types/webgl';

function getIcosphereVerteces() {
  const s = 2 / Math.sqrt(5);
  const c = 1 / Math.sqrt(5);

  const topPoints = [[0, 0, 1]];
  for (let i = 0; i < 5; i += 1) {
    topPoints.push([
      s * Math.cos((i * 2 * Math.PI) / 5),
      s * Math.sin((i * 2 * Math.PI) / 5),
      c,
    ]);
  }

  const bottomPoints = topPoints.map(([x, y, z]) => [-x, y, -z]);

  return [...topPoints, ...bottomPoints];
}

function getIcosphereIndexedTriangles() {
  const icoTriangs = [];

  for (let i = 0; i < 5; i += 1) {
    icoTriangs.push([0, i + 1, ((i + 1) % 5) + 1]);
  }
  for (let i = 0; i < 5; i += 1) {
    icoTriangs.push([6, i + 7, ((i + 1) % 5) + 7]);
  }
  for (let i = 0; i < 5; i += 1) {
    icoTriangs.push([i + 1, ((i + 1) % 5) + 1, ((7 - i) % 5) + 7]);
  }
  for (let i = 0; i < 5; i += 1) {
    icoTriangs.push([i + 1, ((7 - i) % 5) + 7, ((8 - i) % 5) + 7]);
  }

  return icoTriangs;
}

// const edges = [
//   // TOP
//   0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 1, 2, 2, 3, 3, 4, 4, 5, 5, 1,
//   // MIDDLE
//   1, 10, 1, 9, 2, 9, 2, 8, 3, 8, 3, 7, 4, 7, 4, 11, 5, 11, 5, 10,
//   // BOTTOM
//   6, 7, 6, 8, 6, 9, 6, 10, 6, 11, 7, 8, 8, 9, 9, 10, 10, 11, 11, 7,
// ];

function barycentricCoords(point: number[]): number[] {
  const [x, y, z] = point;
  const l3 = (y * 2) / Math.sqrt(3);
  const l2 = x + 0.5 * (1 - l3);
  const l1 = 1 - l2 - l3;
  return [l1, l2, l3];
}

// # barycentric coords for triangle (-0.5,0),(0.5,0),(0,sqrt(3)/2)
// def barycentricCoords(p):
//   x,y = p
//   # l3*sqrt(3)/2 = y
//   l3 = y*2./sqrt(3.)
//   # l1 + l2 + l3 = 1
//   # 0.5*(l2 - l1) = x
//   l2 = x + 0.5*(1 - l3)
//   l1 = 1 - l2 - l3
//   return l1,l2,l3

function scalProd(p1: number[], p2: number[]): number {
  let sum = 0;

  for (let i = 0; i < 3; i += 1) {
    sum += p1[i] * p2[i];
  }

  return sum;
}

// def scalProd(p1,p2):
//   return sum([p1[i]*p2[i] for i in range(len(p1))])

function slerp(p0: number[], p1: number[], t: number): number[] {
  if (Math.abs(scalProd(p0, p0) - scalProd(p1, p1)) >= 1e-7) {
    throw new Error();
  }

  const ang0Cos = scalProd(p0, p1) / scalProd(p0, p0);
  const ang0Sin = Math.sqrt(1 - ang0Cos * ang0Cos);
  const ang0 = Math.atan2(ang0Sin, ang0Cos);
  const l0 = Math.sin((1 - t) * ang0);
  const l1 = Math.sin(t * ang0);

  const point = [0, 0, 0];

  for (let i = 0; i < 3; i += 1) {
    point[i] = (l0 * p0[i] + l1 * p1[i]) / ang0Sin;
  }

  return point;
}

// # uniform interpolation of arc defined by p0, p1 (around origin)
// # t=0 -> p0, t=1 -> p1
// def slerp(p0,p1,t):
//   assert abs(scalProd(p0,p0) - scalProd(p1,p1)) < 1e-7
//   ang0Cos = scalProd(p0,p1)/scalProd(p0,p0)
//   ang0Sin = sqrt(1 - ang0Cos*ang0Cos)
//   ang0 = atan2(ang0Sin,ang0Cos)
//   l0 = sin((1-t)*ang0)
//   l1 = sin(t    *ang0)
//   return tuple([(l0*p0[i] + l1*p1[i])/ang0Sin for i in range(len(p0))])

function mapGridpoint2Sphere(
  p: number[],
  s1: number[],
  s2: number[],
  s3: number[],
): number[] {
  const [l1, l2, l3] = barycentricCoords(p);

  if (Math.abs(l3 - 1) < 1e-10) {
    return s3;
  }

  const l2s = l2 / (l1 + l2);
  const p12 = slerp(s1, s2, l2s);

  return slerp(p12, s3, l3);
}

const mixFactor =
  Number.parseFloat(
    new URLSearchParams(window.location.search).get('f') ?? '0',
  ) || 0;

// setTimeout(() => {
//   const sp = new URLSearchParams(window.location.search);

//   sp.set('f', ((mixFactor + 0.1) % 1).toString());
//   window.location.search = sp.toString();
// }, 200);

// # map 2D point p to spherical triangle s1,s2,s3 (3D vectors of equal length)
// def mapGridpoint2Sphere(p,s1,s2,s3):
//   l1,l2,l3 = barycentricCoords(p)
//   if abs(l3-1) < 1e-10: return s3
//   l2s = l2/(l1+l2)
//   p12 = slerp(s1,s2,l2s)
//   return slerp(p12,s3,l3)

const tan = Math.tan(Math.PI / 6);
const m2 = 1 / Math.sin(Math.PI / 3);

export function generateIcosphere(level: number): WireframeLoadedModel {
  const useUint16 = true;

  const cellWidth = 1 / (level + 1);
  const halfWidth = cellWidth * 0.5;
  const side = halfWidth * m2;
  const halfSide = side * 0.5;
  const rowHeight = side + halfWidth * tan;
  const vertices: number[][] = [];
  const edges: number[][] = [];

  for (let i = 0; i <= level; i += 1) {
    const downRow = [];

    for (let j = level - i; j <= level + i; j += 2) {
      const x = (j - level) * halfWidth;
      const y = (level - i) * rowHeight + halfSide;

      vertices.push([x, y, 0]);

      if (i < level) {
        downRow.push([x, y - side, 0]);
      }
    }

    if (downRow.length) {
      vertices.push(...downRow);

      for (let k = 0; k < downRow.length; k += 1) {
        edges.push([
          vertices.length - downRow.length * 2 + k,
          vertices.length - downRow.length + k,
        ]);
      }
    }
  }

  let prevV1 = 0;
  let prevV2 = 0;

  for (let i = 0; i < level; i += 1) {
    const v1 = prevV1 + (i + 1) * 2;
    const v2 = prevV2 + (i * 2 + 1);
    prevV1 = v1;
    prevV2 = v2;

    for (let j = 0; j <= i; j += 1) {
      edges.push([v1 + j, v2 + j], [v1 + j + 1, v2 + j]);
    }
  }

  // edges.push([2, 1], [3, 1]);
  // edges.push([6, 4], [7, 4], [7, 5], [8, 5]);
  // edges.push([12, 9], [13, 9], [13, 10], [14, 10], [14, 11], [15, 11]);
  // edges.push(
  //   [20, 16],
  //   [21, 16],
  //   [21, 17],
  //   [22, 17],
  //   [22, 18],
  //   [23, 18],
  //   [23, 19],
  //   [24, 19],
  // );

  console.log('vertices', vertices);
  console.log('edges', edges);

  const shift = vertices.length;
  // vertices.push([-0.5, 0, 0], [0, 0.5 * Math.tan(Math.PI / 3), 0], [0.5, 0, 0]);

  // const h = 0.5 * Math.tan(Math.PI / 3) * Math.sin(Math.PI / 6);
  // const x = 0.5 * Math.tan(Math.PI / 3) * Math.cos(Math.PI / 6) - 0.5;
  // vertices.push([0, 0, 0], [-x, h, 0], [x, h, 0]);

  const x1 = 0.25;
  const y1 = (0.5 * Math.tan(Math.PI / 3)) / 6;
  const y2 = 0.5 * Math.tan(Math.PI / 3) * (2 / 3);
  vertices.push([0, y2, 0], [x1, y1, 0], [-x1, y1, 0]);

  edges.push([shift, shift + 1], [shift, shift + 2], [shift + 1, shift + 2]);

  const icoPoints = getIcosphereVerteces();
  const icoIndexedTriangs = getIcosphereIndexedTriangles();

  const allEdges: number[][][] = [];
  const allVertices = [];

  const usePlain = false;

  for (const indexedTriagle of icoIndexedTriangs) {
    if (usePlain) {
      allVertices.push(vertices);
    } else {
      allVertices.push(
        vertices.map((point) =>
          mapGridpoint2Sphere(
            point,
            icoPoints[indexedTriagle[0]],
            icoPoints[indexedTriagle[1]],
            icoPoints[indexedTriagle[2]],
          ),
        ),
      );
    }

    allEdges.push(edges);

    break;
  }

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

export function generateIcosphere2(level: number): WireframeLoadedModel {
  const icoPoints = getIcosphereVerteces();
  const icoIndexedTriangs = getIcosphereIndexedTriangles();

  const verticesArray = icoPoints.flatMap((i) => i);

  const edges = icoIndexedTriangs
    .map(([p1, p2, p3]) => [p1, p2, p1, p3, p2, p3])
    .flatMap((i) => i);

  const indexData = new Uint16Array(edges);
  const dataArray = new Float32Array(verticesArray);

  const useUint16 = true;

  return {
    modelName: 'icosphere',
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
