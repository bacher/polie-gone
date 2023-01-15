import type {
  FragmentShaderInitParams,
  VertexShaderInitParams,
  ShaderProgramType,
  UniformsCollection,
  AttributeLocationsCollection,
} from './types';

export type ShaderInstance = {
  glShader: WebGLShader;
  dispose: () => void;
};

function createShader(gl: GL, type: GLenum, source: string): ShaderInstance {
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

export type ShaderProgramInitial = {
  glProgram: WebGLProgram;
  use: () => void;
  dispose: () => void;
};

function createProgram(
  gl: GL,
  vertexShader: ShaderInstance,
  fragmentShader: ShaderInstance,
): ShaderProgramInitial {
  const glProgram = gl.createProgram();

  if (!glProgram) {
    throw new Error();
  }

  gl.attachShader(glProgram, vertexShader.glShader);
  gl.attachShader(glProgram, fragmentShader.glShader);
  gl.linkProgram(glProgram);

  if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(glProgram));
    gl.deleteProgram(glProgram);
    throw new Error();
  }

  return {
    glProgram: glProgram,
    use: () => {
      gl.useProgram(glProgram);
    },
    dispose: () => {
      gl.deleteProgram(glProgram);
    },
  };
}

export function initShaderProgram(
  gl: GL,
  {
    type,
    vertex,
    fragment,
  }: {
    type: ShaderProgramType;
    vertex: VertexShaderInitParams;
    fragment: FragmentShaderInitParams;
  },
): ShaderProgramInitial & {
  type: ShaderProgramType;
  uniforms: UniformsCollection;
  attributeLocations: AttributeLocationsCollection;
} {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex.source);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment.source);
  const program = createProgram(gl, vertexShader, fragmentShader);

  const vertexInit = vertex.init(gl, program);
  const fragmentInit = fragment.init(gl, program);

  return {
    type,
    glProgram: program.glProgram,
    use: program.use,
    uniforms: {
      ...vertexInit.uniforms,
      ...fragmentInit.uniforms,
    },
    attributeLocations: vertexInit.attributeLocations,
    dispose: () => {
      program.dispose();
      fragmentShader.dispose();
      vertexShader.dispose();
    },
  };
}
