import type { LoadedModel } from '../types/model';

export type ModelVao = {
  glVao: WebGLVertexArrayObject;
  draw: () => void;
  dispose: () => void;
};

export function initModelVao(
  gl: WebGL2RenderingContext,
  attributeLocations: {
    position: number;
    normal?: number;
    uv?: number;
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

  const positionBuffer = glCreateBuffer(gl);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, position.dataArray, gl.STATIC_DRAW);

  gl.enableVertexAttribArray(attributeLocations.position);
  gl.vertexAttribPointer(
    attributeLocations.position,
    position.componentDimension,
    position.componentType,
    false /* normalize */,
    0 /* stride, 0 = move forward size * sizeof(type) each iteration to get the next position */,
    0 /* offset */,
  );

  let normalBuffer: WebGLBuffer | undefined;

  if (attributeLocations.normal && normal) {
    normalBuffer = glCreateBuffer(gl);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normal.dataArray, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(attributeLocations.normal);
    gl.vertexAttribPointer(
      attributeLocations.normal,
      position.componentDimension,
      position.componentType,
      false /* normalize */,
      0 /* stride, 0 = move forward size * sizeof(type) each iteration to get the next position */,
      0 /* offset */,
    );
  }

  let uvBuffer: WebGLBuffer | undefined;

  if (attributeLocations.uv && uv) {
    uvBuffer = glCreateBuffer(gl);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uv.dataArray, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(attributeLocations.uv);
    gl.vertexAttribPointer(
      attributeLocations.uv,
      uv.componentDimension,
      uv.componentType,
      false /* normalize */,
      0 /* stride, 0 = move forward size * sizeof(type) each iteration to get the next position */,
      0 /* offset */,
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
