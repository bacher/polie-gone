import type { AttributeLocation } from '../types/webgl';
import type { DataBuffer, LoadedModel } from '../types/model';
import { ModelType } from '../types/model';
import type {
  VertexBufferObject,
  VertexBufferObjectCollection,
} from './buffers';
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
  buffers: VertexBufferObjectCollection,
  gltfModel: LoadedModel,
): ModelVao {
  const glVao = gl.createVertexArray();

  if (!glVao) {
    throw new Error("Can't create VAO");
  }

  gl.bindVertexArray(glVao);

  glBindBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, buffers.index);

  bindBufferVertexArrayPointer(
    gl,
    gltfModel.dataBuffers.position,
    buffers.position,
    attributeLocations.position,
  );

  if (attributeLocations.normal && gltfModel.dataBuffers.normal) {
    assertExistence(buffers.normal);
    bindBufferVertexArrayPointer(
      gl,
      gltfModel.dataBuffers.normal,
      buffers.normal,
      attributeLocations.normal,
    );
  }

  if (attributeLocations.uv && gltfModel.dataBuffers.uv) {
    assertExistence(buffers.uv);
    bindBufferVertexArrayPointer(
      gl,
      gltfModel.dataBuffers.uv,
      buffers.uv,
      attributeLocations.uv,
    );
  }

  if (gltfModel.type === ModelType.SKINNED) {
    const { joints, weights } = gltfModel.dataBuffers;

    console.log('attributeLocations =', attributeLocations);

    if (!attributeLocations.joints || !attributeLocations.weights) {
      throw new Error('Shader without bones');
    }

    assertExistence(buffers.joints);
    assertExistence(buffers.weights);
    bindBufferVertexArrayPointer(
      gl,
      joints,
      buffers.joints,
      attributeLocations.joints,
    );
    bindBufferVertexArrayPointer(
      gl,
      weights,
      buffers.weights,
      attributeLocations.weights,
    );
  }

  glBindVertexArray(gl, null);
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
  gl.vertexAttribPointer(
    attributeLocation.get(),
    bufferInfo.componentDimension,
    bufferInfo.componentType,
    false /* normalize */,
    0 /* stride, 0 = move forward size * sizeof(type) each iteration to get the next position */,
    0 /* offset */,
  );
}

function assertExistence<T>(value: unknown): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error();
  }
}
