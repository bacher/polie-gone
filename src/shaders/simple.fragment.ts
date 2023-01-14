export { default as fragmentSource } from './simple.fragment.glsl?raw';
import { makeUniformVec3Setter } from '../engine/shaderUtils';

export function initFragment(
  gl: WebGL2RenderingContext,
  glProgram: WebGLProgram,
) {
  return {
    uniforms: {
      lightDirection: makeUniformVec3Setter(gl, glProgram, 'u_lightDirection'),
    },
  };
}
