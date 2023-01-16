import type { DataBuffer } from '../types/model';
import { LoadedModel, ModelType } from '../types/model';
import { glBindBuffer } from '../utils/webgl';

export type VertexBufferObject = {
  glBuffer: WebGLBuffer;
};

export type VertexBufferObjectCollection = {
  index: VertexBufferObject;
  position: VertexBufferObject;
  normal?: VertexBufferObject;
  texcoord?: VertexBufferObject;
  joints?: VertexBufferObject;
  weights?: VertexBufferObject;
};

export function initVertexBufferObjects(
  gl: GL,
  model: LoadedModel,
): VertexBufferObjectCollection {
  const { indices, position, texcoord, normal } = model.dataBuffers;
  let joints: DataBuffer | undefined;
  let weights: DataBuffer | undefined;

  if (model.type === ModelType.SKINNED) {
    ({ joints, weights } = model.dataBuffers);
  }

  return {
    index: createBuffer(gl, indices),
    position: createBuffer(gl, position),
    normal: normal ? createBuffer(gl, normal) : undefined,
    texcoord: texcoord ? createBuffer(gl, texcoord) : undefined,
    joints: joints ? createBuffer(gl, joints) : undefined,
    weights: weights ? createBuffer(gl, weights) : undefined,
  };
}

export function createBuffer(
  gl: GL,
  bufferInfo: DataBuffer,
): VertexBufferObject {
  const glBuffer = glCreateBuffer(gl);

  const bufferInstance = {
    glBuffer,
  };

  glBindBuffer(gl, bufferInfo.bufferTarget, bufferInstance);
  gl.bufferData(bufferInfo.bufferTarget, bufferInfo.dataArray, gl.STATIC_DRAW);

  return bufferInstance;
}

function glCreateBuffer(gl: GL): WebGLBuffer {
  const buffer = gl.createBuffer();

  if (!buffer) {
    throw new Error("Can't create buffer");
  }

  return buffer;
}
