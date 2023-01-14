import type { Branded } from '../utils/typeHelpers';

export type AttributeLocation = Branded<
  {
    get: () => number;
  },
  'AttributeLocation'
>;
