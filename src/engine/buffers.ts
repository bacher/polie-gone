import type { BufferInfo } from '../types/model';
import { LoadedModel, ModelType } from '../types/model';
import { glBindBuffer } from '../utils/webgl';

export type VertexBufferObject = {
  glBuffer: WebGLBuffer;
};

export type VertexBufferObjectCollection = {
  index: VertexBufferObject;
  position: VertexBufferObject;
  normal?: VertexBufferObject;
  uv?: VertexBufferObject;
  joints?: VertexBufferObject;
  weights?: VertexBufferObject;
};

export function initVertexBufferObjects(
  gl: WebGL2RenderingContext,
  gltfModel: LoadedModel,
): VertexBufferObjectCollection {
  const { indices, position, uv, normal } = gltfModel.buffers;
  let joints: BufferInfo | undefined;
  let weights: BufferInfo | undefined;

  if (gltfModel.type === ModelType.SKINNED) {
    ({ joints, weights } = gltfModel.buffers);
  }

  return {
    index: createBuffer(gl, indices),
    position: createBuffer(gl, position),
    normal: normal ? createBuffer(gl, normal) : undefined,
    uv: uv ? createBuffer(gl, uv) : undefined,
    joints: joints ? createBuffer(gl, joints) : undefined,
    weights: weights ? createBuffer(gl, weights) : undefined,
  };
}

export function createBuffer(
  gl: WebGL2RenderingContext,
  bufferInfo: BufferInfo,
): VertexBufferObject {
  const glBuffer = glCreateBuffer(gl);

  const bufferInstance = {
    glBuffer,
  };

  glBindBuffer(gl, bufferInfo.bufferTarget, bufferInstance);
  gl.bufferData(bufferInfo.bufferTarget, bufferInfo.dataArray, gl.STATIC_DRAW);

  return bufferInstance;
}

function glCreateBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
  const buffer = gl.createBuffer();

  if (!buffer) {
    throw new Error("Can't create buffer");
  }

  return buffer;
}
