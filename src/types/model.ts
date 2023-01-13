export const enum ComponentType {
  UNSIGNED_SHORT = 5123,
  FLOAT = 5126,
}

export type BufferInfo = {
  componentType: ComponentType;
  componentDimension: number;
  elementsCount: number;
  dataArray: Uint8Array;
};

export type LoadedModel = {
  modelName: string;
  buffers: {
    indices: BufferInfo;
    position: BufferInfo;
    normal?: BufferInfo;
    uv?: BufferInfo;
  };
};
