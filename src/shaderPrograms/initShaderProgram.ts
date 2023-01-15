import type {
  FragmentShaderInitParams,
  VertexShaderInitParams,
  ShaderProgramType,
  UniformsCollection,
  AttributeLocationsCollection,
} from './types';
import type { ShaderInstance, ShadersManager } from './shaderManager';

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
  shadersManager: ShadersManager,
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
  const vertexShader = shadersManager.getVertexShader(vertex);
  const fragmentShader = shadersManager.getFragmentShader(fragment);

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
    },
  };
}
