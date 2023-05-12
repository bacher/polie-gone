export function getIcosphereVerteces() {
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

export function getIcosphereIndexedTriangles() {
  const icoTriangs = [];

  for (let i = 0; i < 5; i += 1) {
    icoTriangs.push([0, i + 1, ((i + 1) % 5) + 1]);
  }
  for (let i = 0; i < 5; i += 1) {
    icoTriangs.push([i + 1, ((7 - i) % 5) + 7, ((i + 1) % 5) + 1]);
  }
  for (let i = 0; i < 5; i += 1) {
    icoTriangs.push([i + 1, ((8 - i) % 5) + 7, ((7 - i) % 5) + 7]);
  }
  for (let i = 0; i < 5; i += 1) {
    icoTriangs.push([6, i + 7, ((i + 1) % 5) + 7]);
  }

  return icoTriangs;
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
function barycentricCoords(point: number[]): number[] {
  const [x, y, z] = point;
  const l3 = (y * 2) / Math.sqrt(3);
  const l2 = x + 0.5 * (1 - l3);
  const l1 = 1 - l2 - l3;
  return [l1, l2, l3];
}

// def scalProd(p1,p2):
//   return sum([p1[i]*p2[i] for i in range(len(p1))])
function scalProd(p1: number[], p2: number[]): number {
  let sum = 0;

  for (let i = 0; i < 3; i += 1) {
    sum += p1[i] * p2[i];
  }

  return sum;
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

// # map 2D point p to spherical triangle s1,s2,s3 (3D vectors of equal length)
// def mapGridpoint2Sphere(p,s1,s2,s3):
//   l1,l2,l3 = barycentricCoords(p)
//   if abs(l3-1) < 1e-10: return s3
//   l2s = l2/(l1+l2)
//   p12 = slerp(s1,s2,l2s)
//   return slerp(p12,s3,l3)
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

const stitchMapCompact: [
  // Triangle 1 index
  number,
  // Triangle 1 edge type
  'L' | 'R' | 'B',
  // Triangle 1 reverse flag
  boolean,
  // Triangle 2 index
  number,
  // Triangle 2 edge type
  'L' | 'R' | 'B',
  // Triangle 2 reverse flag
  boolean,
][] = [
  // TOP HALF-SPHERE
  [0, 'L', false, 1, 'B', true],
  [1, 'L', false, 2, 'B', true],
  [2, 'L', false, 3, 'B', true],
  [3, 'L', false, 4, 'B', true],
  [4, 'L', false, 0, 'B', true],
  // BOTTOM HALF-SPHERE
  [15, 'L', false, 16, 'B', true],
  [16, 'L', false, 17, 'B', true],
  [17, 'L', false, 18, 'B', true],
  [18, 'L', false, 19, 'B', true],
  [19, 'L', false, 15, 'B', true],
  // INNER
  [10, 'L', false, 5, 'B', true],
  [5, 'R', false, 11, 'B', false],
  [11, 'L', false, 6, 'B', true],
  [6, 'R', false, 12, 'B', false],
  [12, 'L', false, 7, 'B', true],
  [7, 'R', false, 13, 'B', false],
  [13, 'L', false, 8, 'B', true],
  [8, 'R', false, 14, 'B', false],
  [14, 'L', false, 9, 'B', true],
  [9, 'R', false, 10, 'B', false],
  // TOP AND INNER
  [0, 'R', false, 5, 'L', false],
  [1, 'R', false, 6, 'L', false],
  [2, 'R', false, 7, 'L', false],
  [3, 'R', false, 8, 'L', false],
  [4, 'R', false, 9, 'L', false],
  // BOTTOM AND INNER
  [15, 'R', false, 12, 'R', true],
  [16, 'R', false, 11, 'R', true],
  [17, 'R', false, 10, 'R', true],
  [18, 'R', false, 14, 'R', true],
  [19, 'R', false, 13, 'R', true],
];

const enum EdgeType {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  BOTTOM = 'BOTTOM',
}

type TriangleStitchDefinition = {
  triangleIndex: number;
  edgeType: EdgeType;
  reversed: boolean;
};

function lookupEdgeType(letter: 'R' | 'L' | 'B'): EdgeType {
  switch (letter) {
    case 'R':
      return EdgeType.RIGHT;
    case 'L':
      return EdgeType.LEFT;
    case 'B':
      return EdgeType.BOTTOM;
  }
}

const stitchMap: {
  tri1: TriangleStitchDefinition;
  tri2: TriangleStitchDefinition;
}[] = stitchMapCompact.map(
  ([index1, edge1, reverse1, index2, edge2, reverse2]) => ({
    tri1: {
      triangleIndex: index1,
      edgeType: lookupEdgeType(edge1),
      reversed: reverse1,
    },
    tri2: {
      triangleIndex: index2,
      edgeType: lookupEdgeType(edge2),
      reversed: reverse2,
    },
  }),
);

type Side = 'T' | 'L' | 'R';

const pentagonMap: [
  number,
  Side,
  number,
  Side,
  number,
  Side,
  number,
  Side,
  number,
  Side,
][] = [
  // ti - triangle index
  // s - side (T|L|R) - top/left/right
  // vi s vi s vi s vi s vi s
  // TOP
  [0, 'L', 4, 'L', 3, 'L', 2, 'L', 1, 'L'],
  // UPPER HALF
  [4, 'T', 0, 'R', 5, 'L', 10, 'L', 9, 'T'],
  [0, 'T', 1, 'R', 6, 'L', 11, 'L', 5, 'T'],
  [1, 'T', 2, 'R', 7, 'L', 12, 'L', 6, 'T'],
  [2, 'T', 3, 'R', 8, 'L', 13, 'L', 7, 'T'],
  [3, 'T', 4, 'R', 9, 'L', 14, 'L', 8, 'T'],
  // LOWER HALF
  [15, 'R', 12, 'T', 7, 'R', 13, 'R', 19, 'T'],
  [19, 'R', 13, 'T', 8, 'R', 14, 'R', 18, 'T'],
  [18, 'R', 14, 'T', 9, 'R', 10, 'R', 17, 'T'],
  [17, 'R', 10, 'T', 5, 'R', 11, 'R', 16, 'T'],
  [16, 'R', 11, 'T', 6, 'R', 12, 'R', 15, 'T'],
  // BOTTOM
  [15, 'L', 19, 'L', 18, 'L', 17, 'L', 16, 'L'],
];

export const enum FragmentType {
  PENTAGON = 'PENTAGON',
  HEXAGON = 'HEXAGON',
}

export const enum FragmentPlace {
  TRIANGLE = 'TRIANGLE',
  PENTAGON = 'PENTAGON',
  EDGE = 'EDGE',
}

export type Fragment = {
  fragmentType: FragmentType;
  points: number[];
  neighbors: number[];
} & (
  | {
      fragmentPlace: FragmentPlace.EDGE | FragmentPlace.PENTAGON;
    }
  | {
      fragmentPlace: FragmentPlace.TRIANGLE;
      triangleIndex: number;
    }
);

const tan = Math.tan(Math.PI / 6);
const m2 = 1 / Math.sin(Math.PI / 3);

type IcoHexagonPolygons = {
  fragments: Fragment[];
  vertices: number[][];
};

export function generateIcoHexagonPolygons(
  maxLevel: number,
): IcoHexagonPolygons {
  const cellWidth = 1 / (maxLevel + 1);
  const halfWidth = cellWidth * 0.5;
  const side = halfWidth * m2;
  const halfSide = side * 0.5;
  const rowHeight = side + halfWidth * tan;
  const vertices: number[][] = [];
  const edges: number[][] = [];

  for (let i = 0; i <= maxLevel; i += 1) {
    const downRow = [];

    for (let j = maxLevel - i; j <= maxLevel + i; j += 2) {
      const x = (j - maxLevel) * halfWidth;
      const y = (maxLevel - i) * rowHeight + halfSide;

      vertices.push([x, y, 0]);

      if (i < maxLevel) {
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

  for (let i = 0; i < maxLevel; i += 1) {
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

  const shift = vertices.length;
  // vertices.push([-0.5, 0, 0], [0, 0.5 * Math.tan(Math.PI / 3), 0], [0.5, 0, 0]);

  // const h = 0.5 * Math.tan(Math.PI / 3) * Math.sin(Math.PI / 6);
  // const x = 0.5 * Math.tan(Math.PI / 3) * Math.cos(Math.PI / 6) - 0.5;
  // vertices.push([0, 0, 0], [-x, h, 0], [x, h, 0]);

  //   const x1 = 0.25;
  //   const y1 = (0.5 * Math.tan(Math.PI / 3)) / 6;
  //   const y2 = 0.5 * Math.tan(Math.PI / 3) * (2 / 3);
  //   vertices.push([0, y2, 0], [x1, y1, 0], [-x1, y1, 0]);

  edges.push([shift, shift + 1], [shift, shift + 2], [shift + 1, shift + 2]);

  const icoPoints = getIcosphereVerteces();
  const icoIndexedTriangs = getIcosphereIndexedTriangles();

  const allVertices: number[][][] = [];

  const usePlain = false;

  const offset = maxLevel * (maxLevel + 2) + 1; // 121

  const fragmentsChunks: Fragment[][] = [];
  const baseHexagons: number[][] = [];

  const baseEdgeHalfHexagons: Record<EdgeType, number[][]> = {
    [EdgeType.LEFT]: [],
    [EdgeType.RIGHT]: [],
    [EdgeType.BOTTOM]: [],
  };

  for (let l = 0; l < maxLevel - 1; l += 1) {
    const lRowStart = (l + 1) ** 2;
    const l1 = l + 1;
    const l2 = l + 2;
    const l3 = l + 3;

    for (let i = 0; i <= l; i += 1) {
      const lStart = lRowStart + i;

      baseHexagons.push([
        lStart,
        lStart + l1 + 1,
        lStart + l1 + l2 + 1,
        lStart + l1 + l2 + l3,
        lStart + l1 + l2,
        lStart + l1,
      ]);
    }
  }

  for (let l = 0; l < maxLevel; l += 1) {
    const lStart = l ** 2;
    const l1 = lStart + l;
    const l2 = lStart + 2 * l + 1;
    const l3 = lStart + 3 * l + 2;

    baseEdgeHalfHexagons[EdgeType.LEFT].push([l1, l2, l3]);
  }

  for (let l = 0; l < maxLevel; l += 1) {
    const lStart = l ** 2;
    const l1 = lStart + 4 * l + 3;
    const l2 = lStart + 3 * l + 1;
    const l3 = lStart + 2 * l;

    baseEdgeHalfHexagons[EdgeType.RIGHT].push([l1, l2, l3]);
  }

  for (let l = 0; l < maxLevel; l += 1) {
    const lStart = maxLevel * maxLevel;
    const l1 = lStart + maxLevel + l;
    const l2 = lStart + l;
    const l3 = lStart + maxLevel + l + 1;

    baseEdgeHalfHexagons[EdgeType.BOTTOM].push([l1, l2, l3]);
  }

  const joint: Fragment[] = [];

  function getStitchPart(tri: TriangleStitchDefinition) {
    const base = baseEdgeHalfHexagons[tri.edgeType];

    if (tri.reversed) {
      return [...base].reverse();
    }

    return base;
  }

  for (const { tri1, tri2 } of stitchMap) {
    const basePart1 = getStitchPart(tri1);
    const basePart2 = getStitchPart(tri2);

    for (let i = 0; i < maxLevel; i += 1) {
      const part1 = basePart1[i];
      const part2 = basePart2[i];

      joint.push({
        fragmentPlace: FragmentPlace.EDGE,
        fragmentType: FragmentType.HEXAGON,
        points: [
          ...part1.map((index) => index + offset * tri1.triangleIndex),
          ...part2.map((index) => index + offset * tri2.triangleIndex),
        ],
        neighbors: [],
      });
    }
  }

  fragmentsChunks.push(joint);

  let startOffset = 0;

  let triangleIndex = 0;
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

    fragmentsChunks.push(
      baseHexagons.map((vertices) => ({
        fragmentPlace: FragmentPlace.TRIANGLE,
        triangleIndex,
        fragmentType: FragmentType.HEXAGON,
        points: vertices.map((index) => index + startOffset),
        neighbors: [],
      })),
    );

    startOffset += vertices.length;
    triangleIndex += 1;
  }

  const pentagons: Fragment[] = [];

  const sideVertexOffset = {
    T: 0,
    L: maxLevel * (maxLevel + 1),
    R: maxLevel * (maxLevel + 2),
  };

  for (const map of pentagonMap) {
    pentagons.push({
      fragmentPlace: FragmentPlace.PENTAGON,
      fragmentType: FragmentType.PENTAGON,
      points: [
        offset * map[0] + sideVertexOffset[map[1]],
        offset * map[2] + sideVertexOffset[map[3]],
        offset * map[4] + sideVertexOffset[map[5]],
        offset * map[6] + sideVertexOffset[map[7]],
        offset * map[8] + sideVertexOffset[map[9]],
      ],
      neighbors: [],
    });
  }

  fragmentsChunks.push(pentagons);

  const fragments = fragmentsChunks.flat();

  addNeighborsInfo(fragments);

  // TODO: edges is not using

  return {
    fragments,
    vertices: allVertices.flat(),
  };
}

function addNeighborsInfo(fragments: Fragment[]) {
  fragCycle: for (let i = 0; i < fragments.length; i += 1) {
    const frag = fragments[i];
    const neighborsCount = frag.fragmentType === FragmentType.HEXAGON ? 6 : 5;

    if (frag.neighbors.length === neighborsCount) {
      continue;
    }

    nextNeighbor: for (let j = i + 1; j < fragments.length; j += 1) {
      if (!frag.neighbors.includes(j)) {
        const iterFrag = fragments[j];

        for (const p of iterFrag.points) {
          if (frag.points.includes(p)) {
            frag.neighbors.push(j);
            iterFrag.neighbors.push(i);

            if (frag.neighbors.length === neighborsCount) {
              continue fragCycle;
            }

            continue nextNeighbor;
          }
        }
      }
    }

    throw new Error('No all neighbors found');
  }
}
