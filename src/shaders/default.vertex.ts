import {
  extractAttributes,
  makeUniformMat4Setter,
} from '../engine/shaders/utils';
import type { ShaderProgramInitial } from '../engine/shaders/types';

export { default as vertexSource } from './default.vertex.glsl?raw';

export function initVertex(gl: GL, { glProgram }: ShaderProgramInitial) {
  return {
    uniforms: {
      projection: makeUniformMat4Setter(gl, glProgram, 'u_projection'),
      lightSpace: makeUniformMat4Setter(gl, glProgram, 'u_lightSpace'),
      model: makeUniformMat4Setter(gl, glProgram, 'u_model'),
    },
    attributeLocations: extractAttributes(gl, glProgram, [
      'position',
      'normal',
      'texcoord',
    ]),
  };
}
