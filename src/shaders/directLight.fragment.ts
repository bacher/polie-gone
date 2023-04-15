import type { ShaderProgramInitial } from '../engine/shaders/types';
import {
  makeUniformSamplerSetter,
  makeUniformVec3Setter,
} from '../engine/shaders/utils';

export { default as fragmentSource } from './directLight.fragment.glsl?raw';
// export { default as fragmentSource } from './directLightSharpMk1.fragment.glsl?raw';
// export { default as fragmentSource } from './directLightSharpMk2.fragment.glsl?raw';

export function initFragment(gl: GL, { glProgram }: ShaderProgramInitial) {
  return {
    uniforms: {
      lightDirection: makeUniformVec3Setter(gl, glProgram, 'u_lightDirection'),
      diffuseTexture: makeUniformSamplerSetter(gl, glProgram, 'u_diffuse'),
      shadowMapTexture: makeUniformSamplerSetter(gl, glProgram, 'u_shadowMapTexture'),
    },
  };
}
