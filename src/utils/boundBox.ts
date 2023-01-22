import { vec3 } from 'gl-matrix';

import type { BoundBox, BoundSphere } from '../types/model';

export function makeBoundBoxFromSphere({
  center,
  radius,
}: BoundSphere): BoundBox {
  return {
    min: [center[0] - radius, center[1] - radius, center[2] - radius],
    max: [center[0] + radius, center[1] + radius, center[2] + radius],
  };
}

export function makeBoundBoxByPoints(points: vec3[]): BoundBox {
  return {
    min: [
      Math.min(...points.map((point) => point[0])),
      Math.min(...points.map((point) => point[1])),
      Math.min(...points.map((point) => point[2])),
    ],
    max: [
      Math.max(...points.map((point) => point[0])),
      Math.max(...points.map((point) => point[1])),
      Math.max(...points.map((point) => point[2])),
    ],
  };
}

export function isBoundsIntersect(
  { min, max }: BoundBox,
  { center, radius }: BoundSphere,
): boolean {
  return isPointInBoundBox(
    {
      min: [min[0] - radius, min[1] - radius, min[2] - radius],
      max: [max[0] + radius, max[1] + radius, max[2] + radius],
    },
    center,
  );
}

export function isPointInBoundBox(
  { min, max }: BoundBox,
  center: vec3,
): boolean {
  const [x, y, z] = center;

  return (
    // X-axis match
    x > min[0] &&
    x < max[0] &&
    // Y-axis match
    y > min[1] &&
    y < max[1] &&
    // Z-axis match
    z > min[2] &&
    z < max[2]
  );
}
