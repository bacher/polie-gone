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

export type Attributes = {
  position: AttributeLocation;
  normal?: AttributeLocation;
  uv?: AttributeLocation;
  joints?: AttributeLocation;
  weights?: AttributeLocation;
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

  bindBufferVertexArrayPointer(
    gl,
    gltfModel.dataBuffers.position,
    vertexBuffers.position,
    shaderProgram.attributeLocations.position,
  );

  if (shaderProgram.attributeLocations.normal && gltfModel.dataBuffers.normal) {
    assertExistence(vertexBuffers.normal);
    bindBufferVertexArrayPointer(
      gl,
      gltfModel.dataBuffers.normal,
      vertexBuffers.normal,
      shaderProgram.attributeLocations.normal,
    );
  }

  /*
  if (shaderProgram.attributeLocations.uv && gltfModel.dataBuffers.uv) {
    assertExistence(vertexBuffers.uv);
    bindBufferVertexArrayPointer(
      gl,
      gltfModel.dataBuffers.uv,
      vertexBuffers.uv,
      shaderProgram.attributeLocations.uv,
    );
  }
   */

  if (
    gltfModel.type === ModelType.SKINNED &&
    shaderProgram.type === ShaderProgramType.SKIN
  ) {
    assertExistence(vertexBuffers.joints);
    assertExistence(vertexBuffers.weights);

    bindBufferVertexArrayPointer(
      gl,
      gltfModel.dataBuffers.joints,
      vertexBuffers.joints,
      shaderProgram.attributeLocations.joints,
    );
    bindBufferVertexArrayPointer(
      gl,
      gltfModel.dataBuffers.weights,
      vertexBuffers.weights,
      shaderProgram.attributeLocations.weights,
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
