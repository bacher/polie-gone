#version 300 es
precision highp float;

uniform vec3 u_lightDirection;
uniform sampler2D u_diffuse;

in vec3 v_normal;
in vec2 v_texcoord;

out vec4 outColor;

void main() {
  vec4 baseColor = texture(u_diffuse, v_texcoord);
  float light = clamp(dot(normalize(v_normal), u_lightDirection), 0.0, 1.0);

  outColor = vec4(vec3(0.4 + (light * 0.4)), 1.0);
  outColor = baseColor;
}