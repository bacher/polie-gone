import type { ShaderProgramInitial } from '../engine/shaders/initShaderProgram';
import { makeUniformVec3Setter } from '../engine/shaders/utils';

export { default as fragmentSource } from './simple.fragment.glsl?raw';

export function initFragment(gl: GL, { glProgram }: ShaderProgramInitial) {
  return {
    uniforms: {
      lightDirection: makeUniformVec3Setter(gl, glProgram, 'u_lightDirection'),
    },
  };
}
