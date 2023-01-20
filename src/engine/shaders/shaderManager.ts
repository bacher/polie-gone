import type { VertexShaderInitParams, FragmentShaderInitParams } from './types';

export type ShadersManager = {
  getVertexShader: (info: VertexShaderInitParams) => any;
  getFragmentShader: (info: FragmentShaderInitParams) => any;
  disposeAll: () => void;
};

export type ShaderInstance = {
  glShader: WebGLShader;
  isDisposed: boolean;
  dispose: () => void;
};

export function createShadersManager(gl: GL): ShadersManager {
  const vertexShaders = new Map<VertexShaderInitParams, ShaderInstance>();
  const fragmentShaders = new Map<FragmentShaderInitParams, ShaderInstance>();

  return {
    getVertexShader(info) {
      let shader = vertexShaders.get(info);

      if (!shader) {
        shader = createShader(gl, gl.VERTEX_SHADER, info.source);
        vertexShaders.set(info, shader);
      }

      return shader;
    },
    getFragmentShader(info) {
      let shader = fragmentShaders.get(info);

      if (!shader) {
        shader = createShader(gl, gl.FRAGMENT_SHADER, info.source);
        fragmentShaders.set(info, shader);
      }
      return shader;
    },
    disposeAll: () => {
      for (const shader of vertexShaders.values()) {
        shader.dispose();
      }
      vertexShaders.clear();
      for (const shader of fragmentShaders.values()) {
        shader.dispose();
      }
      fragmentShaders.clear();
    },
  };
}

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
    throw new Error('Shader can not be compiled');
  }

  const shaderInstance: ShaderInstance = {
    glShader: shader,
    isDisposed: false,
    dispose: () => {
      gl.deleteShader(shader);
      shaderInstance.isDisposed = true;
    },
  };

  return shaderInstance;
}
