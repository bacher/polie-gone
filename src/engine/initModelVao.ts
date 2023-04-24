import type { AttributeLocation } from '../types/webgl';
import type { DataBuffer, LoadedModel } from '../types/model';
import { ModelType } from '../types/model';
import { glBindBuffer } from '../utils/webgl';
import { ShaderProgramType } from '../shaderPrograms/types';
import { ShaderProgram } from '../shaderPrograms/programs';

import type { ModelVao, Texture, VertexBufferObject } from './types';
import type { GlContext } from './glContext';
import type { VertexBufferObjectCollection } from './initVertextBuffer';

// TODO: !!! Use same vao for shadowmap and regular render (reduce vao count twice)
export function initModelVao(
  glContext: GlContext,
  shaderProgram: ShaderProgram,
  vertexBuffers: VertexBufferObjectCollection,
  gltfModel: LoadedModel,
  textures: Texture[],
): ModelVao {
  const { gl } = glContext;
  const glVao = gl.createVertexArray();

  if (!glVao) {
    throw new Error("Can't create VAO");
  }

  gl.bindVertexArray(glVao);

  if (vertexBuffers.index) {
    glBindBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, vertexBuffers.index);
  }

  const features: (keyof VertexBufferObjectCollection)[] = ['position'];

  if (
    shaderProgram.type !== ShaderProgramType.DEFAULT_SHADOW_MAP &&
    shaderProgram.type !== ShaderProgramType.SKIN_SHADOW_MAP
  ) {
    features.push('normal', 'texcoord');
  }

  if (gltfModel.type === ModelType.SKINNED) {
    if (shaderProgram.type === ShaderProgramType.SKIN) {
      features.push('joints', 'weights');
    }

    if (shaderProgram.type === ShaderProgramType.SKIN_SHADOW_MAP) {
      features.push('joints');
    }
  }

  if (
    gltfModel.type === ModelType.HEIGHT_MAP &&
    shaderProgram.type === ShaderProgramType.HEIGHT_MAP_INSTANCED
  ) {
    features.push('offset');
  }

  for (const featureName of features) {
    processFeature(gl, {
      shaderProgramType: shaderProgram.type,
      modelName: gltfModel.modelName,
      attributeLocations: shaderProgram.attributeLocations,
      dataBuffers: gltfModel.dataBuffers,
      vertexBuffers,
      featureName,
    });
  }

  gl.bindVertexArray(null);
  // TODO: Move next line before VAO unbind
  glBindBuffer(gl, gl.ARRAY_BUFFER, null);
  glBindBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, null);

  function applyTextures() {
    if (textures.length) {
      for (let i = 0; i < textures.length; i += 1) {
        textures[i].use(i);
      }
    }
  }

  let renderFunc: () => void;

  if (gltfModel.type === ModelType.BASIC) {
    const elementsCount = gltfModel.dataBuffers.position.elementsCount;

    renderFunc = () => {
      applyTextures();
      gl.drawArrays(gl.TRIANGLES, 0, elementsCount);
    };
  } else if (gltfModel.type === ModelType.HEIGHT_MAP) {
    const elementsCount = gltfModel.dataBuffers.position.elementsCount;
    const instancedCount = gltfModel.instancedCount;

    renderFunc = () => {
      applyTextures();
      gl.drawArraysInstanced(gl.TRIANGLES, 0, elementsCount, instancedCount);
    };
  } else if (gltfModel.type === ModelType.WIREFRAME) {
    const { elementsCount, componentType } = gltfModel.dataBuffers.indices;

    renderFunc = () => {
      applyTextures();
      gl.drawElements(gl.LINES, elementsCount, componentType, 0 /* offset */);
    };
  } else {
    const { elementsCount, componentType } = gltfModel.dataBuffers.indices;

    renderFunc = () => {
      applyTextures();
      gl.drawElements(
        gl.TRIANGLES,
        elementsCount,
        componentType,
        0 /* offset */,
      );
    };
  }

  const modelVao: ModelVao = {
    glVao,
    draw: () => {
      glContext.useVao(modelVao);
      renderFunc();
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
  const location = attributeLocation.get();

  glBindBuffer(gl, gl.ARRAY_BUFFER, bufferInstance);
  gl.enableVertexAttribArray(location);

  let isFloat = true;

  switch (bufferInfo.componentType) {
    case gl.UNSIGNED_BYTE:
    case gl.UNSIGNED_SHORT:
    case gl.UNSIGNED_INT:
      isFloat = false;
  }

  if (isFloat) {
    gl.vertexAttribPointer(
      location,
      bufferInfo.componentDimension,
      bufferInfo.componentType,
      false /* normalize */,
      0 /* stride, 0 = move forward size * sizeof(type) each iteration to get the next position */,
      0 /* offset */,
    );
  } else {
    gl.vertexAttribIPointer(
      location,
      bufferInfo.componentDimension,
      bufferInfo.componentType,
      0,
      0,
    );
  }

  if (bufferInfo.divisor) {
    gl.vertexAttribDivisor(location, bufferInfo.divisor);
  }
}

function assertExistence<T>(value: unknown): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error();
  }
}

type FeatureData = {
  modelName: string;
  shaderProgramType: ShaderProgramType;
  attributeLocations: Record<string, AttributeLocation | undefined>;
  dataBuffers: Record<string, DataBuffer | undefined>;
  vertexBuffers: VertexBufferObjectCollection;
  featureName: keyof VertexBufferObjectCollection;
};

function processFeature(
  gl: WebGL2RenderingContext,
  {
    modelName,
    shaderProgramType,
    attributeLocations,
    vertexBuffers,
    dataBuffers,
    featureName,
  }: FeatureData,
): boolean {
  const attributeLocation = attributeLocations[featureName];
  const vbo = vertexBuffers[featureName];
  const dataBuffer = dataBuffers[featureName];

  if (attributeLocation && dataBuffer) {
    assertExistence(vbo);
    bindBufferVertexArrayPointer(gl, dataBuffer, vbo, attributeLocation);
    return true;
  }

  if (!attributeLocation && !dataBuffer) {
    return false;
  }

  if (attributeLocation) {
    console.error(
      `Model "${modelName}" does not have ${featureName} buffer for shader ${shaderProgramType}`,
    );
  } else {
    if (shaderProgramType !== ShaderProgramType.DEFAULT_SHADOW_MAP) {
      console.error(
        `Model "${modelName}" have unused ${featureName} buffer with shader ${shaderProgramType}`,
      );
    }
  }

  return false;
}
