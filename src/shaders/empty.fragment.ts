import type { ShaderProgramInitial } from '../engine/shaders/types';

export { default as fragmentSource } from './empty.fragment.glsl?raw';

export function initFragment(gl: GL, { glProgram }: ShaderProgramInitial) {
  return {
    uniforms: {},
  };
}
