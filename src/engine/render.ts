import type { Scene } from './scene';
import type { ShaderProgram } from '../shaderPrograms/programs';

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
    gl.bindVertexArray(model.modelVao.glVao);
    model.modelVao.draw();
  }
}
