import type { AttributeLocation } from '../types/webgl';
import type { DataBuffer, LoadedModel } from '../types/model';
import { ModelType } from '../types/model';
import type {
  VertexBufferObject,
  VertexBufferObjectCollection,
} from './initVertextBuffer';
import { glBindBuffer, glBindVertexArray } from '../utils/webgl';

export type ModelVao = {
  glVao: WebGLVertexArrayObject;
  draw: () => void;
  dispose: () => void;
};

export type Attributes = {
  position: AttributeLocation;
  normal?: AttributeLocation;
  uv?: AttributeLocation;
  joints?: AttributeLocation;
  weights?: AttributeLocation;
};

export function initModelVao(
  gl: GL,
  attributeLocations: Attributes,
  vertexBuffers: VertexBufferObjectCollection,
  gltfModel: LoadedModel,
): ModelVao {
  const glVao = gl.createVertexArray();

  if (!glVao) {
    throw new Error("Can't create VAO");
  }

  gl.bindVertexArray(glVao);

  glBindBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, vertexBuffers.index);

  bindBufferVertexArrayPointer(
    gl,
    gltfModel.dataBuffers.position,
    vertexBuffers.position,
    attributeLocations.position,
  );

  if (attributeLocations.normal && gltfModel.dataBuffers.normal) {
    assertExistence(vertexBuffers.normal);
    bindBufferVertexArrayPointer(
      gl,
      gltfModel.dataBuffers.normal,
      vertexBuffers.normal,
      attributeLocations.normal,
    );
  }

  if (attributeLocations.uv && gltfModel.dataBuffers.uv) {
    assertExistence(vertexBuffers.uv);
    bindBufferVertexArrayPointer(
      gl,
      gltfModel.dataBuffers.uv,
      vertexBuffers.uv,
      attributeLocations.uv,
    );
  }

  if (gltfModel.type === ModelType.SKINNED) {
    if (!attributeLocations.joints || !attributeLocations.weights) {
      throw new Error('Shader without bones');
    }

    assertExistence(vertexBuffers.joints);
    assertExistence(vertexBuffers.weights);

    bindBufferVertexArrayPointer(
      gl,
      gltfModel.dataBuffers.joints,
      vertexBuffers.joints,
      attributeLocations.joints,
    );
    bindBufferVertexArrayPointer(
      gl,
      gltfModel.dataBuffers.weights,
      vertexBuffers.weights,
      attributeLocations.weights,
    );
  }

  glBindVertexArray(gl, null);
  // TODO: Move next line before VAO unbind
  glBindBuffer(gl, gl.ARRAY_BUFFER, null);
  glBindBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, null);

  const { elementsCount, componentType } = gltfModel.dataBuffers.indices;

  return {
    glVao,
    draw: () => {
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
