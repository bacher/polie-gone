import type { Scene } from './scene';
import type { ShaderProgramInstance } from './initShaderProgram';

export function render(
  gl: WebGL2RenderingContext,
  program: ShaderProgramInstance<any>,
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
