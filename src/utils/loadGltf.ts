import { GltfLoader } from 'gltf-loader-ts';

import type { LoadedModel } from '../types/model';

export async function loadGltf(modelUri: string): Promise<LoadedModel> {
  const loader = new GltfLoader();
  const asset = await loader.load(modelUri);

  const { gltf } = asset;
  console.log(gltf);
  (window as any).asset = asset;

  // const JOINTS_0 = gltf.meshes?.[0].primitives[0].attributes['JOINTS_0'];
  // console.log('JOINTS_0:', JOINTS_0);
  // await asset.preFetchAll();

  if (
    !gltf ||
    !gltf.nodes ||
    gltf.nodes.length === 0 ||
    !gltf.meshes ||
    gltf.meshes.length === 0 ||
    !gltf.accessors ||
    gltf.accessors.length === 0
  ) {
    throw new Error('Invalid model file');
  }

  const meshNodes = gltf.nodes.filter((node) => node.mesh !== undefined);

  console.info(
    `Model ${modelUri} contains ${meshNodes.length} nodes with mesh`,
  );

  const meshNode = meshNodes[0];

  const mesh = gltf.meshes[meshNode.mesh!];

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

  console.log('primitives', primitives);

  const indicesAccessor = gltf.accessors[primitives.indices];
  const positionAccessor = gltf.accessors[primitives.attributes.POSITION];
  const normalAccessor = gltf.accessors[primitives.attributes.NORMAL];

  console.log('indicesAccessor', indicesAccessor);
  console.log('positionAccessor', positionAccessor);

  const access = (bufferView: number | undefined): Promise<Uint8Array> => {
    if (bufferView === undefined) {
      throw new Error('Model without some data');
    }
    return asset.accessorData(bufferView);
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

  console.info(`INX size: ${indicesArray.byteLength} bytes
POS size: ${positionArray.byteLength} bytes
NOR size: ${normalArray.byteLength} bytes`);

  console.groupEnd();

  return {
    modelName: meshNode.name ?? 'unknown mesh',
    buffers: {
      indices: {
        componentType: indicesAccessor.componentType,
        dataArray: indicesArray,
      },
      position: {
        componentType: positionAccessor.componentType,
        dataArray: positionArray,
      },
      normal: {
        componentType: normalAccessor.componentType,
        dataArray: normalArray,
      },
    },
  };
}
