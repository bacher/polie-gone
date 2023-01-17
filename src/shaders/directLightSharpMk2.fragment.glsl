#version 300 es
precision highp float;

uniform vec3 u_lightDirection;
uniform sampler2D u_diffuse;

in vec3 v_normal;
in vec2 v_texcoord;

out vec4 outColor;

void main() {
  vec4 baseColor = texture(u_diffuse, v_texcoord);

  float lightFactor = max(dot(normalize(v_normal), u_lightDirection), 0.0);
  lightFactor = smoothstep(0.0, 0.11, 0.01 + lightFactor);

  outColor = vec4(baseColor * (0.5 + lightFactor * 0.5));
}