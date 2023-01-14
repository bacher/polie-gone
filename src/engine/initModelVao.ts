import type { BufferInfo, LoadedModel } from '../types/model';
import { ModelType } from '../types/model';
import type { AttributeLocation } from '../types/webgl';

export type ModelVao = {
  glVao: WebGLVertexArrayObject;
  draw: () => void;
  dispose: () => void;
};

export function initModelVao(
  gl: WebGL2RenderingContext,
  attributeLocations: {
    position: AttributeLocation;
    normal?: AttributeLocation;
    uv?: AttributeLocation;
    joints?: AttributeLocation;
    weights?: AttributeLocation;
  },
  model: LoadedModel,
): ModelVao {
  const glVao = gl.createVertexArray();

  if (!glVao) {
    throw new Error("Can't create VAO");
  }

  gl.bindVertexArray(glVao);

  const { indices, position, normal, uv } = model.buffers;

  const indicesBuffer = glCreateBuffer(gl);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices.dataArray, gl.STATIC_DRAW);

  const positionBuffer = createAndLoadBuffer(
    gl,
    position,
    attributeLocations.position,
  );

  let normalBuffer: WebGLBuffer | undefined;

  if (attributeLocations.normal && normal) {
    normalBuffer = createAndLoadBuffer(gl, normal, attributeLocations.normal);
  }

  let uvBuffer: WebGLBuffer | undefined;

  if (attributeLocations.uv && uv) {
    uvBuffer = createAndLoadBuffer(gl, uv, attributeLocations.uv);
  }

  let jointsBuffer: WebGLBuffer | undefined;
  let weightsBuffer: WebGLBuffer | undefined;

  if (model.type === ModelType.SKINNED) {
    const { joints, weights } = model.buffers;

    console.log('attributeLocations =', attributeLocations);

    if (!attributeLocations.joints || !attributeLocations.weights) {
      throw new Error('Shader without bones');
    }

    jointsBuffer = createAndLoadBuffer(gl, joints, attributeLocations.joints);
    weightsBuffer = createAndLoadBuffer(
      gl,
      weights,
      attributeLocations.weights,
    );
  }

  gl.bindVertexArray(null);

  return {
    glVao,
    draw: () => {
      gl.drawElements(
        gl.TRIANGLES,
        indices.elementsCount,
        indices.componentType,
        0 /* offset */,
      );
    },
    dispose: () => {
      gl.deleteBuffer(indicesBuffer);
      gl.deleteBuffer(positionBuffer);

      if (normalBuffer) {
        gl.deleteBuffer(normalBuffer);
      }

      if (uvBuffer) {
        gl.deleteBuffer(uvBuffer);
      }

      if (jointsBuffer) {
        gl.deleteBuffer(jointsBuffer);
      }

      if (weightsBuffer) {
        gl.deleteBuffer(weightsBuffer);
      }
    },
  };
}

function glCreateBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
  const buffer = gl.createBuffer();

  if (!buffer) {
    throw new Error("Can't create buffer");
  }

  return buffer;
}

function createAndLoadBuffer(
  gl: WebGL2RenderingContext,
  bufferInfo: BufferInfo,
  attributeLocation: AttributeLocation,
) {
  const glBuffer = glCreateBuffer(gl);
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, bufferInfo.dataArray, gl.STATIC_DRAW);

  gl.enableVertexAttribArray(attributeLocation.get());
  gl.vertexAttribPointer(
    attributeLocation.get(),
    bufferInfo.componentDimension,
    bufferInfo.componentType,
    false /* normalize */,
    0 /* stride, 0 = move forward size * sizeof(type) each iteration to get the next position */,
    0 /* offset */,
  );

  return glBuffer;
}
