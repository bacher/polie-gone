export function makeUniformVec3Setter(
  gl: WebGL2RenderingContext,
  program: WebGLUniformLocation,
  uniformName: string,
) {
  const uniformLocation = gl.getUniformLocation(program, uniformName);

  if (!uniformLocation) {
    console.warn(`Uniform ${uniformName} is not using`);
  }

  return (value: Float32Array) => {
    gl.uniform3fv(uniformLocation, value);
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

  return (value: Float32Array) => {
    gl.uniformMatrix4fv(uniformLocation, false, value);
  };
}
