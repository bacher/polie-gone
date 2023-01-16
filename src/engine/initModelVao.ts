import type { AttributeLocation } from '../types/webgl';
import type { DataBuffer, LoadedModel } from '../types/model';
import { ModelType } from '../types/model';
import { glBindBuffer } from '../utils/webgl';
import { ShaderProgram, ShaderProgramType } from '../shaderPrograms/types';
import type {
  VertexBufferObject,
  VertexBufferObjectCollection,
} from './initVertextBuffer';
import type { GlContext } from './glContext';

export type ModelVao = {
  glVao: WebGLVertexArrayObject;
  draw: () => void;
  dispose: () => void;
};

export function initModelVao(
  glContext: GlContext,
  shaderProgram: ShaderProgram,
  vertexBuffers: VertexBufferObjectCollection,
  gltfModel: LoadedModel,
): ModelVao {
  const { gl } = glContext;
  const glVao = gl.createVertexArray();

  if (!glVao) {
    throw new Error("Can't create VAO");
  }

  gl.bindVertexArray(glVao);

  glBindBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, vertexBuffers.index);

  processFeature(
    gl,
    shaderProgram.attributeLocations.position,
    gltfModel.dataBuffers.position,
    vertexBuffers.position,
  );

  processFeature(
    gl,
    shaderProgram.attributeLocations.normal,
    gltfModel.dataBuffers.normal,
    vertexBuffers.normal,
  );

  processFeature(
    gl,
    shaderProgram.attributeLocations.texcoord,
    gltfModel.dataBuffers.texcoord,
    vertexBuffers.texcoord,
  );

  if (
    gltfModel.type === ModelType.SKINNED &&
    shaderProgram.type === ShaderProgramType.SKIN
  ) {
    processFeature(
      gl,
      shaderProgram.attributeLocations.joints,
      gltfModel.dataBuffers.joints,
      vertexBuffers.joints,
    );
    processFeature(
      gl,
      shaderProgram.attributeLocations.weights,
      gltfModel.dataBuffers.weights,
      vertexBuffers.weights,
    );
  }

  gl.bindVertexArray(null);
  // TODO: Move next line before VAO unbind
  glBindBuffer(gl, gl.ARRAY_BUFFER, null);
  glBindBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, null);

  const { elementsCount, componentType } = gltfModel.dataBuffers.indices;

  const modelVao: ModelVao = {
    glVao,
    draw: () => {
      glContext.useVao(modelVao);

      gl.drawElements(
        gl.TRIANGLES,
        elementsCount,
        componentType,
        0 /* offset */,
      );
    },
    dispose: () => {
      gl.deleteVertexArray(glVao);
    },
  };

  return modelVao;
}

function bindBufferVertexArrayPointer(
  gl: GL,
  bufferInfo: DataBuffer,
  bufferInstance: VertexBufferObject,
  attributeLocation: AttributeLocation,
): void {
  glBindBuffer(gl, gl.ARRAY_BUFFER, bufferInstance);
  gl.enableVertexAttribArray(attributeLocation.get());

  let isFloat = true;

  switch (bufferInfo.componentType) {
    case gl.UNSIGNED_BYTE:
    case gl.UNSIGNED_SHORT:
    case gl.UNSIGNED_INT:
      isFloat = false;
  }

  if (isFloat) {
    gl.vertexAttribPointer(
      attributeLocation.get(),
      bufferInfo.componentDimension,
      bufferInfo.componentType,
      false /* normalize */,
      0 /* stride, 0 = move forward size * sizeof(type) each iteration to get the next position */,
      0 /* offset */,
    );
  } else {
    gl.vertexAttribIPointer(
      attributeLocation.get(),
      bufferInfo.componentDimension,
      bufferInfo.componentType,
      0,
      0,
    );
  }
}

function assertExistence<T>(value: unknown): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error();
  }
}

export function processFeature(
  gl: WebGL2RenderingContext,
  attributeLocation?: AttributeLocation,
  dataBuffer?: DataBuffer,
  vbo?: VertexBufferObject,
): boolean {
  if (attributeLocation && dataBuffer) {
    assertExistence(vbo);
    bindBufferVertexArrayPointer(gl, dataBuffer, vbo, attributeLocation);
    return true;
  }

  if (!attributeLocation && !dataBuffer) {
    return false;
  }

  if (attributeLocation) {
    console.error('Model and shader feature mismatch');
  }

  return false;
}
