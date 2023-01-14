import { makeUniformMat4Setter } from '../../engine/shaderUtils';

export { default as vertexSource } from './simple.vertex.glsl?raw';

export function initVertex(
  gl: WebGL2RenderingContext,
  glProgram: WebGLProgram,
) {
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
