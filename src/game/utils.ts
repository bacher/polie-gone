import { quat } from 'gl-matrix';

export function fromEuler(x: number, y: number, z: number): quat {
  return quat.fromEuler(quat.create(), x * 360, y * 360, z * 360);
}
