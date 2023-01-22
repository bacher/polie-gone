import type { mat4, vec3, vec4 } from 'gl-matrix';

export function printMat4(mat: mat4): void {
  const arr = Array.from(mat);

  const rows = [
    arr.slice(0, 4),
    arr.slice(4, 8),
    arr.slice(8, 12),
    arr.slice(12, 16),
  ];

  console.log(
    rows
      .map((row) =>
        row
          .map((value) => {
            return value.toFixed(3).padStart(8, ' ');
          })
          .join(' '),
      )
      .join('\n'),
  );
}

export function debugVec(vec: vec3 | vec4): string {
  return `[${[...vec].map((value) => value.toFixed(3).padStart(9)).join(' ')}]`;
}
