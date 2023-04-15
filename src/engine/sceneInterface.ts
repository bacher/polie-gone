import { mat4, vec3 } from 'gl-matrix';

import type { Transforms, BoundSphere } from '../types/core';
import type { ShaderProgram } from '../shaderPrograms/programs';
import type { ShaderProgramType } from '../shaderPrograms/types';

import type { Light, Model, ModelVao } from './types';
import type { GlContext } from './glContext';
import type { Camera } from './camera';
import type { DebugFigure } from './debug/types';
import type { ShadowMapContext } from './shadowMap';

export type Scene = {
  gl: GL;
  glContext: GlContext;
  initOptions: SceneInitOptions;
  isRenderLoop: boolean;
  shaderPrograms: ShadersCollection;
  camera: Camera;
  light: Light;
  models: ModelInstance[];
  shadowMapContext: ShadowMapContext | undefined;
  debug: {
    models: Record<string, Model<any>>;
    overlay: DebugFigure[];
  };
  addDrawObject: (params: AddDrawObjectParams) => ModelInstance;
};

export type SceneInitOptions = {
  renderShadows: boolean;
};

export type ShadersCollection = Record<ShaderProgramType, ShaderProgram>;

export type AddDrawObjectParams = {
  model: Model<any>;
  transforms: Partial<Transforms>;
  defaultShaderProgramType: ShaderProgramType;
  beforeDraw?: BeforeDrawHandler;
};

export type ModelInstance = {
  modelMat: mat4;
  boundInfo: BoundSphere;
  jointsDataArray?: Float32Array;
  beforeDraw?: BeforeDrawHandler;
  renderTypes: {
    regular: {
      shaderProgram: ShaderProgram;
      modelVao: ModelVao;
    };
    shadowMap?: {
      shaderProgram: ShaderProgram;
      modelVao: ModelVao;
    };
  };
};

export type BeforeDrawHandler = (
  drawObject: ModelInstance,
  program: ShaderProgram,
) => void;
