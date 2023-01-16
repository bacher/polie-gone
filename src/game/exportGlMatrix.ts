import { mat4, vec3, vec4, quat } from 'gl-matrix';

(window as any).vec3 = vec3;
(window as any).vec4 = vec4;
(window as any).mat4 = mat4;
(window as any).quat = quat;
