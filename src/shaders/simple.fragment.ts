import { makeUniformVec3Setter } from '../engine/shaderUtils';

export function init(gl: WebGL2RenderingContext, glProgram: WebGLProgram) {
  return {
    uniforms: {
      lightDirection: makeUniformVec3Setter(gl, glProgram, 'u_lightDirection'),
    },
  };
}
