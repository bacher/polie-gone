import { vec3 } from 'gl-matrix';
import isNil from 'lodash/isNil';
import { GltfLoader, gltf, GltfAsset } from 'gltf-loader-ts';

import {
  ModelType,
  DataBuffer,
  RegularLoadedModel,
  SkinnedLoadedModel,
  JointInfo,
  LoadedModel,
  BoundBox,
} from '../types/model';
import { BufferTarget, ComponentType } from '../types/webgl';
import { MAX_JOINTS } from '../engine/constants';

const enum BufferType {
  INDICES = 'INDICES',
  POSITION = 'POSITION',
  NORMAL = 'NORMAL',
  TEXCOORD = 'TEXCOORD',
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

function ensureBufferTarget(value: number | undefined): BufferTarget {
  if (!value) {
    return BufferTarget.ARRAY_BUFFER;
  }

  if (
    value == BufferTarget.ARRAY_BUFFER ||
    value === BufferTarget.ELEMENT_ARRAY_BUFFER
  ) {
    return value;
  }

  throw new Error('Unknown buffer target');
}

type LoadedBuffer = LoadBuffer & {
  dataArray: Uint8Array;
  bufferTarget: BufferTarget;
};

type AnimationTemp = {
  name: string;
  channels: {
    target: {
      node: number;
      path: 'translation' | 'rotation' | 'scale';
    };
    sampler: Sampler;
  }[];
};

export type Animation = {
  name: string;
  joints: {
    joint: JointInfo;
    mutations: {
      path: 'translation' | 'rotation' | 'scale';
      sampler: Sampler;
    }[];
  }[];
};

type Sampler = {
  interpolation: 'LINEAR' | 'STEP' | 'CUBICSPLINE';
  input: Accessor;
  output: Accessor;
};

export async function loadGltf<T extends { loadSkin?: boolean }>(
  modelUri: string,
  { loadSkin }: Partial<T> = {},
): Promise<
  T['loadSkin'] extends true ? SkinnedLoadedModel : RegularLoadedModel
> {
  const loader = new GltfLoader();
  const asset = await loader.load(modelUri);

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

  if (!positionAccessor.min || !positionAccessor.max) {
    throw new Error('Model without bounds');
  }

  const modelBounds: BoundBox = {
    min: positionAccessor.min as vec3,
    max: positionAccessor.max as vec3,
  };

  let texcoordAccessor: gltf.Accessor | undefined;
  if (primitives.attributes.TEXCOORD_0) {
    texcoordAccessor = gltfData.accessors[primitives.attributes.TEXCOORD_0];
  }

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

  const otherPromises: Promise<unknown>[] = [];

  if (texcoordAccessor) {
    loadingBuffers.push({
      type: BufferType.TEXCOORD,
      accessor: texcoordAccessor,
    });
  }

  let skin: gltf.Skin | undefined;
  let animations: AnimationTemp[] | undefined;

  //  Skin processing
  if (loadSkin) {
    assertNumber(meshNode.skin);

    skin = gltfData.skins![meshNode.skin];

    if (skin.joints.length > MAX_JOINTS) {
      throw new Error('Too many joints');
    }

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

    if (gltfData.animations?.length) {
      animations = [];

      for (const { name, samplers, channels } of gltfData.animations) {
        animations.push({
          name,
          channels: channels.map(({ target, sampler }) => {
            if (isNil(target.node)) {
              throw new Error('Channel target without node');
            }

            const { input, interpolation, output } = samplers[sampler];

            const inputAccessor = gltfData.accessors[input];
            const outputAccessor = gltfData.accessors[output];

            const inputPromise = accessBuffer(asset, inputAccessor.bufferView);
            const outputPromise = accessBuffer(
              asset,
              outputAccessor.bufferView,
            );

            otherPromises.push(inputPromise, outputPromise);

            const samp: Partial<Sampler> = {
              // TODO: check interpolation value
              interpolation: (interpolation as any) ?? 'LINEAR',
            };

            inputPromise.then((dataArray) => {
              samp.input = makeAccessor(inputAccessor, dataArray);
            });

            outputPromise.then((dataArray) => {
              samp.output = makeAccessor(outputAccessor, dataArray);
            });

            return {
              target: {
                node: target.node,
                // TODO: Check path value before passing
                path: target.path as any,
              },
              sampler: samp as Sampler,
            };
          }),
        });
      }
    }
  }

  const [loadedBuffers]: [LoadedBuffer[], unknown] = await Promise.all([
    Promise.all(
      loadingBuffers.map(async ({ type, accessor }: LoadBuffer) => ({
        type,
        bufferTarget: ensureBufferTarget(
          gltfData.bufferViews[accessor.bufferView!].target,
        ),
        accessor,
        dataArray: await accessBuffer(asset, accessor.bufferView),
      })),
    ),
    Promise.all(otherPromises),
  ]);

  const modelName = meshNode.name ?? 'unknown mesh';

  const namedBuffers = loadedBuffers.reduce(
    (acc, { type, accessor, bufferTarget, dataArray }) => {
      acc[type] = makeBufferInfo(accessor, bufferTarget, dataArray);
      return acc;
    },
    {} as Record<BufferType, DataBuffer>,
  );

  function getBufferByName(bufferType: BufferType): DataBuffer {
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
    texcoord: texcoordAccessor
      ? getBufferByName(BufferType.TEXCOORD)
      : undefined,
  };

  function reportEnd() {
    console.groupCollapsed(`Model ${modelUri} loaded.`);
    console.info(`Model contains ${meshNodes.length} nodes with mesh`);
    console.info(
      loadedBuffers
        .map(
          ({ type, dataArray }) =>
            `${type} size: ${(dataArray.byteLength / 1000).toPrecision(1)} kB`,
        )
        .join('\n'),
    );
    console.groupEnd();
  }

  let model: LoadedModel;

  if (loadSkin) {
    const { dataArray } = getBufferByName(BufferType.INVERSE_JOINTS);
    const inverseJointsFloatList = convertUint8ListToFloat32List(
      // gltfLoader uses only Uint8Array as buffers
      dataArray as Uint8Array,
    );

    const joints: JointInfo[] = [];

    for (let i = 0; i < skin!.joints.length; i += 1) {
      const joinNodeIndex = skin!.joints[i];
      const jointInfo = gltfData.nodes[joinNodeIndex];

      let children: number[] | undefined;

      if (jointInfo.children && jointInfo.children.length) {
        children = jointInfo.children.map((nodeId) =>
          skin!.joints.indexOf(nodeId),
        );
      }

      const offset = i * 16;
      // Split by 16 floats (mat 4x4)
      const inverseMat = inverseJointsFloatList.slice(offset, offset + 16);

      joints.push({
        nodeIndex: joinNodeIndex,
        children,
        transforms: {
          rotation: castToFloat32List(jointInfo.rotation),
          scale: castToFloat32List(jointInfo.scale),
          translation: castToFloat32List(jointInfo.translation),
        },
        inverseMat,
      });
    }

    const skinnedModel: SkinnedLoadedModel = {
      type: ModelType.SKINNED,
      modelName,
      dataBuffers: {
        ...baseBuffers,
        joints: getBufferByName(BufferType.JOINTS),
        weights: getBufferByName(BufferType.WEIGHTS),
      },
      joints,
      bounds: modelBounds,
      animations: animations?.map((animation) =>
        linkAnimationAndJoints(animation, joints),
      ),
    };

    model = skinnedModel;
  } else {
    const regularModel: RegularLoadedModel = {
      type: ModelType.REGULAR,
      modelName,
      dataBuffers: baseBuffers,
      bounds: modelBounds,
    };

    model = regularModel;
  }

  reportEnd();

  return model as any;
}

type Accessor = {
  accessor: gltf.Accessor;
  dataArray: Uint8Array | Float32Array;
};

function makeAccessor(
  accessor: gltf.Accessor,
  dataArray: Uint8Array,
): Accessor {
  let convertedDataArray;

  switch (accessor.componentType) {
    case ComponentType.UNSIGNED_BYTE:
      convertedDataArray = dataArray;
      break;
    case ComponentType.FLOAT:
      convertedDataArray = convertUint8ListToFloat32List(dataArray);
      break;
    default:
      // TODO: Implement other conversions
      throw new Error(
        `Component type ${accessor.componentType} is not supported yet`,
      );
  }

  return {
    accessor,
    dataArray: convertedDataArray,
  };
}

function linkAnimationAndJoints(
  animation: AnimationTemp,
  joints: JointInfo[],
): Animation {
  return {
    name: animation.name,
    joints: joints.map((joint) => {
      return {
        joint,
        mutations: animation.channels
          .filter((channel) => channel.target.node === joint.nodeIndex)
          .map((channel) => ({
            path: channel.target.path,
            sampler: channel.sampler,
          })),
      };
    }),
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
  bufferTarget: BufferTarget,
  dataArray: Uint8Array,
): DataBuffer {
  return {
    bufferTarget,
    componentType: accessor.componentType,
    componentDimension: lookupComponentDimension(accessor.type),
    elementsCount: accessor.count,
    dataArray,
  };
}

function assertNumber(x: number | undefined): asserts x is number {
  if (x === undefined || x === null) {
    throw new Error('Number expected');
  }
}

function convertUint8ListToFloat32List(uint8Array: Uint8Array): Float32Array {
  return new Float32Array(
    uint8Array.buffer.slice(
      uint8Array.byteOffset,
      uint8Array.byteOffset + uint8Array.byteLength,
    ),
  );
}

function castToFloat32List(
  values: number[] | undefined,
): Float32Array | undefined {
  if (!values) {
    return undefined;
  }

  return Float32Array.from(values);
}
