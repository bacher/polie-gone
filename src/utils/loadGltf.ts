import { GltfLoader, gltf, GltfAsset } from 'gltf-loader-ts';

import { LoadedModel, ModelType } from '../types/model';
import { BufferInfo } from '../types/model';

const enum BufferType {
  INDICES = 'INDICES',
  POSITION = 'POSITION',
  NORMAL = 'NORMAL',
  UV = 'UV',
  JOINTS = 'JOINTS',
  WEIGHTS = 'WEIGHTS',
  INVERSE_JOINTS = 'INVERSE_JOINTS',
}

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

type LoadGltfOptions = {
  loadSkin?: boolean;
};

type LoadBuffer = {
  type: BufferType;
  accessor: gltf.Accessor;
};

type LoadedBuffer = LoadBuffer & {
  buffer: Uint8Array;
};

export async function loadGltf(
  modelUri: string,
  { loadSkin }: LoadGltfOptions = {},
): Promise<LoadedModel> {
  const loader = new GltfLoader();
  const asset = await loader.load(modelUri);

  // TODO: For debugging
  (window as any).asset = asset;

  const gltfData = asset.gltf;
  checkValidityOfGltfModel(gltfData);

  const meshNodes = gltfData.nodes.filter((node) => node.mesh !== undefined);

  if (meshNodes.length === 0) {
    throw new Error('No meshes in model');
  }

  if (meshNodes.length >= 2) {
    console.warn(`Model ${modelUri} contains more than one mesh`);
  }

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

  if (indicesAccessor.type !== 'SCALAR') {
    throw new Error('Indices is not scalar array');
  }

  const loadingBuffers: LoadBuffer[] = [
    {
      type: BufferType.INDICES,
      accessor: indicesAccessor,
    },
    {
      type: BufferType.POSITION,
      accessor: positionAccessor,
    },
    {
      type: BufferType.NORMAL,
      accessor: normalAccessor,
    },
  ];

  //  Skin processing
  if (loadSkin) {
    assertNumber(meshNode.skin);

    const skin = gltfData.skins![meshNode.skin];

    console.log('Skin:', skin);

    assertNumber(primitives.attributes.JOINTS_0);
    assertNumber(primitives.attributes.WEIGHTS_0);
    assertNumber(skin.inverseBindMatrices);

    loadingBuffers.push(
      {
        type: BufferType.JOINTS,
        accessor: gltfData.accessors[primitives.attributes.JOINTS_0],
      },
      {
        type: BufferType.WEIGHTS,
        accessor: gltfData.accessors[primitives.attributes.WEIGHTS_0],
      },
      {
        type: BufferType.INVERSE_JOINTS,
        accessor: gltfData.accessors[skin.inverseBindMatrices],
      },
    );
  }

  const loadedBuffers: LoadedBuffer[] = await Promise.all(
    loadingBuffers.map(async ({ type, accessor }: LoadBuffer) => ({
      type,
      accessor,
      buffer: await accessBuffer(asset, accessor.bufferView),
    })),
  );

  console.groupCollapsed(`Model ${modelUri} loaded.`);
  console.info(`Model contains ${meshNodes.length} nodes with mesh`);
  console.info(
    loadedBuffers
      .map(({ type, buffer }) => `${type} size: ${buffer.byteLength} bytes`)
      .join('\n'),
  );
  console.groupEnd();

  const modelName = meshNode.name ?? 'unknown mesh';

  const namedBuffers = loadedBuffers.reduce(
    (acc, { type, accessor, buffer }) => {
      acc[type] = makeBufferInfo(accessor, buffer);
      return acc;
    },
    {} as Record<BufferType, BufferInfo>,
  );

  function getBufferByName(bufferType: BufferType): BufferInfo {
    const buffer = namedBuffers[bufferType];

    if (!buffer) {
      throw new Error();
    }

    return buffer;
  }

  const baseBuffers = {
    indices: getBufferByName(BufferType.INDICES),
    position: getBufferByName(BufferType.POSITION),
    normal: getBufferByName(BufferType.NORMAL),
  };

  if (loadSkin) {
    return {
      type: ModelType.SKINNED,
      modelName,
      buffers: {
        ...baseBuffers,
        joints: getBufferByName(BufferType.JOINTS),
        weights: getBufferByName(BufferType.WEIGHTS),
      },
    };
  }

  return {
    type: ModelType.REGULAR,
    modelName,
    buffers: baseBuffers,
  };
}

function accessBuffer(
  asset: GltfAsset,
  bufferViewIndex: number | undefined,
): Promise<Uint8Array> {
  if (bufferViewIndex === undefined) {
    throw new Error('Model without some data');
  }

  const bufferView = asset.gltf.bufferViews![bufferViewIndex];

  if (!bufferView) {
    throw new Error('No BufferView');
  }

  if (bufferView.byteStride) {
    throw new Error('Buffers with byteStride is not supported yet');
  }

  return asset.accessorData(bufferViewIndex);
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

function assertNumber(x: number | undefined): asserts x is number {
  if (x === undefined || x == null) {
    throw new Error('Number expected');
  }
}
