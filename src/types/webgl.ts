import type { Branded } from '../utils/typeHelpers';

export const enum ComponentType {
  UNSIGNED_SHORT = 5123,
  FLOAT = 5126,
}

export const enum BufferTarget {
  ARRAY_BUFFER = 34962,
  ELEMENT_ARRAY_BUFFER = 34963,
}

export type AttributeLocation = Branded<
  {
    get: () => number;
  },
  'AttributeLocation'
>;
