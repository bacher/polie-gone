import type { DataBuffer } from '../types/model';
import { LoadedModel, ModelType } from '../types/model';
import { glBindBuffer } from '../utils/webgl';

import type { VertexBufferObject } from './types';

export type VertexBufferObjectCollection = {
  index?: VertexBufferObject;
  position: VertexBufferObject;
  normal?: VertexBufferObject;
  texcoord?: VertexBufferObject;
  joints?: VertexBufferObject;
  weights?: VertexBufferObject;
  offset?: VertexBufferObject;
};

export function initVertexBufferObjects(
  gl: GL,
  model: LoadedModel,
): VertexBufferObjectCollection {
  const { position } = model.dataBuffers;

  let indices: DataBuffer | undefined;
  let texcoord: DataBuffer | undefined;
  let normal: DataBuffer | undefined;
  let joints: DataBuffer | undefined;
  let weights: DataBuffer | undefined;
  let offset: DataBuffer | undefined;

  if (
    model.type === ModelType.INDEXED ||
    model.type === ModelType.SKINNED ||
    model.type === ModelType.WIREFRAME
  ) {
    indices = model.dataBuffers.indices;
  }

  if (model.type === ModelType.INDEXED || model.type === ModelType.SKINNED) {
    texcoord = model.dataBuffers.texcoord;
    normal = model.dataBuffers.normal;
  }

  if (model.type === ModelType.SKINNED) {
    ({ joints, weights } = model.dataBuffers);
  }

  if (model.type === ModelType.HEIGHT_MAP) {
    offset = model.dataBuffers.offset;
  }

  return {
    index: indices ? createBuffer(gl, indices) : undefined,
    position: createBuffer(gl, position),
    normal: normal ? createBuffer(gl, normal) : undefined,
    texcoord: texcoord ? createBuffer(gl, texcoord) : undefined,
    joints: joints ? createBuffer(gl, joints) : undefined,
    weights: weights ? createBuffer(gl, weights) : undefined,
    // TODO: Make dynamic:
    offset: offset ? createBuffer(gl, offset) : undefined,
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
