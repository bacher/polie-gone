import type { ShaderProgram } from '../shaderPrograms/programs';
import { glBindVertexArray } from '../utils/webgl';

import type { Scene } from './scene';

export function renderScene(
  gl: WebGL2RenderingContext,
  program: ShaderProgram,
  scene: Scene,
) {
  program.use();
  program.uniforms.projection(scene.cameraMat);
  program.uniforms.lightDirection(scene.lightDirection);

  gl.enable(gl.CULL_FACE);
  gl.clear(gl.COLOR_BUFFER_BIT);

  for (const model of scene.models) {
    program.uniforms.model(model.modelMat);
    glBindVertexArray(gl, model.modelVao);
    model.modelVao.draw();
  }
}
