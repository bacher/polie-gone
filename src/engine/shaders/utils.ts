import type { mat4, vec2, vec3, vec4 } from 'gl-matrix';

import type { AttributeLocation } from '../../types/webgl';

export function extractAttributes<T extends string>(
  gl: GL,
  glProgram: WebGLProgram,
  attributesList: Array<T>,
) {
  const attributes = {} as { [K in T]: AttributeLocation };

  for (const attributeName of attributesList) {
    const fullAttributeName = `a_${attributeName}`;

    const position = gl.getAttribLocation(glProgram, fullAttributeName);

    if (position === -1) {
      console.error(`Attribute ${fullAttributeName} is not defined`);
    } else {
      attributes[attributeName] = {
        get: () => position,
      } as AttributeLocation;
    }
  }

  if (!('position' in attributes)) {
    throw new Error('Vertex shader without position attribute');
  }

  return attributes as typeof attributes & {
    position: AttributeLocation;
  };
}

export function makeUniformVec3Setter(
  gl: GL,
  glProgram: WebGLProgram,
  uniformName: string,
) {
  const uniformLocation = gl.getUniformLocation(glProgram, uniformName);

  if (!uniformLocation) {
    console.warn(`Uniform ${uniformName} is not using`);
  }

  return (value: vec3) => {
    gl.uniform3fv(uniformLocation, value);
  };
}

export function makeUniformVec4Setter(
  gl: GL,
  glProgram: WebGLProgram,
  uniformName: string,
) {
  const uniformLocation = gl.getUniformLocation(glProgram, uniformName);

  if (!uniformLocation) {
    console.warn(`Uniform ${uniformName} is not using`);
  }

  return (value: vec4) => {
    gl.uniform4fv(uniformLocation, value);
  };
}

export function makeUniformMat4Setter(
  gl: GL,
  glProgram: WebGLProgram,
  uniformName: string,
) {
  const uniformLocation = gl.getUniformLocation(glProgram, uniformName);

  if (!uniformLocation) {
    console.warn(`Uniform ${uniformName} is not using`);
  }

  return (value: mat4) => {
    gl.uniformMatrix4fv(uniformLocation, false, value);
  };
}

export function makeUniformSamplerSetter(
  gl: GL,
  glProgram: WebGLProgram,
  uniformName: string,
) {
  const uniformLocation = gl.getUniformLocation(glProgram, uniformName);

  if (!uniformLocation) {
    console.warn(`Uniform ${uniformName} is not using`);
  }

  return (value: number) => {
    gl.uniform1i(uniformLocation, value);
  };
}

export function makeUniformVec2Setter(
  gl: GL,
  glProgram: WebGLProgram,
  uniformName: string,
) {
  const uniformLocation = gl.getUniformLocation(glProgram, uniformName);

  if (!uniformLocation) {
    console.warn(`Uniform ${uniformName} is not using`);
  }

  return (value: vec2) => {
    gl.uniform2fv(uniformLocation, value);
  };
}

export function makeUniformMat4ArraySetter(
  gl: GL,
  glProgram: WebGLProgram,
  uniformName: string,
  length: number,
) {
  const uniformLocation = gl.getUniformLocation(glProgram, uniformName);

  if (!uniformLocation) {
    console.warn(`Uniform ${uniformName} is not using`);
  }

  return (value: Float32Array) => {
    if (value.length !== length * 16) {
      throw new Error('Invalid array length');
    }

    gl.uniformMatrix4fv(uniformLocation, false, value);
  };
}

export function makeUniformBoolSetter(
  gl: GL,
  glProgram: WebGLProgram,
  uniformName: string,
) {
  const uniformLocation = gl.getUniformLocation(glProgram, uniformName);

  if (!uniformLocation) {
    console.warn(`Uniform ${uniformName} is not using`);
  }

  return (enabled: boolean) => {
    gl.uniform1ui(uniformLocation, enabled ? 1 : 0);
  };
}
