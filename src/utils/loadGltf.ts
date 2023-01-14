import { GltfLoader, gltf } from 'gltf-loader-ts';

import type { LoadedModel } from '../types/model';
import { BufferInfo } from '../types/model';

// "type": "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4" | string;

const matchTypeToComponentDimension: Record<string, number | undefined> = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16,
};

function lookupComponentDimension(type: string): number {
  const dimension = matchTypeToComponentDimension[type];

  if (dimension === undefined) {
    throw new Error(`Unknown type ${type}`);
  }

  return dimension;
}

type RequiredFields = 'nodes' | 'meshes' | 'accessors' | 'bufferViews';

type GlTfValidated = Exclude<gltf.GlTf, RequiredFields> &
  Required<Pick<gltf.GlTf, RequiredFields>>;

function checkValidityOfGltfModel(
  gltfData: gltf.GlTf,
): asserts gltfData is GlTfValidated {
  if (
    !gltfData ||
    !gltfData.nodes ||
    gltfData.nodes.length === 0 ||
    !gltfData.meshes ||
    gltfData.meshes.length === 0 ||
    !gltfData.accessors ||
    gltfData.accessors.length === 0 ||
    !gltfData.bufferViews ||
    gltfData.bufferViews.length === 0
  ) {
    throw new Error('Invalid model file');
  }
}

export async function loadGltf(modelUri: string): Promise<LoadedModel> {
  const loader = new GltfLoader();
  const asset = await loader.load(modelUri);

  // TODO: For debugging
  (window as any).asset = asset;

  const gltfData = asset.gltf;
  checkValidityOfGltfModel(gltfData);

  const meshNodes = gltfData.nodes.filter((node) => node.mesh !== undefined);

  const meshNode = meshNodes[0];

  const mesh = gltfData.meshes[meshNode.mesh!];

  const primitives = mesh.primitives[0];

  if (!primitives) {
    throw new Error('No primitives');
  }

  if (mesh.primitives.length !== 1) {
    console.warn(
      `Model ${modelUri} contains several (${mesh.primitives.length}) mesh primitives`,
    );
  }

  if (primitives.indices === undefined) {
    throw new Error('No indices');
  }

  if (primitives.targets) {
    console.warn(`Model ${modelUri} contains targets`);
  }

  const indicesAccessor = gltfData.accessors[primitives.indices];
  const positionAccessor = gltfData.accessors[primitives.attributes.POSITION];
  const normalAccessor = gltfData.accessors[primitives.attributes.NORMAL];

  const access = (bufferViewIndex: number | undefined): Promise<Uint8Array> => {
    if (bufferViewIndex === undefined) {
      throw new Error('Model without some data');
    }

    const bufferView = gltfData.bufferViews[bufferViewIndex];

    if (!bufferView) {
      throw new Error('No BufferView');
    }

    if (bufferView.byteStride) {
      throw new Error('Buffers with byteStride is not supported yet');
    }

    return asset.accessorData(bufferViewIndex);
  };

  if (indicesAccessor.type !== 'SCALAR') {
    throw new Error('Indices is not scalar array');
  }

  const [indicesArray, positionArray, normalArray] = await Promise.all([
    access(indicesAccessor.bufferView),
    access(positionAccessor.bufferView),
    access(normalAccessor.bufferView),
  ]);

  console.groupCollapsed(`Model ${modelUri} loaded.`);
  console.info(`Model contains ${meshNodes.length} nodes with mesh`);
  console.info(`INX size: ${indicesArray.byteLength} bytes
POS size: ${positionArray.byteLength} bytes
NOR size: ${normalArray.byteLength} bytes`);

  console.groupEnd();

  return {
    modelName: meshNode.name ?? 'unknown mesh',
    buffers: {
      indices: makeBufferInfo(indicesAccessor, indicesArray),
      position: makeBufferInfo(positionAccessor, positionArray),
      normal: makeBufferInfo(normalAccessor, normalArray),
    },
  };
}

function makeBufferInfo(
  accessor: gltf.Accessor,
  dataArray: Uint8Array,
): BufferInfo {
  return {
    componentType: accessor.componentType,
    componentDimension: lookupComponentDimension(accessor.type),
    elementsCount: accessor.count,
    dataArray,
  };
}
