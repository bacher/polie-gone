import { mat4, vec3 } from 'gl-matrix';

import type { Transforms, BoundSphere } from '../types/model';
import type { ShaderProgram } from '../shaderPrograms/programs';
import type { ShaderProgramType } from '../shaderPrograms/types';

import type { Model, ModelVao } from './types';
import type { GlContext } from './glContext';
import type { Camera } from './camera';
import type { DebugFigure } from './debug/types';

export type Scene = {
  gl: GL;
  glContext: GlContext;
  isRenderLoop: boolean;
  shaderPrograms: ShadersCollection;
  camera: Camera;
  lightDirection: vec3;
  models: ModelInstance[];
  debug: {
    models: Record<string, Model<any>>;
    overlay: DebugFigure[];
  };
  setGlobalLightDirection: (vec: vec3) => void;
  addDrawObject: (params: AddDrawObjectParams) => ModelInstance;
};

export type ShadersCollection = Record<ShaderProgramType, ShaderProgram>;

export type AddDrawObjectParams = {
  model: Model<any>;
  transforms: Partial<Transforms>;
  defaultShaderProgramType: ShaderProgramType;
  beforeDraw?: BeforeDrawHandler;
};

export type ModelInstance = {
  shaderProgram: ShaderProgram;
  modelMat: mat4;
  modelVao: ModelVao;
  boundInfo: BoundSphere;
  jointsDataArray?: Float32Array;
  beforeDraw?: BeforeDrawHandler;
};

export type BeforeDrawHandler = (
  drawObject: ModelInstance,
  program: ShaderProgram,
) => void;
