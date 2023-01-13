#version 300 es
precision highp float;

uniform vec3 u_lightDirection;

in vec3 v_normal;
out vec4 outColor;

void main() {
  float light = dot(normalize(v_normal), u_lightDirection);
  outColor = vec4(light, 0, 0, 1);
}