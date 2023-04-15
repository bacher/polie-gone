import { extractAttributes } from '../engine/shaders/utils';
import type { ShaderProgramInitial } from '../engine/shaders/types';

export { default as vertexSource } from './overlayQuad.vertex.glsl?raw';

export function initVertex(gl: GL, { glProgram }: ShaderProgramInitial) {
  return {
    uniforms: {},
    attributeLocations: extractAttributes(gl, glProgram, ['position']),
  };
}
