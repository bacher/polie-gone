// TODO: Remove
import type { ShaderProgramType } from '../../shaderPrograms/types';
import type { GlContext } from '../glContext';

import type {
  FragmentShaderInitParams,
  VertexShaderInitParams,
  UniformsCollection,
  AttributeLocationsCollection,
  ShaderInterface,
} from './types';
import type { ShaderInstance, ShadersManager } from './shaderManager';

export type ShaderProgramInitial = ShaderInterface & {
  use: () => void;
};

function createProgram(
  glContext: GlContext,
  vertexShader: ShaderInstance,
  fragmentShader: ShaderInstance,
): ShaderProgramInitial {
  const { gl } = glContext;

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
    throw new Error('Shader can not be linked');
  }

  const shaderProgram: ShaderProgramInitial = {
    glProgram: glProgram,
    use: () => {
      glContext.useProgram(shaderProgram);
    },
    dispose: () => {
      gl.deleteProgram(glProgram);
    },
  };

  return shaderProgram;
}

export function initShaderProgram(
  glContext: GlContext,
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
  const { gl } = glContext;

  const vertexShader = shadersManager.getVertexShader(vertex);
  const fragmentShader = shadersManager.getFragmentShader(fragment);

  const program = createProgram(glContext, vertexShader, fragmentShader);

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
