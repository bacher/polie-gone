import type { Scene } from './scene';
import type { ShaderProgram } from '../shaderPrograms/programs';

export function render(
  gl: WebGL2RenderingContext,
  program: ShaderProgram,
  scene: Scene,
) {
  gl.useProgram(program.glProgram);
  program.uniforms.projection(scene.cameraMat);
  program.uniforms.lightDirection(scene.lightDirection);

  gl.enable(gl.CULL_FACE);

  for (const model of scene.models) {
    program.uniforms.model(model.modelMat);
    gl.bindVertexArray(model.modelVao.glVao);
    model.modelVao.draw();
  }
}
