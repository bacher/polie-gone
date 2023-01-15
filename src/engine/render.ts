import type { ShaderProgram } from '../shaderPrograms/types';
import { glBindVertexArray } from '../utils/webgl';

import type { Scene } from './scene';

export function renderScene(gl: GL, program: ShaderProgram, scene: Scene) {
  program.use();
  program.uniforms.projection(scene.cameraMat);
  program.uniforms.lightDirection(scene.lightDirection);

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (const model of scene.models) {
    program.uniforms.model(model.modelMat);
    glBindVertexArray(gl, model.modelVao);
    model.modelVao.draw();
  }
}
