import { mat4 } from 'gl-matrix';

import type { Transforms, BoundSphere } from '../types/core';
import type {
  ShaderProgram,
  ShadersCollection,
} from '../shaderPrograms/programs';
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
  viewport: { width: number; height: number };
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
  viewportSize: { width: number; height: number };
};

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
    regular: Renderer;
    shadowMap?: Renderer;
  };
};

export type Renderer = {
  shaderProgram: ShaderProgram;
  modelVao: ModelVao;
};

export type BeforeDrawHandler = (
  drawObject: ModelInstance,
  program: ShaderProgram,
) => void;
