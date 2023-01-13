import type { UniformInitFunc } from './types';

export type ShaderInstance = {
  glShader: WebGLShader;
  dispose: () => void;
};

function createShader(
  gl: WebGL2RenderingContext,
  type: GLenum,
  source: string,
): ShaderInstance {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error();
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error();
  }

  return {
    glShader: shader,
    dispose: () => {
      gl.deleteShader(shader);
    },
  };
}

export type ShaderProgramInitialInstance = {
  glProgram: WebGLProgram;
  dispose: () => void;
};

export type ShaderProgramInstance<Uniforms> = ShaderProgramInitialInstance & {
  uniforms: Uniforms;
};

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: ShaderInstance,
  fragmentShader: ShaderInstance,
): ShaderProgramInitialInstance {
  const program = gl.createProgram();

  if (!program) {
    throw new Error();
  }

  gl.attachShader(program, vertexShader.glShader);
  gl.attachShader(program, fragmentShader.glShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error();
  }

  return {
    glProgram: program,
    dispose: () => {
      gl.deleteProgram(program);
    },
  };
}

type ShaderInitParams = {
  source: string;
  init: UniformInitFunc;
};

export function initShaderProgram<
  VertexInit extends UniformInitFunc,
  FragmentInit extends UniformInitFunc,
>(
  gl: WebGL2RenderingContext,
  {
    vertex,
    fragment,
  }: { vertex: ShaderInitParams; fragment: ShaderInitParams },
): ShaderProgramInstance<
  ReturnType<VertexInit>['uniforms'] & ReturnType<FragmentInit>['uniforms']
> {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex.source);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment.source);
  const program = createProgram(gl, vertexShader, fragmentShader);

  const vertexUniforms = vertex.init(gl, program.glProgram);
  const fragmentUniforms = fragment.init(gl, program.glProgram);

  return {
    glProgram: program.glProgram,
    uniforms: {
      ...vertexUniforms.uniforms,
      ...fragmentUniforms.uniforms,
    },
    dispose: () => {
      program.dispose();
      fragmentShader.dispose();
      vertexShader.dispose();
    },
  };
}
