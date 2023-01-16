import type { BufferTarget } from '../types/webgl';
import type { VertexBufferObject } from '../engine/initVertextBuffer';

export function glBindBuffer(
  gl: GL,
  target: BufferTarget,
  bufferInfo: VertexBufferObject | null,
): void {
  gl.bindBuffer(target, bufferInfo ? bufferInfo.glBuffer : null);
}
