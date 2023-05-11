declare const brand: unique symbol;

export type Branded<T, Brand> = T & { [brand]: Brand };

export function neverCall(x: never): void {
  throw new Error('Invariant');
}
