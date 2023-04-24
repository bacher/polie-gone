import {
  extractAttributes,
  makeUniformMat4ArraySetter,
  makeUniformMat4Setter,
} from '../engine/shaders/utils';
import type { ShaderProgramInitial } from '../engine/shaders/types';

export { default as vertexSource } from './skin.vertex.glsl?raw';

export function initVertex(gl: GL, { glProgram }: ShaderProgramInitial) {
  return {
    uniforms: {
      projection: makeUniformMat4Setter(gl, glProgram, 'u_projection'),
      model: makeUniformMat4Setter(gl, glProgram, 'u_model'),
      jointMatrices: makeUniformMat4ArraySetter(
        gl,
        glProgram,
        'u_jointMatrices',
        20,
      ),
      lightSpace: makeUniformMat4Setter(gl, glProgram, 'u_lightSpace'),
    },
    attributeLocations: extractAttributes(gl, glProgram, [
      'position',
      'normal',
      'texcoord',
      'joints',
      'weights',
    ]),
  };
}
