#version 300 es
precision highp float;

uniform vec3 u_lightDirection;

in vec3 v_normal;
out vec4 outColor;

void main() {
  float light = clamp(dot(normalize(v_normal), u_lightDirection), 0.0, 1.0);

  outColor = vec4(vec3(0.4 + (light * 0.4)), 1.0);
}