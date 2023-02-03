import type { vec3 } from 'gl-matrix';

export const enum DebugFigureType {
  SPHERE = 'SPHERE',
  // TODO:
  OTHER = 'OTHER',
}

export type DebugSphereFigure = {
  type: DebugFigureType.SPHERE;
  center: vec3;
  radius: number;
};

export type DebugOtherFigure = {
  type: DebugFigureType.OTHER;
};

export type DebugFigure = DebugSphereFigure | DebugOtherFigure;
