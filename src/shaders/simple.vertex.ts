import { makeUniformMat4Setter } from '../engine/shaderUtils';

export function init(gl: WebGL2RenderingContext, glProgram: WebGLProgram) {
  return {
    uniforms: {
      projection: makeUniformMat4Setter(gl, glProgram, 'u_projection'),
      model: makeUniformMat4Setter(gl, glProgram, 'u_model'),
    },
    attributeLocations: {
      position: gl.getAttribLocation(glProgram, 'a_position'),
      normal: gl.getAttribLocation(glProgram, 'a_normal'),
    },
  };
}
