import {
  makeUniformMat4ArraySetter,
  makeUniformMat4Setter,
} from '../../engine/shaderUtils';
import { extractAttributes } from '../shaderUtils';
import type { ShaderProgramInitial } from '../initShaderProgram';

export { default as vertexSource } from './simple.vertex.glsl?raw';

export function initVertex(
  gl: WebGL2RenderingContext,
  { glProgram }: ShaderProgramInitial,
) {
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
    },
    attributeLocations: extractAttributes(gl, glProgram, [
      'position',
      'normal',
      'joints',
      'weights',
    ]),
  };
}
