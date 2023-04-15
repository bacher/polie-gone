import type { ShaderProgramInitial } from '../engine/shaders/types';
import {
  makeUniformSamplerSetter,
  makeUniformBoolSetter,
} from '../engine/shaders/utils';

export { default as fragmentSource } from './overlayQuad.fragment.glsl?raw';

export function initFragment(gl: GL, { glProgram }: ShaderProgramInitial) {
  return {
    uniforms: {
      diffuseTexture: makeUniformSamplerSetter(gl, glProgram, 'u_diffuse'),
      invertColor: makeUniformBoolSetter(gl, glProgram, 'u_invertColor'),
      useOnlyRedChannel: makeUniformBoolSetter(
        gl,
        glProgram,
        'u_useOnlyRedChannel',
      ),
    },
  };
}
