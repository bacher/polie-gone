import type { mat4, vec3, vec4 } from 'gl-matrix';

export function makeUniformVec3Setter(
  gl: WebGL2RenderingContext,
  program: WebGLUniformLocation,
  uniformName: string,
) {
  const uniformLocation = gl.getUniformLocation(program, uniformName);

  if (!uniformLocation) {
    console.warn(`Uniform ${uniformName} is not using`);
  }

  return (value: vec3) => {
    gl.uniform3fv(uniformLocation, value);
  };
}

export function makeUniformVec4Setter(
  gl: WebGL2RenderingContext,
  program: WebGLUniformLocation,
  uniformName: string,
) {
  const uniformLocation = gl.getUniformLocation(program, uniformName);

  if (!uniformLocation) {
    console.warn(`Uniform ${uniformName} is not using`);
  }

  return (value: vec4) => {
    gl.uniform4fv(uniformLocation, value);
  };
}

export function makeUniformMat4Setter(
  gl: WebGL2RenderingContext,
  program: WebGLUniformLocation,
  uniformName: string,
) {
  const uniformLocation = gl.getUniformLocation(program, uniformName);

  if (!uniformLocation) {
    console.warn(`Uniform ${uniformName} is not using`);
  }

  return (value: mat4) => {
    gl.uniformMatrix4fv(uniformLocation, false, value);
  };
}
