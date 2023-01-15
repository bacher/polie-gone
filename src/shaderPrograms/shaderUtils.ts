import type { AttributeLocation } from '../types/webgl';

export function extractAttributes<T extends string>(
  gl: GL,
  glProgram: WebGLProgram,
  attributesList: Array<T>,
) {
  const attributes = {} as { [K in T]?: AttributeLocation };

  for (const attributeName of attributesList) {
    const fullAttributeName = `a_${attributeName}`;

    const position = gl.getAttribLocation(glProgram, fullAttributeName);

    if (position === -1) {
      console.error(`Attribute ${fullAttributeName} is not defined`);
    } else {
      attributes[attributeName] = {
        get: () => position,
      } as AttributeLocation;
    }
  }

  if (!('position' in attributes)) {
    throw new Error('Vertex shader without position attribute');
  }

  return attributes as typeof attributes & {
    position: AttributeLocation;
  };
}
