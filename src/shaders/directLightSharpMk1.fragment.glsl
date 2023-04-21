#version 300 es
precision highp float;

uniform vec3 u_lightDirection;
uniform sampler2D u_diffuse;
uniform sampler2D u_shadowMapTexture;

in vec3 v_normal;
in vec2 v_texcoord;
in vec3 v_posInLightSpace;

out vec4 outColor;

float lightSizeFactor = 11.874342087037917;

#include calcShadow

void main() {
  vec4 baseColor = texture(u_diffuse, v_texcoord);
  float shadowFactor = calcShadow(u_shadowMapTexture, v_posInLightSpace);

  float lightFactor = clamp(dot(normalize(v_normal), lightSizeFactor * u_lightDirection), 0.0, 1.0);

  outColor = vec4(baseColor * (0.5 + (lightFactor * 0.5 * (1.0 - shadowFactor))));
}
