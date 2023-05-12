import { BufferTarget, ComponentType } from '../types/webgl';
import type { VertexBufferObject } from '../engine/types';

export function glBindBuffer(
  gl: GL,
  target: BufferTarget,
  bufferInfo: VertexBufferObject | null,
): void {
  gl.bindBuffer(target, bufferInfo ? bufferInfo.glBuffer : null);
}

type AdaptiveIndexBuffer =
  | {
      indexData: Uint8Array;
      componentType: ComponentType.UNSIGNED_BYTE;
    }
  | {
      indexData: Uint16Array;
      componentType: ComponentType.UNSIGNED_SHORT;
    }
  | {
      indexData: Uint32Array;
      componentType: ComponentType.UNSIGNED_INT;
    };

export function createAdaptiveIndexBuffer(
  indices: number[],
  maxIndex: number,
): AdaptiveIndexBuffer {
  if (maxIndex > 2 ** 16) {
    return {
      indexData: new Uint32Array(indices),
      componentType: ComponentType.UNSIGNED_INT,
    };
  }

  if (maxIndex > 2 ** 8) {
    return {
      indexData: new Uint16Array(indices),
      componentType: ComponentType.UNSIGNED_SHORT,
    };
  }

  return {
    indexData: new Uint8Array(indices),
    componentType: ComponentType.UNSIGNED_BYTE,
  };
}
