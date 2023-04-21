import {
  extractAttributes,
  makeUniformMat4Setter,
  makeUniformSamplerSetter,
  makeUniformVec2Setter,
} from '../engine/shaders/utils';
import type { ShaderProgramInitial } from '../engine/shaders/types';

export { default as vertexSource } from './heightMapInstanced.vertex.glsl?raw';

export function initVertex(gl: GL, { glProgram }: ShaderProgramInitial) {
  return {
    uniforms: {
      projection: makeUniformMat4Setter(gl, glProgram, 'u_projection'),
      model: makeUniformMat4Setter(gl, glProgram, 'u_model'),
      heightMap: makeUniformSamplerSetter(gl, glProgram, 'u_heightMap'),
      cellSize: makeUniformVec2Setter(gl, glProgram, 'u_cellSize'),
      lightSpace: makeUniformMat4Setter(gl, glProgram, 'u_lightSpace'),
    },
    attributeLocations: extractAttributes(gl, glProgram, [
      'position',
      'offset',
    ]),
  };
}
