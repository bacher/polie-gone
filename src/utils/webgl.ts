import type { BufferTarget } from '../types/webgl';
import type { VertexBufferObject } from '../engine/buffers';
import { ModelVao } from '../engine/initModelVao';

export function glBindBuffer(
  gl: GL,
  target: BufferTarget,
  bufferInfo: VertexBufferObject | null,
): void {
  gl.bindBuffer(target, bufferInfo ? bufferInfo.glBuffer : null);
}

export function glBindVertexArray(gl: GL, modelVao: ModelVao | null): void {
  gl.bindVertexArray(modelVao ? modelVao.glVao : null);
}
