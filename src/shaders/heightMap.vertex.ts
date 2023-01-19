import {
  extractAttributes,
  makeUniformMat4Setter,
} from '../engine/shaders/utils';
import type { ShaderProgramInitial } from '../engine/shaders/initShaderProgram';

export { default as vertexSource } from './heightMap.vertex.glsl?raw';

export function initVertex(gl: GL, { glProgram }: ShaderProgramInitial) {
  return {
    uniforms: {
      projection: makeUniformMat4Setter(gl, glProgram, 'u_projection'),
      model: makeUniformMat4Setter(gl, glProgram, 'u_model'),
      heightMap: makeUniformMat4Setter(gl, glProgram, 'u_heightMap'),
    },
    attributeLocations: extractAttributes(gl, glProgram, ['position']),
  };
}
