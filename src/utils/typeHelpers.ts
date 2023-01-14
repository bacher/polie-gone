declare const brand: unique symbol;

export type Branded<T, Brand> = T & {[brand]: Brand};